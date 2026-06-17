import React, { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform, StatusBar, FlatList, Modal, Dimensions, TouchableWithoutFeedback, Image, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText, ThemedView, CustomButton, ProductCard, QuantitySelector, CartHeaderIcon, PriceDisplay, Tag, ScreenHeader } from '../../components';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor, useProductDetail } from '../../hooks';
import { useCart } from '../../context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../core/types/navigation';
import type { Product } from '../../core/types/domain';
import { spacing, radius, typography, elevation, zIndex } from '../../core/constants/theme';
import { formatImageUrl } from '../../config/api.config';

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
  
  // Optimistic UI: Ensure we have a product object passed from previous screen
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialProduct: any = route?.params?.product ?? null;
  const productId = initialProduct?.id || route?.params?.productId;

  // Fetch full details
  const { product: fullProduct, isLoading } = useProductDetail(productId);

  // Merge full data with initial data
  const product = fullProduct || initialProduct;
  
  // Dynamic Related Products from API
  const relatedProducts = product?.relatedProducts || [];

  // State
  const { cartItems, addToCart, updateQuantity, totalItems } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<any>(null);

  // Construct images array for carousel
  const parsedImages = (() => {
    let imgs = product?.gallery || product?.images;
    if (typeof imgs === 'string') {
      try { imgs = JSON.parse(imgs); } catch (e) { imgs = []; }
    }
    return Array.isArray(imgs) ? imgs : [];
  })();

  // Combine main imageUrl and gallery images
  const allUris = new Set<string>();
  const images: any[] = [];
  let imageCounter = 0;

  // 1. Always add the main imageUrl first
  if (product?.imageUrl) {
    allUris.add(product.imageUrl);
    images.push({
      id: String(imageCounter++),
      uri: formatImageUrl(product.imageUrl),
      color: imageBgColor
    });
  }

  // 2. Add any extra gallery images
  parsedImages.forEach((uri: string) => {
    if (uri && !allUris.has(uri)) {
      allUris.add(uri);
      images.push({
        id: String(imageCounter++),
        uri: formatImageUrl(uri),
        color: imageBgColor
      });
    }
  });

  // 3. Fallback to emoji if no images exist
  if (images.length === 0) {
    images.push({
      id: 'fallback',
      emoji: product?.emoji || '📦',
      color: imageBgColor
    });
  }

  if (!product) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bottomBarBgColor }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </ThemedView>
    );
  }

  const normalizedTags = (() => {
    const t = product?.tags;
    if (!t) return [];
    if (Array.isArray(t)) return t;
    if (typeof t === 'string') return t.split(',').map(s => { const str = s.trim(); return { id: str, name: str } });
    if (typeof t === 'object') return Object.values(t);
    return [];
  })();

  const isOutOfStock = product?.inStock === false || (product?.stockQuantity !== undefined && Number(product?.stockQuantity) <= 0);

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
    <View style={{ paddingTop: insets.top, backgroundColor: bottomBarBgColor }}>
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
      />
    </View>
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
              {item.uri ? (
                <Image source={{ uri: item.uri }} style={{ width: '80%', height: '80%' }} resizeMode="contain" />
              ) : (
                <ThemedText style={styles.imageEmoji}>{item.emoji}</ThemedText>
              )}
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

  const renderProductInfo = () => {
    const priceNum = typeof product.price === 'number' ? product.price : parseFloat(product.price || '0');
    const mrpNum = product.compareAtPrice ? parseFloat(product.compareAtPrice) : (product.mrp ? parseFloat(product.mrp) : undefined);
    const discount = mrpNum && mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;
    const storeObj = product.Store || product.store;

    return (
      <View style={styles.infoContainer}>
        {/* Brand & Title */}
        {!!product.brand && (
          <TouchableOpacity onPress={handleBrandPress} style={[styles.brandRow, { marginBottom: 4 }]}>
            {product.brandLogoUrl && (
              <View style={[styles.brandLogoContainer, { backgroundColor: imageBgColor, width: 20, height: 20, marginRight: 6 }]}>
                <Image source={{ uri: product.brandLogoUrl }} style={{ width: 16, height: 16 }} resizeMode="contain" />
              </View>
            )}
            <ThemedText style={[styles.brandText, { fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 1 }]} useSecondaryText>
              {product.brand}
            </ThemedText>
          </TouchableOpacity>
        )}
        <ThemedText type="title" style={styles.productName}>{product.name}</ThemedText>

        {/* Pricing Block */}
        <View style={[styles.priceRow, { alignItems: 'flex-end', marginBottom: 12 }]}>
          <PriceDisplay
            price={priceNum}
            mrp={mrpNum}
            size="lg"
          />
          {discount > 0 && (
            <View style={{ backgroundColor: Colors.light.green100, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.xs, marginLeft: 8, marginBottom: 4 }}>
              <ThemedText style={{ color: Colors.light.green800, fontSize: typography.size.xs, fontWeight: 'bold' }}>
                {discount}% OFF
              </ThemedText>
            </View>
          )}
        </View>

        {/* Trust Badges & Quick Info */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          <Tag
            label={isOutOfStock ? t(STRINGS.productDetail.outOfStock) : t(STRINGS.productDetail.inStock)}
            variant="subtle"
            color={isOutOfStock ? 'error' : 'success'}
          />
          {!!product.weight && (
             <Tag label={product.weight} variant="outline" color="secondary" />
          )}
          {normalizedTags.length > 0 && normalizedTags.map((tag: any) => (
            <Tag key={tag.id || tag} label={tag.name || tag} variant="outline" color="primary" />
          ))}
        </View>

        {/* Description */}
        {!!product.description && (
          <View style={styles.descSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>{t(STRINGS.productDetail.detailsTitle)}</ThemedText>
            <ThemedText style={styles.descriptionText} useSecondaryText>{product.description}</ThemedText>
          </View>
        )}

        {/* Store Info */}
        {!!storeObj && (
          <View style={[styles.storeSection, { backgroundColor: imageBgColor }]}>
            <Feather name="shopping-bag" size={24} color={primaryColor} />
            <View style={styles.storeDetails}>
              <ThemedText style={styles.storeName}>{t(STRINGS.productDetail.soldBy)}{storeObj.name}</ThemedText>
              {!!storeObj.rating && (
                <View style={styles.storeRatingRow}>
                  <Ionicons name="star" size={14} color={Colors.light.yellow900} />
                  <ThemedText style={styles.storeRating} useSecondaryText>{storeObj.rating}</ThemedText>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

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
              price={typeof item.price === 'number' ? `₹${item.price.toFixed(2)}` : `₹${parseFloat(item.price || '0').toFixed(2)}`}
              category={item.Category?.name || item.category || ''}
              weight={item.weight || ''}
              emoji={item.emoji || '📦'}
              imageUrl={item.imageUrl}
              brand={item.brand}
              tags={item.tags}
              inStock={item.inStock ?? true}
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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {/* Left Side: Add to Cart / Quantity */}
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          {cartQuantity === 0 ? (
            <CustomButton 
              title={t(STRINGS.productDetail.addToCart)} 
              type="primary" 
              onPress={() => handleUpdateCart(1)} 
              style={{ width: '100%', marginBottom: 0 }} 
              disabled={isOutOfStock}
            />
          ) : (
            <QuantitySelector 
              quantity={cartQuantity}
              onDecrease={() => handleUpdateCart(-1)}
              onIncrease={() => handleUpdateCart(1)}
              disabled={isOutOfStock}
              size="large"
            />
          )}
        </View>

        {/* Right Side: View Cart Icon */}
        <View style={styles.bottomCartBtn}>
          <CartHeaderIcon color={iconColor} size={28} badgeBorderColor={bottomBarBgColor} />
        </View>
      </View>
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
      <StatusBar barStyle={bottomBarBgColor === Colors.dark.black ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
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
  bottomCartBtn: {
    height: 48,
    width: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.light.red600,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.white,
    zIndex: 10,
  },
  bottomCartBadgeText: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: 'bold',
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
