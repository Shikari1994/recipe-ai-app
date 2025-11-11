import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Хук для работы с AsyncStorage с автоматической синхронизацией состояния
 * Аналог localStorage для React Native с type-safe интерфейсом
 *
 * @param key - ключ для хранения в AsyncStorage
 * @param initialValue - начальное значение
 * @returns [value, setValue, isLoading, error]
 *
 * @example
 * const [userName, setUserName, isLoading] = useLocalStorage('userName', 'Guest');
 *
 * // Изменение значения автоматически сохраняется в AsyncStorage
 * setUserName('John Doe');
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => Promise<void>, boolean, Error | null] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Загрузка значения при монтировании
  useEffect(() => {
    const loadValue = async () => {
      try {
        setIsLoading(true);
        const item = await AsyncStorage.getItem(key);

        if (item !== null) {
          const parsed = JSON.parse(item) as T;
          setStoredValue(parsed);
        }

        setError(null);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        console.error(`Error loading ${key} from AsyncStorage:`, errorObj);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Функция для установки значения
  const setValue = useCallback(
    async (value: T | ((prev: T) => T)) => {
      try {
        // Поддержка функционального обновления
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Сохраняем в state
        setStoredValue(valueToStore);

        // Сохраняем в AsyncStorage
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));

        setError(null);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        console.error(`Error saving ${key} to AsyncStorage:`, errorObj);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue, isLoading, error];
}
