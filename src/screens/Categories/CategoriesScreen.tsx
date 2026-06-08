import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemedView, ThemedText, ImageCategoryCard } from '../../components';
import { Colors, ThemeDimension, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');

// Data using generic high-quality placeholders for now.
// Real app would fetch these from an API.
const CATEGORY_DATA = [
  { id: '1', name: STRINGS.common.categories.fruits, itemCount: 124, deliveryTime: STRINGS.common.categories.deliveryIn, imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop', span: 'full' as const, iconName: 'fruit-cherries' as const },
  { id: '2', name: STRINGS.common.categories.veg, itemCount: 89, imageUrl: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=800&auto=format&fit=crop', span: 'half' as const },
  { id: '3', name: STRINGS.common.categories.dairy, itemCount: 45, imageUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=800&auto=format&fit=crop', span: 'half' as const },
  { id: '4', name: STRINGS.common.categories.bakery, itemCount: 32, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop', span: 'half' as const },
  { id: '5', name: STRINGS.common.categories.drinks, itemCount: 112, imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop', span: 'full' as const, iconName: 'cup-outline' as const },
  { id: '6', name: STRINGS.common.categories.snacks, itemCount: 240, imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=800&auto=format&fit=crop', span: 'half' as const },
  { id: '7', name: STRINGS.common.categories.meat, itemCount: 67, imageUrl: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=800&auto=format&fit=crop', span: 'half' as const },
];

export default function CategoriesScreen() {
  const navigation = useNavigation<any>();
  const { totalItems } = useCart();
  const { t } = useTranslation();

  const bgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.primaryBackground }, 'primaryBackground' as any);
  const textColor = useThemeColor({}, 'primaryText');
  const searchBg = useThemeColor({ light: Colors.light.gray100, dark: 'rgba(255,255,255,0.1)' }, 'gray100' as any);
  const iconColor = useThemeColor({}, 'iconColor' as any);
  const primaryColor = useThemeColor({}, 'primary');
  
  // Arrange items into rows. Full span gets its own row. Half spans pair up.
  const rows: any[][] = [];
  let currentRow: any[] = [];

  CATEGORY_DATA.forEach((item) => {
    if (item.span === 'full') {
      if (currentRow.length > 0) {
        rows.push([...currentRow]);
        currentRow = [];
      }
      rows.push([item]);
    } else {
      currentRow.push(item);
      if (currentRow.length === 2) {
        rows.push([...currentRow]);
        currentRow = [];
      }
    }
  });
  if (currentRow.length > 0) {
    rows.push([...currentRow]);
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <Ionicons name="location-outline" size={24} color={iconColor} />
        <ThemedText style={styles.headerTitle}>{t(STRINGS.common.appName)}</ThemedText>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={28} color={iconColor} />
          {totalItems > 0 && (
            <View style={[styles.badge, { backgroundColor: primaryColor }]}>
              <ThemedText style={styles.badgeText}>{totalItems}</ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Search Bar */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: searchBg }]}
          onPress={() => navigation.navigate('ProductListing')}
        >
          <Ionicons name="search-outline" size={20} color={Colors.light.gray400} style={styles.searchIcon} />
          <ThemedText style={styles.searchPlaceholder}>{t(STRINGS.homeScreen.searchPlaceholder)}</ThemedText>
          <View style={[styles.searchArrow, { backgroundColor: primaryColor }]}>
            <Ionicons name="arrow-forward" size={16} color={Colors.light.white} />
          </View>
        </TouchableOpacity>

        {/* Section Title */}
        <View style={styles.sectionTitleRow}>
          <ThemedText style={styles.sectionTitle}>{t(STRINGS.common.categories.browseCategories)}</ThemedText>
          <ThemedText style={styles.sectionSubtitle} useSecondaryText>{t(STRINGS.common.categories.allDepartments)}</ThemedText>
        </View>

        {/* Mixed Grid Layout */}
        <View style={styles.grid}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item, colIndex) => (
                <ImageCategoryCard
                  key={item.id}
                  name={t(item.name)}
                  itemCount={item.itemCount}
                  deliveryTime={item.deliveryTime ? t(item.deliveryTime) : undefined}
                  imageUrl={item.imageUrl}
                  iconName={item.iconName}
                  span={item.span}
                  onPress={() => navigation.navigate('ProductListing', { category: item.name })}
                />
              ))}
            </View>
          ))}
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  cartBtn: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.white,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: ThemeDimension.borderRadius.l,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    color: Colors.light.gray400,
    fontSize: 14,
    flex: 1,
  },
  searchArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 12,
  },
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
