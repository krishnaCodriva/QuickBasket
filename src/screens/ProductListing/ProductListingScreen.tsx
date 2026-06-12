import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, useColorScheme, Platform, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ThemedText,
  ThemedView,
  ProductCard,
  ActiveFilterChips,
  ProductFilterModal,
  EmptyState,
  LoadingState,
  ScreenHeader,
  CartHeaderIcon,
  SearchAndFilterBar,
  SortModal
} from '../../components';
import { Colors, STRINGS } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeColor, useCategories } from '../../hooks';
import { useCart } from '../../context';
import { useTranslation } from 'react-i18next';
import { useProductListing } from './useProductListing';
import { spacing } from '../../core/constants/theme/spacing';
import { typography } from '../../core/constants/theme/typography';
import { radius } from '../../core/constants/theme/radius';
import { elevation } from '../../core/constants/theme/elevation';
import type { Product } from '../../core/types/domain';


const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns, padding 16 on sides and 16 between columns

export default function ProductListingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId, category = STRINGS.productListing.allProducts, query = '' } = route.params || {};

  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const actionBtnBg = useThemeColor({ light: Colors.light.green100, dark: Colors.light.transparentWhite02 }, 'secondaryBackground' as any);
  const bgColor = useThemeColor({ light: Colors.light.gray100, dark: Colors.dark.black }, 'primaryBackground' as any);
  const modalBgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground' as any);

  const { cartItems, totalItems, subtotal } = useCart();
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const { categories } = useCategories();

  // Initialize the hook
  const {
    products,
    isLoading,
    isInitialLoad,
    isRefreshing,
    hasMore,
    searchQuery,
    setSearchQuery,
    activeSort,
    setActiveSort,
    inStockOnly,
    setInStockOnly,
    outOfStockOnly,
    setOutOfStockOnly,
    filterPrice,
    setFilterPrice,
    filterCategoryId,
    setFilterCategoryId,
    filterSubCategoryId,
    setFilterSubCategoryId,
    filterTag,
    setFilterTag,
    isGridFormat,
    setIsGridFormat,
    handleRefresh,
    handleLoadMore,
    handleUpdateCart,
  } = useProductListing({ categoryId, query });

  let headerTitle = t(STRINGS.productListing.allProducts);
  if (filterCategoryId) {
    if (filterCategoryId === categoryId) {
      headerTitle = t(category);
    } else {
      const currentCategory = categories.find(c => c.id === filterCategoryId);
      headerTitle = currentCategory ? t(currentCategory.nameKey || currentCategory.name) : t(category);
    }
  }

  const renderProductCard = ({ item }: { item: any }) => {
    const imageUrl = item.imageUrl || "https://via.placeholder.com/150";

    return (
      <ProductCard
        id={item.id}
        name={item.name}
        price={`₹${Number(item.price || 0).toFixed(2)}`}
        mrp={`₹${Number(item.compareAtPrice || item.price || 0).toFixed(2)}`}
        category={item.Category?.name || "Grocery"}
        weight={item.weight || "1 unit"}
        emoji={item.emoji || "📦"}
        inStock={item.stockQuantity > 0 || item.isActive}
        imageUrl={imageUrl}
        brand={item.brand}
        tags={item.tags}
        quantity={cartItems.find(i => i.id === item.id)?.quantity || 0}
        onAdd={() => handleUpdateCart(item, 1)}
        onRemove={() => handleUpdateCart(item, -1)}
        onPress={() => navigation.navigate("ProductDetail", { product: item })}
        isGrid={isGridFormat}
        containerStyle={
          isGridFormat
            ? { width: CARD_WIDTH }
            : { width: "100%", marginBottom: spacing.md }
        }
      />
    );
  };

  const renderEmptyState = () => {
    if (isLoading || isInitialLoad) {
      return <LoadingState mode="fullscreen" />;
    }
    return (
      <EmptyState
        icon={<Ionicons name="search" size={64} color={Colors.light.gray300} />}
        title={t(STRINGS.productListing.noProducts)}
        buttonText={t(STRINGS.productListing.clearFilters)}
        onButtonPress={() => {
          setSearchQuery("");
          setInStockOnly(false);
          setOutOfStockOnly(false);
        }}
      />
    );
  };

  const isSortActive = activeSort !== STRINGS.productListing.sortOptions.relevance;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScreenHeader
        title={headerTitle}
        onBack={() => navigation.goBack()}
        rightElement={
          <CartHeaderIcon
            color={iconColor}
            size={26}
            badgeBorderColor={bgColor}
          />
        }
      />

      {/* Search */}
      <SearchAndFilterBar
        placeholder={t(STRINGS.productListing.searchPlaceholder)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setFilterModalVisible(true)}
        autoFocus={!categoryId}
        containerStyle={{ marginHorizontal: spacing.md }}
      />

      {/* Sort / Filter row */}
      <View style={styles.sortFilterRow}>
        <ThemedText style={styles.resultsText}>
          {t(STRINGS.productListing.showingResults)} {products.length}{" "}
          {t(STRINGS.productListing.resultsText)}
        </ThemedText>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setIsGridFormat(!isGridFormat)}
          >
            <Ionicons
              name={isGridFormat ? "list" : "grid"}
              size={16}
              color={iconColor}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              isSortActive && {
                borderColor: primaryColor,
                backgroundColor: actionBtnBg,
              },
            ]}
            onPress={() => setSortModalVisible(true)}
          >
            <Ionicons
              name="swap-vertical"
              size={16}
              color={isSortActive ? primaryColor : iconColor}
            />
            <ThemedText
              style={[
                styles.actionBtnText,
                isSortActive && { color: primaryColor },
              ]}
            >
              {t(STRINGS.productListing.sortBtn)}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active filter chips */}
      <ActiveFilterChips
        filterCategory={filterCategoryId}
        initialCategoryName={category}
        setFilterCategory={setFilterCategoryId}
        filterSubCategoryId={filterSubCategoryId}
        setFilterSubCategoryId={setFilterSubCategoryId}
        filterPrice={filterPrice}
        setFilterPrice={setFilterPrice}
        filterTag={filterTag}
        setFilterTag={setFilterTag}
        inStockOnly={inStockOnly}
        setInStockOnly={setInStockOnly}
        outOfStockOnly={outOfStockOnly}
        setOutOfStockOnly={setOutOfStockOnly}
        onFilterRemove={handleRefresh}
      />

      {/* Product grid / list */}
      <FlatList
        key={isGridFormat ? "grid" : "list"}
        data={products as Product[]}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderProductCard}
        numColumns={isGridFormat ? 2 : 1}
        columnWrapperStyle={isGridFormat ? styles.columnWrapper : undefined}
        contentContainerStyle={[
          styles.listContent,
          totalItems > 0 && { paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Sticky cart bar */}
      {totalItems > 0 && (
        <View style={styles.cartSummary}>
          <View>
            <ThemedText style={styles.cartCountText}>
              {totalItems} {t(STRINGS.productListing.items)}
            </ThemedText>
            <ThemedText style={styles.cartTotalText}>
              ₹{subtotal.toFixed(2)}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.viewCartBtn}
            onPress={() => navigation.navigate("Cart")}
          >
            <ThemedText style={styles.viewCartText}>
              {t(STRINGS.productListing.viewCart)}
            </ThemedText>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={Colors.light.white}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Sort Modal */}
      <SortModal
        visible={sortModalVisible}
        activeSort={activeSort}
        modalBgColor={modalBgColor}
        iconColor={iconColor}
        primaryColor={primaryColor}
        onClose={() => setSortModalVisible(false)}
        onSelect={(sort) => {
          setActiveSort(sort);
          setSortModalVisible(false);
        }}
      />

      {/* Filter Modal */}
      <ProductFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filterCategoryId={filterCategoryId}
        setFilterCategoryId={setFilterCategoryId}
        filterSubCategoryId={filterSubCategoryId}
        setFilterSubCategoryId={setFilterSubCategoryId}
        filterPrice={filterPrice}
        setFilterPrice={setFilterPrice}
        filterTag={filterTag}
        setFilterTag={setFilterTag}
        inStockOnly={inStockOnly}
        setInStockOnly={setInStockOnly}
        outOfStockOnly={outOfStockOnly}
        setOutOfStockOnly={setOutOfStockOnly}
        onFilterChange={handleRefresh}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  headerButton: {
    padding: spacing.sm,
    position: "relative",
  },
  headerTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    flex: 1,
    textAlign: "center",
  },
  sortFilterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  resultsText: {
    fontSize: typography.size.sm,
    color: Colors.light.gray500,
  },
  actionsRow: {
    flexDirection: "row",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.gray300,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginLeft: spacing.sm,
  },
  actionBtnText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    marginLeft: 4,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  cartSummary: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: Colors.light.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    ...elevation.md,
  },
  cartCountText: {
    color: Colors.light.white,
    fontSize: typography.size.sm,
  },
  cartTotalText: {
    color: Colors.light.white,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  viewCartBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewCartText: {
    color: Colors.light.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    marginRight: 4,
  },
});
