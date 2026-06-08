import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { Colors } from '../constants';
import { useThemeColor } from '../hooks';

interface QuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
  size?: 'small' | 'large';
  containerStyle?: any;
}

export default function QuantitySelector({ 
  quantity, 
  onDecrease, 
  onIncrease, 
  disabled = false, 
  size = 'small',
  containerStyle
}: QuantitySelectorProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const separatorColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);

  const isLarge = size === 'large';
  
  // Large size (used in ProductDetail) uses primary color border
  // Small size (used in Cart) uses separator color border
  const borderColor = isLarge ? primaryColor : separatorColor;
  const btnSize = isLarge ? 40 : 28;
  const iconSize = isLarge ? 20 : 16;
  const iconBtnColor = isLarge ? primaryColor : iconColor;
  const textWidth = isLarge ? 40 : 30;
  const fontSize = isLarge ? 18 : 16;
  
  const opacity = disabled ? 0.3 : 1;

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity 
        style={[
          styles.btn, 
          { 
            width: btnSize, 
            height: btnSize, 
            borderRadius: btnSize / 2, 
            borderColor,
            opacity
          }
        ]} 
        onPress={onDecrease}
        disabled={disabled}
      >
        <Feather name="minus" size={iconSize} color={iconBtnColor} />
      </TouchableOpacity>
      
      <ThemedText style={[styles.text, { width: textWidth, fontSize, lineHeight: fontSize + 4 }]}>
        {quantity}
      </ThemedText>
      
      <TouchableOpacity 
        style={[
          styles.btn, 
          { 
            width: btnSize, 
            height: btnSize, 
            borderRadius: btnSize / 2, 
            borderColor,
            opacity
          }
        ]} 
        onPress={onIncrease}
        disabled={disabled}
      >
        <Feather name="plus" size={iconSize} color={iconBtnColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
