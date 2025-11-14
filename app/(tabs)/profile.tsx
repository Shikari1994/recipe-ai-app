import React, { useState, useCallback } from 'react';
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
import { BlurView } from 'expo-blur';
import { PLATFORM } from '@/constants/ui';
import { MultiSelectModal, ServingsSelector, WallpaperSelector } from '@/components/ui';
import { SettingItem, ProfileHeader, InfoModal } from '@/components/profile';
import {
  getUserPreferences,
  saveUserPreferences,
  setWallpaper,
  UserPreferences,
  Allergen,
  DietaryRestriction,
} from '@/utils/userPreferences';
import { WALLPAPERS } from '@/constants/wallpapers';

export default function ProfileScreen() {
  const { isDark, toggleTheme, colors } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [userName, setUserName] = useState('Олег');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [slideAnim] = useState(new Animated.Value(0));

  // Настройки пользователя
  const [preferences, setPreferences] = useState<UserPreferences>({
    allergens: [],
    dietaryRestrictions: [],
    servings: 2,
    wallpaperId: 'dark-image',
  });
  const [allergensModalVisible, setAllergensModalVisible] = useState(false);
  const [dietModalVisible, setDietModalVisible] = useState(false);
  const [wallpaperModalVisible, setWallpaperModalVisible] = useState(false);

  // Загрузка настроек при монтировании
  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [])
  );

  const loadPreferences = async () => {
    const prefs = await getUserPreferences();
    setPreferences(prefs);
  };

  const handleSaveAllergens = async (selected: Allergen[]) => {
    const newPrefs = { ...preferences, allergens: selected };
    const success = await saveUserPreferences(newPrefs);
    if (success) {
      setPreferences(newPrefs);
    }
  };

  const handleSaveDietaryRestrictions = async (selected: DietaryRestriction[]) => {
    const newPrefs = { ...preferences, dietaryRestrictions: selected };
    const success = await saveUserPreferences(newPrefs);
    if (success) {
      setPreferences(newPrefs);
    }
  };

  const handleServingsChange = async (servings: number) => {
    const newPrefs = { ...preferences, servings };
    const success = await saveUserPreferences(newPrefs);
    if (success) {
      setPreferences(newPrefs);
    }
  };

  const handleWallpaperChange = async (wallpaperId: string) => {
    const success = await setWallpaper(wallpaperId);
    if (success) {
      setPreferences({ ...preferences, wallpaperId });
    }
  };

  const getWallpaperName = () => {
    const wallpaper = WALLPAPERS.find(w => w.id === preferences.wallpaperId);
    return wallpaper ? wallpaper.name : 'Не выбрано';
  };

  const showInfoModal = (title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content);
    setModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  };

  const hideInfoModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          onPress: () => {
            // TODO: Реализовать логику выхода из приложения
            Alert.alert('Выход', 'Функция выхода будет реализована позже');
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View
            style={[
              styles.blurContainer,
              {
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(138, 43, 226, 0.3)' : 'rgba(138, 43, 226, 0.2)',
              },
            ]}
          >
            <BlurView
              intensity={80}
              tint={isDark ? 'dark' : 'light'}
              style={styles.blurBackground}
            />
            <View style={styles.innerContent}>
      {/* Профиль пользователя */}
      <ProfileHeader userName={userName} textColor={colors.text} />

      {/* Настройки приложения */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Настройки приложения</Text>

        <SettingItem
          icon="moon"
          title="Темная тема"
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
          icon="notifications"
          title="Уведомления"
          showArrow={false}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
          rightComponent={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#ddd', true: 'rgba(138, 43, 226, 0.8)' }}
              thumbColor="#fff"
            />
          }
        />

        <SettingItem
          icon="language"
          title="Язык"
          value="Русский"
          onPress={() => Alert.alert('Язык', 'Выбор языка')}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />

        <SettingItem
          icon="image"
          title="Обои"
          value={getWallpaperName()}
          onPress={() => setWallpaperModalVisible(true)}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />
      </View>

      {/* Настройки рецептов */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Предпочтения</Text>

        <SettingItem
          icon="nutrition"
          title="Диетические ограничения"
          value={
            preferences.dietaryRestrictions.length > 0
              ? `Выбрано: ${preferences.dietaryRestrictions.length}`
              : 'Не выбрано'
          }
          onPress={() => setDietModalVisible(true)}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />

        <SettingItem
          icon="alert-circle"
          title="Аллергии"
          value={
            preferences.allergens.length > 0
              ? `Выбрано: ${preferences.allergens.length}`
              : 'Не указано'
          }
          onPress={() => setAllergensModalVisible(true)}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />

        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <Ionicons name="people" size={24} color="rgba(138, 43, 226, 0.8)" />
            <Text style={[styles.settingTitle, { color: colors.text }]}>Количество порций</Text>
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
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Дополнительно</Text>

        <SettingItem
          icon="help-circle"
          title="Помощь"
          onPress={() => showInfoModal('Помощь', 'Это приложение для поиска рецептов по продуктам.')}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />

        <SettingItem
          icon="document-text"
          title="Условия использования"
          onPress={() => Linking.openURL('https://ЗАМЕНИТЕ_НА_ВАШ_URL/terms.html')}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />

        <SettingItem
          icon="shield-checkmark"
          title="Политика конфиденциальности"
          onPress={() => Linking.openURL('https://ЗАМЕНИТЕ_НА_ВАШ_URL/privacy.html')}
          borderColor={colors.border}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
        />

        <SettingItem
          icon="information-circle"
          title="О приложении"
          onPress={() => showInfoModal('О приложении', 'Версия 1.0.0\n\nRecipe AI - ваш умный помощник в создании рецептов.\n\nРазработано с ❤️')}
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
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
            </View>
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
        title="Выберите аллергены"
        options={[
          { value: 'milk' as Allergen, label: 'Молоко', icon: 'nutrition' },
          { value: 'eggs' as Allergen, label: 'Яйца', icon: 'egg' },
          { value: 'tree-nuts' as Allergen, label: 'Орехи', icon: 'leaf' },
          { value: 'peanuts' as Allergen, label: 'Арахис', icon: 'leaf' },
          { value: 'gluten' as Allergen, label: 'Глютен', icon: 'warning' },
          { value: 'fish' as Allergen, label: 'Рыба', icon: 'fish' },
        ]}
        selectedValues={preferences.allergens}
        onClose={() => setAllergensModalVisible(false)}
        onSave={handleSaveAllergens}
        isDark={isDark}
      />

      {/* Модальное окно диетических ограничений */}
      <MultiSelectModal
        visible={dietModalVisible}
        title="Диетические ограничения"
        options={[
          { value: 'vegetarian' as DietaryRestriction, label: 'Вегетарианские', icon: 'leaf' },
          { value: 'vegan' as DietaryRestriction, label: 'Веганские', icon: 'leaf' },
          { value: 'low-calorie' as DietaryRestriction, label: 'Низкокалорийные', icon: 'fitness' },
        ]}
        selectedValues={preferences.dietaryRestrictions}
        onClose={() => setDietModalVisible(false)}
        onSave={handleSaveDietaryRestrictions}
        isDark={isDark}
      />

      {/* Модальное окно выбора обоев */}
      <WallpaperSelector
        visible={wallpaperModalVisible}
        selectedWallpaperId={preferences.wallpaperId || 'dark-image'}
        onClose={() => setWallpaperModalVisible(false)}
        onSelect={handleWallpaperChange}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: PLATFORM.contentPaddingTop,
    paddingBottom: 140,
  },
  contentWrapper: {
    paddingHorizontal: 16,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: 'rgba(138, 43, 226, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  innerContent: {
    position: 'relative',
    zIndex: 1,
  },
  section: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
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
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(138, 43, 226, 0.8)',
  },
  bottomPadding: {
    height: 120,
  },
});