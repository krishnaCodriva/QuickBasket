/**
 * ScreenHeader.tsx
 * @description Reusable screen header component.
 *
 * Eliminates the repeated back-button + title + right-action pattern
 * that appears in 8+ screens. Fully themed, design-token driven.
 *
 * Props:
 *  - title          — screen title string
 *  - subtitle       — optional subtitle string (renders below title)
 *  - onBack         — called when back chevron is pressed (omit to hide back button)
 *  - rightElement   — optional JSX node placed on the right (e.g. CartHeaderIcon)
 *  - showBorder     — show a bottom border (default true)
 *  - testID         — optional accessibility test ID
 *
 * Usage:
 *  <ScreenHeader title="Checkout" onBack={() => navigation.goBack()} />
 *  <ScreenHeader title="Invoice" onBack={navigation.goBack} rightElement={<CartHeaderIcon />} />
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../hooks';
import { Colors } from '../constants';
import { spacing } from '../core/constants/theme/spacing';
import { typography } from '../core/constants/theme/typography';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ScreenHeaderProps {
  /** Screen title displayed in the centre */
  title: string;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  /** Called when back button is pressed. Omit to hide back button. */
  onBack?: () => void;
  /** Optional element rendered on the right side */
  rightElement?: React.ReactNode;
  /** Show a hairline border below the header. Default: true */
  showBorder?: boolean;
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Additional styles for the title text */
  titleStyle?: TextStyle;
  /** For testing */
  testID?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightElement,
  showBorder = true,
  style,
  titleStyle,
  testID,
}: ScreenHeaderProps) {
  const iconColor = useThemeColor(
    { light: Colors.light.black, dark: Colors.light.white },
    'primaryText' as never,
  );
  const borderColor = useThemeColor(
    { light: Colors.light.gray200, dark: Colors.dark.gray300 },
    'secondaryBackground' as never,
  );

  return (
    <View
      style={[
        styles.container,
        showBorder && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
        style,
      ]}
      testID={testID}
    >
      {/* Left — back button or spacer */}
      {onBack ? (
        <TouchableOpacity
          style={styles.sideSlot}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={24} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.sideSlot} />
      )}

      {/* Centre — title & subtitle */}
      <View style={styles.titleContainer}>
        <ThemedText style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle} useSecondaryText numberOfLines={1}>
            {subtitle}
          </ThemedText>
        )}
      </View>

      {/* Right — custom element or spacer */}
      <View style={styles.sideSlot}>
        {rightElement ?? null}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smd,
    minHeight: 52,
  },
  /** Flexible side slot so long text doesn't break */
  sideSlot: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  title: {
    textAlign: 'center',
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: typography.size.sm,
    marginTop: spacing.xxs,
  },
});
