import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Animated,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/utils/ThemeContext';
import { useLanguage } from '@/utils/LanguageContext';
import { PLATFORM } from '@/constants/ui';
import { fontScale, scale, verticalScale, moderateScale } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { MultiSelectModal, ServingsSelector } from '@/components/ui';
import { SettingItem, ProfileHeader, InfoModal, LanguageModal } from '@/components/profile';
import { getUserPreferences, saveUserPreferences } from '@/utils/userPreferences';
import type { UserPreferences, Allergen, DietaryRestriction } from '@/types';
import { LANGUAGES } from '@/constants/languages';

export default function ProfileScreen() {
  const { isDark, toggleTheme, colors } = useTheme();
  const { language, t } = useLanguage();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [slideAnim] = useState(new Animated.Value(0));

  // Настройки пользователя
  const [preferences, setPreferences] = useState<UserPreferences>({
    allergens: [],
    dietaryRestrictions: [],
    servings: 2,
  });
  const [allergensModalVisible, setAllergensModalVisible] = useState(false);
  const [dietModalVisible, setDietModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Мемоизированные функции
  const loadPreferences = useCallback(async () => {
    const prefs = await getUserPreferences();
    console.log('📋 Loaded preferences:', prefs);
    setPreferences(prefs);
  }, []);

  const handleSaveAllergens = useCallback(async (selected: Allergen[]) => {
    const newPrefs = { ...preferences, allergens: selected };
    const success = await saveUserPreferences(newPrefs);
    if (success) {
      setPreferences(newPrefs);
      console.log('✅ Allergens saved successfully:', selected);
    } else {
      console.error('❌ Failed to save allergens');
      Alert.alert(
        t.common.error || 'Ошибка',
        'Не удалось сохранить аллергены. Попробуйте снова.'
      );
    }
  }, [preferences, t]);

  const handleSaveDietaryRestrictions = useCallback(async (selected: DietaryRestriction[]) => {
    const newPrefs = { ...preferences, dietaryRestrictions: selected };
    const success = await saveUserPreferences(newPrefs);
    if (success) {
      setPreferences(newPrefs);
      console.log('✅ Dietary restrictions saved successfully:', selected);
    } else {
      console.error('❌ Failed to save dietary restrictions');
      Alert.alert(
        t.common.error || 'Ошибка',
        'Не удалось сохранить диетические ограничения. Попробуйте снова.'
      );
    }
  }, [preferences, t]);

  const handleServingsChange = useCallback(async (servings: number) => {
    const newPrefs = { ...preferences, servings };
    const success = await saveUserPreferences(newPrefs);
    if (success) {
      setPreferences(newPrefs);
      console.log('✅ Servings saved successfully:', servings);
    } else {
      console.error('❌ Failed to save servings');
      Alert.alert(
        t.common.error || 'Ошибка',
        'Не удалось сохранить количество порций. Попробуйте снова.'
      );
    }
  }, [preferences, t]);

  const showInfoModal = useCallback((title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content);
    setModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  }, [slideAnim]);

  const hideInfoModal = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  }, [slideAnim]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      t.profile.logoutConfirm,
      t.profile.logoutMessage,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.profile.logoutButton,
          onPress: () => {
            // TODO: Реализовать логику выхода из приложения
            Alert.alert(t.profile.logoutConfirm, t.profile.logoutNotImplemented);
          }
        },
      ]
    );
  }, [t]);

  // Мемоизированные массивы опций
  const allergenOptions = useMemo(() => [
    { value: 'milk' as Allergen, label: t.allergens.milk, icon: 'nutrition' },
    { value: 'eggs' as Allergen, label: t.allergens.eggs, icon: 'egg' },
    { value: 'tree-nuts' as Allergen, label: t.allergens.treeNuts, icon: 'leaf' },
    { value: 'peanuts' as Allergen, label: t.allergens.peanuts, icon: 'leaf' },
    { value: 'gluten' as Allergen, label: t.allergens.gluten, icon: 'warning' },
    { value: 'fish' as Allergen, label: t.allergens.fish, icon: 'fish' },
  ], [t]);

  const dietaryOptions = useMemo(() => [
    { value: 'vegetarian' as DietaryRestriction, label: t.profile.vegetarian, icon: 'leaf' },
    { value: 'vegan' as DietaryRestriction, label: t.profile.vegan, icon: 'leaf' },
    { value: 'low-calorie' as DietaryRestriction, label: t.profile.lowCalorie, icon: 'fitness' },
  ], [t]);

  // Загрузка настроек при монтировании
  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [loadPreferences])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header с кнопкой Назад */}
      <View style={[styles.header, { paddingTop: PLATFORM.safeArea.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/chat')}
        >
          <Ionicons
            name="arrow-back"
            size={moderateScale(28)}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t.tabs.profile}
        </Text>
        <View style={{ width: scale(40) }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.innerContent}>
      {/* Профиль пользователя */}
      <ProfileHeader userName={t.profile.username} textColor={colors.text} />

      {/* Настройки приложения */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t.profile.settings}</Text>

        <SettingItem
          icon="moon"
          title={t.profile.theme}
          value={isDark ? t.profile.themeDark : t.profile.themeLight}
          showArrow={false}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
          rightComponent={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#ddd', true: 'rgba(138, 43, 226, 0.8)' }}
              thumbColor="#fff"
            />
          }
        />

        <SettingItem
          icon="language"
          title={t.profile.language}
          value={LANGUAGES.find(l => l.code === language)?.nativeName || LANGUAGES[0].nativeName}
          onPress={() => setLanguageModalVisible(true)}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />
      </View>

      {/* Настройки рецептов */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t.profile.preferences}</Text>

        <SettingItem
          icon="nutrition"
          title={t.profile.dietaryRestrictions}
          value={
            preferences.dietaryRestrictions.length > 0
              ? `${t.profile.selected}: ${preferences.dietaryRestrictions.length}`
              : t.profile.noAllergens
          }
          onPress={() => setDietModalVisible(true)}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />

        <SettingItem
          icon="alert-circle"
          title={t.profile.allergens}
          value={
            preferences.allergens.length > 0
              ? `${t.profile.selected}: ${preferences.allergens.length}`
              : t.profile.noAllergens
          }
          onPress={() => setAllergensModalVisible(true)}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />

        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <Ionicons name="people" size={24} color="rgba(138, 43, 226, 0.8)" />
            <Text style={[styles.settingTitle, { color: colors.text }]}>{t.profile.servings}</Text>
          </View>
        </View>
        <View style={styles.servingsContainer}>
          <ServingsSelector
            servings={preferences.servings}
            onServingsChange={handleServingsChange}
            isDark={isDark}
          />
        </View>
      </View>

      {/* Дополнительно */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t.profile.additional}</Text>

        <SettingItem
          icon="help-circle"
          title={t.profile.help}
          onPress={() => showInfoModal(t.profile.help, t.profile.helpText)}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />

        <SettingItem
          icon="document-text"
          title={t.profile.termsOfService}
          onPress={() => Linking.openURL('https://shikari1994.github.io/recipe-ai-app/terms.html')}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />

        <SettingItem
          icon="shield-checkmark"
          title={t.profile.privacyPolicy}
          onPress={() => Linking.openURL('https://shikari1994.github.io/recipe-ai-app/privacy.html')}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />

        <SettingItem
          icon="information-circle"
          title={t.profile.about}
          onPress={() => showInfoModal(t.profile.about, t.profile.aboutText)}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />
      </View>

      {/* Кнопка выхода */}
      <TouchableOpacity
        style={styles.logoutButtonWrapper}
        onPress={handleLogout}
      >
        <View
          style={[
            styles.logoutButton,
            {
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: 'rgba(138, 43, 226, 0.4)',
            },
          ]}
        >
          <Ionicons name="log-out-outline" size={24} color="rgba(138, 43, 226, 0.8)" />
          <Text style={styles.logoutText}>{t.profile.logout}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
          </View>
        </View>
      </ScrollView>

      {/* Модальное окно для информации */}
      <InfoModal
        visible={modalVisible}
        title={modalTitle}
        content={modalContent}
        isDark={isDark}
        textColor={colors.text}
        slideAnim={slideAnim}
        onClose={hideInfoModal}
      />

      {/* Модальное окно аллергенов */}
      <MultiSelectModal
        visible={allergensModalVisible}
        title={t.profile.selectAllergensModal}
        options={allergenOptions}
        selectedValues={preferences.allergens}
        onClose={() => setAllergensModalVisible(false)}
        onSave={handleSaveAllergens}
        isDark={isDark}
      />

      {/* Модальное окно диетических ограничений */}
      <MultiSelectModal
        visible={dietModalVisible}
        title={t.profile.selectDietaryRestrictionsModal}
        options={dietaryOptions}
        selectedValues={preferences.dietaryRestrictions}
        onClose={() => setDietModalVisible(false)}
        onSave={handleSaveDietaryRestrictions}
        isDark={isDark}
      />

      {/* Модальное окно выбора языка */}
      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontScale(20),
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: verticalScale(16),
    paddingBottom: 140,
  },
  contentWrapper: {
    paddingHorizontal: 16,
  },
  innerContent: {
    position: 'relative',
  },
  section: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: fontScale(14),
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  servingsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: fontScale(16),
    fontWeight: '500',
    marginLeft: 12,
  },
  logoutButtonWrapper: {
    marginTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: 'rgba(138, 43, 226, 0.8)',
  },
  bottomPadding: {
    height: 120,
  },
});