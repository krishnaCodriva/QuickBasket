/**
 * Tag.tsx
 * @description Pill-shaped tag for filters, categories, and labels.
 *
 * Used for:
 *  - ActiveFilterChips (remove-able filter tags)
 *  - Category labels on ProductCards
 *  - Status tags (e.g. "In Stock", "Delivered")
 *
 * Variants:
 *  - 'filled'   — solid background (default)
 *  - 'outlined' — border only, transparent bg
 *  - 'subtle'   — light tinted background
 *
 * Usage:
 *  <Tag label="Fruits" onRemove={() => setCategory(null)} />
 *  <Tag label="In Stock" variant="subtle" color="success" />
 *  <Tag label="Dairy" variant="outlined" />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { typography } from '../core/constants/theme/typography';
import { radius } from '../core/constants/theme/radius';
import { spacing } from '../core/constants/theme/spacing';
import { useThemeColor } from '../hooks';

// ─── Props ────────────────────────────────────────────────────────────────────

type TagVariant = 'filled' | 'outlined' | 'subtle';
type TagColor = 'primary' | 'success' | 'error' | 'neutral';

export interface TagProps {
  /** Text content of the tag */
  label: string;
  /** Visual variant. Default: 'filled' */
  variant?: TagVariant;
  /** Colour theme. Default: 'primary' */
  color?: TagColor;
  /** If provided, shows a remove (×) icon and calls this on press */
  onRemove?: () => void;
  /** If provided, the entire tag becomes pressable */
  onPress?: () => void;
  /** Additional container style */
  style?: ViewStyle;
  /** testID for automation */
  testID?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Tag({
  label,
  variant = 'filled',
  color = 'primary',
  onRemove,
  onPress,
  style,
  testID,
}: TagProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const chipBg = useThemeColor(
    { light: Colors.light.gray200, dark: Colors.dark.gray800 },
    'secondaryBackground' as never,
  );
  const chipText = useThemeColor(
    { light: Colors.light.gray800, dark: Colors.dark.gray200 },
    'primaryText' as never,
  );

  // Compute colours based on variant + color
  const colorValue =
    color === 'primary'
      ? primaryColor
      : color === 'success'
      ? Colors.light.success
      : color === 'error'
      ? Colors.light.red600
      : chipBg; // neutral

  const bgColor =
    variant === 'filled'
      ? colorValue
      : variant === 'subtle'
      ? colorValue + '20'
      : 'transparent';

  const textColor =
    variant === 'filled'
      ? Colors.light.white
      : color === 'neutral'
      ? chipText
      : colorValue;

  const borderColorValue = variant === 'outlined' ? colorValue : 'transparent';

  const content = (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: bgColor,
          borderColor: borderColorValue,
          borderWidth: variant === 'outlined' ? 1 : 0,
        },
        style,
      ]}
      testID={testID}
    >
      <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeBtn}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label} filter`}
        >
          <Ionicons name="close" size={12} color={textColor} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
  },
  removeBtn: {
    marginLeft: spacing.xs,
  },
});
