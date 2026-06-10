import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, CustomButton, CartItemCard, CartPriceSummary } from '../../components';
import ThemedInput from '../../components/ThemedInput';
import { useCart, useOrder } from '../../context';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AddressFormModal from './AddressFormModal';
import AddressSection from './AddressSection';
import PaymentMethodSection from './PaymentMethodSection';

let INITIAL_ADDRESSES = [
  { id: 'addr_1', label: 'home', address: '123 Main St, Springfield, IL 62701', fullName: 'John Doe', mobile: '1234567890', flat: '123', street: 'Main St', landmark: '', city: 'Springfield', state: 'IL', pincode: '62701', type: 'home' },
  { id: 'addr_2', label: 'work', address: '456 Business Rd, Suite 200, Springfield, IL 62704', fullName: 'John Doe', mobile: '1234567890', flat: 'Suite 200', street: 'Business Rd', landmark: '', city: 'Springfield', state: 'IL', pincode: '62704', type: 'work' }
];

const MOCK_PAYMENT_METHODS = [
  { id: 'pm_cod', label: 'Cash on Delivery', details: 'Pay when your order arrives' },
  { id: 'pm_debit', label: 'Debit Card', details: 'Pay using your bank debit card' },
  { id: 'pm_credit', label: 'Credit Card', details: '**** **** **** 1234' },
  { id: 'pm_upi', label: 'UPI', details: 'Google Pay, PhonePe, Paytm, etc.' },
  { id: 'pm_netbanking', label: 'Net Banking', details: 'All major banks available' }
];

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
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const modalBgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground' as any);
  const errorColor = useThemeColor({ light: Colors.light.red600, dark: Colors.dark.error }, 'error' as any);

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
        Alert.alert("Invalid Card", "Please enter a valid 16-digit card number.");
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentDetails.cardExpiry)) {
        Alert.alert("Invalid Expiry", "Please enter expiry date in MM/YY format.");
        return;
      }
      if (!/^\d{3}$/.test(paymentDetails.cardCvv)) {
        Alert.alert("Invalid CVV", "Please enter a valid 3-digit CVV.");
        return;
      }
    } else if (selectedPayment === 'pm_upi') {
      if (!paymentDetails.upiId.includes('@')) {
        Alert.alert("Invalid UPI ID", "Please enter a valid UPI ID.");
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
      address: selectedAddrObj,
      paymentMethod: selectedPaymentObj?.label || '',
      paymentMethodId: selectedPaymentObj?.id || '',
      estimatedDelivery: 'Arriving in 30-45 mins'
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
      Alert.alert(t(STRINGS.checkoutScreen.error), t(STRINGS.checkoutScreen.fillFieldsError) || "Please fill all mandatory fields.");
      return;
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      Alert.alert(t(STRINGS.checkoutScreen.error), "Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{5,6}$/.test(form.pincode)) {
      Alert.alert(t(STRINGS.checkoutScreen.error), "Please enter a valid 5 or 6-digit pincode.");
      return;
    }

    if (!/^\d{5,6}$/.test(form.pincode)) {
      Alert.alert(t(STRINGS.checkoutScreen.error), "Please enter a valid 5 or 6-digit pincode.");
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
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setAddresses(prev => prev.filter(a => a.id !== id));
            if (selectedAddress === id) setSelectedAddress('');
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
        <Feather name="arrow-left" size={24} color={iconColor} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <ThemedText type="subtitle" style={styles.headerTitle}>{t(STRINGS.checkoutScreen.title)}</ThemedText>
      </View>
      <View style={{ width: 32 }} />
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText>{t(STRINGS.checkoutScreen.emptyCart)}</ThemedText>
        <CustomButton title={t(STRINGS.checkoutScreen.goShopping)} onPress={() => navigation.navigate('HomeTab', { screen: 'Home' })} style={{ marginTop: 20 }} />
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
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentForm: {
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 2,
    borderTopWidth: 0,
    marginTop: -4,
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
  },
  bottomBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveAddressBtn: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
  }
});
