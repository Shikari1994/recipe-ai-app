import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

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

  // Проверяем доступность модуля
  if (!isSpeechRecognitionAvailable) {
    return {
      isRecording: false,
      transcript: '',
      error: 'Распознавание речи недоступно в Expo Go. Используйте development build.',
      startRecording: async () => {
        console.warn('Speech recognition not available');
      },
      stopRecording: async () => {},
      cancelRecording: async () => {},
      clearTranscript: () => {},
    };
  }

  // Слушаем события распознавания речи
  useSpeechRecognitionEvent('start', () => {
    setIsRecording(true);
    setError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const results = event.results;
    if (results && results.length > 0) {
      const latestResult = results[results.length - 1];
      if (latestResult?.transcription) {
        setTranscript(latestResult.transcription);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsRecording(false);
    setError(event.error || 'Ошибка распознавания речи');
    console.error('Speech recognition error:', event);
  });

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
      if (!ExpoSpeechRecognitionModule) return;
      await ExpoSpeechRecognitionModule.start({
        lang: 'ru-RU',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
        contextualStrings: ['рецепт', 'блюдо', 'ингредиенты', 'готовить'],
      });
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Не удалось начать запись');
      setIsRecording(false);
    }
  }, [requestPermissions]);

  // Остановить запись
  const stopRecording = useCallback(async () => {
    if (!ExpoSpeechRecognitionModule) return;
    try {
      await ExpoSpeechRecognitionModule.stop();
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

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearTranscript,
  };
};
