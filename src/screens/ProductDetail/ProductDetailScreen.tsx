import React, { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform, StatusBar, FlatList, Modal, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ThemedText, ThemedView, CustomButton, ProductCard, QuantitySelector } from '../../components';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useCart } from '../../context';
import { MOCK_PRODUCTS } from '../../data/mockData';
import { useTranslation } from 'react-i18next';

type Props = {
  navigation: any;
  route: any;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

// --- FALLBACK DUMMY DATA ---

export default function ProductDetailScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const primaryColor = useThemeColor({}, 'primary');
  const imageBgColor = useThemeColor({ light: Colors.light.gray100, dark: Colors.dark.secondaryBackground }, 'secondaryBackground' as any);
  const bottomBarBgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.black }, 'primaryBackground' as any);
  const bottomBarBorderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  
  // Ensure we have a product object
  const product = route?.params?.product || MOCK_PRODUCTS[0];
  
  // Dynamic Related Products based on category
  const relatedProducts = MOCK_PRODUCTS.filter(
    p => p.category === product.category && p.id !== product.id
  ).slice(0, 4);
  
  // State
  const { cartItems, addToCart, updateQuantity, totalItems } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<any>(null);

  const images = product.images || [
    { id: '1', emoji: product.emoji || '📦', color: imageBgColor }
  ];

  // --- HANDLERS ---
  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImageIndex(Math.round(index));
  };

  const openZoom = (img: any) => {
    setZoomedImage(img);
    setIsZoomVisible(true);
  };

  const handleBrandPress = () => {
    navigation.navigate('ProductListing', { category: product.brand });
  };

  const handleRelatedProductPress = (relatedProd: any) => {
    navigation.push('ProductDetail', { product: relatedProd });
  };

  // --- RENDER SECTIONS ---
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
        <Feather name="arrow-left" size={24} color={iconColor} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Cart')}>
        <Ionicons name="cart-outline" size={28} color={iconColor} />
        {totalItems > 0 && (
          <View style={[styles.badge, { backgroundColor: Colors.light.red600, borderColor: bottomBarBgColor }]}>
            <ThemedText style={styles.badgeText}>{totalItems}</ThemedText>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderImageGallery = () => (
    <View style={styles.galleryContainer}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9} onPress={() => openZoom(item)}>
            <View style={[styles.imageBox, { width: SCREEN_WIDTH, backgroundColor: item.color || imageBgColor }]}>
              <ThemedText style={styles.imageEmoji}>{item.emoji}</ThemedText>
            </View>
          </TouchableOpacity>
        )}
      />
      {/* Pagination Dots */}
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_: any, index: number) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                { backgroundColor: index === activeImageIndex ? primaryColor : Colors.light.gray400 }
              ]} 
            />
          ))}
        </View>
      )}
    </View>
  );

  const renderProductInfo = () => (
    <View style={styles.infoContainer}>
      {/* Title & Brand */}
      <ThemedText type="title" style={styles.productName}>{product.name}</ThemedText>
      <TouchableOpacity onPress={handleBrandPress} style={styles.brandRow}>
        <View style={[styles.brandLogoContainer, { backgroundColor: imageBgColor }]}>
          <ThemedText style={styles.brandLogo}>{product.brandLogo || '🏢'}</ThemedText>
        </View>
        <ThemedText style={styles.brandText} useSecondaryText>
          {product.brand || 'QuickBasket'} • {t(STRINGS.productDetail.premiumQuality)}
        </ThemedText>
      </TouchableOpacity>

      {/* Pricing & Stock */}
      <View style={styles.priceRow}>
        <ThemedText style={[styles.price, { color: primaryColor }]}>
          {typeof product.price === 'number' ? `₹${product.price.toFixed(2)}` : product.price}
        </ThemedText>
        {product.mrp && (
          <ThemedText style={styles.mrp} useSecondaryText>
            {typeof product.mrp === 'number' ? `₹${product.mrp.toFixed(2)}` : product.mrp}
          </ThemedText>
        )}
        <View style={[styles.stockBadge, { backgroundColor: product.inStock ? Colors.light.transparentGreen015 : Colors.light.transparentRed015 }]}>
          <ThemedText style={[styles.stockText, { color: product.inStock ? Colors.light.success : Colors.light.error }]}>
            {product.inStock ? t(STRINGS.productDetail.inStock) : t(STRINGS.productDetail.outOfStock)}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={styles.weight} useSecondaryText>{product.weight}</ThemedText>

      {/* Specifications */}
      {product.specifications && (
        <View style={styles.specsContainer}>
          {Object.entries(product.specifications).map(([key, value]) => (
            <View key={key} style={[styles.specCard, { backgroundColor: imageBgColor }]}>
              <View style={styles.specIcon}>
                <Feather name="info" size={18} color={primaryColor} />
              </View>
              <View>
                <ThemedText style={styles.specKey} useSecondaryText>{key}</ThemedText>
                <ThemedText style={styles.specValue}>{value as string}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Description */}
      {product.description && (
        <View style={styles.descSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t(STRINGS.productDetail.detailsTitle)}</ThemedText>
          <ThemedText style={styles.descriptionText} useSecondaryText>{product.description}</ThemedText>
        </View>
      )}

      {/* Store Info */}
      {product.store && (
        <View style={[styles.storeSection, { backgroundColor: imageBgColor }]}>
          <Feather name="shopping-bag" size={24} color={primaryColor} />
          <View style={styles.storeDetails}>
            <ThemedText style={styles.storeName}>{t(STRINGS.productDetail.soldBy)}{product.store.name}</ThemedText>
            <View style={styles.storeRatingRow}>
              <Ionicons name="star" size={14} color={Colors.light.yellow900} />
              <ThemedText style={styles.storeRating} useSecondaryText>{product.store.rating}</ThemedText>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderRelatedProducts = () => (
    <View style={styles.relatedSection}>
      <ThemedText type="subtitle" style={[styles.sectionTitle, { marginLeft: 16 }]}>{t(STRINGS.productDetail.frequentlyBought)}</ThemedText>
      <FlatList
        data={relatedProducts}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const itemQuantity = cartItems.find(i => i.id === item.id)?.quantity || 0;
          return (
            <ProductCard
              id={item.id}
              name={item.name}
              price={`₹${item.price.toFixed(2)}`}
              category={item.category}
              weight={item.weight}
              emoji={item.emoji}
              inStock={item.inStock}
              quantity={itemQuantity}
              onAdd={() => {
                if (itemQuantity === 0) addToCart(item, 1);
                else updateQuantity(item.id, 1);
              }}
              onRemove={() => updateQuantity(item.id, -1)}
              onPress={() => handleRelatedProductPress(item)}
              isGrid={true}
              containerStyle={{ width: 160, marginRight: 16 }}
            />
          );
        }}
      />
    </View>
  );

  const cartItem = cartItems.find(item => item.id === product.id);
  const cartQuantity = cartItem?.quantity || 0;

  const handleUpdateCart = (delta: number) => {
    if (delta > 0) {
      if (cartItem) {
        updateQuantity(product.id, delta);
      } else {
        addToCart(product, delta);
      }
    } else {
      updateQuantity(product.id, delta);
    }
  };

  const renderBottomBar = () => (
    <View style={[styles.bottomBar, { backgroundColor: bottomBarBgColor, borderTopColor: bottomBarBorderColor }]}>
      {cartQuantity === 0 ? (
        <CustomButton 
          title={t(STRINGS.productDetail.addToCart)} 
          type="primary" 
          onPress={() => handleUpdateCart(1)} 
          style={{ width: '100%', marginBottom: 0 }} 
          disabled={product.inStock === false}
        />
      ) : (
        <View style={styles.quantityControl}>
          <QuantitySelector 
            quantity={cartQuantity}
            onDecrease={() => handleUpdateCart(-1)}
            onIncrease={() => handleUpdateCart(1)}
            disabled={product.inStock === false}
            size="large"
          />
        </View>
      )}
    </View>
  );

  const renderZoomModal = () => (
    <Modal visible={isZoomVisible} transparent={true} animationType="fade" onRequestClose={() => setIsZoomVisible(false)}>
      <TouchableWithoutFeedback onPress={() => setIsZoomVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.zoomBox, { backgroundColor: zoomedImage?.color || Colors.light.black }]}>
              <ThemedText style={styles.zoomEmoji}>{zoomedImage?.emoji}</ThemedText>
              <TouchableOpacity style={styles.closeZoom} onPress={() => setIsZoomVisible(false)}>
                <Feather name="x" size={28} color={Colors.light.white} />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {renderImageGallery()}
        {renderProductInfo()}
        {renderRelatedProducts()}
      </ScrollView>
      {renderBottomBar()}
      {renderZoomModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Make room for bottom bar
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight : 45,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.transparentWhite02,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.light.white,
  },
  badgeText: {
    color: Colors.light.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  galleryContainer: {
    position: 'relative',
    height: 380,
  },
  imageBox: {
    height: 380,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEmoji: {
    fontSize: 150,
  },
  pagination: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  infoContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 26,
    marginBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandLogoContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandLogo: {
    fontSize: 14,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 10,
  },
  mrp: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    marginRight: 16,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  weight: {
    fontSize: 14,
    marginBottom: 24,
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  specCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  specIcon: {
    marginRight: 10,
  },
  specKey: {
    fontSize: 11,
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  descSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  storeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  storeDetails: {
    marginLeft: 16,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeRating: {
    fontSize: 13,
    marginLeft: 4,
  },
  relatedSection: {
    marginBottom: 24,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    elevation: 10,
  },
  quantityControl: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.light.transparentBlack09,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomBox: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH - 32,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  zoomEmoji: {
    fontSize: 150,
  },
  closeZoom: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.light.transparentBlack05,
    borderRadius: 20,
    padding: 8,
  }
});
