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
import { scale, verticalScale, fontScale, moderateScale, BORDER_RADIUS } from '@/utils/responsive';
import { getUserPreferences } from '@/utils/userPreferences';
import { WALLPAPERS, WallpaperConfig } from '@/constants/wallpapers';
import { useFocusEffect } from '@react-navigation/native';

export default function ChatScreen() {
  const { isDark } = useTheme();
  const [inputText, setInputText] = useState('');
  const [wallpaperConfig, setWallpaperConfig] = useState<WallpaperConfig | null>(null);

  const { selectedImage, showImageOptions, clearImage } = useImagePicker();
  const { messages, scrollViewRef, scrollToBottom, sendMessage, handleRecipePress } =
    useChatMessages();

  const themeColors = useMemo(() => getThemeColors(isDark), [isDark]);

  // Загрузка выбранных обоев при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      const loadWallpaper = async () => {
        const prefs = await getUserPreferences();
        const wallpaperId = prefs.wallpaperId || 'dark-image';
        const wallpaper = WALLPAPERS.find(w => w.id === wallpaperId);
        if (wallpaper) {
          setWallpaperConfig(wallpaper);
        }
      };
      loadWallpaper();
    }, [])
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

  const renderContent = () => (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
              intensity={60}
              tint={isDark ? 'dark' : 'light'}
              style={styles.inputBlur}
              pointerEvents="none"
            />
            <LinearGradient
              colors={isDark ? COLORS.gradient.purple.dark : COLORS.gradient.purple.light}
              style={styles.inputGradient}
              pointerEvents="none"
            />
            <View style={[styles.inputOverlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)' }]} pointerEvents="none" />

            <View style={styles.inputContent}>
              {selectedImage && (
                <View style={styles.selectedImageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={clearImage}
                  >
                    <Ionicons name="close-circle" size={moderateScale(22)} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputRow}>
                <TouchableOpacity style={styles.iconButton} onPress={showImageOptions}>
                  <Ionicons name="camera" size={moderateScale(26)} color={COLORS.primary} />
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
                  <Ionicons name="send" size={moderateScale(22)} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
  );

  return renderBackground();
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
    paddingTop: PLATFORM.contentPaddingTop,
    paddingBottom: SPACING.md,
  },
  emptyMessagesContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageWrapper: {
    marginBottom: verticalScale(12),
    maxWidth: '80%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  aiMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: scale(12),
    borderRadius: BORDER_RADIUS.lg,
  },
  messageText: {
    fontSize: fontScale(14),
    lineHeight: moderateScale(20),
    color: '#fff',
  },
  messageImage: {
    width: scale(180),
    height: verticalScale(135),
    borderRadius: BORDER_RADIUS.md,
    marginBottom: verticalScale(8),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiRecipesContainer: {
    marginTop: verticalScale(8),
    paddingHorizontal: 0,
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    justifyContent: 'flex-start',
  },
  recipeCardWrapper: {
    width: '48%',
  },
  inputContainerWrapper: {
    paddingHorizontal: LAYOUT.containerPadding,
    paddingBottom: Platform.select({
      ios: verticalScale(96),
      android: verticalScale(88),
      default: verticalScale(88),
    }),
  },
  inputContainer: {
    position: 'relative',
    borderRadius: scale(30),
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: COLORS.purple.shadow,
    shadowOffset: { width: 0, height: verticalScale(10) },
    shadowOpacity: 0.15,
    shadowRadius: scale(20),
    elevation: 10,
    height: verticalScale(56),
  },
  inputBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  inputGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  inputOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  inputContent: {
    position: 'relative',
    zIndex: 1,
    paddingHorizontal: scale(20),
    height: verticalScale(56),
    justifyContent: 'center',
  },
  selectedImageContainer: {
    position: 'relative',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
  },
  selectedImage: {
    width: scale(72),
    height: scale(72),
    borderRadius: BORDER_RADIUS.sm,
  },
  removeImageButton: {
    position: 'absolute',
    top: scale(-8),
    right: scale(-8),
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  iconButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: fontScale(14),
    minHeight: verticalScale(40),
    maxHeight: verticalScale(48),
    paddingTop: Platform.OS === 'ios' ? verticalScale(13) : verticalScale(11),
    paddingBottom: 0,
    textAlignVertical: 'top',
    includeFontPadding: false,
    lineHeight: moderateScale(20),
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
