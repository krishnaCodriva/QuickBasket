/**
 * FormInput.tsx
 * @description Labelled, validated text input for forms.
 *
 * Extends ThemedInput with:
 *  - A label above the field
 *  - Inline error message below the field
 *  - Required asterisk indicator
 *  - Error border state (red outline)
 *  - Success border state (green outline)
 *  - Fully themed colours and design-token spacing
 *
 * Usage:
 *  <FormInput
 *    label="Full Name"
 *    required
 *    value={name}
 *    onChangeText={setName}
 *    error={errors.name}
 *    placeholder="e.g. Ravi Kumar"
 *  />
 */

import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useThemeColor } from '../hooks';
import { Colors } from '../constants';
import { ThemedText } from './ThemedText';
import { spacing } from '../core/constants/theme/spacing';
import { typography } from '../core/constants/theme/typography';
import { radius } from '../core/constants/theme/radius';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FormInputProps extends TextInputProps {
  /** Label shown above the field */
  label?: string;
  /** Whether the field is required (shows a red asterisk) */
  required?: boolean;
  /** Error message shown below the field. Also triggers red border. */
  error?: string;
  /** Success message shown below the field. Also triggers green border. */
  success?: string;
  /** Additional wrapper style */
  containerStyle?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FormInput({
  label,
  required,
  error,
  success,
  containerStyle,
  style,
  ...rest
}: FormInputProps) {
  const bgColor = useThemeColor({}, 'primaryBackground');
  const textColor = useThemeColor({}, 'primaryText');
  const placeholderColor = Colors.light.gray400;
  const borderDefault = useThemeColor(
    { light: Colors.light.gray300, dark: Colors.dark.gray300 },
    'secondaryBackground' as never,
  );

  const borderColor = error
    ? Colors.light.red600
    : success
    ? Colors.light.success
    : borderDefault;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <ThemedText style={styles.label}>
          {label}
          {required && <ThemedText style={styles.asterisk}> *</ThemedText>}
        </ThemedText>
      )}

      {/* Input */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: bgColor,
            color: textColor,
            borderColor,
          },
          style,
        ]}
        placeholderTextColor={placeholderColor}
        {...rest}
      />

      {/* Error / Success message */}
      {error ? (
        <ThemedText style={[styles.helperText, styles.errorText]}>{error}</ThemedText>
      ) : success ? (
        <ThemedText style={[styles.helperText, styles.successText]}>{success}</ThemedText>
      ) : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    marginBottom: spacing.xs,
  },
  asterisk: {
    color: Colors.light.red600,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.smd,
    fontSize: typography.size.mdlg,
  },
  helperText: {
    fontSize: typography.size.xs,
    marginTop: spacing.xs,
  },
  errorText: {
    color: Colors.light.red600,
  },
  successText: {
    color: Colors.light.success,
  },
});
