import { useState, useCallback, useRef, useEffect } from 'react';
import { ScrollView } from 'react-native';
import uuid from 'react-native-uuid';
import { getRecipesFromAI } from '@/utils/aiService';
import { saveAIRecipe } from '@/utils/storage';
import { getChatById, addMessageToChat } from '@/utils/chatStorage';
import type { AIRecipe, Message } from '@/types';
import { useLanguage } from '@/utils/LanguageContext';

export function useChatMessages(activeChatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<AIRecipe | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { t, language } = useLanguage();

  const loadMessages = useCallback(async () => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const chat = await getChatById(activeChatId);
    if (chat) {
      setMessages(chat.messages);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  // Загрузка сообщений при смене активного чата
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const scrollToBottom = useCallback(() => {
    // Используем requestAnimationFrame для более плавной прокрутки
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });
  }, []);

  const sendMessage = useCallback(
    async (inputText: string, selectedImage?: string) => {
      if (!inputText.trim() && !selectedImage) return;
      if (!activeChatId) return;

      const userMessage: Message = {
        id: uuid.v4() as string,
        text: inputText.trim(),
        isUser: true,
        image: selectedImage || undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      await addMessageToChat(activeChatId, userMessage);

      // Добавляем сообщение "загрузка"
      const loadingMessage: Message = {
        id: uuid.v4() as string,
        text: selectedImage
          ? t.chat.thinkingWithImage
          : t.chat.thinking,
        isUser: false,
        timestamp: new Date(),
        isLoading: true,
      };
      setMessages((prev) => [...prev, loadingMessage]);

      // Запрашиваем рецепты от AI с учетом языка пользователя
      const result = await getRecipesFromAI(
        inputText.trim(),
        selectedImage || undefined,
        language
      );

      // Убираем сообщение "загрузка"
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));

      if (result.success) {
        const aiResponse: Message = {
          id: uuid.v4() as string,
          text: t.chat.recipesFound,
          isUser: false,
          timestamp: new Date(),
          aiRecipes: result.recipes,
        };
        setMessages((prev) => [...prev, aiResponse]);
        await addMessageToChat(activeChatId, aiResponse);
      } else {
        const errorResponse: Message = {
          id: uuid.v4() as string,
          text: `😔 ${result.error || t.chat.error}`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponse]);
        await addMessageToChat(activeChatId, errorResponse);
      }
    },
    [activeChatId, t, language]
  );

  const handleRecipePress = useCallback(
    async (recipe: AIRecipe) => {
      await saveAIRecipe(recipe);
      setSelectedRecipe(recipe);
      setModalVisible(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedRecipe(null);
  }, []);

  return {
    messages,
    scrollViewRef,
    scrollToBottom,
    sendMessage,
    handleRecipePress,
    selectedRecipe,
    modalVisible,
    closeModal,
  };
}
