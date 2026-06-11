/**
 * SortModal.tsx
 * Extracted from ProductListingScreen as part of the QuickBasket Enterprise Architecture Plan.
 *
 * Responsibilities:
 * - Display sort options list (sourced from STRINGS constant)
 * - Show active sort with a checkmark and primary colour
 * - Call onSelect with chosen sort key
 * - Uses design tokens — no hardcoded values
 * - Fully i18n — no hardcoded strings
 */

import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemedText } from './ThemedText';
import { Colors, STRINGS } from '../constants';
import { spacing } from '../core/constants/theme/spacing';
import { radius } from '../core/constants/theme/radius';
import { typography } from '../core/constants/theme/typography';

// ─── Sort options (driven by STRINGS constant — localised keys) ────────────────

const SORT_OPTIONS = [
  STRINGS.productListing.sortOptions.relevance,
  STRINGS.productListing.sortOptions.priceLowHigh,
  STRINGS.productListing.sortOptions.priceHighLow,
  STRINGS.productListing.sortOptions.newest,
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface SortModalProps {
  visible: boolean;
  activeSort: string;
  modalBgColor: string;
  iconColor: string;
  primaryColor: string;
  onClose: () => void;
  onSelect: (sort: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SortModal({
  visible,
  activeSort,
  modalBgColor,
  iconColor,
  primaryColor,
  onClose,
  onSelect,
}: SortModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: modalBgColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="subtitle">{t(STRINGS.productListing.sortBy)}</ThemedText>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t(STRINGS.common.cancel)}
            >
              <Ionicons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Sort options */}
          {SORT_OPTIONS.map((option) => {
            const isActive = activeSort === option;
            return (
              <TouchableOpacity
                key={option}
                style={styles.option}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: isActive }}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    isActive && {
                      color: primaryColor,
                      fontWeight: typography.weight.bold,
                    },
                  ]}
                >
                  {t(option)}
                </ThemedText>
                {isActive && (
                  <Ionicons name="checkmark" size={20} color={primaryColor} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.light.transparentBlack05,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.gray200,
  },
  optionText: {
    fontSize: typography.size.lg,
  },
});
