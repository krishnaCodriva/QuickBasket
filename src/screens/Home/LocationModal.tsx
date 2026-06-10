/**
 * LocationModal.tsx
 * Extracted from HomeScreen as part of the QuickBasket Enterprise Architecture Plan.
 *
 * Responsibilities:
 * - Display current delivery address
 * - Allow navigation to the Location screen to change address
 * - Uses design tokens — no hardcoded values
 * - Fully i18n — no hardcoded strings
 */

import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ThemedText } from "../../components/ThemedText";
import { Colors, STRINGS } from "../../constants";
import { spacing } from "../../core/constants/theme/spacing";
import { radius } from "../../core/constants/theme/radius";
import { typography } from "../../core/constants/theme/typography";

interface LocationModalProps {
  visible: boolean;
  currentAddress: string;
  sheetBg: string;
  sheetDivider: string;
  primaryColor: string;
  onClose: () => void;
  onNavigateToLocation: () => void;
}

export default function LocationModal({
  visible,
  currentAddress,
  sheetBg,
  sheetDivider,
  primaryColor,
  onClose,
  onNavigateToLocation,
}: LocationModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable>
          <View style={[styles.sheet, { backgroundColor: sheetBg }]}>
            {/* Header */}
              <View style={styles.header}>
                <ThemedText style={styles.title}>
                  {t(STRINGS.homeScreen.selectLocation)}
                </ThemedText>
                <TouchableOpacity
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel={t(STRINGS.common.cancel)}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={Colors.light.gray400}
                  />
                </TouchableOpacity>
              </View>

              {/* Current address option */}
              <TouchableOpacity style={styles.option} onPress={onClose}>
                <Ionicons name="location" size={24} color={primaryColor} />
                <View style={styles.optionText}>
                  <ThemedText style={styles.optionTitle}>
                    {t(STRINGS.locationScreen.currentAddress)}
                  </ThemedText>
                  <ThemedText style={styles.optionSub} useSecondaryText>
                    {currentAddress}
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: sheetDivider }]} />

              {/* Search new location option */}
              <TouchableOpacity style={styles.option} onPress={onNavigateToLocation}>
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={Colors.light.gray400}
                />
                <View style={styles.optionText}>
                  <ThemedText style={styles.optionTitle}>
                    {t(STRINGS.locationScreen.searchNewLocation)}
                  </ThemedText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.light.gray400}
                />
              </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.light.transparentBlack05,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
    minHeight: 220,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  optionText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  optionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    marginBottom: spacing.xs,
  },
  optionSub: {
    fontSize: typography.size.smmd,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
    marginVertical: spacing.xs,
  },
});
