import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Конвертирует изображение в base64 строку
 * @param imageUri - URI изображения
 * @returns base64 строка изображения
 */
export async function convertImageToBase64(imageUri: string): Promise<string> {
  try {
    // Для web используем fetch
    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // Для мобильных платформ
    // Используем expo-image-manipulator для надежной конвертации
    const manipResult = await manipulateAsync(
      imageUri,
      [{ resize: { width: 1024 } }], // Уменьшаем размер для экономии
      { compress: 0.7, format: SaveFormat.JPEG, base64: true }
    );

    if (!manipResult.base64) {
      throw new Error('Не удалось получить base64 из изображения');
    }

    return manipResult.base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    throw new Error('Не удалось обработать изображение. Попробуйте другое фото.');
  }
}

/**
 * Получает MIME тип изображения из URI
 * @param imageUri - URI изображения
 * @returns MIME тип (например, 'image/jpeg')
 */
export function getImageMimeType(imageUri: string): string {
  // Поскольку мы используем expo-image-manipulator с форматом JPEG,
  // всегда возвращаем image/jpeg для мобильных платформ
  if (Platform.OS !== 'web') {
    return 'image/jpeg';
  }

  // Для web пытаемся определить по расширению
  const extension = imageUri.split('.').pop()?.toLowerCase()?.split('?')[0]; // Убираем query параметры

  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg'; // По умолчанию
  }
}
