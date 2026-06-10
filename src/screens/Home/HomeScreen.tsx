/**
 * HomeScreen.tsx
 * Refactored under the QuickBasket Enterprise Architecture Plan.
 *
 * Changes:
 * - Fixed critical syntax error: duplicate/unclosed filteredProducts declaration
 * - Removed navigation: any — uses typed NativeStackScreenProps
 * - Extracted LocationModal to dedicated component
 * - Extracted LanguageModal to dedicated component
 * - Replaced inline language array with SUPPORTED_LANGUAGES constant
 * - Replaced hardcoded "Select Language" with i18n key
 * - Removed all console.log debug statements
 * - Replaced inline spacing values with design tokens where feasible
 * - handleBannerPress correctly typed with Banner domain type
 * - filteredProducts correctly uses ProductService.getProductsByTag
 */

import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  Platform,
  StatusBar,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { StorageService, STORAGE_KEYS } from "../../services";
import { useThemeColor, useCategories } from "../../hooks";
import {
  ThemedText,
  ThemedView,
  ProductCard,
  CartHeaderIcon,
  EmptyState,
  SearchAndFilterBar,
} from "../../components";
import {
  BannerCarousel,
  CategoryCard,
  QuickFilters,
} from "../../components/Home";
import { ThemeDimension, Colors, STRINGS } from "../../constants";
import { ProductService } from "../../services";
import { HOME_BANNERS } from "../../data/mockData";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../context/localizationContext/localeAction";
import LocalizationContext from "../../context/localizationContext/LocaleContext";
import { useCart } from "../../context/CartContext";
import i18n from "../../localization/i18";

import { SUPPORTED_LANGUAGES } from "../../core/constants/languages";
import { spacing } from "../../core/constants/theme/spacing";
import { radius } from "../../core/constants/theme/radius";
import { zIndex } from "../../core/constants/theme/zIndex";
import { typography } from "../../core/constants/theme/typography";
import type { RootStackParamList } from "../../core/types/navigation";
import type { Banner, Category, LanguageCode } from "../../core/types/domain";

import LocationModal from "./LocationModal";
import LanguageModal from "./LanguageModal";


// ─── Types ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<RootStackParamList, "HomeTab">;

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }: Props) {
  const [initLang, initDispatch] = useContext(LocalizationContext);
  const { t } = useTranslation();

  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  // ─── Theme colors ──────────────────────────────────────────────────────────
  const iconColor = useThemeColor(
    { light: Colors.light.black, dark: Colors.light.white },
    "primaryText" as never,
  );
  const searchBg = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.secondaryBackground },
    "secondaryBackground" as never,
  );
  const searchBorder = useThemeColor(
    { light: Colors.light.gray200, dark: Colors.dark.gray300 },
    "gray200" as never,
  );
  const seeAllColor = useThemeColor(
    { light: Colors.light.gray900, dark: Colors.light.blue100 },
    "primaryText" as never,
  );
  const sheetBg = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.secondaryBackground },
    "secondaryBackground" as never,
  );
  const sheetDivider = useThemeColor(
    { light: Colors.light.gray200, dark: Colors.dark.gray300 },
    "gray200" as never,
  );
  const primaryColor = useThemeColor({}, "primary");
  const statusBarBg = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.black },
    "primaryBackground" as never,
  );

  // ─── Cart ──────────────────────────────────────────────────────────────────
  const { cartItems, addToCart, updateQuantity } = useCart();
  
  const { categories, isLoading: categoriesLoading } = useCategories();

  // ─── Search & Tag Filter ──────────────────────────────────────────────────────────
  const [selectedTagId, setSelectedTagId] = useState(STRINGS.homeScreen.tags.all);

  const tagsList = [
    { id: STRINGS.homeScreen.tags.all, label: t(STRINGS.homeScreen.tags.all) },
    { id: STRINGS.homeScreen.tags.fresh, label: t(STRINGS.homeScreen.tags.fresh) },
    { id: STRINGS.homeScreen.tags.trending, label: t(STRINGS.homeScreen.tags.trending) },
    { id: STRINGS.homeScreen.tags.dailyEssentials, label: t(STRINGS.homeScreen.tags.dailyEssentials) },
    { id: STRINGS.homeScreen.tags.fastDelivery, label: t(STRINGS.homeScreen.tags.fastDelivery) },
    { id: STRINGS.homeScreen.tags.recommended, label: t(STRINGS.homeScreen.tags.recommended) },
    { id: STRINGS.homeScreen.tags.bestSelling, label: t(STRINGS.homeScreen.tags.bestSelling) },
    { id: STRINGS.homeScreen.tags.newArrivals, label: t(STRINGS.homeScreen.tags.newArrivals) },
  ];

  // ─── Products ──────────────────────────────────────────────────────────────
  const filteredProducts = ProductService.getProductsByTag(selectedTagId, 20);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const getProductQuantity = useCallback(
    (id: string) => {
      const item = cartItems.find((i) => i.id === id);
      return item ? item.quantity : 0;
    },
    [cartItems],
  );

  const handleBannerPress = useCallback(
    (banner: Banner) => {
      if (banner.linkType === "category" || banner.linkType === "offer") {
        navigation.navigate("ProductListing", {
          category:
            banner.linkType === "category"
              ? banner.linkTarget
              : "Special Offers",
          query:
            banner.linkType === "offer" ? banner.linkTarget : undefined,
        });
      } else if (banner.linkType === "product") {
        const product =
          ProductService.getProductById(banner.linkTarget) ??
          ProductService.getProducts({ page: 1 }).products[0];
        if (product) {
          navigation.navigate("ProductDetail", { product });
        }
      }
    },
    [navigation],
  );

  // ─── Location ──────────────────────────────────────────────────────────────
  const [currentAddress, setCurrentAddress] = useState("");
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const parsed = await StorageService.getObject<{ address: string }>(
          STORAGE_KEYS.USER_LOCATION,
        );
        if (parsed?.address) {
          setCurrentAddress(parsed.address);
        }
      } catch {
        // Location unavailable — silently ignore, user can select manually
      }
    };

    fetchLocation();
    const unsubscribe = navigation.addListener("focus", fetchLocation);
    return unsubscribe;
  }, [navigation]);

  // ─── Language switch ───────────────────────────────────────────────────────
  const handleLanguageSelect = useCallback(
    (code: LanguageCode) => {
      setLangModalVisible(false);
      setTimeout(() => {
        React.startTransition(() => {
          i18n.changeLanguage(code).then(() => {
            initDispatch(setLanguage(code));
          });
        });
      }, 300);
    },
    [initDispatch],
  );

  // ─── Render helpers ────────────────────────────────────────────────────────

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => setLocationModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t(STRINGS.homeScreen.selectLocation)}
      >
        <ThemedText style={styles.deliveringTo} useSecondaryText>
          {t(STRINGS.homeScreen.deliveringTo)}
        </ThemedText>
        <View style={styles.locationRow}>
          <ThemedText style={styles.locationBoldText} numberOfLines={1}>
            📍 {currentAddress || t(STRINGS.homeScreen.selectLocation)}
          </ThemedText>
          <Ionicons
            name="chevron-down"
            size={16}
            color={iconColor}
            style={{ marginLeft: spacing.xs }}
          />
        </View>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => setLangModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={t(STRINGS.homeScreen.selectLanguage)}
        >
          <Ionicons name="globe-outline" size={24} color={iconColor} />
        </TouchableOpacity>
        <CartHeaderIcon color={iconColor} badgeBorderColor={statusBarBg} />
      </View>
    </View>
  );

  const renderSearch = () => (
    <SearchAndFilterBar
      searchQuery={""}
      onSearchChange={() => {}}
      onPress={() => navigation.navigate("ProductListing" as never)}
      containerStyle={styles.searchBarContainer}
    />
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <ThemedText type="subtitle">
          {t(STRINGS.common.categories.browseCategories)}
        </ThemedText>
        <TouchableOpacity onPress={() => navigation.navigate("CategoriesTab" as never)}>
          <ThemedText style={[styles.seeAllText, { color: seeAllColor }]}>
            {t(STRINGS.common.seeAll)}
          </ThemedText>
        </TouchableOpacity>
      </View>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            name={t(item.nameKey)}
            emoji={item.emoji}
            colorName={item.colorName}
            onPress={() =>
              navigation.navigate("HomeTab", {
                screen: "CategoriesTab",
                params: { categoryId: item.id },
              })
            }
          />
        )}
      />
    </View>
  );

  const renderListHeader = () => (
    <View>
      {renderSearch()}
      <BannerCarousel
        banners={HOME_BANNERS as never}
        onBannerPress={handleBannerPress}
      />
      {renderCategories()}
      <View style={{ marginBottom: spacing.md }}>
        <QuickFilters
          tags={tagsList}
          selectedTagId={selectedTagId}
          onSelectTag={setSelectedTagId}
        />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon={<Ionicons name="search" size={40} color={Colors.light.gray300} />}
      title={t(STRINGS.homeScreen.noProductsFound)}
      containerStyle={styles.emptyContainer}
    />
  );

  const renderProductItem = useCallback(
    ({ item }: { item: ReturnType<typeof ProductService.getProductsByTag>[0] }) => (
      <ProductCard
        id={item.id}
        name={item.name}
        price={`₹${item.price.toFixed(2)}`}
        mrp={item.mrp ? `₹${item.mrp.toFixed(2)}` : undefined}
        category={item.category}
        weight={item.weight}
        emoji={item.emoji}
        inStock={item.inStock}
        quantity={getProductQuantity(item.id)}
        onAdd={() => {
          if (getProductQuantity(item.id) > 0) {
            updateQuantity(item.id, 1);
          } else {
            addToCart(item, 1);
          }
        }}
        onRemove={() => updateQuantity(item.id, -1)}
        onPress={() => navigation.navigate("ProductDetail", { product: item })}
        isGrid
        containerStyle={{ width: "48%", marginBottom: spacing.md }}
      />
    ),
    [getProductQuantity, updateQuantity, addToCart, navigation],
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <ThemedView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={statusBarBg}
      />
      {renderHeader()}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        renderItem={renderProductItem}
      />

      <LocationModal
        visible={locationModalVisible}
        currentAddress={currentAddress}
        sheetBg={sheetBg}
        sheetDivider={sheetDivider}
        primaryColor={primaryColor}
        onClose={() => setLocationModalVisible(false)}
        onNavigateToLocation={() => {
          setLocationModalVisible(false);
          navigation.navigate("Location");
        }}
      />

      <LanguageModal
        visible={langModalVisible}
        sheetBg={sheetBg}
        sheetDivider={sheetDivider}
        primaryColor={primaryColor}
        activeLangCode={i18n.language as LanguageCode}
        onClose={() => setLangModalVisible(false)}
        onSelectLanguage={handleLanguageSelect}
      />
    </ThemedView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: ThemeDimension.spacing.m,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ?? 0) + spacing.sm
        : 50,
    paddingBottom: spacing.md,
  },
  iconButton: {
    flex: 1,
    marginRight: spacing.md,
  },
  headerIconBtn: {
    padding: spacing.sm,
  },
  deliveringTo: {
    fontSize: typography.size.sm,
    marginBottom: 2,
    fontWeight: typography.weight.medium,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationBoldText: {
    fontSize: typography.size.mdlg,
    fontWeight: typography.weight.bold,
    flexShrink: 1,
  },
  searchBarContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchPlaceholder: {
    color: Colors.light.gray400,
    fontSize: typography.size.mdlg,
    flex: 1,
  },
  micIcon: {
    marginLeft: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.gray200,
    borderRadius: radius.lg,
    borderStyle: "dashed",
  },
});
