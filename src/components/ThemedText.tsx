import { Colors } from '../constants/colors';
import React from 'react';
import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '../hooks';
import { ThemeDimension } from '../constants';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  useSecondaryText?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  useSecondaryText,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor }, 
    useSecondaryText ? 'secondaryText' : 'primaryText'
  );

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: ThemeDimension.fontSize.m,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: ThemeDimension.fontSize.m,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: ThemeDimension.fontSize.xxl,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: ThemeDimension.fontSize.xl,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: ThemeDimension.fontSize.m,
    color: Colors.light.tint,
  },
});
