/**
 * Утилиты для работы с множественными чатами
 * ВЕРСИЯ 2.0 - Оптимизированное инкрементальное сохранение
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import type { Chat, Message } from '@/types';

// Ключи хранилища V2
const CHATS_METADATA_KEY = '@recipe_ai_chats_metadata_v2';
const CHAT_MESSAGES_PREFIX = '@recipe_ai_chat_';
const ACTIVE_CHAT_KEY = '@recipe_ai_active_chat';
const STORAGE_VERSION_KEY = '@recipe_ai_storage_version';
const MIGRATION_BACKUP_KEY = '@recipe_ai_migration_backup';

// Старые ключи для миграции
const OLD_CHATS_KEY = '@recipe_ai_chats';

const CURRENT_VERSION = '2.0';

// Тип для метаданных чата (без сообщений)
type ChatMetadata = Omit<Chat, 'messages'> & { messageCount: number };

// ============================================
// МИГРАЦИЯ ДАННЫХ
// ============================================

/**
 * Проверка и выполнение миграции данных при необходимости
 */
async function checkAndMigrate(): Promise<void> {
  try {
    const version = await AsyncStorage.getItem(STORAGE_VERSION_KEY);

    // Если версия уже 2.0, миграция не нужна
    if (version === CURRENT_VERSION) {
      return;
    }

    console.log('🔄 Starting chat storage migration to v2.0...');

    // Загружаем старые данные
    const oldChatsJson = await AsyncStorage.getItem(OLD_CHATS_KEY);
    if (!oldChatsJson) {
      // Нет старых данных - устанавливаем версию и выходим
      await AsyncStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
      console.log('✅ No old data to migrate. Set version to v2.0');
      return;
    }

    // Создаем backup перед миграцией
    await AsyncStorage.setItem(MIGRATION_BACKUP_KEY, oldChatsJson);
    console.log('📦 Backup created');

    const oldChats = JSON.parse(oldChatsJson);

    // Мигрируем каждый чат
    const metadata: ChatMetadata[] = [];

    for (const chat of oldChats) {
      // Сохраняем сообщения отдельно
      const messages = chat.messages || [];
      if (messages.length > 0) {
        await AsyncStorage.setItem(
          `${CHAT_MESSAGES_PREFIX}${chat.id}`,
          JSON.stringify(messages)
        );
      }

      // Создаем метаданные
      const meta: ChatMetadata = {
        id: chat.id,
        title: chat.title,
        preview: chat.preview,
        timestamp: chat.timestamp,
        createdAt: chat.createdAt,
        recipeCount: chat.recipeCount || 0,
        messageCount: messages.length,
      };
      metadata.push(meta);
    }

    // Сохраняем метаданные
    await AsyncStorage.setItem(CHATS_METADATA_KEY, JSON.stringify(metadata));

    // Удаляем старый ключ
    await AsyncStorage.removeItem(OLD_CHATS_KEY);

    // Устанавливаем версию
    await AsyncStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);

    console.log(`✅ Migration complete! Migrated ${oldChats.length} chats`);
  } catch (error) {
    console.error('❌ Migration error:', error);
    // При ошибке пытаемся восстановить из backup
    try {
      const backup = await AsyncStorage.getItem(MIGRATION_BACKUP_KEY);
      if (backup) {
        await AsyncStorage.setItem(OLD_CHATS_KEY, backup);
        console.log('🔙 Restored from backup');
      }
    } catch (restoreError) {
      console.error('Failed to restore from backup:', restoreError);
    }
    throw error;
  }
}

// ============================================
// ПОЛУЧЕНИЕ МЕТАДАННЫХ ЧАТОВ
// ============================================

export async function getAllChatsMetadata(): Promise<ChatMetadata[]> {
  // Проверяем миграцию при первом вызове
  await checkAndMigrate();

  try {
    const metaJson = await AsyncStorage.getItem(CHATS_METADATA_KEY);
    if (!metaJson) return [];

    const metadata = JSON.parse(metaJson);
    // Преобразуем строки дат обратно в Date объекты
    return metadata.map((meta: any) => ({
      ...meta,
      timestamp: new Date(meta.timestamp),
      createdAt: new Date(meta.createdAt),
    }));
  } catch (error) {
    console.error('Error loading chats metadata:', error);
    return [];
  }
}

// ============================================
// ПОЛУЧЕНИЕ СООБЩЕНИЙ ЧАТА
// ============================================

export async function getChatMessages(chatId: string): Promise<Message[]> {
  try {
    const messagesJson = await AsyncStorage.getItem(`${CHAT_MESSAGES_PREFIX}${chatId}`);
    if (!messagesJson) return [];

    const messages = JSON.parse(messagesJson);
    // Преобразуем строки дат обратно в Date объекты
    return messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (error) {
    console.error(`Error loading messages for chat ${chatId}:`, error);
    return [];
  }
}

// ============================================
// СОХРАНЕНИЕ СООБЩЕНИЙ ЧАТА
// ============================================

export async function saveChatMessages(chatId: string, messages: Message[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${CHAT_MESSAGES_PREFIX}${chatId}`,
      JSON.stringify(messages)
    );
  } catch (error) {
    console.error(`Error saving messages for chat ${chatId}:`, error);
    throw error;
  }
}

// ============================================
// ОБНОВЛЕНИЕ МЕТАДАННЫХ ЧАТА
// ============================================

export async function updateChatMetadata(chatId: string, updates: Partial<ChatMetadata>): Promise<void> {
  try {
    const metadata = await getAllChatsMetadata();
    const chatIndex = metadata.findIndex((meta) => meta.id === chatId);

    if (chatIndex === -1) return;

    metadata[chatIndex] = {
      ...metadata[chatIndex],
      ...updates,
      timestamp: new Date(),
    };

    await AsyncStorage.setItem(CHATS_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Error updating chat metadata:', error);
    throw error;
  }
}

// ============================================
// ПОЛУЧЕНИЕ ВСЕХ ЧАТОВ (С СООБЩЕНИЯМИ)
// ============================================

export async function getAllChats(): Promise<Chat[]> {
  const metadata = await getAllChatsMetadata();
  const chats: Chat[] = [];

  for (const meta of metadata) {
    const messages = await getChatMessages(meta.id);
    const chat: Chat = {
      id: meta.id,
      title: meta.title,
      preview: meta.preview,
      timestamp: meta.timestamp,
      createdAt: meta.createdAt,
      recipeCount: meta.recipeCount,
      messages,
    };
    chats.push(chat);
  }

  return chats;
}

// ============================================
// СОХРАНЕНИЕ ВСЕХ ЧАТОВ (ОБРАТНАЯ СОВМЕСТИМОСТЬ)
// ============================================

export async function saveAllChats(chats: Chat[]): Promise<void> {
  try {
    const metadata: ChatMetadata[] = [];

    for (const chat of chats) {
      // Сохраняем сообщения отдельно
      await saveChatMessages(chat.id, chat.messages);

      // Создаем метаданные
      metadata.push({
        id: chat.id,
        title: chat.title,
        preview: chat.preview,
        timestamp: chat.timestamp,
        createdAt: chat.createdAt,
        recipeCount: chat.recipeCount,
        messageCount: chat.messages.length,
      });
    }

    await AsyncStorage.setItem(CHATS_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Error saving chats:', error);
    throw error;
  }
}

// ============================================
// СОЗДАНИЕ НОВОГО ЧАТА
// ============================================

export async function createNewChat(firstMessage?: string): Promise<Chat> {
  const newChat: Chat = {
    id: uuid.v4() as string,
    title: firstMessage ? generateChatTitle(firstMessage) : 'Новый чат',
    preview: firstMessage || '',
    timestamp: new Date(),
    createdAt: new Date(),
    messages: [],
    recipeCount: 0,
  };

  const metadata = await getAllChatsMetadata();
  const newMeta: ChatMetadata = {
    id: newChat.id,
    title: newChat.title,
    preview: newChat.preview,
    timestamp: newChat.timestamp,
    createdAt: newChat.createdAt,
    recipeCount: 0,
    messageCount: 0,
  };

  metadata.unshift(newMeta); // Добавляем в начало
  await AsyncStorage.setItem(CHATS_METADATA_KEY, JSON.stringify(metadata));
  await setActiveChat(newChat.id);

  return newChat;
}

// ============================================
// ПОЛУЧЕНИЕ ЧАТА ПО ID
// ============================================

export async function getChatById(chatId: string): Promise<Chat | null> {
  try {
    const metadata = await getAllChatsMetadata();
    const meta = metadata.find((m) => m.id === chatId);

    if (!meta) return null;

    const messages = await getChatMessages(chatId);

    return {
      id: meta.id,
      title: meta.title,
      preview: meta.preview,
      timestamp: meta.timestamp,
      createdAt: meta.createdAt,
      recipeCount: meta.recipeCount,
      messages,
    };
  } catch (error) {
    console.error(`Error getting chat ${chatId}:`, error);
    return null;
  }
}

// ============================================
// ОБНОВЛЕНИЕ ЧАТА
// ============================================

export async function updateChat(chatId: string, updates: Partial<Chat>): Promise<void> {
  try {
    // Если обновляются сообщения, сохраняем их отдельно
    if (updates.messages) {
      await saveChatMessages(chatId, updates.messages);
      delete updates.messages; // Убираем из метаданных
    }

    // Обновляем метаданные
    const metaUpdates: Partial<ChatMetadata> = {
      ...updates,
      messageCount: updates.messages?.length,
    };

    await updateChatMetadata(chatId, metaUpdates);
  } catch (error) {
    console.error('Error updating chat:', error);
    throw error;
  }
}

// ============================================
// ДОБАВЛЕНИЕ СООБЩЕНИЯ В ЧАТ - ОПТИМИЗИРОВАНО
// ============================================

export async function addMessageToChat(chatId: string, message: Message): Promise<void> {
  try {
    // Загружаем только сообщения этого чата
    const messages = await getChatMessages(chatId);
    messages.push(message);

    // Сохраняем сообщения
    await saveChatMessages(chatId, messages);

    // Получаем текущие метаданные
    const metadata = await getAllChatsMetadata();
    const chatIndex = metadata.findIndex((m) => m.id === chatId);

    if (chatIndex === -1) return;

    const meta = metadata[chatIndex];

    // Обновляем preview
    if (!message.isUser && message.text) {
      meta.preview = message.text.substring(0, 100);
    } else if (message.isUser && message.text) {
      meta.preview = message.text.substring(0, 100);
    }

    // Обновляем количество рецептов
    if (message.aiRecipes && message.aiRecipes.length > 0) {
      meta.recipeCount += message.aiRecipes.length;
    }

    // Обновляем название чата если это первое сообщение пользователя
    const userMessagesCount = messages.filter(m => m.isUser).length;
    if (userMessagesCount === 1 && message.isUser && message.text) {
      meta.title = generateChatTitle(message.text);
    }

    meta.timestamp = new Date();
    meta.messageCount = messages.length;

    // Сохраняем ТОЛЬКО метаданные
    await AsyncStorage.setItem(CHATS_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Error adding message to chat:', error);
    throw error;
  }
}

// ============================================
// УДАЛЕНИЕ ЧАТА
// ============================================

export async function deleteChat(chatId: string): Promise<void> {
  try {
    // Удаляем сообщения чата
    await AsyncStorage.removeItem(`${CHAT_MESSAGES_PREFIX}${chatId}`);

    // Удаляем из метаданных
    const metadata = await getAllChatsMetadata();
    const filteredMetadata = metadata.filter((meta) => meta.id !== chatId);
    await AsyncStorage.setItem(CHATS_METADATA_KEY, JSON.stringify(filteredMetadata));

    // Если удаляем активный чат, сбрасываем активный
    const activeId = await getActiveChat();
    if (activeId === chatId) {
      await setActiveChat(null);
    }
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
}

// ============================================
// ПЕРЕИМЕНОВАНИЕ ЧАТА
// ============================================

export async function renameChat(chatId: string, newTitle: string): Promise<void> {
  await updateChatMetadata(chatId, { title: newTitle });
}

// ============================================
// ОЧИСТКА СООБЩЕНИЙ В ЧАТЕ
// ============================================

export async function clearChatMessages(chatId: string): Promise<void> {
  try {
    // Очищаем сообщения
    await saveChatMessages(chatId, []);

    // Обновляем метаданные
    await updateChatMetadata(chatId, {
      recipeCount: 0,
      preview: '',
      messageCount: 0,
    });
  } catch (error) {
    console.error('Error clearing chat messages:', error);
    throw error;
  }
}

// ============================================
// АКТИВНЫЙ ЧАТ (ID текущего открытого чата)
// ============================================

export async function getActiveChat(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ACTIVE_CHAT_KEY);
  } catch (error) {
    console.error('Error getting active chat:', error);
    return null;
  }
}

export async function setActiveChat(chatId: string | null): Promise<void> {
  try {
    if (chatId) {
      await AsyncStorage.setItem(ACTIVE_CHAT_KEY, chatId);
    } else {
      await AsyncStorage.removeItem(ACTIVE_CHAT_KEY);
    }
  } catch (error) {
    console.error('Error setting active chat:', error);
  }
}

// ============================================
// ГЕНЕРАЦИЯ НАЗВАНИЯ ЧАТА ИЗ ПЕРВОГО СООБЩЕНИЯ
// ============================================

function generateChatTitle(text: string): string {
  // Берем первые 30 символов или до первого знака препинания
  const title = text
    .split(/[.!?,\n]/)[0]
    .substring(0, 40)
    .trim();

  return title || 'Новый чат';
}

// ============================================
// ГРУППИРОВКА ЧАТОВ ПО ДАТАМ
// ============================================

export function groupChatsByDate(chats: Chat[]): { title: string; chats: Chat[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const groups: { title: string; chats: Chat[] }[] = [
    { title: 'Сегодня', chats: [] },
    { title: 'Вчера', chats: [] },
    { title: 'Прошлая неделя', chats: [] },
    { title: 'Прошлый месяц', chats: [] },
    { title: 'Давно', chats: [] },
  ];

  chats.forEach((chat) => {
    const chatDate = new Date(chat.timestamp);

    if (chatDate >= today) {
      groups[0].chats.push(chat);
    } else if (chatDate >= yesterday && chatDate < today) {
      groups[1].chats.push(chat);
    } else if (chatDate >= weekAgo && chatDate < yesterday) {
      groups[2].chats.push(chat);
    } else if (chatDate >= monthAgo && chatDate < weekAgo) {
      groups[3].chats.push(chat);
    } else {
      groups[4].chats.push(chat);
    }
  });

  // Фильтруем пустые группы
  return groups.filter((group) => group.chats.length > 0);
}

// ============================================
// УТИЛИТА ДЛЯ ВОССТАНОВЛЕНИЯ ИЗ BACKUP
// ============================================

export async function restoreFromBackup(): Promise<boolean> {
  try {
    const backup = await AsyncStorage.getItem(MIGRATION_BACKUP_KEY);
    if (!backup) {
      console.log('No backup found');
      return false;
    }

    await AsyncStorage.setItem(OLD_CHATS_KEY, backup);
    await AsyncStorage.removeItem(STORAGE_VERSION_KEY);
    console.log('✅ Restored from backup. Restart app to re-migrate.');
    return true;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    return false;
  }
}
