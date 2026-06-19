

import React, { useState, useEffect, useContext, useCallback, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { StorageService, STORAGE_KEYS } from "../../services";
import { useThemeColor, useCategories, useRefresh } from "../../hooks";
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
import { homeApi } from "../../services/homeApi";
import { formatImageUrl } from "../../config/api.config";
// Removed mock data as per backend-driven requirement

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

  const { cartItems, addToCart, updateQuantity, totalItems } = useCart();

  // API States
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagsData, setTagsData] = useState<any[]>([]);
  const [bannersData, setBannersData] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<any[]>([]);

  // Filter products strictly based on selectedTag
  const filteredProducts = productsData.filter((p) => {
    if (!selectedTag) return true; // If no tag is selected, show all
    // Backend tag array structure: p.tags = [{ id, name, slug }, ...]
    return p.tags?.some((t: any) => t.id === selectedTag);
  });

  const getProductQuantity = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleBannerPress = useCallback((banner: any) => {
    if (banner.redirectType === "category" || banner.redirectType === "offer") {
      navigation.navigate("ProductListing", {
        categoryId: banner.redirectType === "category" ? banner.redirectId : undefined,
        category: banner.redirectType === "category" ? "Category" : "Special Offers",
        query: banner.redirectType === "offer" ? banner.redirectId : undefined,
      });
    } else if (banner.redirectType === "product") {
      const product = productsData.find((p) => p.id === banner.redirectId);
      if (product) {
        navigation.navigate("ProductDetail", { product });
      }
    }
  }, [navigation, productsData]);


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

  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchHomeData = useCallback(async (pageNum: number = 1, reset: boolean = false, currentTag: string | null = null, isInitialLoad: boolean = false, isTagClick: boolean = false) => {
    if (isFetchingRef.current && pageNum > 1) return;
    isFetchingRef.current = true;
    try {
      if (pageNum === 1 && isInitialLoad) setIsLoading(true);
      else if (pageNum > 1) setIsLoadMore(true);

      const res = await homeApi(pageNum, 10, currentTag || undefined);
      if (res?.data) {
        if (reset) {
          if (!isTagClick) {
            let parsedTags = res.data.tags || [];
            if (!Array.isArray(parsedTags) && Array.isArray(parsedTags.data)) parsedTags = parsedTags.data;
            setTagsData(parsedTags);
            
            let parsedBanners = res.data.banners || [];
            if (!Array.isArray(parsedBanners) && Array.isArray(parsedBanners.data)) parsedBanners = parsedBanners.data;
            setBannersData(parsedBanners);
            
            let parsedCategories = res.data.categories || [];
            if (!Array.isArray(parsedCategories) && Array.isArray(parsedCategories.data)) parsedCategories = parsedCategories.data;
            setCategoriesData(parsedCategories);
          }
        }
        
        let parsedProducts = res.data.products || [];
        if (!Array.isArray(parsedProducts) && Array.isArray(parsedProducts.data)) parsedProducts = parsedProducts.data;
        
        setProductsData(prev => reset ? parsedProducts : [...prev, ...parsedProducts]);
        setPage(pageNum);

        if (res.data.pagination) {
          setHasMore(pageNum < res.data.pagination.pages);
        } else {
          setHasMore(parsedProducts.length === 10);
        }
      }
    } catch (error) {
      console.error("Failed to fetch home API data:", error);
    } finally {
      setIsLoading(false);
      setIsLoadMore(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchHomeData(1, true, null, true);
  }, [fetchHomeData]);

  const handleRefresh = useCallback(() => {
    fetchHomeData(1, true, selectedTag);
  }, [fetchHomeData, selectedTag]);

  const { refreshing, onRefresh } = useRefresh(handleRefresh);

  const handleTagSelect = useCallback((tag: string | null) => {
    setSelectedTag(tag);
    fetchHomeData(1, true, tag, false, true);
  }, [fetchHomeData]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadMore && !isLoading && !isFetchingRef.current) {
      fetchHomeData(page + 1, false, selectedTag);
    }
  }, [hasMore, isLoadMore, isLoading, page, fetchHomeData, selectedTag]);
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
      onSearchChange={() => { }}
      onPress={() => navigation.navigate("CategoriesTab" as never)}
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
        data={categoriesData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            name={item.name}
            emoji={item.emoji || "📦"}
            imageUrl={item.imageUrl ? formatImageUrl(item.imageUrl) : undefined}
            colorName={item.colorName || "blue100"}
            onPress={() =>
              navigation.navigate("CategoriesTab", { categoryId: item.id })
            }
          />
        )}
      />
    </View>
  );

  const formattedBanners = useMemo(() => {
    return bannersData.map(b => ({
      ...b,
      // Handle different backend naming conventions for the image field
      source: { uri: formatImageUrl(b.imageUrl || b.image || b.bannerUrl || b.url || b.picture) }
    }));
  }, [bannersData]);

  const renderListHeader = () => (
    <View>
      {renderSearch()}
      {bannersData.length > 0 && (
        <BannerCarousel
          banners={formattedBanners}
          onBannerPress={handleBannerPress}
        />
      )}
      {renderCategories()}
      <View style={{ marginBottom: spacing.md }}>
        <QuickFilters
          tags={tagsData}
          selectedTag={selectedTag}
          onSelectTag={handleTagSelect}
        />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search" size={40} color={Colors.light.gray300} />
      <ThemedText style={{ fontSize: 16, color: Colors.light.gray500, marginTop: 8, fontWeight: "500" }}>
        {t(STRINGS.homeScreen.noProductsFound)}
      </ThemedText>
    </View>
  );

  const renderProductItem = ({ item }: { item: any }) => (
    <ProductCard
      id={item.id}
      name={item.name}
      price={`₹${Number(item.price || 0).toFixed(2)}`}
      mrp={item.compareAtPrice ? `₹${Number(item.compareAtPrice).toFixed(2)}` : undefined}
      category={item.Category?.name || "Other"}
      weight={item.weight || "1 unit"}
      emoji={item.emoji || "🛍️"} // Assuming backend doesn't send emoji for products, provide a fallback
      brand={item.brand}
      tags={item.tags}
      inStock={item.inStock !== false && (item.stockQuantity === undefined || Number(item.stockQuantity) > 0)}
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
      isGrid={true}
      containerStyle={{ width: "48%", marginBottom: 16 }}
      imageUrl={formatImageUrl(item.imageUrl)}
    />
  );



  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={statusBarBg}
        />
        {renderHeader()}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </ThemedView>
    );
  }

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
        ListHeaderComponent={renderListHeader()}
        ListEmptyComponent={renderEmptyState}
        renderItem={renderProductItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadMore ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={primaryColor} />
            </View>
          ) : null
        }
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
