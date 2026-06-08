import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '../hooks';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  useSecondaryBackground?: boolean;
};

export function ThemedView({ style, lightColor, darkColor, useSecondaryBackground, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor }, 
    useSecondaryBackground ? 'secondaryBackground' : 'primaryBackground'
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
