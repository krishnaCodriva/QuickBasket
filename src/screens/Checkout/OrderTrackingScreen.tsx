import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useTranslation } from 'react-i18next';
import { STRINGS } from '../../constants';

export default function OrderTrackingScreen({ route, navigation }: any) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{t(STRINGS.orderTrackingScreen.title)}</ThemedText>
      <ThemedText style={{ marginTop: 10 }}>{t(STRINGS.orderTrackingScreen.subtitle)}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
