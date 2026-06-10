import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, CustomButton, CartItemCard, CartPriceSummary, ScreenHeader, EmptyState } from '../../components';
import ThemedInput from '../../components/ThemedInput';
import { useCart, useOrder } from '../../context';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { INITIAL_ADDRESSES, MOCK_PAYMENT_METHODS } from '../../data/mockData';
import AddressFormModal from './AddressFormModal';
import AddressSection from './AddressSection';
import { spacing, radius, elevation } from '../../core/constants/theme';
import PaymentMethodSection from './PaymentMethodSection';


export default function CheckoutScreen() {
  const { cartItems, subtotal, clearCart, totalItems } = useCart();
  const { addOrder } = useOrder();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: '', mobile: '', flat: '', street: '', landmark: '', city: '', state: '', pincode: '', type: 'home'
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    upiId: ''
  });

  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);

  const discount = subtotal > 0 ? 5 : 0; // Flat ₹5 mock discount for any order
  const deliveryCharge = subtotal > 50 ? 0 : 5.99;
  const taxes = subtotal * 0.08;
  const totalPayable = subtotal - discount + deliveryCharge + taxes;

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      Alert.alert(t(STRINGS.checkoutScreen.missingInfo), t(STRINGS.checkoutScreen.selectAddressError));
      return;
    }
    if (!selectedPayment) {
      Alert.alert(t(STRINGS.checkoutScreen.missingInfo), t(STRINGS.checkoutScreen.selectPaymentError));
      return;
    }

    if (selectedPayment === 'pm_credit' || selectedPayment === 'pm_debit') {
      if (!/^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) {
        Alert.alert(t(STRINGS.checkoutScreen.invalidCard), t(STRINGS.checkoutScreen.invalidCardMsg));
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentDetails.cardExpiry)) {
        Alert.alert(t(STRINGS.checkoutScreen.invalidExpiry), t(STRINGS.checkoutScreen.invalidExpiryMsg));
        return;
      }
      if (!/^\d{3}$/.test(paymentDetails.cardCvv)) {
        Alert.alert(t(STRINGS.checkoutScreen.invalidCvv), t(STRINGS.checkoutScreen.invalidCvvMsg));
        return;
      }
    } else if (selectedPayment === 'pm_upi') {
      if (!paymentDetails.upiId.includes('@')) {
        Alert.alert(t(STRINGS.checkoutScreen.invalidUpiId), t(STRINGS.checkoutScreen.invalidUpiIdMsg));
        return;
      }
    }

    setIsPlacingOrder(true);

    const txId = 'TXN' + Math.floor(100000000 + Math.random() * 900000000);
    const selectedAddrObj = addresses.find(a => a.id === selectedAddress);
    const selectedPaymentObj = MOCK_PAYMENT_METHODS.find(p => p.id === selectedPayment);

    const orderPayload = {
      id: txId,
      date: new Date().toISOString(),
      items: cartItems,
      subtotal,
      discount,
      deliveryCharge,
      taxes,
      totalPayable,
      address: selectedAddrObj
        ? { ...selectedAddrObj, type: selectedAddrObj.type as 'home' | 'work' | 'other' }
        : undefined,
      paymentMethod: selectedPaymentObj?.label || '',
      paymentMethodId: selectedPaymentObj?.id || '',
      estimatedDelivery: t(STRINGS.checkoutScreen.estimatedDelivery)
    };

    setTimeout(() => {
      setIsPlacingOrder(false);
      addOrder(orderPayload);
      clearCart();
      navigation.navigate('OrderSuccess', { order: orderPayload });
    }, 2000);
  };

  const openAddressForm = (addr?: any) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setForm({ ...addr });
    } else {
      setEditingAddressId(null);
      setForm({ fullName: '', mobile: '', flat: '', street: '', landmark: '', city: '', state: '', pincode: '', type: 'home' });
    }
    setAddressModalVisible(true);
  };

  const saveAddress = () => {
    if (!form.fullName || !form.mobile || !form.flat || !form.street || !form.city || !form.state || !form.pincode) {
      Alert.alert(t(STRINGS.checkoutScreen.error), t(STRINGS.checkoutScreen.fillFieldsError));
      return;
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      Alert.alert(t(STRINGS.checkoutScreen.error), t(STRINGS.checkoutScreen.invalidMobileMsg));
      return;
    }

    if (!/^\d{5,6}$/.test(form.pincode)) {
      Alert.alert(t(STRINGS.checkoutScreen.error), t(STRINGS.checkoutScreen.invalidPincodeMsg));
      return;
    }

    const fullAddressString = `${form.flat}, ${form.street}, ${form.city}, ${form.state} ${form.pincode}`;

    if (editingAddressId) {
      setAddresses(prev => prev.map(a => a.id === editingAddressId ? { ...a, ...form, label: form.type, address: fullAddressString } : a));
    } else {
      const newId = `addr_${Date.now()}`;
      setAddresses(prev => [...prev, { id: newId, ...form, label: form.type, address: fullAddressString }]);
      setSelectedAddress(newId);
    }
    setAddressModalVisible(false);
  };

  const deleteAddress = (id: string) => {
    Alert.alert(
      t(STRINGS.checkoutScreen.deleteAddress),
      t(STRINGS.checkoutScreen.deleteAddressConfirm),
      [
        { text: t(STRINGS.checkoutScreen.deleteAddressCancel), style: 'cancel' },
        {
          text: t(STRINGS.checkoutScreen.deleteAddressConfirmBtn),
          style: 'destructive',
          onPress: () => {
            setAddresses(prev => prev.filter(a => a.id !== id));
            if (selectedAddress === id) setSelectedAddress('');
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <ScreenHeader 
      title={t(STRINGS.checkoutScreen.title)} 
      onBack={() => navigation.goBack()} 
      showBorder={false}
      style={{ paddingHorizontal: 16 }}
    />
  );

  if (cartItems.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <EmptyState
          emoji="🛒"
          title={t(STRINGS.checkoutScreen.emptyCart)}
          buttonText={t(STRINGS.checkoutScreen.goShopping)}
          onButtonPress={() => navigation.navigate('HomeTab', { screen: 'Home' })}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {renderHeader()}
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Address Selection */}
          <AddressSection
            addresses={addresses}
            selectedAddress={selectedAddress}
            onSelect={setSelectedAddress}
            onEdit={(addr) => openAddressForm(addr)}
            onDelete={deleteAddress}
            onAddNew={() => openAddressForm()}
          />

          {/* Order Items */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>{t(STRINGS.checkoutScreen.orderItems)} ({totalItems})</ThemedText>
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                readOnly={true}
              />
            ))}
          </View>

          {/* Payment Methods */}
          <PaymentMethodSection
            paymentMethods={MOCK_PAYMENT_METHODS}
            selectedPayment={selectedPayment}
            onSelect={setSelectedPayment}
            paymentDetails={paymentDetails}
            onPaymentDetailsChange={setPaymentDetails}
          />

          {/* Order Summary */}
          <CartPriceSummary
            subtotal={subtotal}
            discount={discount}
            deliveryCharge={deliveryCharge}
            taxes={taxes}
            totalPayable={totalPayable}
          />

        </ScrollView>

        {/* Sticky Bottom Button */}
        <View style={[
          styles.bottomBar,
          {
            borderTopColor: borderColor,
            backgroundColor: cardColor,
            paddingBottom: Math.max(insets.bottom, 16)
          }
        ]}>
          <View style={styles.bottomBarRow}>
            <View>
              <ThemedText useSecondaryText>{t(STRINGS.checkoutScreen.total)}</ThemedText>
              <ThemedText type="subtitle">₹{totalPayable.toFixed(2)}</ThemedText>
            </View>
            <CustomButton
              title={t(STRINGS.checkoutScreen.placeOrder)}
              onPress={handlePlaceOrder}
              loading={isPlacingOrder}
              style={{ minWidth: 150 }}
            />
          </View>
        </View>

        <AddressFormModal
          visible={isAddressModalVisible}
          onClose={() => setAddressModalVisible(false)}
          onSave={saveAddress}
          editingAddressId={editingAddressId}
          form={form}
          onFormChange={setForm}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.mlg,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.smd,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  optionCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.smd,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentForm: {
    padding: spacing.md,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    borderWidth: 2,
    borderTopWidth: 0,
    marginTop: -4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...elevation.lg,
  },
  bottomBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveAddressBtn: {
    marginTop: spacing.smd,
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: radius.circle,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.smd,
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
  }
});
