import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';
import QuantitySelector from '../QuantitySelector';
import { Colors, STRINGS } from '../../constants';
import { spacing, radius, typography, elevation } from '../../core/constants/theme';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from '../../hooks';
import type { CartItem } from '../../core/types/domain';
import { formatImageUrl } from '../../config/api.config';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DELETE_BTN_WIDTH = 80;

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemove?: (id: string) => void;
  readOnly?: boolean;
}

export default function CartItemCard({ item, onUpdateQuantity, onRemove, readOnly = false }: CartItemCardProps) {
  const { t } = useTranslation();
  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const primaryColor = useThemeColor({}, 'primary');
  const separatorColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const dangerColor = useThemeColor({ light: Colors.light.red600, dark: Colors.dark.red600 }, 'red600' as any);
  const imageBgColor = useThemeColor({ light: Colors.light.gray100, dark: Colors.dark.secondaryBackground }, 'gray100' as any);

  return (
    <View style={styles.cartItemWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
        bounces={false}
        scrollEnabled={!readOnly}
      >
        <View style={[styles.card, { width: SCREEN_WIDTH, backgroundColor: cardColor, borderBottomColor: separatorColor }]}>
          <View style={[styles.imageContainer, { backgroundColor: imageBgColor }]}>
            {item.imageUrl ? (
              <Image
                source={{ uri: formatImageUrl(item.imageUrl) }}
                style={{ width: '80%', height: '80%' }}
                resizeMode="contain"
              />
            ) : (
              <ThemedText style={styles.itemEmoji}>{item.emoji}</ThemedText>
            )}
          </View>

          <View style={styles.itemDetails}>
            <ThemedText style={styles.itemName} numberOfLines={2}>{item.name}</ThemedText>
            <ThemedText style={[styles.itemPrice, { color: primaryColor }]}>₹{Number(item.price || 0).toFixed(2)}</ThemedText>
            {item.inStock ? (
              <ThemedText style={styles.itemSubtotal} useSecondaryText>{t(STRINGS.cartScreen.itemSubtotal)}: ₹{(Number(item.price || 0) * item.quantity).toFixed(2)}</ThemedText>
            ) : (
              <View style={[styles.outOfStockBadge, { backgroundColor: dangerColor }]}>
                <ThemedText style={styles.outOfStockText}>{t(STRINGS.cartScreen.outOfStockBadge)}</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.quantityContainer}>
            {readOnly ? (
              <ThemedText style={{ fontWeight: typography.weight.bold, fontSize: typography.size.md }}>x{item.quantity}</ThemedText>
            ) : (
              <QuantitySelector
                quantity={item.quantity}
                onDecrease={() => onUpdateQuantity && onUpdateQuantity(item.id, -1)}
                onIncrease={() => onUpdateQuantity && onUpdateQuantity(item.id, 1)}
                disabled={!item.inStock}
                size="small"
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.deleteAction, { width: DELETE_BTN_WIDTH, backgroundColor: dangerColor }]}
          onPress={() => onRemove && onRemove(item.id)}
        >
          <Feather name="trash-2" size={24} color={Colors.light.white} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cartItemWrapper: {
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  card: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemEmoji: {
    fontSize: typography.size.xxxl,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  itemSubtotal: {
    fontSize: typography.size.sm,
  },
  outOfStockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  outOfStockText: {
    color: Colors.light.white,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'transparent',
  },
});
