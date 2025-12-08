import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Platform,
  ScrollView,
  Keyboard,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/utils/ThemeContext';
import { useLanguage } from '@/utils/LanguageContext';
import { COLORS } from '@/constants/colors';
import { SPACING, SIZES } from '@/constants/ui';
import { WelcomeCard } from '@/components/WelcomeCard';

import { AIRecipeModal } from '@/components/AIRecipeModal';
import {
  AnimatedMessage,
  AIMessageBubble,
  AITextMessageBubble,
  ChatDrawer,
  ChatHeader,
  LoadingMessageBubble,
  MessageInput,
  UserMessageBubble,
} from '@/components/chat';
import { useImagePicker, useChatMessages, useSpeechRecognition, useChats } from '@/hooks';

import { verticalScale } from '@/utils/responsive';
import { getUserPreferences } from '@/utils/userPreferences';
import { WALLPAPERS, WallpaperConfig, getDefaultWallpaperId } from '@/constants/wallpapers';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [wallpaperConfig, setWallpaperConfig] = useState<WallpaperConfig | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const { selectedImage, showImageOptions, clearImage } = useImagePicker();

  // Управление чатами
  const {
    chats,
    activeChatId,
    loading: chatsLoading,
    createChat,
    deleteChat,
    switchChat,
    getActiveChat,
    getGroupedChats,
    refreshChats,
  } = useChats();

  // Сообщения активного чата
  const {
    messages,
    scrollViewRef,
    scrollToBottom,
    sendMessage,
    handleRecipePress,
    selectedRecipe,
    modalVisible,
    closeModal,
  } = useChatMessages(activeChatId);

  const { isRecording, transcript, startRecording, stopRecording, clearTranscript, error: speechError } = useSpeechRecognition();

  const activeChat = getActiveChat();

  // Загрузка выбранных обоев при фокусе на экране и при смене темы
  useFocusEffect(
    useCallback(() => {
      const loadWallpaper = async () => {
        const prefs = await getUserPreferences();
        const wallpaperId = prefs.wallpaperId || getDefaultWallpaperId(isDark);
        const wallpaper = WALLPAPERS.find(w => w.id === wallpaperId);
        if (wallpaper) {
          setWallpaperConfig(wallpaper);
        }
      };
      loadWallpaper();
    }, [isDark])
  );

  // Автопрокрутка при новых сообщениях (теперь используем onContentSizeChange в ScrollView)
  // useEffect убран, так как onContentSizeChange обрабатывает это автоматически

  // Отслеживание клавиатуры
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Автоскролл при открытии клавиатуры
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [scrollToBottom]);

  // Обновление текста при распознавании речи
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Анимация пульсации микрофона
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording, pulseAnim]);

  const handleSendMessage = useCallback(async () => {
    const userInput = inputText.trim();
    const imageToSend = selectedImage;

    setInputText('');
    clearImage();
    clearTranscript();

    await sendMessage(userInput, imageToSend ?? undefined);
  }, [inputText, selectedImage, sendMessage, clearImage, clearTranscript]);

  const handleMicrophonePress = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const canSend = !!(inputText.trim() || selectedImage);

  // Рендер фона в зависимости от типа обоев
  const renderBackground = () => {
    if (!wallpaperConfig) {
      return null;
    }

    if (wallpaperConfig.type === 'image' && wallpaperConfig.image) {
      return (
        <ImageBackground
          source={wallpaperConfig.image}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {renderContent()}
        </ImageBackground>
      );
    }

    if (wallpaperConfig.type === 'gradient' && wallpaperConfig.colors) {
      return (
        <LinearGradient
          colors={wallpaperConfig.colors}
          locations={wallpaperConfig.locations}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.backgroundImage}
        >
          {renderContent()}
        </LinearGradient>
      );
    }

    return null;
  };

  const handleNewChat = useCallback(async () => {
    await createChat();
    await refreshChats();
  }, [createChat, refreshChats]);

  const handleDeleteChat = useCallback(async (chatId: string) => {
    console.log('chat.tsx handleDeleteChat called for:', chatId);
    await deleteChat(chatId);
    console.log('deleteChat completed, calling refreshChats');
    await refreshChats();
    console.log('refreshChats completed');
  }, [deleteChat, refreshChats]);

  const handleSwitchChat = useCallback(async (chatId: string) => {
    await switchChat(chatId);
  }, [switchChat]);

  const renderContent = () => {
    // Динамический отступ снизу - KeyboardAvoidingView управляет подъемом, поэтому не добавляем keyboardHeight
    const dynamicPaddingBottom = (insets.bottom || 0) + SIZES.tabBarHeight + SPACING.xl + verticalScale(70);

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <View style={styles.container}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={[
              styles.messagesContent,
              messages.length === 0 && styles.emptyMessagesContent,
              {
                paddingTop: insets.top + verticalScale(8) + verticalScale(56) + SPACING.base, // Отступ под header + запас
                paddingBottom: dynamicPaddingBottom,
              }
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={() => {
              // Автоскролл при изменении размера контента (новые сообщения)
              scrollToBottom();
            }}
          >
          {messages.length === 0 && keyboardHeight === 0 && <WelcomeCard isDark={isDark} />}

          {messages.map((message, index) => (
            <AnimatedMessage key={message.id} index={index}>
              {message.isUser ? (
                <UserMessageBubble text={message.text} image={message.image} />
              ) : message.isLoading ? (
                <LoadingMessageBubble text={message.text} />
              ) : message.aiRecipes && message.aiRecipes.length > 0 ? (
                <AIMessageBubble
                  text={message.text}
                  recipes={message.aiRecipes}
                  isDark={isDark}
                  onRecipePress={handleRecipePress}
                />
              ) : (
                <AITextMessageBubble text={message.text} />
              )}
            </AnimatedMessage>
          ))}
        </ScrollView>

        {/* Header поверх ScrollView с прозрачностью */}
        <ChatHeader
          title={activeChat?.title || t.chat.newChat}
          isDark={isDark}
          topInset={insets.top}
          onMenuPress={() => setDrawerVisible(true)}
        />

        <MessageInput
          inputText={inputText}
          selectedImage={selectedImage}
          canSend={canSend}
          isDark={isDark}
          isRecording={isRecording}
          speechError={speechError}
          pulseAnim={pulseAnim}
          bottom={(insets.bottom || 0) + SIZES.tabBarHeight + SPACING.xl}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          onImagePress={showImageOptions}
          onClearImage={clearImage}
          onMicrophonePress={handleMicrophonePress}
        />
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <>
      {renderBackground()}
      <AIRecipeModal
        visible={modalVisible}
        recipe={selectedRecipe}
        onClose={closeModal}
      />
      <ChatDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        chats={getGroupedChats()}
        activeChatId={activeChatId}
        onChatSelect={handleSwitchChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isDark={isDark}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.base,
    paddingBottom: SPACING.md,
  },
  emptyMessagesContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
