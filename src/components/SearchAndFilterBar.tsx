import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedInput from './ThemedInput';
import { useThemeColor } from '../hooks';
import { Colors } from '../constants';
import { spacing, radius } from '../core/constants/theme';

export interface SearchAndFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
  onFilterPress?: () => void;
  onPress?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  containerStyle?: ViewStyle;
}

export function SearchAndFilterBar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onFilterPress,
  onPress,
  placeholder = "Search groceries...",
  autoFocus = false,
  containerStyle,
}: SearchAndFilterBarProps) {
  const iconColor = useThemeColor(
    { light: Colors.light.black, dark: Colors.light.white },
    'primaryText' as any
  );
  const borderColor = useThemeColor(
    { light: Colors.light.gray300, dark: Colors.dark.gray300 },
    'primaryText' as any
  );
  const filterBtnBg = useThemeColor(
    { light: Colors.light.gray100, dark: Colors.dark.secondaryBackground },
    'secondaryBackground' as any
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {onPress ? (
        <TouchableOpacity style={styles.searchWrapper} onPress={onPress} activeOpacity={0.8}>
          <View pointerEvents="none">
            <ThemedInput
              placeholder={placeholder}
              value={searchQuery}
              onChangeText={onSearchChange}
              editable={false}
              styleWrapper={{
                borderWidth: 1,
                borderColor,
              }}
            />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.searchWrapper}>
          <ThemedInput
            placeholder={placeholder}
            value={searchQuery}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
            onClear={() => onSearchChange('')}
            returnKeyType="search"
            autoFocus={autoFocus}
            styleWrapper={{
              borderWidth: 1,
              borderColor,
            }}
          />
        </View>
      )}
      {onFilterPress && (
        <TouchableOpacity
          style={[
            styles.filterBtn,
            { backgroundColor: filterBtnBg, borderColor, borderWidth: 1 },
          ]}
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel="Filter Options"
        >
          <Ionicons name="options-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  searchWrapper: {
    flex: 1,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
});
