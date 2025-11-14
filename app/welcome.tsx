import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale, BORDER_RADIUS } from '@/utils/responsive';

export default function WelcomeScreen() {
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!accepted) return;

    try {
      await AsyncStorage.setItem('hasAcceptedTerms', 'true');
      router.replace('/(tabs)/chat');
    } catch (error) {
      console.error('Error saving acceptance:', error);
    }
  };

  const openTerms = () => {
    Linking.openURL('https://shikari1994.github.io/recipe-ai-app/terms.html');
  };

  const openPrivacy = () => {
    Linking.openURL('https://shikari1994.github.io/recipe-ai-app/privacy.html');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460', '#533483', '#8A2BE2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Иконка приложения */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.purple.dark]}
              style={styles.iconGradient}
            >
              <Ionicons name="restaurant" size={moderateScale(60)} color="#fff" />
            </LinearGradient>
          </View>

          {/* Приветствие */}
          <Text style={styles.title}>Добро пожаловать в Recipe AI!</Text>
          <Text style={styles.subtitle}>
            Ваш умный помощник в создании рецептов на основе искусственного интеллекта
          </Text>

          {/* Предупреждение */}
          <View style={styles.warningBox}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={moderateScale(24)} color="#ffc107" />
              <Text style={styles.warningTitle}>Важная информация</Text>
            </View>
            <Text style={styles.warningText}>
              Рецепты генерируются искусственным интеллектом и могут содержать ошибки.
            </Text>
            <Text style={styles.warningText}>
              При наличии аллергий ВСЕГДА проверяйте состав продуктов самостоятельно и консультируйтесь с врачом.
            </Text>
            <Text style={styles.warningTextBold}>
              Мы не несём ответственности за последствия использования рецептов.
            </Text>
          </View>

          {/* Ссылки на документы */}
          <View style={styles.linksContainer}>
            <Text style={styles.linksText}>
              Продолжая, вы соглашаетесь с нашими:
            </Text>

            <TouchableOpacity style={styles.linkButton} onPress={openTerms}>
              <Ionicons name="document-text" size={moderateScale(20)} color={COLORS.primary} />
              <Text style={styles.linkText}>Условиями использования</Text>
              <Ionicons name="open-outline" size={moderateScale(16)} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={openPrivacy}>
              <Ionicons name="shield-checkmark" size={moderateScale(20)} color={COLORS.primary} />
              <Text style={styles.linkText}>Политикой конфиденциальности</Text>
              <Ionicons name="open-outline" size={moderateScale(16)} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Чекбокс согласия */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAccepted(!accepted)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted && (
                <Ionicons name="checkmark" size={moderateScale(20)} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxText}>
              Я прочитал(а) и соглашаюсь с условиями использования и политикой конфиденциальности
            </Text>
          </TouchableOpacity>

          {/* Кнопка продолжить */}
          <TouchableOpacity
            style={[styles.continueButton, !accepted && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!accepted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={accepted ? [COLORS.primary, COLORS.purple.dark] : ['#ccc', '#999']}
              style={styles.buttonGradient}
            >
              <Text style={styles.continueButtonText}>Продолжить</Text>
              <Ionicons name="arrow-forward" size={moderateScale(24)} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(80),
    paddingBottom: verticalScale(40),
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: verticalScale(24),
  },
  iconGradient: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: verticalScale(10) },
    shadowOpacity: 0.5,
    shadowRadius: scale(20),
    elevation: 10,
  },
  title: {
    fontSize: fontScale(28),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  subtitle: {
    fontSize: fontScale(16),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: verticalScale(32),
    lineHeight: moderateScale(24),
  },
  warningBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    borderWidth: 2,
    borderColor: '#ffc107',
    borderRadius: BORDER_RADIUS.lg,
    padding: scale(20),
    marginBottom: verticalScale(32),
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    gap: scale(8),
  },
  warningTitle: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: '#ffc107',
  },
  warningText: {
    fontSize: fontScale(14),
    color: '#fff',
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(8),
  },
  warningTextBold: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: moderateScale(22),
    marginTop: verticalScale(8),
  },
  linksContainer: {
    marginBottom: verticalScale(32),
  },
  linksText: {
    fontSize: fontScale(14),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(138,43,226,0.2)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: scale(12),
    marginBottom: verticalScale(12),
    gap: scale(8),
  },
  linkText: {
    fontSize: fontScale(14),
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(32),
    gap: scale(12),
  },
  checkbox: {
    width: scale(24),
    height: scale(24),
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(2),
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: fontScale(13),
    color: '#fff',
    lineHeight: moderateScale(20),
  },
  continueButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.3,
    shadowRadius: scale(12),
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(32),
    gap: scale(12),
  },
  continueButtonText: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomPadding: {
    height: verticalScale(20),
  },
});
