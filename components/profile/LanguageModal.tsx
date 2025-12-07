import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/utils/ThemeContext';
import { useLanguage } from '@/utils/LanguageContext';
import { LANGUAGES } from '@/constants/languages';
import { COLORS } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale } from '@/utils/responsive';

type LanguageModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const LanguageModal: React.FC<LanguageModalProps> = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleSelectLanguage = async (code: string) => {
    await setLanguage(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t.profile.language}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={moderateScale(24)} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Languages List */}
          <FlatList
            data={LANGUAGES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.languageItem,
                  {
                    backgroundColor: language === item.code
                      ? COLORS.primary + '20'
                      : 'transparent',
                  },
                ]}
                onPress={() => handleSelectLanguage(item.code)}
              >
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, { color: colors.text }]}>
                    {item.nativeName}
                  </Text>
                  <Text style={[styles.languageSubtitle, { color: colors.textSecondary }]}>
                    {item.name}
                  </Text>
                </View>
                {language === item.code && (
                  <Ionicons name="checkmark-circle" size={moderateScale(24)} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  modal: {
    width: '100%',
    maxWidth: scale(400),
    borderRadius: moderateScale(20),
    padding: scale(20),
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: fontScale(20),
    fontWeight: '600',
  },
  closeButton: {
    padding: scale(4),
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(8),
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: fontScale(16),
    fontWeight: '500',
    marginBottom: verticalScale(4),
  },
  languageSubtitle: {
    fontSize: fontScale(14),
  },
});
