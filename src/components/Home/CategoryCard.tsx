import { Colors } from '../../constants/colors';
import React from 'react';
import { formatImageUrl } from '../../config/api.config';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, Image } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '../../hooks';
import { spacing, typography, radius } from '../../core/constants/theme';

type Props = {
  name: string;
  emoji?: string;
  imageUrl?: string;
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark;
  onPress: () => void;
  isSelected?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

const CategoryCard = ({ name, emoji = "📦", imageUrl, colorName, onPress, isSelected, containerStyle }: Props) => {
  const bgColor = useThemeColor({}, colorName);
  const innerBg = useThemeColor({}, 'transparentWhite04');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <TouchableOpacity style={[styles.container, containerStyle]} onPress={onPress}>
      {/* Outer Circle */}
      <View style={[
        styles.circle, 
        { backgroundColor: bgColor },
        isSelected && { borderWidth: 2, borderColor: primaryColor }
      ]}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={{ width: '100%', height: '100%', borderRadius: 32 }} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.innerCircle, { backgroundColor: innerBg }]}>
            <ThemedText style={styles.emoji}>{emoji}</ThemedText>
          </View>
        )}
      </View>
      <ThemedText 
        style={[styles.name, isSelected && { color: primaryColor }]} 
        numberOfLines={1}
      >
        {name}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 70,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: radius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  innerCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.circle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: typography.size.xxl,
  },
  name: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
});

export default React.memo(CategoryCard);
