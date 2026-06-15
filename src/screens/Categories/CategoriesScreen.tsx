import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ThemedView, ThemedText, CartHeaderIcon } from "../../components";
import { CategoryCard } from "../../components/Home";
import { Colors, STRINGS } from "../../constants";
import { useThemeColor, useCategories } from "../../hooks";
import { spacing, radius, typography } from "../../core/constants/theme";
import type { Category, SubCategory } from "../../core/types/domain";
import type { TabParamList } from "../../core/types/navigation";
import { formatImageUrl } from "../../config/api.config";

export default function CategoriesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<TabParamList, "CategoriesTab">>();
  const { t } = useTranslation();

  const { categories, isLoading: categoriesLoading } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  // Auto-select first category when loaded or categoryId from params
  useEffect(() => {
    if (categories.length > 0) {
      if (route.params?.categoryId) {
        setSelectedCategoryId(route.params.categoryId);
        // Clear param so subsequent changes aren't overridden
        navigation.setParams({ categoryId: undefined });
      } else if (!selectedCategoryId) {
        setSelectedCategoryId(categories[0].id);
      }
    }
  }, [categories, selectedCategoryId, route.params?.categoryId, navigation]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const subCategories = selectedCategory?.subcategories || [];
  const subCategoriesLoading = false;

  const bgColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.primaryBackground },
    "primaryBackground" as any,
  );
  const iconColor = useThemeColor({}, "iconColor" as any);
  const searchBg = useThemeColor(
    { light: Colors.light.gray100, dark: "rgba(255,255,255,0.1)" },
    "gray100" as any,
  );
  const primaryColor = useThemeColor({}, "primary");

  const leftColBg = useThemeColor(
    { light: Colors.light.gray50, dark: Colors.dark.secondaryBackground },
    "secondaryBackground" as any,
  );
  const selectedCatBg = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.primaryBackground },
    "primaryBackground" as any,
  );
  const imageBgColor = useThemeColor(
    { light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.05)" },
    "transparentWhite04" as any,
  );

  const handleSubCategoryPress = (subCategory: SubCategory) => {
    navigation.navigate("ProductListing", {
      categoryId: subCategory.parentId || selectedCategoryId,
      subCategoryId: subCategory.id,
      category: subCategory.nameKey || subCategory.name,
    });
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = item.id === selectedCategoryId;
    return (
      <CategoryCard
        name={t(item.nameKey || item.name)}
        emoji={item.emoji || "📦"}
        imageUrl={item.imageUrl ? formatImageUrl(item.imageUrl) : undefined}
        colorName={item.colorName || "blue100"}
        isSelected={isSelected}
        onPress={() => setSelectedCategoryId(item.id)}
        containerStyle={{
          width: "100%",
          marginRight: 0,
          paddingVertical: spacing.md,
          backgroundColor: isSelected ? selectedCatBg : leftColBg,
        }}
      />
    );
  };

  const renderSubCategoryItem = ({ item }: { item: SubCategory }) => (
    <TouchableOpacity
      style={[styles.subCategoryCard, { backgroundColor: searchBg }]}
      onPress={() => handleSubCategoryPress(item)}
    >
      <Image
        source={{ uri: item.imageUrl ? formatImageUrl(item.imageUrl) : "https://via.placeholder.com/150" }}
        style={[styles.subCategoryImage, { backgroundColor: imageBgColor }]}
      />
      <ThemedText style={styles.subCategoryName} numberOfLines={2}>
        {t(item.nameKey || item.name)}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <View style={{ width: 24 }} />
        <ThemedText style={styles.headerTitle}>
          {t(STRINGS.common.appName)}
        </ThemedText>
        <CartHeaderIcon color={iconColor} badgeBorderColor={bgColor} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: searchBg }]}
          onPress={() => navigation.navigate("ProductListing")}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.light.gray400}
            style={styles.searchIcon}
          />
          <ThemedText style={styles.searchPlaceholder}>
            {t(STRINGS.homeScreen.searchPlaceholder)}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {/* Left Column: Main Categories */}
        <View style={[styles.leftColumn, { backgroundColor: leftColBg }]}>
          {categoriesLoading ? (
            <ActivityIndicator
              size="small"
              color={primaryColor}
              style={{ marginTop: spacing.xl }}
            />
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={renderCategoryItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: spacing.xxl }}
            />
          )}
        </View>

        {/* Right Column: Sub Categories */}
        <View style={styles.rightColumn}>
          {subCategoriesLoading ? (
            <ActivityIndicator
              size="large"
              color={primaryColor}
              style={{ marginTop: spacing.xxxl }}
            />
          ) : subCategories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText useSecondaryText>
                {t(STRINGS.productListing.noProducts)}
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={subCategories}
              keyExtractor={(item) => item.id}
              renderItem={renderSubCategoryItem}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.subCatListContent}
              columnWrapperStyle={styles.subCatColumnWrapper}
            />
          )}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ?? 0) + spacing.smd
        : spacing.xxxl,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchPlaceholder: {
    color: Colors.light.gray400,
    fontSize: typography.size.sm,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },
  leftColumn: {
    width: "21%",
    height: "100%",
  },
  rightColumn: {
    width: "79%",
    height: "100%",
  },
  subCatListContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  subCatColumnWrapper: {
    justifyContent: "space-between",
  },
  subCategoryCard: {
    width: "47%",
    borderRadius: radius.md,
    overflow: "hidden",
    marginBottom: spacing.md,
    alignItems: "center",
  },
  subCategoryImage: {
    width: "100%",
    height: 80,
  },
  subCategoryName: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    textAlign: "center",
    padding: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
