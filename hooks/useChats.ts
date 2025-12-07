/**
 * Хук для управления множественными чатами
 */

import { useState, useCallback, useEffect } from 'react';
import type { Chat } from '@/types';
import {
  getAllChats,
  createNewChat,
  deleteChat as deleteChatStorage,
  renameChat as renameChatStorage,
  getActiveChat as getActiveChatId,
  setActiveChat,
  groupChatsByDate,
} from '@/utils/chatStorage';

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка чатов при монтировании
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = useCallback(async () => {
    setLoading(true);
    try {
      const loadedChats = await getAllChats();
      setChats(loadedChats);

      // Загружаем активный чат
      const activeId = await getActiveChatId();

      // Если нет активного чата, создаем новый
      if (!activeId && loadedChats.length === 0) {
        const newChat = await createNewChat();
        setChats([newChat]);
        setActiveChatId(newChat.id);
      } else if (activeId) {
        setActiveChatId(activeId);
      } else if (loadedChats.length > 0) {
        // Если есть чаты, но нет активного, выбираем первый
        setActiveChatId(loadedChats[0].id);
        await setActiveChat(loadedChats[0].id);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createChat = useCallback(async (firstMessage?: string) => {
    const newChat = await createNewChat(firstMessage);
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat;
  }, []);

  const deleteChat = useCallback(async (chatId: string) => {
    console.log('useChats deleteChat called for:', chatId);
    try {
      await deleteChatStorage(chatId);
      console.log('deleteChatStorage completed');

      // Обновляем список чатов
      setChats((prev) => {
        console.log('Updating chats, prev length:', prev.length);
        const remainingChats = prev.filter((chat) => chat.id !== chatId);
        console.log('Remaining chats:', remainingChats.length);

        // Если удаляем активный чат, переключаемся на другой
        if (chatId === activeChatId) {
          if (remainingChats.length > 0) {
            const newActiveId = remainingChats[0].id;
            setActiveChatId(newActiveId);
            setActiveChat(newActiveId);
          } else {
            // Если чатов не осталось, создаем новый
            createNewChat().then((newChat) => {
              setChats([newChat]);
              setActiveChatId(newChat.id);
            });
          }
        }

        return remainingChats;
      });
    } catch (error) {
      console.error('Error in useChats deleteChat:', error);
    }
  }, [activeChatId]);

  const renameChat = useCallback(async (chatId: string, newTitle: string) => {
    await renameChatStorage(chatId, newTitle);
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    );
  }, []);

  const switchChat = useCallback(async (chatId: string) => {
    setActiveChatId(chatId);
    await setActiveChat(chatId);
  }, []);

  const refreshChats = useCallback(async () => {
    await loadChats();
  }, [loadChats]);

  const getActiveChat = useCallback(() => {
    return chats.find((chat) => chat.id === activeChatId) || null;
  }, [chats, activeChatId]);

  const getGroupedChats = useCallback(() => {
    return groupChatsByDate(chats);
  }, [chats]);

  return {
    chats,
    activeChatId,
    loading,
    createChat,
    deleteChat,
    renameChat,
    switchChat,
    refreshChats,
    getActiveChat,
    getGroupedChats,
  };
}
