/**
 * EmptyState.tsx
 * @description Improved empty state component.
 *
 * Improvements over original:
 *  - Added optional `subtitle` / `description` prop
 *  - Removed `containerStyle: any` → typed `ViewStyle`
 *  - Design tokens for spacing and typography
 *  - `buttonText` and `secondaryButtonText` support
 *  - Fully typed props
 *
 * Usage:
 *  <EmptyState
 *    emoji="🛒"
 *    title="Your cart is empty"
 *    subtitle="Add items to get started"
 *    buttonText="Browse Products"
 *    onButtonPress={() => navigation.navigate('Categories')}
 *  />
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { CustomButton } from './CustomButton';
import { spacing } from '../core/constants/theme/spacing';
import { typography } from '../core/constants/theme/typography';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  /** Emoji character rendered as large icon */
  emoji?: string;
  /** Custom React node icon (takes priority over emoji) */
  icon?: React.ReactNode;
  /** Main title text (required) */
  title: string;
  /** Optional subtitle / description below the title */
  subtitle?: string;
  /** Primary action button label */
  buttonText?: string;
  /** Called when primary button is pressed */
  onButtonPress?: () => void;
  /** Secondary action button label */
  secondaryButtonText?: string;
  /** Called when secondary button is pressed */
  onSecondaryButtonPress?: () => void;
  /** Additional container style */
  containerStyle?: ViewStyle;
  /** testID for automation */
  testID?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmptyState({
  emoji,
  icon,
  title,
  subtitle,
  buttonText,
  onButtonPress,
  secondaryButtonText,
  onSecondaryButtonPress,
  containerStyle,
  testID,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {/* Icon */}
      {icon ? (
        <View style={styles.iconWrapper}>{icon}</View>
      ) : emoji ? (
        <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      ) : null}

      {/* Title */}
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>

      {/* Subtitle */}
      {subtitle && (
        <ThemedText useSecondaryText style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      )}

      {/* Primary action */}
      {buttonText && onButtonPress && (
        <CustomButton
          title={buttonText}
          type="primary"
          onPress={onButtonPress}
          style={styles.button}
        />
      )}

      {/* Secondary action */}
      {secondaryButtonText && onSecondaryButtonPress && (
        <CustomButton
          title={secondaryButtonText}
          type="secondary"
          onPress={onSecondaryButtonPress}
          style={styles.button}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconWrapper: {
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 80,
    lineHeight: 100, // Prevents vertical cropping of large emojis
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.xxl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.size.mdlg,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
    width: 220,
  },
});
