import { useState, useCallback, useRef } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import uuid from 'react-native-uuid';
import { getRecipesFromAI, AIRecipe } from '@/utils/aiService';
import { saveAIRecipe } from '@/utils/storage';

export type Message = {
  id: string;
  text: string;
  isUser: boolean;
  image?: string;
  timestamp: Date;
  aiRecipes?: AIRecipe[];
  isLoading?: boolean;
};

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const sendMessage = useCallback(
    async (inputText: string, selectedImage?: string) => {
      if (!inputText.trim() && !selectedImage) return;

      const userMessage: Message = {
        id: uuid.v4() as string,
        text: inputText.trim(),
        isUser: true,
        image: selectedImage || undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Добавляем сообщение "загрузка"
      const loadingMessage: Message = {
        id: uuid.v4() as string,
        text: selectedImage
          ? 'Анализирую изображение и подбираю рецепты...'
          : 'Думаю над рецептами...',
        isUser: false,
        timestamp: new Date(),
        isLoading: true,
      };
      setMessages((prev) => [...prev, loadingMessage]);

      // Запрашиваем рецепты от AI
      const result = await getRecipesFromAI(
        inputText.trim(),
        selectedImage || undefined
      );

      // Убираем сообщение "загрузка"
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));

      if (result.success) {
        const aiResponse: Message = {
          id: uuid.v4() as string,
          text: result.greeting || '✨ Вот что я нашёл для тебя:',
          isUser: false,
          timestamp: new Date(),
          aiRecipes: result.recipes,
        };
        setMessages((prev) => [...prev, aiResponse]);
      } else {
        const errorResponse: Message = {
          id: uuid.v4() as string,
          text: `😔 ${result.error || 'Произошла ошибка при получении рецептов'}`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponse]);
      }
    },
    []
  );

  const handleRecipePress = useCallback(
    async (recipe: AIRecipe) => {
      try {
        await saveAIRecipe(recipe);
        router.push(`/recipe/${recipe.id}`);
      } catch (error) {
        console.error('Error saving recipe:', error);
        Alert.alert('Ошибка', 'Не удалось открыть рецепт');
      }
    },
    [router]
  );

  return {
    messages,
    scrollViewRef,
    scrollToBottom,
    sendMessage,
    handleRecipePress,
  };
}
