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

const SERVICEABLE_PINCODES = ['62701', '62704', '400001', '110001', '560001'];

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

    if (!SERVICEABLE_PINCODES.includes(form.pincode)) {
      Alert.alert("Location Not Serviceable", `Sorry, we do not deliver to pincode ${form.pincode} yet.`);
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

  const getAddressTypeLabel = (typeKey: string) => {
    if (typeKey === 'home') return t(STRINGS.checkoutScreen.home);
    if (typeKey === 'work') return t(STRINGS.checkoutScreen.work);
    return t(STRINGS.checkoutScreen.other);
  };

  const getAddressTypeIcon = (typeKey: string): any => {
    if (typeKey === 'home') return 'home';
    if (typeKey === 'work') return 'briefcase';
    return 'map-pin';
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

  const renderAddressModal = () => (
    <Modal visible={isAddressModalVisible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: modalBgColor }]}>
          <View style={styles.dragHandle} />

          <View style={styles.modalHeader}>
            <ThemedText type="subtitle" style={{ fontSize: 20 }}>
              {editingAddressId ? t(STRINGS.checkoutScreen.editAddressTitle) : t(STRINGS.checkoutScreen.addAddressTitle)}
            </ThemedText>
            <TouchableOpacity onPress={() => setAddressModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.fullName)} value={form.fullName} onChangeText={(t) => setForm({ ...form, fullName: t })} styleWrapper={[styles.input, { borderColor: borderColor }]} />
            <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.mobile)} value={form.mobile} onChangeText={(t) => setForm({ ...form, mobile: t })} keyboardType="phone-pad" styleWrapper={[styles.input, { borderColor: borderColor }]} />

            <View style={styles.inputDivider} />

            <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.flat)} value={form.flat} onChangeText={(t) => setForm({ ...form, flat: t })} styleWrapper={[styles.input, { borderColor: borderColor }]} />
            <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.street)} value={form.street} onChangeText={(t) => setForm({ ...form, street: t })} styleWrapper={[styles.input, { borderColor: borderColor }]} />
            <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.landmark)} value={form.landmark} onChangeText={(t) => setForm({ ...form, landmark: t })} styleWrapper={[styles.input, { borderColor: borderColor }]} />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.city)} value={form.city} onChangeText={(t) => setForm({ ...form, city: t })} styleWrapper={[styles.input, { flex: 1, borderColor: borderColor }]} />
              <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.state)} value={form.state} onChangeText={(t) => setForm({ ...form, state: t })} styleWrapper={[styles.input, { flex: 1, borderColor: borderColor }]} />
            </View>
            <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.pincode)} value={form.pincode} onChangeText={(t) => setForm({ ...form, pincode: t })} keyboardType="number-pad" styleWrapper={[styles.input, { borderColor: borderColor }]} />

            <View style={styles.inputDivider} />

            <ThemedText style={{ marginBottom: 12, fontSize: 16, fontWeight: '600' }}>
              {t(STRINGS.checkoutScreen.addressType)}
            </ThemedText>
            <View style={styles.typeRow}>
              {['home', 'work', 'other'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeBtn,
                    form.type === type ? { backgroundColor: primaryColor, borderColor: primaryColor } : { borderColor: borderColor, backgroundColor: cardColor }
                  ]}
                  onPress={() => setForm({ ...form, type })}
                >
                  <Feather name={getAddressTypeIcon(type)} size={16} color={form.type === type ? '#FFF' : iconColor} style={{ marginRight: 6 }} />
                  <ThemedText style={{ color: form.type === type ? '#FFF' : iconColor, fontWeight: form.type === type ? 'bold' : '500' }}>
                    {getAddressTypeLabel(type)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <CustomButton
              title={t(STRINGS.checkoutScreen.saveAddress)}
              onPress={saveAddress}
              style={styles.saveAddressBtn}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (cartItems.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText>{t(STRINGS.checkoutScreen.emptyCart)}</ThemedText>
        <CustomButton title={t(STRINGS.checkoutScreen.goShopping)} onPress={() => navigation.navigate('Home')} style={{ marginTop: 20 }} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {renderHeader()}
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Address Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>{t(STRINGS.checkoutScreen.deliveryAddress)}</ThemedText>
              <TouchableOpacity onPress={() => openAddressForm()}>
                <ThemedText style={{ color: primaryColor, fontWeight: 'bold' }}>{t(STRINGS.checkoutScreen.addNew)}</ThemedText>
              </TouchableOpacity>
            </View>

            {addresses.map((addr) => (
              <View
                key={addr.id}
                style={[
                  styles.optionCard,
                  { backgroundColor: cardColor, borderColor: selectedAddress === addr.id ? primaryColor : borderColor, borderWidth: selectedAddress === addr.id ? 2 : 1 }
                ]}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => {
                    if (!SERVICEABLE_PINCODES.includes(addr.pincode)) {
                      Alert.alert("Location Not Serviceable", `Sorry, we do not deliver to pincode ${addr.pincode}.`);
                      return;
                    }
                    setSelectedAddress(addr.id);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Feather name={getAddressTypeIcon(addr.label)} size={16} color={iconColor} style={{ marginRight: 6 }} />
                    <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>{getAddressTypeLabel(addr.label)}</ThemedText>
                  </View>
                  <ThemedText useSecondaryText style={{ fontSize: 14, lineHeight: 20 }}>{addr.address}</ThemedText>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => openAddressForm(addr)} style={{ padding: 8 }}>
                    <Feather name="edit-2" size={18} color={iconColor} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteAddress(addr.id)} style={{ padding: 8 }}>
                    <Feather name="trash-2" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

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
          <View style={styles.section}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { marginBottom: 16 }]}>{t(STRINGS.checkoutScreen.paymentMethod)}</ThemedText>
            {MOCK_PAYMENT_METHODS.map((pm) => (
              <View key={pm.id} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    { backgroundColor: cardColor, borderColor: selectedPayment === pm.id ? primaryColor : borderColor, borderWidth: selectedPayment === pm.id ? 2 : 1, marginBottom: 0 }
                  ]}
                  onPress={() => setSelectedPayment(pm.id)}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>{pm.label}</ThemedText>
                    <ThemedText useSecondaryText style={{ fontSize: 14 }}>{pm.details}</ThemedText>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedPayment === pm.id ? { borderColor: primaryColor } : { borderColor: borderColor }
                  ]}>
                    {selectedPayment === pm.id && <View style={[styles.radioButtonInner, { backgroundColor: primaryColor }]} />}
                  </View>
                </TouchableOpacity>

                {selectedPayment === pm.id && (pm.id === 'pm_credit' || pm.id === 'pm_debit') && (
                  <View style={[styles.paymentForm, { backgroundColor: cardColor, borderColor: primaryColor }]}>
                    <ThemedInput
                      icon={null}
                      placeholder="Card Number (16 digits)"
                      keyboardType="number-pad"
                      value={paymentDetails.cardNumber}
                      onChangeText={(t) => setPaymentDetails({ ...paymentDetails, cardNumber: t })}
                      styleWrapper={[styles.input, { borderColor: borderColor, marginBottom: 12 }]}
                    />
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <ThemedInput
                        icon={null}
                        placeholder="MM/YY"
                        value={paymentDetails.cardExpiry}
                        onChangeText={(t) => setPaymentDetails({ ...paymentDetails, cardExpiry: t })}
                        styleWrapper={[styles.input, { flex: 1, borderColor: borderColor, marginBottom: 0 }]}
                      />
                      <ThemedInput
                        icon={null}
                        placeholder="CVV"
                        keyboardType="number-pad"
                        secureTextEntry
                        value={paymentDetails.cardCvv}
                        onChangeText={(t) => setPaymentDetails({ ...paymentDetails, cardCvv: t })}
                        styleWrapper={[styles.input, { flex: 1, borderColor: borderColor, marginBottom: 0 }]}
                      />
                    </View>
                  </View>
                )}

                {selectedPayment === pm.id && pm.id === 'pm_upi' && (
                  <View style={[styles.paymentForm, { backgroundColor: cardColor, borderColor: primaryColor }]}>
                    <ThemedInput
                      icon={null}
                      placeholder="Enter UPI ID (e.g. name@bank)"
                      value={paymentDetails.upiId}
                      onChangeText={(t) => setPaymentDetails({ ...paymentDetails, upiId: t })}
                      styleWrapper={[styles.input, { borderColor: borderColor, marginBottom: 0 }]}
                    />
                  </View>
                )}

                {selectedPayment === pm.id && pm.id === 'pm_netbanking' && (
                  <View style={[styles.paymentForm, { backgroundColor: cardColor, borderColor: primaryColor, paddingVertical: 16 }]}>
                    <ThemedText useSecondaryText style={{ textAlign: 'center' }}>You will be redirected to your bank's portal to complete the payment.</ThemedText>
                  </View>
                )}
              </View>
            ))}
          </View>

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

        {renderAddressModal()}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '90%',
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#D1D5DB', // Light gray drag handle
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#F3F4F6', // very light gray circle for close
    borderRadius: 16,
  },
  inputDivider: {
    height: 1,
    backgroundColor: '#E5E7EB', // gray-200
    marginVertical: 16,
  },
  input: {
    marginBottom: 16,
    borderRadius: 12, // More rounded inputs
    borderWidth: 1, // Added border
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1, // Make them equally sized
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveAddressBtn: {
    marginTop: 12,
    backgroundColor: '#0f9b58', // Green background
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
