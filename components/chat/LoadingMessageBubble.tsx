import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedDots } from './AnimatedDots';
import { COLORS } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale } from '@/utils/responsive';

type LoadingMessageBubbleProps = {
  text: string;
};

const LoadingMessageBubbleComponent = ({ text }: LoadingMessageBubbleProps) => {
  return (
    <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
      <View style={[styles.messageBubble, { backgroundColor: COLORS.primary }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.messageText, { color: '#fff' }]}>
            {text}
          </Text>
          <AnimatedDots color="#fff" />
        </View>
      </View>
    </View>
  );
};

LoadingMessageBubbleComponent.displayName = 'LoadingMessageBubble';

export const LoadingMessageBubble = React.memo(LoadingMessageBubbleComponent);

const styles = StyleSheet.create({
  messageWrapper: {
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(4),
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(20),
    borderBottomLeftRadius: moderateScale(6),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  messageText: {
    fontSize: fontScale(15),
    lineHeight: fontScale(21),
  },
});
