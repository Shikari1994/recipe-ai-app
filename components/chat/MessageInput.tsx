import React from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, getThemeColors } from '@/constants/colors';
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
  bottom: number;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onImagePress: () => void;
  onClearImage: () => void;
  onMicrophonePress: () => void;
};

export const MessageInput = React.memo(({
  inputText,
  selectedImage,
  canSend,
  isDark,
  isRecording,
  speechError,
  pulseAnim,
  bottom,
  onChangeText,
  onSend,
  onImagePress,
  onClearImage,
  onMicrophonePress,
}: MessageInputProps) => {
  const themeColors = getThemeColors(isDark);
  const { t } = useLanguage();

  return (
    <View style={[styles.inputContainerWrapper, { bottom }]}>
      <View style={styles.inputContainer}>
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
        <View
          style={[
            styles.inputOverlay,
            {
              backgroundColor: isDark
                ? (Platform.OS === 'android' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)')
                : (Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.3)')
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
                  <Ionicons name="close-circle" size={moderateScale(18)} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.iconButton} onPress={onImagePress}>
                <Ionicons name="camera" size={moderateScale(26)} color={COLORS.primary} />
              </TouchableOpacity>
            )}

            {/* Кнопка микрофона - показываем только если модуль доступен */}
            {!speechError && (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={[styles.iconButton, isRecording && styles.recordingButton]}
                  onPress={onMicrophonePress}
                >
                  <Ionicons
                    name={isRecording ? "mic" : "mic-outline"}
                    size={moderateScale(26)}
                    color={isRecording ? '#fff' : COLORS.primary}
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
              style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
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
});

const styles = StyleSheet.create({
  inputContainerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: scale(16),
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
    paddingVertical: verticalScale(6), // Уменьшено с 8 до 6
    gap: scale(8),
  },
  iconButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(138, 43, 226, 0.15)',
  },
  recordingButton: {
    backgroundColor: COLORS.primary,
  },
  input: {
    flex: 1,
    fontSize: fontScale(15),
    maxHeight: verticalScale(70), // Уменьшено с 80 до 70
    paddingVertical: verticalScale(6), // Уменьшено с 8 до 6
  },
  sendButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  selectedImageContainer: {
    position: 'relative',
    width: scale(50),
    height: scale(50),
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
