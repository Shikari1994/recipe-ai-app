import React, { useMemo } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlatformBlur } from '@/components/ui/PlatformBlur';
import { LinearGradient } from 'expo-linear-gradient';
import { getThemeColors } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale } from '@/utils/responsive';
import { useLanguage } from '@/utils/LanguageContext';

type MessageInputProps = {
  inputText: string;
  selectedImage: string | null;
  canSend: boolean;
  isDark: boolean;
  isRecording: boolean;
  speechError: string | null;
  pulseAnim: Animated.Value;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onImagePress: () => void;
  onClearImage: () => void;
  onMicrophonePress: () => void;
};

const MessageInputComponent = ({
  inputText,
  selectedImage,
  canSend,
  isDark,
  isRecording,
  speechError,
  pulseAnim,
  onChangeText,
  onSend,
  onImagePress,
  onClearImage,
  onMicrophonePress,
}: MessageInputProps) => {
  const themeColors = useMemo(() => getThemeColors(isDark), [isDark]);
  const { t } = useLanguage();

  return (
    <View style={styles.inputContainerWrapper}>
      <View style={styles.inputContainer}>
        <PlatformBlur
          intensity={60}
          tint={isDark ? 'dark' : 'light'}
          style={styles.inputBlur}
        />
        <LinearGradient
          colors={isDark ? themeColors.gradientDark : themeColors.gradientLight}
          style={styles.inputGradient}
          pointerEvents="none"
        />
        <View
          style={[
            styles.inputOverlay,
            {
              backgroundColor: isDark
                ? (Platform.OS === 'android' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.3)')
                : (Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.3)')
            }
          ]}
          pointerEvents="none"
        />

        <View style={styles.inputContent}>
          <View style={styles.inputRow}>
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={onClearImage}
                >
                  <Ionicons name="close-circle" size={moderateScale(18)} color={themeColors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: themeColors.primaryLight }]}
                onPress={onImagePress}
              >
                <Ionicons name="camera" size={moderateScale(26)} color={themeColors.primary} />
              </TouchableOpacity>
            )}

            {/* Кнопка микрофона - показываем только если модуль доступен */}
            {!speechError && (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    { backgroundColor: isRecording ? themeColors.primary : themeColors.primaryLight }
                  ]}
                  onPress={onMicrophonePress}
                >
                  <Ionicons
                    name={isRecording ? "mic" : "mic-outline"}
                    size={moderateScale(26)}
                    color={isRecording ? '#fff' : themeColors.primary}
                  />
                </TouchableOpacity>
              </Animated.View>
            )}

            <TextInput
              style={[styles.input, { color: themeColors.text }]}
              placeholder={
                selectedImage
                  ? t.chat.placeholderWithImage
                  : t.chat.placeholder
              }
              placeholderTextColor={themeColors.inputPlaceholder}
              value={inputText}
              onChangeText={onChangeText}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: themeColors.primary },
                !canSend && styles.sendButtonDisabled
              ]}
              onPress={onSend}
              disabled={!canSend}
            >
              <Ionicons name="send" size={moderateScale(22)} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

MessageInputComponent.displayName = 'MessageInput';

export const MessageInput = React.memo(MessageInputComponent);

const styles = StyleSheet.create({
  inputContainerWrapper: {
    // Убрали absolute positioning - теперь часть layout
    width: '100%',
  },
  inputContainer: {
    borderRadius: moderateScale(25),
    overflow: 'hidden',
    position: 'relative',
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
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    gap: scale(8),
  },
  iconButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: fontScale(15),
    maxHeight: verticalScale(60),
    paddingVertical: verticalScale(4),
  },
  sendButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  selectedImageContainer: {
    position: 'relative',
    width: scale(44),
    height: scale(44),
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(12),
  },
  removeImageButton: {
    position: 'absolute',
    top: -verticalScale(6),
    right: -scale(6),
    backgroundColor: '#fff',
    borderRadius: moderateScale(9),
  },
});
