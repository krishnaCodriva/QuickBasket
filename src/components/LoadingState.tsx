/**
 * LoadingState.tsx
 * @description Full-screen or inline loading indicator.
 *
 * Replaces the repeated pattern of:
 *   <View style={{ flex: 1, justifyContent: 'center' }}>
 *     <ActivityIndicator size="large" color={primaryColor} />
 *   </View>
 *
 * Features:
 *  - 'fullscreen' mode: takes full available space
 *  - 'inline' mode: compact, embeds in content
 *  - Optional message below the spinner
 *  - Optional overlay mode (semi-transparent backdrop)
 *  - Fully themed spinner colour
 *
 * Usage:
 *  <LoadingState />
 *  <LoadingState mode="fullscreen" message="Loading products..." />
 *  <LoadingState mode="overlay" />
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColor } from '../hooks';
import { Colors } from '../constants';
import { spacing } from '../core/constants/theme/spacing';
import { typography } from '../core/constants/theme/typography';
import { radius } from '../core/constants/theme/radius';
import { zIndex } from '../core/constants/theme/zIndex';

// ─── Props ────────────────────────────────────────────────────────────────────

type LoadingMode = 'fullscreen' | 'inline' | 'overlay';
type SpinnerSize = 'small' | 'large';

export interface LoadingStateProps {
  /** Layout mode. Default: 'fullscreen' */
  mode?: LoadingMode;
  /** Optional message displayed below the spinner */
  message?: string;
  /** Spinner size. Default: 'large' */
  size?: SpinnerSize;
  /** Additional container style */
  style?: ViewStyle;
  /** testID for automation */
  testID?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LoadingState({
  mode = 'fullscreen',
  message,
  size = 'large',
  style,
  testID,
}: LoadingStateProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'secondaryText');

  if (mode === 'overlay') {
    return (
      <View style={[styles.overlay, style]} testID={testID}>
        <View style={styles.overlayCard}>
          <ActivityIndicator size={size} color={primaryColor} />
          {message && (
            <Text style={[styles.message, { color: Colors.light.white }]}>
              {message}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        mode === 'fullscreen' ? styles.fullscreen : styles.inline,
        style,
      ]}
      testID={testID}
    >
      <ActivityIndicator size={size} color={primaryColor} />
      {message && (
        <Text style={[styles.message, { color: textColor as string }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  inline: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.light.transparentBlack05,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: zIndex.overlay,
  },
  overlayCard: {
    backgroundColor: Colors.light.gray900,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    minWidth: 120,
  },
  message: {
    marginTop: spacing.sm,
    fontSize: typography.size.smmd,
    textAlign: 'center',
  },
});
