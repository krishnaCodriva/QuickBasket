import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';
import { Colors, STRINGS } from '../../constants';
import { useTranslation } from 'react-i18next';
import { spacing, radius, typography } from '../../core/constants/theme';

interface CartWarningBannerProps {
  visible: boolean;
}

export default function CartWarningBanner({ visible }: CartWarningBannerProps) {
  const { t } = useTranslation();
  if (!visible) return null;
  
  const warningBg = Colors.light.yellow100;
  const warningText = Colors.light.yellow900;

  return (
    <View style={[styles.warningBanner, { backgroundColor: warningBg }]}>
      <Ionicons name="warning" size={20} color={warningText} />
      <ThemedText style={[styles.warningText, { color: warningText }]}>{t(STRINGS.cartScreen.outOfStockWarning)}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.smd,
    marginHorizontal: spacing.md,
    marginBottom: spacing.smd,
    borderRadius: radius.sm,
  },
  warningText: {
    fontSize: typography.size.sm,
    marginLeft: spacing.sm,
    flex: 1,
  },
});
