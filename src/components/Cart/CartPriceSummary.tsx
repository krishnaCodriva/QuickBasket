import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useTranslation } from 'react-i18next';

interface CartPriceSummaryProps {
  subtotal: number;
  discount?: number;
  deliveryCharge: number;
  taxes: number;
  totalPayable: number;
}

export default function CartPriceSummary({ subtotal, discount = 0, deliveryCharge, taxes, totalPayable }: CartPriceSummaryProps) {
  const { t } = useTranslation();
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'primaryText');
  const separatorColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);

  return (
    <View style={[styles.summaryContainer, { borderColor: separatorColor }]}>
      <ThemedText type="subtitle" style={styles.summaryTitle}>{t(STRINGS.cartScreen.priceSummary)}</ThemedText>
      
      <View style={styles.summaryRow}>
        <ThemedText useSecondaryText>{t(STRINGS.cartScreen.itemSubtotal)}</ThemedText>
        <ThemedText>₹{subtotal.toFixed(2)}</ThemedText>
      </View>

      {discount > 0 && (
        <View style={styles.summaryRow}>
          <ThemedText useSecondaryText>{t(STRINGS.cartScreen.discounts)}</ThemedText>
          <ThemedText style={{ color: Colors.light.success || primaryColor }}>-₹{discount.toFixed(2)}</ThemedText>
        </View>
      )}
      
      <View style={styles.summaryRow}>
        <ThemedText useSecondaryText>{t(STRINGS.cartScreen.deliveryCharges)}</ThemedText>
        <ThemedText style={{ color: deliveryCharge === 0 ? primaryColor : textColor }}>
          {deliveryCharge === 0 ? t(STRINGS.cartScreen.freeDelivery) : `₹${deliveryCharge.toFixed(2)}`}
        </ThemedText>
      </View>

      <View style={styles.summaryRow}>
        <ThemedText useSecondaryText>{t(STRINGS.cartScreen.taxes)}</ThemedText>
        <ThemedText>₹{taxes.toFixed(2)}</ThemedText>
      </View>

      <View style={[styles.divider, { backgroundColor: separatorColor }]} />

      <View style={styles.summaryRow}>
        <ThemedText type="subtitle">{t(STRINGS.cartScreen.totalPayable)}</ThemedText>
        <ThemedText type="subtitle" style={{ color: primaryColor }}>₹{totalPayable.toFixed(2)}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryTitle: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
});
