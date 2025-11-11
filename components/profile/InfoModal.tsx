import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface InfoModalProps {
  visible: boolean;
  title: string;
  content: string;
  isDark: boolean;
  textColor: string;
  slideAnim: Animated.Value;
  onClose: () => void;
}

export function InfoModal({
  visible,
  title,
  content,
  isDark,
  textColor,
  slideAnim,
  onClose,
}: InfoModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            opacity: slideAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [600, 0],
              }),
            }],
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.modalCard}>
          <BlurView
            intensity={100}
            tint={isDark ? 'dark' : 'light'}
            style={styles.modalBlur}
            pointerEvents="none"
          />
          <View
            style={[
              styles.modalOverlay,
              {
                backgroundColor: isDark
                  ? 'rgba(20, 20, 20, 0.85)'
                  : 'rgba(255, 255, 255, 0.85)',
              },
            ]}
            pointerEvents="none"
          />

          <View style={styles.modalContentWrapper}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitleText, { color: textColor }]}>
                {title}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <Ionicons name="close" size={28} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalBodyText, { color: textColor }]}>
                {content}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContentWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(138, 43, 226, 0.3)',
  },
  modalTitleText: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
    marginLeft: 16,
  },
  modalBody: {
    padding: 24,
  },
  modalBodyText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
