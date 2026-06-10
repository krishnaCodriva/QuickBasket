import { StyleSheet, Text, TextInput, TouchableOpacity, View, TextInputProps, ActivityIndicator } from 'react-native'
import React from 'react'
import { Colors } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks';
import { spacing, radius, typography } from '../core/constants/theme';

interface ThemedInputProps extends TextInputProps {
  styleWrapper?: any;
  onClear?: () => void;
  icon?: keyof typeof Ionicons.glyphMap | null;
  isLoading?: boolean;
  autoFocus?: boolean;
}

const ThemedInput = ({
    styleWrapper,
    placeholder,
    value,
    onChangeText,
    keyboardType = 'default',
    onClear,
    icon = 'search-outline',
    isLoading = false,
    autoFocus = false,
    ...rest
}: ThemedInputProps) => {
    const bg = useThemeColor({}, "primaryBackground")
    const text = useThemeColor({}, "primaryText")
    const primary = useThemeColor({}, "primary")
    return (
        <View style={[styles.searchContainer, { backgroundColor: bg }, styleWrapper]}>
            {icon && <Ionicons name={icon} size={20} color={Colors.light.gray400} />}
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={Colors.light.gray400}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                autoFocus={autoFocus}
                {...rest}
                style={[{ color: text }, styles.input, rest.style]}
            />
            {isLoading ? (
              <ActivityIndicator size="small" color={primary} />
            ) : value && value.length > 0 && onClear ? (
              <TouchableOpacity onPress={onClear}>
                <Ionicons name="close-circle" size={20} color={Colors.light.gray400} />
              </TouchableOpacity>
            ) : null}
        </View>
    )
}

export default ThemedInput

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.transparentGray015,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.smd,
        height: 44,
        width: "100%",
    },
    input: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: typography.size.mdlg || typography.size.md,
    }
})