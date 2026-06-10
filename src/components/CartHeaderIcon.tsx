/**
 * CartHeaderIcon.tsx
 * Phase 7 refactor: uses the shared Badge component instead of inline badge JSX.
 * Navigation typed with NativeStackNavigationProp.
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../context';
import { useThemeColor } from '../hooks';
import { Colors } from '../constants';
import { Badge } from './Badge';
import type { RootStackParamList } from '../core/types/navigation';
import { spacing } from '../core/constants/theme';

type CartNavProp = NativeStackNavigationProp<RootStackParamList>;

interface CartHeaderIconProps {
  color?: string;
  size?: number;
  badgeBorderColor?: string;
  style?: StyleProp<ViewStyle>;
}

export default function CartHeaderIcon({
  color,
  size = 28,
  badgeBorderColor,
  style,
}: CartHeaderIconProps) {
  const navigation = useNavigation<CartNavProp>();
  const { totalItems } = useCart();
  const defaultIconColor = useThemeColor({}, 'iconColor' as never);
  const bgColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.primaryBackground },
    'primaryBackground' as never,
  );

  const finalIconColor = color || defaultIconColor;
  const finalBorderColor = badgeBorderColor || bgColor;

  return (
    <TouchableOpacity
      style={[styles.cartButton, style]}
      onPress={() => navigation.navigate('Cart')}
      accessibilityRole="button"
      accessibilityLabel={`Cart, ${totalItems} items`}
    >
      <Ionicons name="cart-outline" size={size} color={finalIconColor} />

      {/* Live cart count badge — sourced from CartContext */}
      <Badge
        count={totalItems}
        color="primary"
        borderColor={finalBorderColor}
        style={styles.badge}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cartButton: {
    padding: spacing.xs,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
  },
});
