/**
 * PriceDisplay.tsx
 * @description Consistent price + MRP + discount badge rendering.
 *
 * Used in ProductCard, CartItemCard, CartPriceSummary, and OrderScreens.
 * Eliminates the repeated pattern of price/MRP/discount calculation.
 *
 * Features:
 *  - Shows current price (always)
 *  - Optionally shows MRP with strikethrough
 *  - Automatically calculates and shows % discount badge
 *  - Supports 'sm', 'md', 'lg' size presets
 *  - Currency prefix configurable (default ₹)
 *
 * Usage:
 *  <PriceDisplay price={45} mrp={60} />
 *  <PriceDisplay price={45} mrp={60} size="lg" currency="₹" />
 *  <PriceDisplay price={45} />   // no MRP → no strikethrough, no badge
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants';
import { typography } from '../core/constants/theme/typography';
import { spacing } from '../core/constants/theme/spacing';
import { radius } from '../core/constants/theme/radius';
import { useThemeColor } from '../hooks';

// ─── Props ────────────────────────────────────────────────────────────────────

type PriceSize = 'sm' | 'md' | 'lg';

export interface PriceDisplayProps {
  /** Current selling price (number) */
  price: number;
  /** Maximum retail price — triggers strikethrough + discount badge */
  mrp?: number;
  /** Currency symbol. Default: '₹' */
  currency?: string;
  /** Size preset. Default: 'md' */
  size?: PriceSize;
  /** Hide the discount badge even when MRP > price */
  hideDiscount?: boolean;
  /** Additional container style */
  style?: ViewStyle;
  /** testID for automation */
  testID?: string;
}

// ─── Size map ─────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<PriceSize, { price: number; mrp: number; badge: number }> = {
  sm: { price: typography.size.md, mrp: typography.size.sm, badge: typography.size.xxs },
  md: { price: typography.size.lg, mrp: typography.size.smmd, badge: typography.size.xs },
  lg: { price: typography.size.xxl, mrp: typography.size.md, badge: typography.size.sm },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PriceDisplay({
  price,
  mrp,
  currency = '₹',
  size = 'md',
  hideDiscount = false,
  style,
  testID,
}: PriceDisplayProps) {
  const textColor = useThemeColor({}, 'primaryText');
  const sizeTokens = SIZE_MAP[size];

  const hasDiscount = mrp !== undefined && mrp > price;
  const discountPct = hasDiscount
    ? Math.round(((mrp! - price) / mrp!) * 100)
    : 0;

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Current price */}
      <Text
        style={[
          styles.price,
          { color: textColor, fontSize: sizeTokens.price },
        ]}
      >
        {currency}{price.toFixed(2)}
      </Text>

      {/* MRP with strikethrough */}
      {hasDiscount && (
        <Text
          style={[
            styles.mrp,
            { fontSize: sizeTokens.mrp },
          ]}
        >
          {currency}{mrp!.toFixed(2)}
        </Text>
      )}

      {/* Discount badge */}
      {hasDiscount && !hideDiscount && discountPct > 0 && (
        <View style={styles.discountBadge}>
          <Text style={[styles.discountText, { fontSize: sizeTokens.badge }]}>
            {discountPct}% off
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  price: {
    fontWeight: typography.weight.bold,
  },
  mrp: {
    color: Colors.light.gray500,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: Colors.light.success + '20',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  discountText: {
    color: Colors.light.success,
    fontWeight: typography.weight.semiBold,
  },
});
