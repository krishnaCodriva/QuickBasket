import React from "react";
import { ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { STRINGS, Colors } from "../constants";
import { useThemeColor, useCategories } from "../hooks";
import { useTranslation } from "react-i18next";
import { spacing, radius, typography } from "../core/constants/theme";

interface ActiveFilterChipsProps {
  filterCategory: string | null;
  setFilterCategory: (val: string | null) => void;
  filterSubCategoryId?: string | null;
  setFilterSubCategoryId?: (val: string | null) => void;
  filterPrice: string | null;
  setFilterPrice: (val: string | null) => void;
  filterTag: string | null;
  setFilterTag: (val: string | null) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  outOfStockOnly: boolean;
  setOutOfStockOnly: (val: boolean) => void;
  onFilterRemove: () => void;
}

const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filterCategory,
  setFilterCategory,
  filterSubCategoryId,
  setFilterSubCategoryId,
  filterPrice,
  setFilterPrice,
  filterTag,
  setFilterTag,
  inStockOnly,
  setInStockOnly,
  outOfStockOnly,
  setOutOfStockOnly,
  onFilterRemove,
}) => {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const selectedCategory = categories.find(c => c.id === filterCategory);
  const subCategories = selectedCategory?.subcategories || [];

  const hasActiveFilters =
    filterPrice || filterCategory || filterSubCategoryId || filterTag || inStockOnly || outOfStockOnly;

  const categoryNameKey = categories.find(c => c.id === filterCategory)?.nameKey || filterCategory;
  const subCategoryNameKey = subCategories.find(s => s.id === filterSubCategoryId)?.nameKey || filterSubCategoryId;

  const chipBgColor = useThemeColor(
    { light: Colors.light.gray200, dark: Colors.dark.gray800 },
    "secondaryBackground" as any,
  );
  const chipTextColor = useThemeColor(
    { light: Colors.light.gray800, dark: Colors.dark.gray200 },
    "primaryText" as any,
  );
  const closeIconColor = useThemeColor(
    { light: Colors.light.gray500, dark: Colors.dark.gray400 },
    "primaryText" as any,
  );

  if (!hasActiveFilters) return null;

  const handleClearAll = () => {
    setFilterCategory(null);
    if (setFilterSubCategoryId) setFilterSubCategoryId(null);
    setFilterPrice(null);
    setFilterTag(null);
    setInStockOnly(false);
    setOutOfStockOnly(false);
    onFilterRemove();
  };

  return (
    <View style={styles.activeFiltersWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.activeFiltersContainer}
      >
        {filterCategory && (
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: chipBgColor }]}
            onPress={() => {
              setFilterCategory(null);
              // Subcategories depend on categories, so clearing category should clear subcategory too
              if (setFilterSubCategoryId) setFilterSubCategoryId(null);
              onFilterRemove();
            }}
          >
            <ThemedText
              style={[styles.filterChipText, { color: chipTextColor }]}
            >
              {categoryNameKey ? t(categoryNameKey) : ''}
            </ThemedText>
            <Ionicons name="close-circle" size={16} color={closeIconColor} />
          </TouchableOpacity>
        )}
        {filterSubCategoryId && (
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: chipBgColor }]}
            onPress={() => {
              if (setFilterSubCategoryId) setFilterSubCategoryId(null);
              onFilterRemove();
            }}
          >
            <ThemedText
              style={[styles.filterChipText, { color: chipTextColor }]}
            >
              {subCategoryNameKey ? t(subCategoryNameKey) : ''}
            </ThemedText>
            <Ionicons name="close-circle" size={16} color={closeIconColor} />
          </TouchableOpacity>
        )}
        {filterPrice && (
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: chipBgColor }]}
            onPress={() => {
              setFilterPrice(null);
              onFilterRemove();
            }}
          >
            <ThemedText
              style={[styles.filterChipText, { color: chipTextColor }]}
            >
              {t(filterPrice)}
            </ThemedText>
            <Ionicons name="close-circle" size={16} color={closeIconColor} />
          </TouchableOpacity>
        )}
        {filterTag && (
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: chipBgColor }]}
            onPress={() => {
              setFilterTag(null);
              onFilterRemove();
            }}
          >
            <ThemedText
              style={[styles.filterChipText, { color: chipTextColor }]}
            >
              {t(filterTag)}
            </ThemedText>
            <Ionicons name="close-circle" size={16} color={closeIconColor} />
          </TouchableOpacity>
        )}
        {inStockOnly && (
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: chipBgColor }]}
            onPress={() => {
              setInStockOnly(false);
              onFilterRemove();
            }}
          >
            <ThemedText
              style={[styles.filterChipText, { color: chipTextColor }]}
            >
              {t(STRINGS.productListing.inStockOnly)}
            </ThemedText>
            <Ionicons name="close-circle" size={16} color={closeIconColor} />
          </TouchableOpacity>
        )}
        {outOfStockOnly && (
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: chipBgColor }]}
            onPress={() => {
              setOutOfStockOnly(false);
              onFilterRemove();
            }}
          >
            <ThemedText
              style={[styles.filterChipText, { color: chipTextColor }]}
            >
              {t(STRINGS.productListing.outOfStockOnly)}
            </ThemedText>
            <Ionicons name="close-circle" size={16} color={closeIconColor} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.clearAllChip} onPress={handleClearAll}>
          <ThemedText style={styles.clearAllText}>
            {t(STRINGS.productListing.clearFilters)}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  activeFiltersWrapper: {
    marginBottom: spacing.md,
  },
  activeFiltersContainer: {
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.smd,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    marginRight: spacing.sm,
  },
  filterChipText: {
    fontSize: typography.size.sm,
    marginRight: spacing.xs,
  },
  clearAllChip: {
    paddingHorizontal: spacing.smd,
    paddingVertical: spacing.xs,
  },
  clearAllText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.light.red600,
  },
});

export default ActiveFilterChips;
