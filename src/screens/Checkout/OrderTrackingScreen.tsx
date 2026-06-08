import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

export default function OrderTrackingScreen({ route, navigation }: any) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Order Tracking</ThemedText>
      <ThemedText style={{ marginTop: 10 }}>Track your order here.</ThemedText>
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
