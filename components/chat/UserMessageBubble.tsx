import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale } from '@/utils/responsive';

type UserMessageBubbleProps = {
  text?: string;
  image?: string;
};

const UserMessageBubbleComponent = ({ text, image }: UserMessageBubbleProps) => {
  return (
    <View style={[styles.messageWrapper, styles.userMessageWrapper]}>
      <View style={[styles.messageBubble, { backgroundColor: COLORS.primary }]}>
        {image && (
          <Image
            source={{ uri: image }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        )}
        {text && (
          <Text style={[styles.messageText, { color: '#fff' }]}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};

UserMessageBubbleComponent.displayName = 'UserMessageBubble';

export const UserMessageBubble = React.memo(UserMessageBubbleComponent);

const styles = StyleSheet.create({
  messageWrapper: {
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(4),
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(6),
  },
  messageImage: {
    width: scale(200),
    height: verticalScale(200),
    minWidth: scale(200),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(8),
  },
  messageText: {
    fontSize: fontScale(15),
    lineHeight: fontScale(21),
  },
});
