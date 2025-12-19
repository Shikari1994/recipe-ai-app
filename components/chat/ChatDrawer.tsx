import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale, BORDER_RADIUS } from '@/utils/responsive';
import type { Chat } from '@/types';
import { useLanguage } from '@/utils/LanguageContext';
import { getPlural } from '@/utils/plurals';

interface ChatDrawerProps {
  visible: boolean;
  onClose: () => void;
  chats: { title: string; chats: Chat[] }[]; // Группированные чаты
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onProfilePress: () => void;
  isDark: boolean;
}

export function ChatDrawer({
  visible,
  onClose,
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onProfilePress,
  isDark,
}: ChatDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();

  // Фильтрация чатов по поиску
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    return chats
      .map((group) => ({
        ...group,
        chats: group.chats.filter(
          (chat) =>
            chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((group) => group.chats.length > 0);
  }, [chats, searchQuery]);

  // Создаем плоский массив для одного FlatList вместо вложенных
  const flatData = useMemo(() => {
    return filteredGroups.flatMap(group => [
      { type: 'header' as const, data: group },
      ...group.chats.map(chat => ({ type: 'chat' as const, data: chat }))
    ]);
  }, [filteredGroups]);

  const handleDeleteChat = useCallback((chat: Chat) => {
    console.log('ChatDrawer handleDeleteChat called for:', chat.id, chat.title);

    const message = t.chat.deleteMessage.replace('{title}', chat.title);

    // Для веб-платформы используем window.confirm
    if (Platform.OS === 'web') {
      console.log('Using window.confirm for web platform');
      const confirmed = window.confirm(message);
      console.log('User response:', confirmed ? 'confirmed' : 'cancelled');

      if (confirmed) {
        console.log('User confirmed delete for:', chat.id);
        onDeleteChat(chat.id);
      }
    } else {
      // Для нативных платформ используем Alert
      Alert.alert(
        t.chat.deleteTitle,
        message,
        [
          {
            text: t.chat.cancel,
            style: 'cancel',
            onPress: () => console.log('User cancelled delete')
          },
          {
            text: t.chat.delete,
            style: 'destructive',
            onPress: () => {
              console.log('User confirmed delete for:', chat.id);
              onDeleteChat(chat.id);
            },
          },
        ],
        { cancelable: true }
      );
    }
  }, [t, onDeleteChat]);

  const renderChatItem = useCallback(({ item }: { item: Chat }) => {
    const isActive = item.id === activeChatId;

    return (
      <TouchableOpacity
        style={[
          styles.chatItem,
          isActive && styles.chatItemActive,
          { backgroundColor: isActive ? COLORS.primary : 'transparent' },
        ]}
        onPress={() => {
          onChatSelect(item.id);
          onClose();
        }}
        onLongPress={() => handleDeleteChat(item)}
        activeOpacity={0.7}
      >
        <View style={styles.chatIconContainer}>
          <Ionicons
            name="chatbubble-outline"
            size={moderateScale(20)}
            color={isActive ? '#fff' : isDark ? '#fff' : '#333'}
          />
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatTextContainer}>
            <Text
              style={[
                styles.chatTitle,
                { color: isActive ? '#fff' : isDark ? '#fff' : '#333' },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {item.preview && (
              <Text
                style={[
                  styles.chatPreview,
                  {
                    color: isActive
                      ? 'rgba(255,255,255,0.7)'
                      : isDark
                      ? 'rgba(255,255,255,0.5)'
                      : 'rgba(0,0,0,0.5)',
                  },
                ]}
                numberOfLines={1}
              >
                {item.preview}
              </Text>
            )}
            {item.recipeCount > 0 && (
              <Text
                style={[
                  styles.recipeCount,
                  {
                    color: isActive
                      ? 'rgba(255,255,255,0.8)'
                      : isDark
                      ? 'rgba(255,255,255,0.6)'
                      : 'rgba(0,0,0,0.6)',
                  },
              ]}
            >
              📝 {item.recipeCount} {getPlural(item.recipeCount, language, t.chat)}
            </Text>
          )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteChat(item)}
        >
          <Ionicons
            name="trash-outline"
            size={moderateScale(18)}
            color={isActive ? '#fff' : isDark ? '#999' : '#666'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [activeChatId, isDark, onChatSelect, onClose, handleDeleteChat, t, language]);

  const renderGroupHeader = useCallback(({ item }: { item: { title: string; chats: Chat[] } }) => (
    <View style={styles.groupHeader}>
      <Text style={[styles.groupTitle, { color: isDark ? '#999' : '#666' }]}>
        {item.title}
      </Text>
    </View>
  ), [isDark]);

  const renderItem = useCallback(({ item }: { item: { type: 'header' | 'chat', data: any } }) => {
    if (item.type === 'header') {
      return renderGroupHeader({ item: item.data });
    }
    return renderChatItem({ item: item.data });
  }, [renderGroupHeader, renderChatItem]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.drawer,
            { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={moderateScale(28)}
                color={isDark ? '#fff' : '#333'}
              />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#333' }]}>
              {t.chat.history}
            </Text>

            <View style={{ width: scale(40) }} />
          </View>

          {/* Кнопка нового чата */}
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => {
              onNewChat();
              onClose();
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradient.icon}
              style={styles.newChatGradient}
            >
              <Ionicons name="add" size={moderateScale(24)} color="#fff" />
              <Text style={styles.newChatText}>{t.chat.newChat}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Поиск */}
          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchInputContainer,
                { backgroundColor: isDark ? '#2a2a2a' : '#e5e5e5' },
              ]}
            >
              <Ionicons
                name="search"
                size={moderateScale(20)}
                color={isDark ? '#999' : '#666'}
              />
              <TextInput
                style={[
                  styles.searchInput,
                  { color: isDark ? '#fff' : '#333' },
                ]}
                placeholder={t.chat.searchPlaceholder}
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons
                    name="close-circle"
                    size={moderateScale(20)}
                    color={isDark ? '#999' : '#666'}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Список чатов - плоский FlatList вместо вложенных */}
          <FlatList
            data={flatData}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.type}-${index}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={moderateScale(60)}
                  color={isDark ? '#444' : '#ccc'}
                />
                <Text style={[styles.emptyText, { color: isDark ? '#666' : '#999' }]}>
                  {searchQuery ? t.chat.noChatsFound : t.chat.noChats}
                </Text>
              </View>
            }
          />

          {/* Кнопка настроек внизу */}
          <TouchableOpacity
            style={[
              styles.profileButton,
              {
                backgroundColor: isDark ? '#2a2a2a' : '#e5e5e5',
                marginBottom: Math.max(insets.bottom, verticalScale(20)),
              }
            ]}
            onPress={() => {
              onProfilePress();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="settings-outline"
              size={moderateScale(24)}
              color={COLORS.primary}
            />
            <Text style={[styles.profileButtonText, { color: isDark ? '#fff' : '#333' }]}>
              {t.tabs.profile}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    width: '85%',
    height: '100%',
    paddingTop: verticalScale(50),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(20),
  },
  closeButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontScale(20),
    fontWeight: 'bold',
  },
  newChatButton: {
    marginHorizontal: scale(20),
    marginBottom: verticalScale(16),
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  newChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(14),
    gap: scale(8),
  },
  newChatText: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(16),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderRadius: BORDER_RADIUS.md,
    gap: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: fontScale(14),
  },
  listContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
  },
  groupHeader: {
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  groupTitle: {
    fontSize: fontScale(12),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12),
    borderRadius: BORDER_RADIUS.md,
    marginBottom: verticalScale(6),
    gap: scale(12),
  },
  chatItemActive: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  chatIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContent: {
    flex: 1,
  },
  chatTextContainer: {
    flex: 1,
  },
  chatTitle: {
    fontSize: fontScale(15),
    fontWeight: '600',
    marginBottom: verticalScale(2),
  },
  chatPreview: {
    fontSize: fontScale(12),
    marginBottom: verticalScale(2),
  },
  recipeCount: {
    fontSize: fontScale(11),
  },
  deleteButton: {
    padding: scale(8),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
  },
  emptyText: {
    fontSize: fontScale(16),
    marginTop: verticalScale(16),
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(20),
    paddingVertical: verticalScale(14),
    borderRadius: BORDER_RADIUS.md,
    gap: scale(10),
  },
  profileButtonText: {
    fontSize: fontScale(16),
    fontWeight: '600',
  },
});
