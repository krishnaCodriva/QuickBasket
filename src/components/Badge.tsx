/**
 * Badge.tsx
 * @description Small numeric or status badge.
 *
 * Used for:
 *  - Cart item count (CartHeaderIcon)
 *  - Notification counts
 *  - Status labels (e.g. "New", "Sale")
 *
 * Variants:
 *  - 'count'   — circular, shows a number (clips at 99+)
 *  - 'dot'     — tiny dot (no number, just presence indicator)
 *  - 'label'   — pill with text (e.g. "NEW", "SALE")
 *
 * Usage:
 *  <Badge count={3} />
 *  <Badge variant="dot" color="error" />
 *  <Badge variant="label" label="SALE" color="success" />
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants';
import { typography } from '../core/constants/theme/typography';
import { radius } from '../core/constants/theme/radius';
import { spacing } from '../core/constants/theme/spacing';

// ─── Props ────────────────────────────────────────────────────────────────────

type BadgeColor = 'primary' | 'error' | 'success' | 'warning';

export interface BadgeProps {
  /** For 'count' variant — the number to display */
  count?: number;
  /** Badge variant. Default: 'count' */
  variant?: 'count' | 'dot' | 'label';
  /** For 'label' variant — the text to display */
  label?: string;
  /** Badge colour theme. Default: 'error' */
  color?: BadgeColor;
  /** Border colour (e.g. match parent background). Default: white */
  borderColor?: string;
  /** Additional container style */
  style?: ViewStyle;
  /** testID for automation */
  testID?: string;
}

// ─── Color map ────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<BadgeColor, string> = {
  primary: Colors.light.primary,
  error: Colors.light.red600,
  success: Colors.light.success,
  warning: '#F59E0B', // amber-500 — add Colors.light.warning when design token is defined
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Badge({
  count,
  variant = 'count',
  label,
  color = 'error',
  borderColor = Colors.light.white,
  style,
  testID,
}: BadgeProps) {
  const bgColor = COLOR_MAP[color];

  if (variant === 'dot') {
    return (
      <View
        style={[styles.dot, { backgroundColor: bgColor, borderColor }, style]}
        testID={testID}
      />
    );
  }

  if (variant === 'label') {
    return (
      <View style={[styles.labelPill, { backgroundColor: bgColor }, style]} testID={testID}>
        <Text style={styles.labelText}>{label?.toUpperCase()}</Text>
      </View>
    );
  }

  // count variant
  if (count === undefined || count <= 0) return null;
  const displayCount = count > 99 ? '99+' : String(count);

  return (
    <View
      style={[styles.countBadge, { backgroundColor: bgColor, borderColor }, style]}
      testID={testID}
    >
      <Text style={styles.countText}>{displayCount}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxs,
  },
  countText: {
    color: Colors.light.white,
    fontSize: typography.size.xxs,
    fontWeight: typography.weight.bold,
    lineHeight: 12,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  labelPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
  labelText: {
    color: Colors.light.white,
    fontSize: typography.size.xxs,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.5,
  },
});
