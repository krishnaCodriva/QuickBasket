import { Colors } from '../../constants/colors';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '../../hooks';

type Props = {
  name: string;
  emoji: string;
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark;
  onPress: () => void;
};

const CategoryCard = ({ name, emoji, colorName, onPress }: Props) => {
  const bgColor = useThemeColor({}, colorName);
  const innerBg = useThemeColor({}, 'transparentWhite04');

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Outer Circle */}
      <View style={[styles.circle, { backgroundColor: bgColor }]}>
        {/* Inner Circle */}
        <View style={[styles.innerCircle, { backgroundColor: innerBg }]}>
          <ThemedText style={styles.emoji}>{emoji}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.name} numberOfLines={1}>{name}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 70,
    alignItems: 'center',
    marginRight: 16,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  innerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default React.memo(CategoryCard);
