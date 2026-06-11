import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  Platform,
  StatusBar,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeColor } from "../../hooks";
import { ThemedView, ThemedText, ProductCard } from "../../components";
import {
  BannerCarousel,
  CategoryCard,
  QuickFilters,
} from "../../components/Home";
import { ThemeDimension, Colors, STRINGS } from "../../constants";
import { MOCK_PRODUCTS } from "../../data/mockData";
import { HomeApi } from "../../services/api/home.api";
import { Banner, Category, Product } from "../../types/api";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../context/localizationContext/localeAction";
import LocalizationContext from "../../context/localizationContext/LocaleContext";
import { useCart } from "../../context/CartContext";
import i18n from "../../localization/i18";
// Mock Data
const CATEGORIES = [
  {
    id: "1",
    name: STRINGS.common.categories.fruits,
    emoji: "🍎",
    colorName: "red100" as const,
  },
  {
    id: "2",
    name: STRINGS.common.categories.veg,
    emoji: "🥕",
    colorName: "green100" as const,
  },
  {
    id: "3",
    name: STRINGS.common.categories.dairy,
    emoji: "🥛",
    colorName: "blue100" as const,
  },
  {
    id: "4",
    name: STRINGS.common.categories.bakery,
    emoji: "🍞",
    colorName: "orange100" as const,
  },
  {
    id: "5",
    name: STRINGS.common.categories.meat,
    emoji: "🥩",
    colorName: "pink100" as const,
  },
  {
    id: "6",
    name: STRINGS.common.categories.snacks,
    emoji: "🍿",
    colorName: "yellow100" as const,
  },
  {
    id: "7",
    name: STRINGS.common.categories.drinks,
    emoji: "🥤",
    colorName: "indigo100" as const,
  },
  {
    id: "8",
    name: STRINGS.common.categories.frozen,
    emoji: "🧊",
    colorName: "cyan100" as const,
  },
];

const HOME_BANNERS = [
  {
    id: "1",
    source: require("../../../assets/Section - Hero Carousel (Bento Style).png"),
    linkType: "category",
    linkTarget: STRINGS.common.categories.fruits,
  },
  {
    id: "2",
    source: require("../../../assets/banner1.jpg"),
    linkType: "offer",
    linkTarget: "Avocado",
  },
  {
    id: "3",
    source: require("../../../assets/banner2.jpg"),
    linkType: "product",
    linkTarget: "1",
  },
];

type Props = {
  navigation: any;
};

export default function HomeScreen({ navigation }: Props) {
  const [initLang, initDispatch] = useContext(LocalizationContext);
  const { t } = useTranslation();
  console.log("initLang 1234", initLang?.lange);
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const iconColor = useThemeColor(
    { light: Colors.light.black, dark: Colors.light.white },
    "primaryText" as any,
  );
  const searchBg = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.secondaryBackground },
    "secondaryBackground" as any,
  );
  const searchBorder = useThemeColor(
    { light: Colors.light.gray200, dark: Colors.dark.gray300 },
    "gray200" as any,
  );
  const seeAllColor = useThemeColor(
    { light: Colors.light.gray900, dark: Colors.light.blue100 },
    "primaryText" as any,
  );
  const sheetBg = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.secondaryBackground },
    "secondaryBackground" as any,
  );
  const sheetDivider = useThemeColor(
    { light: Colors.light.gray200, dark: Colors.dark.gray300 },
    "gray200" as any,
  );
  const primaryColor = useThemeColor({}, "primary");
  const statusBarBg = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.black },
    "primaryBackground" as any,
  );

  const { cartItems, addToCart, updateQuantity, totalItems } = useCart();
  const [selectedTag, setSelectedTag] = useState<string>("");

  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [apiBanners, setApiBanners] = useState<Banner[]>([]);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [apiTags, setApiTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setIsLoading(true);
      const res = await HomeApi.getHomeFeed(1, 10);
      // console.log("response  : ", JSON.stringify(res))

      if (res?.success) {
        // Extract base URL for images (remove /api/v1)
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.58:5000/api/v1';
        const baseUrl = apiUrl.replace('/api/v1', '');

        // Map Banners
        const mappedBanners = (res?.data?.banners || []).map((b: any) => ({
          id: b.id,
          source: { uri: baseUrl + b.imageUrl },
          linkType: b.redirectType,
          linkTarget: b.redirectId || b.redirectUrl,
        }));

        // Map Categories (we will fallback to emoji if imageUrl fails)
        const mappedCategories = (res.data.categories || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          imageUrl: baseUrl + c.imageUrl,
          emoji: "📦", // Fallback if needed
          colorName: "gray100"
        }));

        // Map Products
        const mappedProducts = (res.data.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price || 0),
          mrp: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
          category: p.Category?.name || '',
          weight: "1 pc", // Fallback or map from attributes if it exists
          imageUrl: baseUrl + p.imageUrl,
          inStock: p.isActive && p.stockQuantity > 0,
          tags: (p.tags || []).map((t: any) => t.name), // Extract tag names for filtering
        }));

        // Map Tags for QuickFilters: Safely handle if backend sends it as an object or array
        let rawTags = res.data.tags || [];
        if (!Array.isArray(rawTags) && typeof rawTags === 'object') {
          rawTags = Object.values(rawTags);
        }
        const backendTags = rawTags.map((t: any) => t.name).filter(Boolean);
        console.log("Parsed backend tags:", backendTags);

        setApiBanners(mappedBanners);
        setApiCategories(mappedCategories);
        setApiProducts(mappedProducts);
        setApiTags(backendTags);
      }
      setIsLoading(false);
    };
    loadHomeData();
  }, []);

  // REMOVED MOCK DATA FALLBACK: strictly use what backend provides
  const displayProducts = apiProducts;

  const filteredProducts = displayProducts.filter((p: any) => {
    // If no tag is selected, show all products
    if (!selectedTag) return true;
    
    // Only use backend tags filtering
    return p.tags?.includes(selectedTag);
  });

  const getProductQuantity = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleBannerPress = useCallback((banner: any) => {
    if (banner.linkType === "category" || banner.linkType === "offer") {
      navigation.navigate("ProductListing", {
        category:
          banner.linkType === "category" ? banner.linkTarget : "Special Offers",
        query: banner.linkType === "offer" ? banner.linkTarget : undefined,
      });
    } else if (banner.linkType === "product") {
      const product =
        displayProducts.find((p: any) => p.id === banner.linkTarget) ||
        displayProducts[0];
      navigation.navigate("ProductDetail", { product });
    }
  }, [navigation, displayProducts]);

  const [currentAddress, setCurrentAddress] = useState("Select Location");
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const stored = await AsyncStorage.getItem("@user_location");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.address) {
            setCurrentAddress(parsed.address);
          }
        }
      } catch (e) {
        console.log(e);
      }
    };

    fetchLocation();

    const unsubscribe = navigation.addListener("focus", () => {
      fetchLocation();
    });
    return unsubscribe;
  }, [navigation]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.locationSelector}
        onPress={() => setLocationModalVisible(true)}
      >
        <ThemedText style={styles.deliveringTo} useSecondaryText>
          {t(STRINGS.homeScreen.deliveringTo)}
        </ThemedText>
        <View style={styles.locationRow}>
          <ThemedText style={styles.locationBoldText} numberOfLines={1}>
            📍 {currentAddress}
          </ThemedText>
          <Ionicons
            name="chevron-down"
            size={16}
            color={iconColor}
            style={{ marginLeft: 4 }}
          />
        </View>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setLangModalVisible(true)}
        >
          <Ionicons name="language-outline" size={24} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Ionicons name="cart-outline" size={28} color={iconColor} />
          {totalItems > 0 && (
            <View style={[styles.badge, { borderColor: statusBarBg }]}>
              <ThemedText style={styles.badgeText}>{totalItems}</ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearch = () => (
    <TouchableOpacity
      style={[
        styles.searchBar,
        {
          backgroundColor: searchBg,
          borderColor: searchBorder,
          borderWidth: 1,
        },
      ]}
      onPress={() => navigation.navigate("ProductListing")}
    >
      <Ionicons
        name="search-outline"
        size={22}
        color={Colors.light.gray400}
        style={styles.searchIcon}
      />
      <ThemedText style={styles.searchPlaceholder}>
        {t(STRINGS.homeScreen.searchPlaceholder)}
      </ThemedText>
      <Ionicons
        name="mic-outline"
        size={22}
        color={iconColor}
        style={styles.micIcon}
      />
    </TouchableOpacity>
  );

  const renderCategories = () => {
    const displayCategories = apiCategories;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText type="subtitle">
            {t(STRINGS.common.categories.browseCategories)}
          </ThemedText>
          <TouchableOpacity onPress={() => navigation.navigate("CategoriesTab")}>
            <ThemedText style={[styles.seeAllText, { color: seeAllColor }]}>
              {t(STRINGS.common.seeAll)}
            </ThemedText>
          </TouchableOpacity>
        </View>
        <FlatList
          data={displayCategories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: any }) => (
            <CategoryCard
              name={t(item.name)}
              emoji={item.emoji || "📦"}
              colorName={item.colorName || "gray100"}
              onPress={() =>
                navigation.navigate("ProductListing", { category: item.name })
              }
            />
          )}
        />
      </View>
    );
  };

  const renderListHeader = () => {
    const displayBanners = apiBanners;
    return (
      <View>
        {renderSearch()}
        {displayBanners.length > 0 && (
          <BannerCarousel
            key={`banners-${displayBanners.length}-${displayBanners[0]?.id}`}
            banners={displayBanners as any}
            onBannerPress={handleBannerPress}
          />
        )}
        {apiCategories.length > 0 && renderCategories()}
        <View style={{ marginBottom: 16 }}>
          <QuickFilters
            tags={apiTags}
            selectedTag={selectedTag}
            onSelectTag={(tag) => setSelectedTag(prev => prev === tag ? "" : tag)}
          />
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search" size={40} color={Colors.light.gray300} />
      <ThemedText style={styles.emptyTitle}>
        {t(STRINGS.homeScreen.noProductsFound)}
      </ThemedText>
    </View>
  );

  const renderProductItem = ({ item }: { item: any }) => {
    // Safely parse price and mrp in case they come back as strings or are undefined from the backend
    const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
    const itemMrp = typeof item.mrp === 'number' ? item.mrp : parseFloat(item.mrp || 0);

    return (
      <ProductCard
        id={item.id}
        name={item.name}
        price={`₹${itemPrice.toFixed(2)}`}
        mrp={item.mrp ? `₹${itemMrp.toFixed(2)}` : undefined}
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
        isGrid={true}
        containerStyle={{ width: "48%", marginBottom: 16 }}
      />
    );
  };

  const renderLocationModal = () => (
    <Modal
      visible={locationModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setLocationModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setLocationModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.bottomSheet, { backgroundColor: sheetBg }]}>
              <View style={styles.sheetHeader}>
                <ThemedText style={styles.sheetTitle}>
                  Select Location
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setLocationModalVisible(false)}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={Colors.light.gray400}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={() => setLocationModalVisible(false)}
              >
                <Ionicons name="location" size={24} color={primaryColor} />
                <View style={styles.sheetOptionText}>
                  <ThemedText style={styles.sheetOptionTitle}>
                    {t(STRINGS.locationScreen.currentAddress)}
                  </ThemedText>
                  <ThemedText style={styles.sheetOptionSub} useSecondaryText>
                    {currentAddress}
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <View
                style={[styles.sheetDivider, { backgroundColor: sheetDivider }]}
              />

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={() => {
                  setLocationModalVisible(false);
                  navigation.navigate("Location");
                }}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={Colors.light.gray400}
                />
                <View style={styles.sheetOptionText}>
                  <ThemedText style={styles.sheetOptionTitle}>
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
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderLanguageModal = () => (
    <Modal
      visible={langModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setLangModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setLangModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.bottomSheet, { backgroundColor: sheetBg }]}>
              <View style={styles.sheetHeader}>
                <ThemedText style={styles.sheetTitle}>
                  Select Language
                </ThemedText>
                <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={Colors.light.gray400}
                  />
                </TouchableOpacity>
              </View>

              {[
                { code: "en", label: "English", icon: "A" },
                { code: "hi", label: "हिंदी", icon: "अ" },
                { code: "hinglish", label: "Hinglish", icon: "H" },
                { code: "ml", label: "മലയാളം", icon: "മ" },
              ].map((lang, index) => (
                <View key={lang.code}>
                  <TouchableOpacity
                    style={styles.sheetOption}
                    onPress={() => {
                      setLangModalVisible(false);
                      setTimeout(async () => {
                        const startTime = Date.now();
                        console.log(`[Performance] Starting language switch to ${lang.code}...`);

                        React.startTransition(() => {
                          i18n.changeLanguage(lang.code).then(() => {
                            initDispatch(setLanguage(lang.code));
                            console.log(`[Performance] Language switch completed in ${Date.now() - startTime}ms`);
                          });
                        });
                      }, 300);
                    }}
                  >
                    <View
                      style={[
                        styles.iconButton,
                        {
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: Colors.light.gray100,
                          justifyContent: "center",
                          alignItems: "center",
                        },
                      ]}
                    >
                      <ThemedText
                        style={{
                          color: Colors.light.gray800,
                          fontWeight: "bold",
                        }}
                      >
                        {lang.icon}
                      </ThemedText>
                    </View>
                    <View style={styles.sheetOptionText}>
                      <ThemedText
                        style={[
                          styles.sheetOptionTitle,
                          initLang?.lange === lang.code && {
                            color: primaryColor,
                            fontWeight: "bold",
                          },
                        ]}
                      >
                        {lang.label}
                      </ThemedText>
                    </View>
                    {initLang?.lange === lang.code && (
                      <Ionicons
                        name="checkmark"
                        size={24}
                        color={primaryColor}
                      />
                    )}
                  </TouchableOpacity>
                  {index < 3 && (
                    <View
                      style={[
                        styles.sheetDivider,
                        { backgroundColor: sheetDivider },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={statusBarBg}
      />
      {renderHeader()}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          ListHeaderComponent={renderListHeader()}
          ListEmptyComponent={renderEmptyState()}
          renderItem={renderProductItem}
        />
      )}
      {renderLocationModal()}
      {renderLanguageModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: ThemeDimension.spacing.m,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 10 : 50,
    paddingBottom: 16,
  },
  iconButton: {
    padding: 8,
  },
  locationSelector: {
    flex: 1,
  },
  deliveringTo: {
    fontSize: 12,
    marginBottom: 2,
    fontWeight: "500",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationBoldText: {
    fontSize: 15,
    fontWeight: "bold",
    maxWidth: "85%",
  },
  cartButton: {
    padding: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: Colors.light.red600, // Red
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.light.white,
    zIndex: 1, // Ensure it stays on top of the icon
  },
  badgeText: {
    color: Colors.light.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "bold",
    includeFontPadding: false, // Prevents text from being pushed down on Android
    textAlignVertical: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 25, // Pill shaped search bar
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    color: Colors.light.gray400,
    fontSize: 15,
    flex: 1,
  },
  micIcon: {
    marginLeft: 10,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.light.transparentBlack05,
    justifyContent: "flex-end",
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  sheetOptionText: {
    flex: 1,
    marginLeft: 16,
  },
  sheetOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  sheetOptionSub: {
    fontSize: 13,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
    marginVertical: 4,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.gray200,
    borderRadius: 16,
    borderStyle: "dashed",
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.light.gray400,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: 8,
  },
});
