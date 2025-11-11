import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/utils/ThemeContext';
import { COLORS, getThemeColors } from '@/constants/colors';
import { PLATFORM, LAYOUT, SPACING } from '@/constants/ui';
import { WelcomeCard } from '@/components/WelcomeCard';
import { AIRecipeCard } from '@/components/AIRecipeCard';
import { AnimatedMessage } from '@/components/chat';
import { useImagePicker, useChatMessages } from '@/hooks';
import type { AIRecipe } from '@/utils/aiService';

export default function ChatScreen() {
  const { isDark } = useTheme();
  const [inputText, setInputText] = useState('');

  const { selectedImage, showImageOptions, clearImage } = useImagePicker();
  const { messages, scrollViewRef, scrollToBottom, sendMessage, handleRecipePress } =
    useChatMessages();

  const themeColors = useMemo(() => getThemeColors(isDark), [isDark]);
  const backgroundImage = useMemo(
    () => isDark ? require('@/assets/images/black.png') : require('@/assets/images/white.png'),
    [isDark]
  );

  // Автопрокрутка при новых сообщениях
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    const userInput = inputText.trim();
    const imageToSend = selectedImage;

    setInputText('');
    clearImage();

    await sendMessage(userInput, imageToSend ?? undefined);
  }, [inputText, selectedImage, sendMessage, clearImage]);

  const canSend = inputText.trim() || selectedImage;

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            messages.length === 0 && styles.emptyMessagesContent,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && <WelcomeCard isDark={isDark} />}

          {messages.map((message, index) => (
            <AnimatedMessage key={message.id} index={index}>
              <View>
              <View
                style={[
                  styles.messageWrapper,
                  message.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper,
                ]}
              >
                <View style={[
                  styles.messageBubble,
                  { backgroundColor: COLORS.primary }
                ]}>
                  {message.image && (
                    <Image source={{ uri: message.image }} style={styles.messageImage} />
                  )}
                  {message.isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={[styles.messageText, { color: '#fff', marginLeft: 8 }]}>
                        {message.text}
                      </Text>
                    </View>
                  ) : (
                    message.text && (
                      <Text style={[styles.messageText, { color: '#fff' }]}>
                        {message.text}
                      </Text>
                    )
                  )}
                </View>
              </View>

              {message.aiRecipes && message.aiRecipes.length > 0 && (
                <View style={styles.aiRecipesContainer}>
                  <View style={styles.recipeGrid}>
                    {message.aiRecipes.map((recipe) => (
                      <View key={recipe.id} style={styles.recipeCardWrapper}>
                        <AIRecipeCard
                          recipe={recipe}
                          isDark={isDark}
                          onPress={() => handleRecipePress(recipe)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
              </View>
            </AnimatedMessage>
          ))}
        </ScrollView>

        <View style={styles.inputContainerWrapper}>
          <View style={[
            styles.inputContainer,
            {
              borderColor: isDark ? COLORS.purple.medium : COLORS.purple.light,
            }
          ]}>
            <BlurView
              intensity={90}
              tint={isDark ? 'dark' : 'light'}
              style={styles.inputBlur}
              pointerEvents="none"
            />
            <LinearGradient
              colors={isDark ? COLORS.gradient.purple.dark : COLORS.gradient.purple.light}
              style={styles.inputGradient}
              pointerEvents="none"
            />
            <View style={styles.inputOverlay} pointerEvents="none" />

            <View style={styles.inputContent}>
              {selectedImage && (
                <View style={styles.selectedImageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={clearImage}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputRow}>
                <TouchableOpacity style={styles.iconButton} onPress={showImageOptions}>
                  <Ionicons name="camera" size={28} color={COLORS.primary} />
                </TouchableOpacity>

                <TextInput
                  style={[styles.input, { color: themeColors.text }]}
                  placeholder={
                    selectedImage
                      ? 'Добавьте описание к фото (опционально)'
                      : 'Опишите продукты или загрузите фото'
                  }
                  placeholderTextColor={themeColors.inputPlaceholder}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                />

                <TouchableOpacity
                  style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
                  onPress={handleSendMessage}
                  disabled={!canSend}
                >
                  <Ionicons name="send" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
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
    padding: SPACING.lg,
    paddingTop: PLATFORM.contentPaddingTop,
    paddingBottom: SPACING.md,
  },
  emptyMessagesContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageWrapper: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  aiMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#fff',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiRecipesContainer: {
    marginTop: 8,
    paddingHorizontal: 0,
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  recipeCardWrapper: {
    width: '48%',
  },
  inputContainerWrapper: {
    paddingHorizontal: LAYOUT.containerPadding,
    paddingBottom: LAYOUT.chatInputContainerBottom,
  },
  inputContainer: {
    position: 'relative',
    borderRadius: 35,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: COLORS.purple.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  inputBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  inputGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  inputOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputContent: {
    position: 'relative',
    zIndex: 1,
    paddingHorizontal: 20,
    minHeight: 70,
  },
  selectedImageContainer: {
    position: 'relative',
    marginTop: 12,
    marginBottom: 12,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 44,
    maxHeight: 54,
    paddingTop: Platform.OS === 'ios' ? 15 : 13,
    paddingBottom: 0,
    textAlignVertical: 'top',
    includeFontPadding: false,
    lineHeight: 22,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
