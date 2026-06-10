/**
 * ErrorState.tsx
 * @description Full-screen or inline error UI with retry action.
 *
 * Features:
 *  - Large error icon (configurable)
 *  - Title and description text
 *  - Primary action button (e.g. "Try Again")
 *  - Secondary action (e.g. "Go Back")
 *  - Fully themed, design-token driven
 *
 * Usage:
 *  <ErrorState
 *    title="Something went wrong"
 *    description="We could not load your orders. Please check your connection."
 *    onRetry={fetchOrders}
 *  />
 *
 *  <ErrorState
 *    title="Session expired"
 *    description="Please log in again."
 *    retryLabel="Login"
 *    onRetry={() => navigation.navigate('Login')}
 *  />
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CustomButton } from './CustomButton';
import { useThemeColor } from '../hooks';
import { Colors } from '../constants';
import { spacing } from '../core/constants/theme/spacing';
import { typography } from '../core/constants/theme/typography';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ErrorStateProps {
  /** Main error title. Default: 'Something went wrong' */
  title?: string;
  /** Descriptive message below the title */
  description?: string;
  /** Primary action button label. Default: 'Try Again' */
  retryLabel?: string;
  /** Called when primary action button is pressed */
  onRetry?: () => void;
  /** Secondary action button label (e.g. 'Go Back') */
  secondaryLabel?: string;
  /** Called when secondary action button is pressed */
  onSecondary?: () => void;
  /** Custom icon node. Defaults to a Feather 'alert-circle' icon */
  icon?: React.ReactNode;
  /** Additional container style */
  style?: ViewStyle;
  /** testID for automation */
  testID?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ErrorState({
  title = 'Something went wrong',
  description,
  retryLabel = 'Try Again',
  onRetry,
  secondaryLabel,
  onSecondary,
  icon,
  style,
  testID,
}: ErrorStateProps) {
  const textColor = useThemeColor({}, 'primaryText');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        {icon ?? (
          <Feather name="alert-circle" size={64} color={Colors.light.red600} />
        )}
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: textColor as string }]}>{title}</Text>

      {/* Description */}
      {description && (
        <Text style={[styles.description, { color: secondaryTextColor as string }]}>
          {description}
        </Text>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {onRetry && (
          <CustomButton
            title={retryLabel}
            type="primary"
            onPress={onRetry}
            style={styles.button}
          />
        )}
        {onSecondary && secondaryLabel && (
          <CustomButton
            title={secondaryLabel}
            type="secondary"
            onPress={onSecondary}
            style={styles.button}
          />
        )}
      </View>
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
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.size.mdlg,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.xl,
  },
  actions: {
    width: '100%',
    maxWidth: 280,
  },
  button: {
    width: '100%',
  },
});
