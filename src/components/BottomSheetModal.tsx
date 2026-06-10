/**
 * BottomSheetModal.tsx
 * @description Reusable bottom-sheet modal wrapper.
 *
 * Provides the consistent pattern used across ProfileScreen (logout confirm),
 * SortModal, AddressFormModal, LanguageModal — all of which follow the same
 * overlay → sheet → drag-handle → content structure.
 *
 * Features:
 *  - Backdrop tap to dismiss
 *  - Optional drag handle
 *  - Safe-area-aware padding (paddingBottom)
 *  - Design-token driven radii, spacing
 *  - Fully themed background
 *  - animationType controlled by prop
 *
 * Usage:
 *  <BottomSheetModal visible={visible} onClose={onClose}>
 *    <ThemedText>Content here</ThemedText>
 *  </BottomSheetModal>
 */

import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useThemeColor } from '../hooks';
import { Colors } from '../constants';
import { spacing } from '../core/constants/theme/spacing';
import { radius } from '../core/constants/theme/radius';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BottomSheetModalProps {
  /** Controls visibility */
  visible: boolean;
  /** Called when backdrop is tapped or hardware back is pressed */
  onClose: () => void;
  /** Sheet content */
  children: React.ReactNode;
  /** Show the drag handle. Default: true */
  showHandle?: boolean;
  /** Padding applied to sheet content. Default: spacing.lg */
  contentPadding?: number;
  /** Additional styles for the sheet container */
  sheetStyle?: ViewStyle;
  /** Adjust for keyboard (useful for forms). Default: false */
  avoidKeyboard?: boolean;
  /** Animation type. Default: 'slide' */
  animationType?: 'slide' | 'fade' | 'none';
  /** testID for automation */
  testID?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BottomSheetModal({
  visible,
  onClose,
  children,
  showHandle = true,
  contentPadding = spacing.lg,
  sheetStyle,
  avoidKeyboard = false,
  animationType = 'slide',
  testID,
}: BottomSheetModalProps) {
  const sheetBg = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.secondaryBackground },
    'secondaryBackground' as never,
  );
  const handleColor = useThemeColor(
    { light: Colors.light.gray300, dark: Colors.dark.gray300 },
    'secondaryBackground' as never,
  );

  const SheetWrapper = avoidKeyboard ? KeyboardAvoidingView : View;
  const wrapperProps = avoidKeyboard
    ? { behavior: Platform.OS === 'ios' ? ('padding' as const) : undefined }
    : {};

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.overlay}>
        {/* Backdrop — tap to dismiss */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        {/* Sheet */}
        <SheetWrapper
          {...wrapperProps}
          style={[
            styles.sheet,
            { backgroundColor: sheetBg, padding: contentPadding },
            sheetStyle,
          ]}
        >
          {showHandle && (
            <View style={[styles.handle, { backgroundColor: handleColor }]} />
          )}
          {children}
        </SheetWrapper>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.light.transparentBlack05,
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingBottom: spacing.xxl,
    width: '100%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.xs,
    marginBottom: spacing.lg,
  },
});
