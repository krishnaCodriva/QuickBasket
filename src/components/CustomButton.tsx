import React from 'react';
import { TouchableOpacity, ActivityIndicator, View, StyleSheet, TouchableOpacityProps } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors, ThemeDimension } from '../constants';
import { useThemeColor } from '../hooks';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, radius, typography } from '../core/constants/theme';

type ButtonProps = TouchableOpacityProps & {
  title: string;
  type?: 'primary' | 'secondary';
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
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryTextColor = useThemeColor({ light: Colors.light.gray900, dark: Colors.light.white }, 'primaryText' as any);
  const borderColor = useThemeColor({}, 'gray300' as any);

  const buttonStyle = isPrimary ? [styles.primaryButton, { backgroundColor: primaryColor }] : [styles.secondaryButton, { borderColor: borderColor }];
  const textStyle = isPrimary ? styles.primaryButtonText : [styles.secondaryButtonText, { color: secondaryTextColor }];

  return (
    <TouchableOpacity
      style={[buttonStyle, style, (disabled || loading) && { opacity: 0.7 }]}
      activeOpacity={0.8}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.light.white : Colors.light.gray900} />
      ) : (
        <View style={styles.buttonContent}>
          {icon && (
            <MaterialCommunityIcons 
              name={icon} 
              size={20} 
              color={isPrimary ? Colors.light.white : secondaryTextColor} 
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: spacing.sm,
  },
});
