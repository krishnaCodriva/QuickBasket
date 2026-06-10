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
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../context/localizationContext/localeAction";
import LocalizationContext from "../../context/localizationContext/LocaleContext";
import { useCart } from "../../context/CartContext";
import i18n from "../../localization/i18";
import { homeApi } from "../../services/homeApi";
// Removed mock data as per backend-driven requirement

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

  useEffect(() => {
    (async () => {
      try {
        const res = await homeApi();
        if (res?.data) {
          setTagsData(res.data.tags || []);
          setBannersData(res.data.banners || []);
          setCategoriesData(res.data.categories || []);
          setProductsData(res.data.products || []);
        }
      } catch (error) {
        console.error("Failed to fetch home API data:", error);
      }
    })();
  }, []);

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

  const renderCategories = () => (
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
        data={categoriesData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            name={item.name}
            emoji={item.emoji || "📦"} // Fallback if backend doesn't provide emoji
            colorName={item.colorName || "blue100"}
            onPress={() =>
              navigation.navigate("ProductListing", { categoryId: item.id, category: item.name })
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
        banners={bannersData.map(b => ({
          ...b,
          // Map backend URL to a format the component expects if necessary
          source: { uri: `http://192.168.1.58:5000${b.imageUrl}` } // Ensure full URL is passed
        }))}
        onBannerPress={handleBannerPress}
      />
      {renderCategories()}
      <View style={{ marginBottom: 16 }}>
        <QuickFilters
          tags={tagsData}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search" size={40} color={Colors.light.gray300} />
      <ThemedText style={styles.emptyTitle}>
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
      inStock={item.stockQuantity > 0}
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
    // imageUrl={item.imageUrl ? `http://192.168.1.58:5000${item.imageUrl}` : undefined}
    />
  );

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
