import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, DimensionValue, Platform } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Colors, ThemeDimension } from '../../constants';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, radius, typography, elevation } from '../../core/constants/theme';
import { formatImageUrl } from '../../config/api.config';

export type ImageCategoryCardProps = {
  name: string;
  itemCount: number;
  deliveryTime?: string;
  imageUrl: string;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  span: 'full' | 'half';
  onPress: () => void;
};

export default function ImageCategoryCard({
  name,
  itemCount,
  deliveryTime,
  imageUrl,
  iconName,
  span,
  onPress,
}: ImageCategoryCardProps) {
  const isFull = span === 'full';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.container, isFull ? styles.fullWidth : styles.halfWidth]}
      onPress={onPress}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.gradient}
        >
          {iconName && (
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name={iconName} size={16} color={Colors.light.white} />
            </View>
          )}
          <View style={styles.textContainer}>
            <ThemedText style={styles.title}>{name}</ThemedText>
            <ThemedText style={styles.subtitle}>
              {itemCount} Items {deliveryTime ? `• ${deliveryTime}` : ''}
            </ThemedText>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    marginBottom: spacing.md,
    borderRadius: ThemeDimension.borderRadius.l,
    backgroundColor: Colors.dark.gray800, // Placeholder color while loading
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        ...elevation.sm,
      },
    }),
  },
  fullWidth: {
    width: '100%',
    height: 220,
  },
  halfWidth: {
    width: '48%', // Approx half width to allow space between
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: ThemeDimension.borderRadius.l,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderRadius: ThemeDimension.borderRadius.l,
  },
  iconContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: Colors.light.transparentWhite02,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.transparentWhite04,
  },
  textContainer: {
    marginTop: 'auto',
  },
  title: {
    color: Colors.light.white,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: Colors.light.transparentWhite07,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
});
