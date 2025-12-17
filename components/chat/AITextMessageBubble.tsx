import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale } from '@/utils/responsive';

type AITextMessageBubbleProps = {
  text: string;
};

const AITextMessageBubbleComponent = ({ text }: AITextMessageBubbleProps) => {
  return (
    <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
      <View style={[styles.messageBubble, { backgroundColor: COLORS.primary }]}>
        <Text style={[styles.messageText, { color: '#fff' }]}>
          {text}
        </Text>
      </View>
    </View>
  );
};

AITextMessageBubbleComponent.displayName = 'AITextMessageBubble';

export const AITextMessageBubble = React.memo(AITextMessageBubbleComponent);

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
  messageText: {
    fontSize: fontScale(15),
    lineHeight: fontScale(21),
  },
});
