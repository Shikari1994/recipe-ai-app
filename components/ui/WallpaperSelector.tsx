import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { WALLPAPERS, WallpaperConfig } from '@/constants/wallpapers';

type WallpaperSelectorProps = {
  visible: boolean;
  selectedWallpaperId: string;
  onClose: () => void;
  onSelect: (wallpaperId: string) => void;
  isDark: boolean;
};

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 64) / 2; // 2 колонки с отступами

export function WallpaperSelector({
  visible,
  selectedWallpaperId,
  onClose,
  onSelect,
  isDark,
}: WallpaperSelectorProps) {
  const renderWallpaperPreview = (wallpaper: WallpaperConfig) => {
    if (wallpaper.type === 'image' && wallpaper.image) {
      return (
        <ImageBackground
          source={wallpaper.image}
          style={styles.previewImage}
          resizeMode="cover"
        />
      );
    }

    if (wallpaper.type === 'gradient' && wallpaper.colors) {
      return (
        <LinearGradient
          colors={wallpaper.colors}
          locations={wallpaper.locations}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.previewGradient}
        />
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDark ? 'rgba(20, 20, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)' },
          ]}
        >
          <BlurView
            intensity={100}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: isDark ? '#fff' : '#000' },
              ]}
            >
              Выберите обои
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.wallpaperGrid}
            showsVerticalScrollIndicator={false}
          >
            {WALLPAPERS.map((wallpaper) => {
              const isSelected = wallpaper.id === selectedWallpaperId;

              return (
                <TouchableOpacity
                  key={wallpaper.id}
                  style={[
                    styles.wallpaperItem,
                    isSelected && styles.wallpaperItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(wallpaper.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.previewContainer}>
                    {renderWallpaperPreview(wallpaper)}
                    {isSelected && (
                      <View style={styles.selectedOverlay}>
                        <View style={styles.checkmarkContainer}>
                          <Ionicons name="checkmark-circle" size={32} color="#fff" />
                        </View>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.wallpaperName,
                      { color: isDark ? '#fff' : '#000' },
                      isSelected && styles.wallpaperNameSelected,
                    ]}
                  >
                    {wallpaper.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(138, 43, 226, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  wallpaperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  wallpaperItem: {
    width: ITEM_WIDTH,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
  },
  wallpaperItemSelected: {
    borderWidth: 3,
    borderColor: 'rgba(138, 43, 226, 1)',
  },
  previewContainer: {
    width: '100%',
    height: ITEM_WIDTH * 1.5,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewGradient: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(138, 43, 226, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    backgroundColor: 'rgba(138, 43, 226, 0.9)',
    borderRadius: 50,
    padding: 4,
  },
  wallpaperName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
  },
  wallpaperNameSelected: {
    color: 'rgba(138, 43, 226, 1)',
  },
});
