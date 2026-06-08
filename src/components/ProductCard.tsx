import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors, STRINGS } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks';
import { useTranslation } from 'react-i18next';

type Props = {
  id: string;
  name: string;
  price: string;
  mrp?: string;
  category: string;
  weight: string;
  emoji: string;
  quantity: number;
  inStock?: boolean;
  isGrid?: boolean;
  containerStyle?: any;
  onAdd: () => void;
  onRemove: () => void;
  onPress?: () => void;
};

export default function ProductCard({ name, price, mrp, category, weight, emoji, quantity, inStock = true, isGrid = false, containerStyle, onAdd, onRemove, onPress }: Props) {
  const { t } = useTranslation();
  const bg = useThemeColor({ light: Colors.light.gray100, dark: Colors.dark.primaryBackground }, "primaryBackground" as any);
  const hearColor = useThemeColor({}, "heart")
  const cardBg = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'primaryBackground' as any);
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const imageBg = useThemeColor({ light: Colors.light.gray100, dark: Colors.dark.gray300 }, 'gray100' as any);
  const categoryColor = useThemeColor({ light: Colors.dark.gray400, dark: Colors.light.gray400 }, 'secondaryText' as any);
  const nameColor = useThemeColor({ light: Colors.light.gray900, dark: Colors.light.gray100 }, 'primaryText' as any);
  const priceColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const mrpColor = useThemeColor({ light: Colors.light.gray400, dark: Colors.dark.gray400 }, 'secondaryText' as any);
  const actionBtnBg = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const actionBtnIcon = useThemeColor({ light: Colors.light.white, dark: Colors.light.black }, 'primaryBackground' as any);
  const disabledBtnBg = useThemeColor({ light: Colors.light.gray300, dark: Colors.dark.gray700 }, 'gray300' as any);
  const outOfStockBg = useThemeColor({ light: Colors.light.transparentWhite06, dark: Colors.dark.transparentBlack05 }, 'primaryBackground' as any);
  const outOfStockBadgeBg = useThemeColor({ light: Colors.light.red600, dark: Colors.dark.error }, 'error' as any);
  const outOfStockBadgeText = useThemeColor({ light: Colors.light.white, dark: Colors.light.white }, 'white' as any);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, isGrid && styles.gridCard, containerStyle, { backgroundColor: cardBg, borderColor: borderColor }]}>

      <View style={[styles.imageContainer, isGrid && styles.gridImageContainer, { backgroundColor: isGrid ? imageBg : bg }]}>
        <TouchableOpacity style={[styles.heartButton, isGrid && styles.gridHeartButton]}>
          <Ionicons name="heart-outline" size={isGrid ? 20 : 24} color={hearColor} />
        </TouchableOpacity>
        <ThemedText style={[styles.emoji, isGrid && styles.gridEmoji]}>{emoji}</ThemedText>
        {!inStock && (
          <View style={[styles.outOfStockOverlay, { backgroundColor: outOfStockBg }]}>
            <ThemedText style={[styles.outOfStockText, { backgroundColor: outOfStockBadgeBg, color: outOfStockBadgeText }]}>
              {t(STRINGS.productListing.outOfStock)}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={[styles.infoContainer, isGrid && styles.gridInfoContainer]}>
        <ThemedText style={[styles.categoryLabel, isGrid && styles.gridCategoryLabel, { color: categoryColor }]}>{t(category)}</ThemedText>
        <ThemedText style={[styles.name, isGrid && styles.gridName, { color: nameColor }]} numberOfLines={2}>{name}</ThemedText>
        <ThemedText useSecondaryText style={[styles.weight, isGrid && styles.gridWeight]}>{weight}</ThemedText>

        <View style={[styles.priceRow, isGrid && styles.gridPriceRow]}>
          <ThemedText style={[styles.price, isGrid && styles.gridPrice, { color: priceColor }]}>{price}</ThemedText>
        </View>

        {mrp && (
          <View style={styles.mrpRow}>
            <ThemedText style={[styles.mrp, { color: mrpColor }]}>{mrp}</ThemedText>
          </View>
        )}

        <View style={styles.bottomRow}>
          {quantity > 0 ? (
            <View style={[styles.quantityControl, { backgroundColor: actionBtnBg }, isGrid && styles.gridQuantityControl]}>
              <TouchableOpacity onPress={() => inStock && onRemove()} style={styles.qtyBtn}>
                <Ionicons name="remove" size={isGrid ? 14 : 16} color={actionBtnIcon} />
              </TouchableOpacity>
              <ThemedText style={[styles.qtyText, { color: actionBtnIcon }, isGrid && styles.gridQtyText]}>{quantity}</ThemedText>
              <TouchableOpacity onPress={() => inStock && onAdd()} style={styles.qtyBtn}>
                <Ionicons name="add" size={isGrid ? 14 : 16} color={actionBtnIcon} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: actionBtnBg, shadowColor: actionBtnBg }, isGrid && styles.gridAddButton, !inStock && { backgroundColor: disabledBtnBg, shadowOpacity: 0 }]}
              onPress={() => inStock && onAdd()}
              disabled={!inStock}
            >
              <Ionicons name="add" size={isGrid ? 18 : 20} color={actionBtnIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 170, // Slightly wider to match Figma proportions
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 16,
    overflow: 'hidden', // Ensures the image container respects the border radius
  },
  imageContainer: {
    height: 120,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  emoji: {
    fontSize: 64,
  },
  infoContainer: {
    padding: 12,
    flex: 1,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    minHeight: 40,
    lineHeight: 20,
  },
  weight: {
    fontSize: 13,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  price: {
    fontSize: 18,
    fontWeight: '900', // Extra bold price
  },
  addButton: {
    width: 36, // Large circular button
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18, // Match Add button height
    height: 36,
    paddingHorizontal: 8,
    minWidth: 80,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  gridCard: {
    width: 'auto',
    marginRight: 0,
    marginBottom: 16,
  },
  gridImageContainer: {
    height: 110,
  },
  gridHeartButton: {
    top: 8,
    right: 8,
  },
  gridEmoji: {
    fontSize: 54,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  gridInfoContainer: {
    padding: 12,
  },
  gridCategoryLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  gridName: {
    fontSize: 14,
    minHeight: 36,
  },
  gridWeight: {
    fontSize: 12,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridPriceRow: {
    marginBottom: 0,
  },
  gridPrice: {
    fontSize: 16,
  },
  mrpRow: {
    marginBottom: 8,
  },
  mrp: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  gridQuantityControl: {
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 6,
    minWidth: 70,
  },
  gridQtyText: {
    fontSize: 13,
  },
  gridAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  }
});
