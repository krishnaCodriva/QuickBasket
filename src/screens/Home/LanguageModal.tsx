/**
 * LanguageModal.tsx
 * Extracted from HomeScreen as part of the QuickBasket Enterprise Architecture Plan.
 *
 * Responsibilities:
 * - Display all supported languages from the SUPPORTED_LANGUAGES constant
 * - Show the currently active language with a checkmark
 * - Call onSelectLanguage with the selected language code
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
import { SUPPORTED_LANGUAGES } from "../../core/constants/languages";
import { spacing } from "../../core/constants/theme/spacing";
import { radius } from "../../core/constants/theme/radius";
import { typography } from "../../core/constants/theme/typography";
import type { LanguageCode } from "../../core/types/domain";

interface LanguageModalProps {
  visible: boolean;
  sheetBg: string;
  sheetDivider: string;
  primaryColor: string;
  activeLangCode: LanguageCode | string;
  onClose: () => void;
  onSelectLanguage: (code: LanguageCode) => void;
}

export default function LanguageModal({
  visible,
  sheetBg,
  sheetDivider,
  primaryColor,
  activeLangCode,
  onClose,
  onSelectLanguage,
}: LanguageModalProps) {
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
                  {t(STRINGS.homeScreen.selectLanguage)}
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

              {/* Language options — sourced from SUPPORTED_LANGUAGES constant */}
              {SUPPORTED_LANGUAGES.map((lang, index) => {
                const isActive = activeLangCode === lang.code;
                return (
                  <View key={lang.code}>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => onSelectLanguage(lang.code)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                    >
                      <View style={[styles.iconBadge, { backgroundColor: Colors.light.gray100 }]}>
                        <ThemedText
                          style={{
                            color: Colors.light.gray800,
                            fontWeight: typography.weight.bold,
                          }}
                        >
                          {lang.icon}
                        </ThemedText>
                      </View>
                      <View style={styles.optionText}>
                        <ThemedText
                          style={[
                            styles.optionLabel,
                            isActive && {
                              color: primaryColor,
                              fontWeight: typography.weight.bold,
                            },
                          ]}
                        >
                          {lang.label}
                        </ThemedText>
                      </View>
                      {isActive && (
                        <Ionicons
                          name="checkmark"
                          size={24}
                          color={primaryColor}
                        />
                      )}
                    </TouchableOpacity>
                    {index < SUPPORTED_LANGUAGES.length - 1 && (
                      <View
                        style={[
                          styles.divider,
                          { backgroundColor: sheetDivider },
                        ]}
                      />
                    )}
                  </View>
                );
              })}
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
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.circle,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  optionLabel: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
    marginVertical: spacing.xs,
  },
});
