import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ThemedView,
  ThemedText,
  CustomButton,
  CartItemCard,
  CartPriceSummary,
  CartWarningBanner,
  EmptyState
} from '../../components';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useCart } from '../../context';
import { useTranslation } from 'react-i18next';

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock auth state
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { cartItems, updateQuantity, removeFromCart, totalItems, subtotal, hasOutOfStock } = useCart();

  const deliveryCharge = subtotal > 500 ? 0 : 40;
  const taxes = subtotal * 0.05;
  const totalPayable = subtotal > 0 ? (subtotal + deliveryCharge + taxes) : 0;

  // Theme Colors
  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const separatorColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);

  // Handlers
  const handleCheckout = () => {
    if (hasOutOfStock) return;
    if (!isLoggedIn) {
      navigation.navigate('Login');
    } else {
      navigation.navigate('Checkout');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
        <Feather name="arrow-left" size={24} color={iconColor} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <ThemedText type="subtitle" style={styles.headerTitle}>{t(STRINGS.cartScreen.title)}</ThemedText>
        <ThemedText style={styles.headerSubtitle} useSecondaryText>({totalItems} {t(STRINGS.cartScreen.itemsCount)})</ThemedText>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('HomeTab', { screen: 'Home' })}>
        <ThemedText style={[styles.continueShopping, { color: primaryColor }]}>{t(STRINGS.cartScreen.continueShopping)}</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
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
          />
        )}

        {cartItems.length > 0 && (
          <View style={[styles.bottomBar, { borderTopColor: separatorColor, backgroundColor: cardColor, paddingBottom: Math.max(insets.bottom, 16) }]}>
            <CustomButton
              title={t(STRINGS.cartScreen.proceedToCheckout)}
              type={hasOutOfStock ? "outline" : "primary"}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  continueShopping: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100, // Space for bottom bar
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }
});
