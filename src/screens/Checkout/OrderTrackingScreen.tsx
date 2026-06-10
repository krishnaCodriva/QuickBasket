/**
 * OrderTrackingScreen.tsx
 * Refactored: removed duplicate imports, typed props with NativeStackScreenProps.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { STRINGS } from '../../constants';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import type { RootStackParamList } from '../../core/types/navigation';
import { spacing } from '../../core/constants/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderStatus'>;

export default function OrderTrackingScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{t(STRINGS.orderTrackingScreen.title)}</ThemedText>
      <ThemedText style={{ marginTop: spacing.sm }}>
        {t(STRINGS.orderTrackingScreen.subtitle)}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.mlg,
  },
});
