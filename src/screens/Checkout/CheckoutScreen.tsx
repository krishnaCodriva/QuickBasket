import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, CustomButton, CartItemCard, CartPriceSummary, ScreenHeader, EmptyState } from '../../components';
import ThemedInput from '../../components/ThemedInput';
import { useCart, useOrder, useAddress } from '../../context';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor, useLocationServiceability } from '../../hooks';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { INITIAL_ADDRESSES } from '../../data/mockData';
import AddressFormModal from './AddressFormModal';
import AddressSection from './AddressSection';
import { spacing, radius, elevation } from '../../core/constants/theme';
import PaymentMethodSection from './PaymentMethodSection';
import { orderApi } from '../../services/orderApi';
import RazorpayWebView, { RazorpayOptions } from './RazorpayWebView';

const PAYMENT_METHODS = [
  { id: 'pm_online', label: 'Pay Online', details: 'Cards, UPI, Netbanking, Wallets', icon: 'credit-card' },
  { id: 'pm_cod', label: 'Cash on Delivery', details: 'Pay at your doorstep', icon: 'truck' }
];


export default function CheckoutScreen() {
  const { cartItems, subtotal, tax, deliveryCharge, grandTotal, clearCart, totalItems } = useCart();
  const { addOrder } = useOrder();
  const { addresses, selectedAddressId, selectAddress, addAddress, updateAddress, deleteAddress } = useAddress();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { verifyLocation } = useLocationServiceability();

  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // WebView state
  const [razorpayOptions, setRazorpayOptions] = useState<RazorpayOptions | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

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

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert(t(STRINGS.checkoutScreen.missingInfo), t(STRINGS.checkoutScreen.selectAddressError));
      return;
    }
    if (!selectedPayment) {
      Alert.alert(t(STRINGS.checkoutScreen.missingInfo), t(STRINGS.checkoutScreen.selectPaymentError));
      return;
    }

    const method = selectedPayment === 'pm_cod' ? 'COD' : 'RAZORPAY';
    setIsPlacingOrder(true);

    try {
      // 1. Initiate Order
      const initRes = await orderApi.initiateOrder({
        addressId: selectedAddressId,
        paymentMethod: method
      });

      if (!initRes.success || !initRes.data) {
        Alert.alert('Error', initRes.message || 'Failed to initiate order');
        setIsPlacingOrder(false);
        return;
      }

      if (method === 'COD') {
        // COD order placed successfully
        clearCart();
        addOrder();
        const orderId = initRes.data?.id || initRes.data?.orderId || initRes.data?.order?.id;
        navigation.navigate('OrderSuccess', { order: { id: orderId } });
        setIsPlacingOrder(false);
        return;
      }

      // 2. Razorpay Flow
      const rzpData = initRes.data.razorpay || initRes.data;
      if (!rzpData || !rzpData.razorpayOrderId) {
        Alert.alert('Error', 'Invalid Razorpay configuration from server');
        setIsPlacingOrder(false);
        return;
      }

      // Save the internal order ID to verify later
      const internalId = initRes.data?.id || initRes.data?.internalOrderId || initRes.data?.order?.id;
      setPendingOrderId(internalId);

      const options: RazorpayOptions = {
        description: 'QuickBasket Order',
        currency: rzpData.currency || 'INR',
        key: rzpData.keyId || rzpData.key,
        amount: rzpData.amount,
        name: 'QuickBasket',
        order_id: rzpData.razorpayOrderId,
        theme: { color: Colors.light.primary }
      };

      // Open the WebView instead of the native SDK
      setRazorpayOptions(options);
      setIsPlacingOrder(false); // Stop loading since the webview will take over

    } catch (e: any) {
      console.error('Checkout error:', e);
      Alert.alert('Error', e.response?.data?.message || e.message || 'Failed to place order');
      setIsPlacingOrder(false);
    }
  };

  const handleRazorpaySuccess = async (paymentData: any) => {
    setRazorpayOptions(null);
    setIsPlacingOrder(true);
    try {
      // 3. Verify Payment
      const verifyRes = await orderApi.verifyPayment({
        internalOrderId: pendingOrderId,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature
      });

      if (verifyRes.success) {
        clearCart();
        addOrder();
        const successOrderId = verifyRes.data?.id || verifyRes.data?.orderId || pendingOrderId;
        navigation.navigate('OrderSuccess', { order: { id: successOrderId } });
      } else {
        Alert.alert('Payment Failed', verifyRes.message || 'Verification failed');
      }
    } catch (e: any) {
      console.error('Verify error:', e);
      Alert.alert('Error', 'Payment verification failed');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleRazorpayCancel = () => {
    setRazorpayOptions(null);
    setIsPlacingOrder(false);
    Alert.alert('Payment Cancelled', 'You cancelled the payment. Your cart has been saved.');
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

  const saveAddress = async () => {
    if (!form.fullName || !form.mobile || !form.flat || !form.city || !form.state || !form.pincode) {
      Alert.alert(t(STRINGS.checkoutScreen.error), t(STRINGS.checkoutScreen.fillFieldsError));
      return;
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      Alert.alert(t(STRINGS.checkoutScreen.error), t(STRINGS.checkoutScreen.invalidMobileMsg));
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      Alert.alert(t(STRINGS.checkoutScreen.error), t(STRINGS.checkoutScreen.invalidPincodeMsg));
      return;
    }

    let checkLat = (form as any).latitude;
    let checkLon = (form as any).longitude;

    if (!checkLat || !checkLon) {
      // Geocode the typed address - omit 'flat' as OSM struggles with specific apartment/shop names
      const primaryAddress = `${form.street}, ${form.city}, ${form.state}, ${form.pincode}`;
      const fallbackAddress = `${form.pincode}, ${form.city}, ${form.state}`;
      
      try {
        // First attempt: Street + City + State + Pincode
        let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(primaryAddress)}&limit=1`, {
          headers: { "User-Agent": "QuickBasketApp/1.0" }
        });
        let data = await response.json();
        
        // Second attempt (Fallback): Pincode + City + State (Less accurate but ensures we get *some* location)
        if (!data || data.length === 0) {
           response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackAddress)}&limit=1`, {
            headers: { "User-Agent": "QuickBasketApp/1.0" }
          });
          data = await response.json();
        }

        if (data && data.length > 0) {
          checkLat = parseFloat(data[0].lat);
          checkLon = parseFloat(data[0].lon);
          // Attach to form so we send it to backend
          (form as any).latitude = checkLat;
          (form as any).longitude = checkLon;
        } else {
          Alert.alert("Address Not Found", "We couldn't locate this address on the map. Please try re-wording your street or city.");
          return;
        }
      } catch (err) {
        Alert.alert("Error", "Failed to verify address location.");
        return;
      }
    }

    // Verify distance
    const isServiceable = await verifyLocation(checkLat, checkLon);
    if (!isServiceable) {
      Alert.alert(
        "Delivery Unavailable",
        "Sorry, we do not deliver to this address as it is beyond our delivery range.",
        [{ text: "OK" }]
      );
      return; // Do NOT save to backend
    }

    if (editingAddressId) {
      await updateAddress(editingAddressId, form);
    } else {
      await addAddress(form);
    }

    setAddressModalVisible(false);
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      t(STRINGS.checkoutScreen.deleteAddress),
      t(STRINGS.checkoutScreen.deleteAddressConfirm),
      [
        { text: t(STRINGS.checkoutScreen.deleteAddressCancel), style: 'cancel' },
        {
          text: t(STRINGS.checkoutScreen.deleteAddressConfirmBtn),
          style: 'destructive',
          onPress: () => {
            deleteAddress(id);
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
      <SafeAreaView style={{ flex: 1 }}>
        {renderHeader()}
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Address Selection */}
          <AddressSection
            addresses={addresses}
            selectedAddress={selectedAddressId || ''}
            onSelect={selectAddress}
            onEdit={(addr) => openAddressForm(addr)}
            onDelete={handleDeleteAddress}
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
            paymentMethods={PAYMENT_METHODS as any}
            selectedPayment={selectedPayment}
            onSelect={setSelectedPayment}
            paymentDetails={paymentDetails}
            onPaymentDetailsChange={setPaymentDetails}
          />

          {/* Order Summary */}
          <CartPriceSummary
            subtotal={subtotal}
            discount={0}
            deliveryCharge={deliveryCharge}
            taxes={tax}
            totalPayable={grandTotal}
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
              <ThemedText type="subtitle">₹{grandTotal.toFixed(2)}</ThemedText>
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

        {/* Razorpay Webview Modal */}
        <RazorpayWebView 
          visible={!!razorpayOptions}
          options={razorpayOptions}
          onSuccess={handleRazorpaySuccess}
          onCancel={handleRazorpayCancel}
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
