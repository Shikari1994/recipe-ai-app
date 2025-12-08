/**
 * Утилиты для работы с множественными чатами
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import type { Chat, Message } from '@/types';

const CHATS_KEY = '@recipe_ai_chats';
const ACTIVE_CHAT_KEY = '@recipe_ai_active_chat';

// ============================================
// Получение всех чатов
// ============================================

export async function getAllChats(): Promise<Chat[]> {
  try {
    const chatsJson = await AsyncStorage.getItem(CHATS_KEY);
    if (!chatsJson) return [];

    const chats = JSON.parse(chatsJson);
    // Преобразуем строки дат обратно в Date объекты
    return chats.map((chat: any) => ({
      ...chat,
      timestamp: new Date(chat.timestamp),
      createdAt: new Date(chat.createdAt),
      messages: chat.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.error('Error loading chats:', error);
    return [];
  }
}

// ============================================
// Сохранение всех чатов
// ============================================

export async function saveAllChats(chats: Chat[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Error saving chats:', error);
  }
}

// ============================================
// Создание нового чата
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

  const chats = await getAllChats();
  chats.unshift(newChat); // Добавляем в начало
  await saveAllChats(chats);
  await setActiveChat(newChat.id);

  return newChat;
}

// ============================================
// Получение чата по ID
// ============================================

export async function getChatById(chatId: string): Promise<Chat | null> {
  const chats = await getAllChats();
  return chats.find((chat) => chat.id === chatId) || null;
}

// ============================================
// Обновление чата
// ============================================

export async function updateChat(chatId: string, updates: Partial<Chat>): Promise<void> {
  const chats = await getAllChats();
  const chatIndex = chats.findIndex((chat) => chat.id === chatId);

  if (chatIndex === -1) return;

  chats[chatIndex] = {
    ...chats[chatIndex],
    ...updates,
    timestamp: new Date(), // Обновляем время последнего изменения
  };

  await saveAllChats(chats);
}

// ============================================
// Добавление сообщения в чат
// ============================================

export async function addMessageToChat(chatId: string, message: Message): Promise<void> {
  const chats = await getAllChats();
  const chatIndex = chats.findIndex((chat) => chat.id === chatId);

  if (chatIndex === -1) return;

  const chat = chats[chatIndex];
  chat.messages.push(message);

  // Обновляем превью и количество рецептов
  if (!message.isUser && message.text) {
    chat.preview = message.text.substring(0, 100);
  } else if (message.isUser && message.text) {
    chat.preview = message.text.substring(0, 100);
  }

  if (message.aiRecipes && message.aiRecipes.length > 0) {
    chat.recipeCount += message.aiRecipes.length;
  }

  // Обновляем название чата если это первое сообщение пользователя
  if (chat.messages.filter(m => m.isUser).length === 1 && message.isUser && message.text) {
    chat.title = generateChatTitle(message.text);
  }

  chat.timestamp = new Date();
  await saveAllChats(chats);
}

// ============================================
// Удаление чата
// ============================================

export async function deleteChat(chatId: string): Promise<void> {
  try {
    const chats = await getAllChats();
    const filteredChats = chats.filter((chat) => chat.id !== chatId);
    await saveAllChats(filteredChats);

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
// Переименование чата
// ============================================

export async function renameChat(chatId: string, newTitle: string): Promise<void> {
  await updateChat(chatId, { title: newTitle });
}

// ============================================
// Очистка сообщений в чате
// ============================================

export async function clearChatMessages(chatId: string): Promise<void> {
  await updateChat(chatId, {
    messages: [],
    recipeCount: 0,
    preview: '',
  });
}

// ============================================
// Активный чат (ID текущего открытого чата)
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
// Генерация названия чата из первого сообщения
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
// Группировка чатов по датам
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
