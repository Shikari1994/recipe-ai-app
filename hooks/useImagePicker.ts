import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

type ImagePickerOptions = {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
};

const DEFAULT_OPTIONS: ImagePickerOptions = {
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.8,
};

/**
 * Custom hook для работы с выбором и съемкой изображений
 * Управляет permissions и предоставляет удобные методы
 */
export function useImagePicker(options: ImagePickerOptions = {}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: options.allowsEditing ?? DEFAULT_OPTIONS.allowsEditing,
    aspect: options.aspect ?? DEFAULT_OPTIONS.aspect,
    quality: options.quality ?? DEFAULT_OPTIONS.quality,
  };

  // Запрос разрешений
  const requestPermissions = useCallback(async () => {
    try {
      const [cameraResult, libraryResult] = await Promise.all([
        ImagePicker.requestCameraPermissionsAsync(),
        ImagePicker.requestMediaLibraryPermissionsAsync(),
      ]);

      const granted = cameraResult.granted && libraryResult.granted;
      setHasPermissions(granted);

      if (!granted) {
        Alert.alert(
          'Требуются разрешения',
          'Пожалуйста, предоставьте доступ к камере и галерее в настройках.',
          [{ text: 'OK' }]
        );
      }

      return granted;
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось запросить разрешения');
      return false;
    }
  }, []);

  // Выбор из галереи
  const pickImage = useCallback(async () => {
    try {
      if (!hasPermissions) {
        const granted = await requestPermissions();
        if (!granted) return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        return imageUri;
      }

      return null;
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
      return null;
    }
  }, [hasPermissions, requestPermissions, pickerOptions]);

  // Съемка фото
  const takePhoto = useCallback(async () => {
    try {
      if (!hasPermissions) {
        const granted = await requestPermissions();
        if (!granted) return null;
      }

      const result = await ImagePicker.launchCameraAsync(pickerOptions);

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        return imageUri;
      }

      return null;
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сделать фото');
      return null;
    }
  }, [hasPermissions, requestPermissions, pickerOptions]);

  // Очистка выбранного изображения
  const clearImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // Показать выбор: камера или галерея
  const showImageOptions = useCallback(() => {
    Alert.alert(
      'Добавить фото',
      'Выберите источник',
      [
        { text: 'Камера', onPress: takePhoto },
        { text: 'Галерея', onPress: pickImage },
        { text: 'Отмена', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [takePhoto, pickImage]);

  return {
    selectedImage,
    hasPermissions,
    requestPermissions,
    pickImage,
    takePhoto,
    clearImage,
    showImageOptions,
    setSelectedImage,
  };
}
