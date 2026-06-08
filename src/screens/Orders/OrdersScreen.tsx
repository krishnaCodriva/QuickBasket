import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView, ThemedText } from '../../components';

export default function OrdersScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Orders Coming Soon</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
