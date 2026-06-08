import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, TextInput, useColorScheme, Modal, Dimensions, Platform, StatusBar, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText, ThemedView, CustomButton, ProductCard, ActiveFilterChips, ProductFilterModal } from '../../components';
import { Colors, STRINGS } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ThemedInput from '../../components/ThemedInput';
import { useThemeColor } from '../../hooks';
import { useCart } from '../../context';
import { MOCK_PRODUCTS } from '../../data/mockData';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns, padding 16 on sides and 16 between columns

export default function ProductListingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { category = STRINGS.productListing.allProducts, query = '' } = route.params || {};

  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const actionBtnBg = useThemeColor({ light: Colors.light.green100, dark: Colors.light.transparentWhite02 }, 'secondaryBackground' as any);
  const bgColor = useThemeColor({ light: Colors.light.gray100, dark: Colors.dark.black }, 'primaryBackground' as any);
  const modalBgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground' as any);
  const chipBgColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray800 }, 'secondaryBackground' as any);
  const chipTextColor = useThemeColor({ light: Colors.light.gray800, dark: Colors.dark.gray200 }, 'primaryText' as any);
  const closeIconColor = useThemeColor({ light: Colors.light.gray500, dark: Colors.dark.gray400 }, 'primaryText' as any);
  const borderColor = useThemeColor({ light: Colors.light.gray300, dark: Colors.dark.gray700 }, 'primaryText' as any);

  const [searchQuery, setSearchQuery] = useState(query);
  const [products, setProducts] = useState<typeof MOCK_PRODUCTS>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { cartItems, addToCart, updateQuantity, removeFromCart, totalItems, subtotal } = useCart();
  const [isGridFormat, setIsGridFormat] = useState(true);

  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [activeSort, setActiveSort] = useState(STRINGS.productListing.sortOptions.relevance);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);

  const [filterPrice, setFilterPrice] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(category === STRINGS.productListing.allProducts || category === 'Special Offers' ? null : category);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    loadProducts(1, true);
  }, [searchQuery, activeSort, inStockOnly, outOfStockOnly, filterPrice, filterCategory, filterTag]);

  const loadProducts = (pageNumber: number, reset: boolean = false) => {
    if (isLoading && !reset) return;
    setIsLoading(true);

    setTimeout(() => {
      let filtered = [...MOCK_PRODUCTS];

      if (filterCategory) {
        filtered = filtered.filter(p => p.category.toLowerCase() === filterCategory.toLowerCase());
      } else if (category && category !== STRINGS.productListing.allProducts && category !== 'Special Offers') {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }

      if (filterPrice) {
        if (filterPrice === STRINGS.productListing.priceRanges.under5) {
          filtered = filtered.filter(p => p.price < 5);
        } else if (filterPrice === STRINGS.productListing.priceRanges.fiveToTen) {
          filtered = filtered.filter(p => p.price >= 5 && p.price <= 10);
        } else if (filterPrice === STRINGS.productListing.priceRanges.over10) {
          filtered = filtered.filter(p => p.price > 10);
        }
      }

      if (filterTag) {
        filtered = filtered.filter(p => p.tags?.includes(filterTag));
      }

      if (searchQuery) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      if (inStockOnly) {
        filtered = filtered.filter(p => p.inStock === true || p.inStock === 'true' || p.inStock === undefined);
      } else if (outOfStockOnly) {
        filtered = filtered.filter(p => p.inStock === false || p.inStock === 'false' || !p.inStock);
      }

      if (activeSort === STRINGS.productListing.sortOptions.priceLowHigh) {
        filtered.sort((a, b) => a.price - b.price);
      } else if (activeSort === STRINGS.productListing.sortOptions.priceHighLow) {
        filtered.sort((a, b) => b.price - a.price);
      } else if (activeSort === STRINGS.productListing.sortOptions.newest) {
        filtered = filtered.reverse(); // Mock newest
      }

      const startIndex = (pageNumber - 1) * 10;
      const paginated = filtered.slice(startIndex, startIndex + 10);

      setProducts(reset ? paginated : [...products, ...paginated]);
      setPage(pageNumber);
      setHasMore(paginated.length === 10);
      setIsLoading(false);
      setIsRefreshing(false);
      setIsInitialLoad(false);
    }, 500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProducts(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && products.length > 0) {
      loadProducts(page + 1);
    }
  };

  const handleUpdateCart = (product: any, delta: number) => {
    if (delta > 0) {
      const item = cartItems.find(i => i.id === product.id);
      if (item) {
        updateQuantity(product.id, delta);
      } else {
        addToCart(product, delta);
      }
    } else {
      updateQuantity(product.id, delta);
    }
  };


  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={iconColor} />
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle} numberOfLines={1}>{t(filterCategory || category)}</ThemedText>
      <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Cart')}>
        <Ionicons name="cart-outline" size={26} color={iconColor} />
        {totalItems > 0 && (
          <View style={[styles.badge, { borderColor: bgColor }]}>
            <ThemedText style={styles.badgeText}>{totalItems}</ThemedText>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <ThemedInput
      placeholder={t(STRINGS.productListing.searchPlaceholder)}
      value={searchQuery}
      onChangeText={(text) => {
        setSearchQuery(text);
        setIsLoading(true);
      }}
      onClear={() => {
        setSearchQuery('');
        setIsLoading(true);
      }}
      styleWrapper={{
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: borderColor,
        marginBottom: 16,
        width: 'auto'
      }}
    />
  );

  const renderSortFilterRow = () => (
    <View style={styles.sortFilterRow}>
      <ThemedText style={styles.resultsText}>{t(STRINGS.productListing.showingResults)} {products.length} {t(STRINGS.productListing.resultsText)}</ThemedText>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn]}
          onPress={() => setIsGridFormat(!isGridFormat)}
        >
          <Ionicons name={isGridFormat ? "list" : "grid"} size={16} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, activeSort !== STRINGS.productListing.sortOptions.relevance && { borderColor: primaryColor, backgroundColor: actionBtnBg }]}
          onPress={() => setSortModalVisible(true)}
        >
          <Ionicons name="swap-vertical" size={16} color={activeSort !== STRINGS.productListing.sortOptions.relevance ? primaryColor : iconColor} />
          <ThemedText style={[styles.actionBtnText, activeSort !== STRINGS.productListing.sortOptions.relevance && { color: primaryColor }]}>{t(STRINGS.productListing.sortBtn)}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, (inStockOnly || outOfStockOnly) && { borderColor: primaryColor, backgroundColor: actionBtnBg }]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={16} color={(inStockOnly || outOfStockOnly) ? primaryColor : iconColor} />
          <ThemedText style={[styles.actionBtnText, (inStockOnly || outOfStockOnly) && { color: primaryColor }]}>{t(STRINGS.productListing.filtersBtn)}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActiveFilters = () => (
    <ActiveFilterChips
      filterCategory={filterCategory}
      setFilterCategory={setFilterCategory}
      filterPrice={filterPrice}
      setFilterPrice={setFilterPrice}
      filterTag={filterTag}
      setFilterTag={setFilterTag}
      inStockOnly={inStockOnly}
      setInStockOnly={setInStockOnly}
      outOfStockOnly={outOfStockOnly}
      setOutOfStockOnly={setOutOfStockOnly}
      onFilterRemove={() => setIsLoading(true)}
    />
  );

  const renderProductCard = ({ item }: { item: typeof MOCK_PRODUCTS[0] }) => {
    return (
      <ProductCard
        id={item.id}
        name={item.name}
        price={`$${item.price.toFixed(2)}`}
        mrp={`$${item.mrp.toFixed(2)}`}
        category={item.category}
        weight={t(item.weight)}
        emoji={item.emoji}
        inStock={item.inStock}
        quantity={cartItems.find(i => i.id === item.id)?.quantity || 0}
        onAdd={() => handleUpdateCart(item, 1)}
        onRemove={() => handleUpdateCart(item, -1)}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        isGrid={isGridFormat}
        containerStyle={isGridFormat ? { width: CARD_WIDTH } : { width: '100%', marginBottom: 16 }}
      />
    );
  };

  const renderEmptyState = () => {
    if (isLoading || isInitialLoad) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search" size={64} color={Colors.light.gray300} />
        <ThemedText style={styles.emptyTitle}>{t(STRINGS.productListing.noProducts)}</ThemedText>
        <CustomButton
          title={t(STRINGS.productListing.clearFilters)}
          type="primary"
          onPress={() => {
            setSearchQuery('');
            setInStockOnly(false);
            setOutOfStockOnly(false);
            setIsLoading(true);
          }}
          style={{ paddingHorizontal: 24 }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {renderHeader()}
      {renderSearchBar()}
      {renderSortFilterRow()}
      {renderActiveFilters()}

      <FlatList
        key={isGridFormat ? 'grid' : 'list'}
        data={products}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderProductCard}
        numColumns={isGridFormat ? 2 : 1}
        columnWrapperStyle={isGridFormat ? styles.columnWrapper : undefined}
        contentContainerStyle={[styles.listContent, totalItems > 0 && { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
      />

      {totalItems > 0 && (
        <View style={styles.cartSummary}>
          <View>
            <ThemedText style={styles.cartCountText}>{totalItems} {t(STRINGS.productListing.items)}</ThemedText>
            <ThemedText style={styles.cartTotalText}>₹{subtotal.toFixed(2)}</ThemedText>
          </View>
          <TouchableOpacity style={styles.viewCartBtn} onPress={() => navigation.navigate('Cart')}>
            <ThemedText style={styles.viewCartText}>{t(STRINGS.productListing.viewCart)}</ThemedText>
            <Ionicons name="chevron-forward" size={16} color={Colors.light.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Sort Modal */}
      <Modal visible={sortModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: modalBgColor }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">{t(STRINGS.productListing.sortBy)}</ThemedText>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Ionicons name="close" size={24} color={iconColor} />
              </TouchableOpacity>
            </View>
            {[STRINGS.productListing.sortOptions.relevance, STRINGS.productListing.sortOptions.priceLowHigh, STRINGS.productListing.sortOptions.priceHighLow, STRINGS.productListing.sortOptions.newest].map(option => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  if (activeSort !== option) {
                    setActiveSort(option);
                    setIsLoading(true);
                  }
                  setSortModalVisible(false);
                }}
              >
                <ThemedText style={[styles.modalOptionText, activeSort === option && { color: primaryColor, fontWeight: 'bold' }]}>
                  {t(option)}
                </ThemedText>
                {activeSort === option && <Ionicons name="checkmark" size={20} color={primaryColor} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <ProductFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterPrice={filterPrice}
        setFilterPrice={setFilterPrice}
        filterTag={filterTag}
        setFilterTag={setFilterTag}
        inStockOnly={inStockOnly}
        setInStockOnly={setInStockOnly}
        outOfStockOnly={outOfStockOnly}
        setOutOfStockOnly={setOutOfStockOnly}
        onFilterChange={() => setIsLoading(true)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.light.red600,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.white,
    zIndex: 1,
  },
  badgeText: {
    color: Colors.light.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  sortFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 13,
    color: Colors.light.gray500,
  },
  actionsRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.gray300,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 24,
  },

  cartSummary: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cartCountText: {
    color: Colors.light.white,
    fontSize: 12,
  },
  cartTotalText: {
    color: Colors.light.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCartText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.light.transparentBlack05,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.gray200,
  },
  modalOptionText: {
    fontSize: 16,
  },
});
