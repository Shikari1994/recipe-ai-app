import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Platform,
  FlatList,
  Keyboard,
  Animated,
  Text,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/utils/ThemeContext';
import { useLanguage } from '@/utils/LanguageContext';
import { getThemeColors } from '@/constants/colors';
import { SPACING } from '@/constants/ui';

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
import { useImagePicker, useChatMessages, useSpeechRecognition, useChats, useWallpaper } from '@/hooks';

import { verticalScale, fontScale } from '@/utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Message } from '@/types';

export default function ChatScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const themeColors = useMemo(() => getThemeColors(isDark), [isDark]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const { selectedImage, showImageOptions, clearImage } = useImagePicker();
  const wallpaperConfig = useWallpaper(isDark);

  // Управление чатами
  const {
    activeChatId,
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

  const handleFavoritesPress = useCallback(() => {
    router.push('/(tabs)/favorites');
  }, [router]);

  const handleProfilePress = useCallback(() => {
    router.push('/(tabs)/profile');
  }, [router]);

  // Колбэки для FlatList
  const renderMessage = useCallback(({ item: message, index }: { item: Message; index: number }) => (
    <AnimatedMessage key={message.id} index={index}>
      {message.isUser ? (
        <UserMessageBubble text={message.text} image={message.image} />
      ) : message.isLoading ? (
        <LoadingMessageBubble text={message.text} isDark={isDark} />
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
  ), [isDark, handleRecipePress]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const ListHeaderComponent = useCallback(() => (
    messages.length === 0 && keyboardHeight === 0 ? (
      <View style={styles.welcomeContainer}>
        <Text style={[styles.welcomeTitle, { color: isDark ? themeColors.text : '#444444' }]}>
          {t.welcome.title}
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: themeColors.textSecondary }]}>
          {t.welcome.subtitle}
        </Text>
      </View>
    ) : null
  ), [messages.length, keyboardHeight, themeColors, isDark, t]);

  // Мемоизированные inline стили
  const messagesContentStyle = useMemo(() => ([
    styles.messagesContent,
    messages.length === 0 && styles.emptyMessagesContent,
    {
      paddingTop: insets.top + verticalScale(8) + verticalScale(56) + SPACING.base,
      paddingBottom: SPACING.md,
    }
  ]), [messages.length, insets.top]);

  const inputWrapperStyle = useMemo(() => ([
    styles.inputWrapper,
    {
      paddingBottom: keyboardHeight > 0
        ? (insets.bottom || SPACING.base) + SPACING.xxl
        : (insets.bottom || SPACING.base) + SPACING.sm,
      marginBottom: keyboardHeight > 0 ? SPACING.md : 0,
    }
  ]), [insets.bottom, keyboardHeight]);

  const renderContent = useCallback(() => {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* FlatList с сообщениями */}
        <FlatList
          ref={scrollViewRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          style={styles.messagesContainer}
          contentContainerStyle={messagesContentStyle}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={scrollToBottom}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={21}
          initialNumToRender={15}
        />

      {/* Header поверх ScrollView */}
      <ChatHeader
        title={activeChat?.title || t.chat.newChat}
        isDark={isDark}
        topInset={insets.top}
        onMenuPress={() => setDrawerVisible(true)}
        onFavoritesPress={handleFavoritesPress}
      />

      {/* MessageInput - внизу контейнера */}
      <View style={inputWrapperStyle}>
        <MessageInput
          inputText={inputText}
          selectedImage={selectedImage}
          canSend={canSend}
          isDark={isDark}
          isRecording={isRecording}
          speechError={speechError}
          pulseAnim={pulseAnim}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          onImagePress={showImageOptions}
          onClearImage={clearImage}
          onMicrophonePress={handleMicrophonePress}
        />
      </View>
      </KeyboardAvoidingView>
    );
  }, [
    messages,
    renderMessage,
    keyExtractor,
    ListHeaderComponent,
    messagesContentStyle,
    inputWrapperStyle,
    scrollToBottom,
    insets,
    activeChat,
    inputText,
    selectedImage,
    canSend,
    isDark,
    isRecording,
    speechError,
    pulseAnim,
    t,
    setInputText,
    handleSendMessage,
    showImageOptions,
    clearImage,
    handleMicrophonePress,
    setDrawerVisible,
    handleFavoritesPress,
  ]);

  // Рендер фона в зависимости от типа обоев
  const renderBackground = useCallback(() => {
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
  }, [wallpaperConfig, renderContent]);

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
        onProfilePress={handleProfilePress}
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
    alignItems: 'flex-start',
  },
  welcomeContainer: {
    maxWidth: '90%',
    paddingLeft: SPACING.lg,
    alignItems: 'flex-start',
  },
  welcomeTitle: {
    fontSize: fontScale(24),
    fontWeight: '500',
    marginBottom: verticalScale(4),
    lineHeight: fontScale(32),
  },
  welcomeSubtitle: {
    fontSize: fontScale(24),
    fontWeight: '300',
    lineHeight: fontScale(32),
  },
  inputWrapper: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
  },
});
