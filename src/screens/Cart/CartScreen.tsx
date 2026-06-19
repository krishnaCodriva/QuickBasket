import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ThemedView,
  ThemedText,
  CustomButton,
  CartItemCard,
  CartPriceSummary,
  CartWarningBanner,
  EmptyState,
  ScreenHeader
} from '../../components';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor, useRefresh } from '../../hooks';
import { useCart, useAuth } from '../../context';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '../../core/types/navigation';
import { spacing, typography, elevation } from '../../core/constants/theme';

type CartNavProp = NativeStackNavigationProp<RootStackParamList>;

export default function CartScreen() {
  const navigation = useNavigation<CartNavProp>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { cartItems, updateQuantity, removeFromCart, totalItems, subtotal, deliveryCharge, tax, grandTotal, hasOutOfStock, fetchCart } = useCart();
  const { refreshing, onRefresh } = useRefresh(fetchCart);

  const taxes = tax;
  const totalPayable = grandTotal;

  // Theme Colors
  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as never);
  const separatorColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as never);

  // Handlers
  const handleCheckout = () => {
    if (hasOutOfStock) return;
    if (!user) {
      navigation.navigate('Login', { returnTo: 'Checkout' });
    } else {
      navigation.navigate('Checkout');
    }
  };

  const renderHeader = () => (
    <ScreenHeader
      title={t(STRINGS.cartScreen.title)}
      subtitle={`(${totalItems} ${t(STRINGS.cartScreen.itemsCount)})`}
      onBack={() => navigation.goBack()}
      rightElement={
        <TouchableOpacity onPress={() => navigation.navigate('HomeTab', { screen: 'Home' })}>
          <ThemedText style={[styles.continueShopping, { color: primaryColor }]}>{t(STRINGS.cartScreen.continueShopping)}</ThemedText>
        </TouchableOpacity>
      }
    />
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {renderHeader()}
        <CartWarningBanner visible={hasOutOfStock} />

        {cartItems.length === 0 ? (
          <EmptyState
            emoji="🛒"
            title={t(STRINGS.cartScreen.emptyCart)}
            buttonText={t(STRINGS.cartScreen.startShopping)}
            onButtonPress={() => navigation.navigate('HomeTab', { screen: 'Home' })}
          />
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <CartItemCard
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            )}
            ListFooterComponent={() => (
              <CartPriceSummary
                subtotal={subtotal}
                deliveryCharge={deliveryCharge}
                taxes={taxes}
                totalPayable={totalPayable}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}

        {cartItems.length > 0 && (
          <View style={[styles.bottomBar, { borderTopColor: separatorColor, backgroundColor: cardColor, paddingBottom: Math.max(insets.bottom, 16) }]}>
            <CustomButton
              title={t(STRINGS.cartScreen.proceedToCheckout)}
              type={hasOutOfStock ? "secondary" : "primary"}
              onPress={handleCheckout}
              disabled={hasOutOfStock}
              style={{ width: '100%', marginBottom: Platform.OS === 'ios' ? 10 : 0 }}
            />
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smd,
  },
  headerBtn: {
    padding: spacing.xs,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.size.xl,
  },
  headerSubtitle: {
    fontSize: typography.size.sm,
    marginTop: spacing.xxs,
  },
  continueShopping: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
  },
  listContent: {
    paddingBottom: 100, // Space for bottom bar
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...elevation.lg,
  }
});
