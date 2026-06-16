import React from 'react';
import { TouchableOpacity, ActivityIndicator, View, StyleSheet, TouchableOpacityProps } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors, ThemeDimension } from '../constants';
import { useThemeColor } from '../hooks';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, radius, typography } from '../core/constants/theme';

type ButtonProps = TouchableOpacityProps & {
  title: string;
  type?: 'primary' | 'secondary' | 'tertiary';
  loading?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
};

export function CustomButton({ 
  title, 
  type = 'primary', 
  loading = false, 
  icon, 
  style, 
  disabled,
  ...rest 
}: ButtonProps) {
  const isPrimary = type === 'primary';
  const isTertiary = type === 'tertiary';
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryTextColor = useThemeColor({ light: Colors.light.gray900, dark: Colors.light.white }, 'primaryText' as any);
  const tertiaryBgColor = useThemeColor({ light: Colors.light.blue100, dark: Colors.dark.secondaryBackground }, 'secondaryBackground' as any);
  const borderColor = useThemeColor({}, 'gray300' as any);

  let buttonStyle;
  let textStyle;
  let iconColor;

  if (disabled) {
    buttonStyle = [styles.primaryButton, { backgroundColor: Colors.light.gray300 }];
    textStyle = [styles.primaryButtonText, { color: Colors.light.gray500 }];
    iconColor = Colors.light.gray500;
  } else if (isPrimary) {
    buttonStyle = [styles.primaryButton, { backgroundColor: primaryColor }];
    textStyle = styles.primaryButtonText;
    iconColor = Colors.light.white;
  } else if (isTertiary) {
    buttonStyle = [styles.tertiaryButton, { backgroundColor: tertiaryBgColor }];
    textStyle = [styles.tertiaryButtonText, { color: primaryColor }];
    iconColor = primaryColor;
  } else {
    buttonStyle = [styles.secondaryButton, { borderColor: borderColor }];
    textStyle = [styles.secondaryButtonText, { color: secondaryTextColor }];
    iconColor = secondaryTextColor;
  }

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      activeOpacity={0.8}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary && !disabled ? Colors.light.white : Colors.light.gray900} />
      ) : (
        <View style={styles.buttonContent}>
          {icon && (
            <MaterialCommunityIcons 
              name={icon} 
              size={20} 
              color={iconColor} 
              style={styles.btnIcon} 
            />
          )}
          <ThemedText style={textStyle}>{title}</ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: Colors.light.white,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  tertiaryButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tertiaryButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: spacing.sm,
  },
});
