import { useState, useCallback, useEffect } from 'react';

// Типы для модуля распознавания речи
type SpeechRecognitionModule = {
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  start: (config: SpeechConfig) => Promise<void>;
  stop: () => Promise<void>;
  abort: () => Promise<void>;
};

type SpeechConfig = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  requiresOnDeviceRecognition: boolean;
  addsPunctuation: boolean;
  contextualStrings: string[];
};

type SpeechEventHandler = (eventName: string, handler: (event: any) => void) => void;

// Проверяем доступность модуля
let ExpoSpeechRecognitionModule: SpeechRecognitionModule | null = null;
let useSpeechRecognitionEvent: SpeechEventHandler = () => {};
let isSpeechRecognitionAvailable = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SpeechRecognition = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = SpeechRecognition.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = SpeechRecognition.useSpeechRecognitionEvent;
  isSpeechRecognitionAvailable = true;
} catch (error) {
  console.warn('Speech recognition not available:', error);
}

export type SpeechRecognitionResult = {
  transcript: string;
  isFinal: boolean;
};

export const useSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Устанавливаем ошибку если модуль недоступен
  const moduleError = !isSpeechRecognitionAvailable
    ? 'Распознавание речи недоступно в Expo Go. Используйте development build.'
    : null;

  // Запросить разрешения
  const requestPermissions = useCallback(async () => {
    if (!ExpoSpeechRecognitionModule) return false;
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      return result.granted;
    } catch (err) {
      console.error('Error requesting permissions:', err);
      setError('Не удалось получить разрешение на использование микрофона');
      return false;
    }
  }, []);

  // Начать запись
  const startRecording = useCallback(async () => {
    if (!isSpeechRecognitionAvailable || !ExpoSpeechRecognitionModule) {
      console.warn('Speech recognition not available');
      setError(moduleError);
      return;
    }

    try {
      setError(null);
      setTranscript('');

      // Проверяем разрешения
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setError('Нет разрешения на использование микрофона');
        return;
      }

      // Запускаем распознавание
      await ExpoSpeechRecognitionModule.start({
        lang: 'ru-RU',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
        contextualStrings: ['рецепт', 'блюдо', 'ингредиенты', 'готовить'],
      });
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Не удалось начать запись');
      setIsRecording(false);
    }
  }, [requestPermissions, moduleError]);

  // Остановить запись
  const stopRecording = useCallback(async () => {
    if (!ExpoSpeechRecognitionModule) return;
    try {
      await ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  }, []);

  // Отменить запись
  const cancelRecording = useCallback(async () => {
    if (!ExpoSpeechRecognitionModule) return;
    try {
      await ExpoSpeechRecognitionModule.abort();
      setTranscript('');
      setIsRecording(false);
    } catch (err) {
      console.error('Error canceling recording:', err);
    }
  }, []);

  // Очистить транскрипт
  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  // Cleanup: останавливаем запись при размонтировании компонента
  useEffect(() => {
    return () => {
      if (isRecording && ExpoSpeechRecognitionModule) {
        ExpoSpeechRecognitionModule.stop().catch(err =>
          console.error('Error stopping recording on unmount:', err)
        );
      }
    };
  }, [isRecording]);

  return {
    isRecording,
    transcript,
    error: error || moduleError,
    startRecording,
    stopRecording,
    cancelRecording,
    clearTranscript,
  };
};
