import React, { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform, StatusBar, FlatList, Modal, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText, ThemedView, CustomButton, ProductCard, QuantitySelector, CartHeaderIcon, PriceDisplay, Tag, ScreenHeader } from '../../components';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useCart } from '../../context';
import { MOCK_PRODUCTS } from '../../data/mockData';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../core/types/navigation';
import type { Product } from '../../core/types/domain';
import { spacing, radius, typography, elevation, zIndex } from '../../core/constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const SCREEN_WIDTH = Dimensions.get('window').width;

// --- FALLBACK DUMMY DATA ---

export default function ProductDetailScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const primaryColor = useThemeColor({}, 'primary');
  const imageBgColor = useThemeColor({ light: Colors.light.gray100, dark: Colors.dark.secondaryBackground }, 'secondaryBackground' as any);
  const bottomBarBgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.black }, 'primaryBackground' as any);
  const bottomBarBorderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  
  // Ensure we have a product object — typed via route.params, extended fields from mockData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product: any = route?.params?.product ?? MOCK_PRODUCTS[0];
  
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
    <ScreenHeader
      title=""
      onBack={() => navigation.goBack()}
      rightElement={
        <CartHeaderIcon
          color={iconColor}
          size={28}
          badgeBorderColor={bottomBarBgColor}
        />
      }
      showBorder={false}
      style={{
        position: 'absolute',
        top: Math.max(insets.top, 10),
        left: 0,
        right: 0,
        zIndex: zIndex.elevated,
      }}
    />
  );

  const renderImageGallery = () => (
    <View style={styles.imageCarousel}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9} onPress={() => openZoom(item)}>
            <View style={[styles.imageSlide, { width: SCREEN_WIDTH, backgroundColor: item.color || imageBgColor }]}>
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
        <PriceDisplay
          price={typeof product.price === 'number' ? product.price : parseFloat(product.price)}
          mrp={product.mrp && typeof product.mrp === 'number' ? product.mrp : undefined}
          size="lg"
        />
        <Tag
          label={product.inStock ? t(STRINGS.productDetail.inStock) : t(STRINGS.productDetail.outOfStock)}
          variant="subtle"
          color={product.inStock ? 'success' : 'error'}
          style={{ marginLeft: 8 }}
        />
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
    <View style={[styles.bottomBar, { backgroundColor: bottomBarBgColor, borderTopColor: bottomBarBorderColor, paddingBottom: Math.max(insets.bottom, 16) }]}>
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
  imageCarousel: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.8,
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEmoji: {
    fontSize: 150,
  },
  pagination: {
    position: 'absolute',
    bottom: spacing.mlg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radius.xs,
    marginHorizontal: spacing.xs,
  },
  infoContainer: {
    padding: spacing.md,
  },
  productName: {
    fontSize: typography.size.xxl,
    marginBottom: spacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandLogoContainer: {
    width: 28,
    height: 28,
    borderRadius: radius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  brandLogo: {
    fontSize: typography.size.sm,
  },
  brandText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    marginRight: spacing.smd,
  },
  mrp: {
    fontSize: typography.size.lg,
    textDecorationLine: 'line-through',
    marginRight: spacing.md,
  },
  stockBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  stockText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  weight: {
    fontSize: typography.size.md,
    marginBottom: spacing.lg,
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  specCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.smd,
    borderRadius: radius.md,
    marginBottom: spacing.smd,
  },
  specIcon: {
    marginRight: spacing.smd,
  },
  specKey: {
    fontSize: typography.size.xs,
    marginBottom: spacing.xxs,
  },
  specValue: {
    fontSize: typography.size.smmd,
    fontWeight: typography.weight.semiBold,
  },
  descSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.xl,
    marginBottom: spacing.smd,
  },
  descriptionText: {
    fontSize: typography.size.md,
    lineHeight: 22,
  },
  storeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  storeDetails: {
    marginLeft: spacing.md,
  },
  storeName: {
    fontSize: typography.size.mdlg,
    fontWeight: typography.weight.semiBold,
    marginBottom: spacing.xs,
  },
  storeRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeRating: {
    fontSize: typography.size.smmd,
    marginLeft: spacing.xs,
  },
  relatedSection: {
    marginBottom: spacing.lg,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.md,
    borderTopWidth: 1,
    ...elevation.lg,
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
    borderRadius: radius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  zoomEmoji: {
    fontSize: 150,
  },
  closeZoom: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: Colors.light.transparentBlack05,
    borderRadius: radius.xl,
    padding: spacing.sm,
  }
});
