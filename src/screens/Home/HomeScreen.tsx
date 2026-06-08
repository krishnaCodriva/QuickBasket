
import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, useColorScheme, Platform, StatusBar, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '../../hooks';
import { ThemedView, ThemedText, ProductCard } from '../../components';
import { BannerCarousel, CategoryCard, QuickFilters } from '../../components/Home';
import { ThemeDimension, Colors, STRINGS } from '../../constants';
import { MOCK_PRODUCTS } from '../../data/mockData';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../context/localizationContext/localeAction';
import LocalizationContext from '../../context/localizationContext/LocaleContext';
import { useCart } from '../../context/CartContext';
import i18n from "../../localization/i18"
// Mock Data
const CATEGORIES = [
  { id: '1', name: STRINGS.common.categories.fruits, emoji: '🍎', colorName: 'red100' as const },
  { id: '2', name: STRINGS.common.categories.veg, emoji: '🥕', colorName: 'green100' as const },
  { id: '3', name: STRINGS.common.categories.dairy, emoji: '🥛', colorName: 'blue100' as const },
  { id: '4', name: STRINGS.common.categories.bakery, emoji: '🍞', colorName: 'orange100' as const },
  { id: '5', name: STRINGS.common.categories.meat, emoji: '🥩', colorName: 'pink100' as const },
  { id: '6', name: STRINGS.common.categories.snacks, emoji: '🍿', colorName: 'yellow100' as const },
  { id: '7', name: STRINGS.common.categories.drinks, emoji: '🥤', colorName: 'indigo100' as const },
  { id: '8', name: STRINGS.common.categories.frozen, emoji: '🧊', colorName: 'cyan100' as const },
];


const HOME_BANNERS = [
  { id: '1', source: require('../../../assets/Section - Hero Carousel (Bento Style).png'), linkType: 'category', linkTarget: STRINGS.common.categories.fruits },
  { id: '2', source: require('../../../assets/Section - Hero Carousel (Bento Style).png'), linkType: 'offer', linkTarget: 'Discount' },
  { id: '3', source: require('../../../assets/Section - Hero Carousel (Bento Style).png'), linkType: 'product', linkTarget: '1' },
];

type Props = {
  navigation: any;
};

export default function HomeScreen({ navigation }: Props) {
  const [initLang, initDispatch] = useContext(LocalizationContext);
  const { t } = useTranslation();
  console.log("initLang 1234", initLang?.lange)
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const searchBg = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground' as any);
  const searchBorder = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const seeAllColor = useThemeColor({ light: Colors.light.gray900, dark: Colors.light.blue100 }, 'primaryText' as any);
  const sheetBg = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground' as any);
  const sheetDivider = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const primaryColor = useThemeColor({}, 'primary');
  const statusBarBg = useThemeColor({ light: Colors.light.white, dark: Colors.dark.black }, 'primaryBackground' as any);

  const { cartItems, addToCart, updateQuantity, totalItems } = useCart();
  const [selectedTag, setSelectedTag] = useState(STRINGS.homeScreen.tags.all);

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

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    if (selectedTag === STRINGS.homeScreen.tags.all) return true;
    return p.tags?.includes(selectedTag);
  });

  const getProductQuantity = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleBannerPress = (banner: any) => {
    if (banner.linkType === 'category' || banner.linkType === 'offer') {
      navigation.navigate('ProductListing', {
        category: banner.linkType === 'category' ? banner.linkTarget : 'Special Offers',
        query: banner.linkType === 'offer' ? banner.linkTarget : undefined
      });
    } else if (banner.linkType === 'product') {
      const product = MOCK_PRODUCTS.find(p => p.id === banner.linkTarget) || MOCK_PRODUCTS[0];
      navigation.navigate('ProductDetail', { product });
    }
  };

  const [currentAddress, setCurrentAddress] = useState('Select Location');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const stored = await AsyncStorage.getItem('@user_location');
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

    const unsubscribe = navigation.addListener('focus', () => {
      fetchLocation();
    });
    return unsubscribe;
  }, [navigation]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.locationSelector} onPress={() => setLocationModalVisible(true)}>
        <ThemedText style={styles.deliveringTo} useSecondaryText>{t(STRINGS.homeScreen.deliveringTo)}</ThemedText>
        <View style={styles.locationRow}>
          <ThemedText style={styles.locationBoldText} numberOfLines={1}>
            📍 {currentAddress}
          </ThemedText>
          <Ionicons name="chevron-down" size={16} color={iconColor} style={{ marginLeft: 4 }} />
        </View>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setLangModalVisible(true)}>
          <Ionicons name="language-outline" size={24} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
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
      style={[styles.searchBar, { backgroundColor: searchBg, borderColor: searchBorder, borderWidth: 1 }]}
      onPress={() => navigation.navigate('ProductListing')}
    >
      <Ionicons name="search-outline" size={22} color={Colors.light.gray400} style={styles.searchIcon} />
      <ThemedText style={styles.searchPlaceholder}>{t(STRINGS.homeScreen.searchPlaceholder)}</ThemedText>
      <Ionicons name="mic-outline" size={22} color={iconColor} style={styles.micIcon} />
    </TouchableOpacity>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <ThemedText type="subtitle">{t(STRINGS.common.categories.browseCategories)}</ThemedText>
        <TouchableOpacity onPress={() => navigation.navigate('CategoriesTab')}>
          <ThemedText style={[styles.seeAllText, { color: seeAllColor }]}>{t(STRINGS.common.seeAll)}</ThemedText>
        </TouchableOpacity>
      </View>
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            name={t(item.name)}
            emoji={item.emoji}
            colorName={item.colorName}
            onPress={() => navigation.navigate('ProductListing', { category: item.name })}
          />
        )}
      />
    </View>
  );

  const renderFilteredProducts = () => (
    <View style={styles.section}>
      <QuickFilters
        tags={tagsList}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
      />
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
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
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={40} color={Colors.light.gray300} />
          <ThemedText style={styles.emptyTitle}>{t(STRINGS.homeScreen.noProductsFound)}</ThemedText>
        </View>
      )}
    </View>
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
                <ThemedText style={styles.sheetTitle}>Select Location</ThemedText>
                <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.light.gray400} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.sheetOption} onPress={() => setLocationModalVisible(false)}>
                <Ionicons name="location" size={24} color={primaryColor} />
                <View style={styles.sheetOptionText}>
                  <ThemedText style={styles.sheetOptionTitle}>{t(STRINGS.locationScreen.currentAddress)}</ThemedText>
                  <ThemedText style={styles.sheetOptionSub} useSecondaryText>{currentAddress}</ThemedText>
                </View>
              </TouchableOpacity>

              <View style={[styles.sheetDivider, { backgroundColor: sheetDivider }]} />

              <TouchableOpacity style={styles.sheetOption} onPress={() => { setLocationModalVisible(false); navigation.navigate('Location'); }}>
                <Ionicons name="add-circle-outline" size={24} color={Colors.light.gray400} />
                <View style={styles.sheetOptionText}>
                  <ThemedText style={styles.sheetOptionTitle}>{t(STRINGS.locationScreen.searchNewLocation)}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.light.gray400} />
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
                <ThemedText style={styles.sheetTitle}>Select Language</ThemedText>
                <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.light.gray400} />
                </TouchableOpacity>
              </View>

              {[
                { code: 'en', label: 'English', icon: 'A' },
                { code: 'hi', label: 'हिंदी', icon: 'अ' },
                { code: 'hinglish', label: 'Hinglish', icon: 'H' },
                { code: 'ml', label: 'മലയാളം', icon: 'മ' }
              ].map((lang, index) => (
                <View key={lang.code}>
                  <TouchableOpacity
                    style={styles.sheetOption}
                    onPress={() => {
                      i18n.changeLanguage(lang.code);
                      initDispatch(setLanguage(lang.code));
                      setLangModalVisible(false);
                    }}
                  >
                    <View style={[styles.iconButton, { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.light.gray100, justifyContent: 'center', alignItems: 'center' }]}>
                      <ThemedText style={{ color: Colors.light.gray800, fontWeight: 'bold' }}>{lang.icon}</ThemedText>
                    </View>
                    <View style={styles.sheetOptionText}>
                      <ThemedText style={[styles.sheetOptionTitle, initLang?.lange === lang.code && { color: primaryColor, fontWeight: 'bold' }]}>
                        {lang.label}
                      </ThemedText>
                    </View>
                    {initLang?.lange === lang.code && <Ionicons name="checkmark" size={24} color={primaryColor} />}
                  </TouchableOpacity>
                  {index < 3 && <View style={[styles.sheetDivider, { backgroundColor: sheetDivider }]} />}
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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={statusBarBg} />
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {renderSearch()}
        <BannerCarousel banners={HOME_BANNERS as any} onBannerPress={handleBannerPress} />
        {renderCategories()}
        {renderFilteredProducts()}
      </ScrollView>
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
    paddingHorizontal: ThemeDimension.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 50,
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
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationBoldText: {
    fontSize: 15,
    fontWeight: 'bold',
    maxWidth: '85%',
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.light.red600, // Red
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.white,
    zIndex: 1, // Ensure it stays on top of the icon
  },
  badgeText: {
    color: Colors.light.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: 'bold',
    includeFontPadding: false, // Prevents text from being pushed down on Android
    textAlignVertical: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.light.transparentBlack05,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sheetOptionText: {
    flex: 1,
    marginLeft: 16,
  },
  sheetOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sheetOptionSub: {
    fontSize: 13,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginVertical: 4,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.gray200,
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.gray400,
  }
});
