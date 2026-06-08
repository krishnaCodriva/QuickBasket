import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { CustomButton } from '../../components/CustomButton';
import { Colors, ThemeDimension } from '../../constants';
import { useThemeColor } from '../../hooks';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useCart } from '../../context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// No longer using dummy cart data

export default function CheckoutScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  
  // Theme Colors
  const backgroundColor = useThemeColor({}, 'primaryBackground');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const borderColor = useThemeColor({}, 'gray200' as any);
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'primaryText');
  const errorColor = useThemeColor({}, 'error');

  // Context
  const { cartItems, subtotal: itemSubtotal, hasOutOfStock: anyOutOfStock, clearCart } = useCart();

  // States
  const [showAllItems, setShowAllItems] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Address Form States
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    houseFlatNo: '',
    streetArea: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home',
  });

  // Derived Values
  const deliveryCharges = itemSubtotal > 500 ? 0 : 40;
  const taxes = itemSubtotal * 0.05;
  const totalPayable = itemSubtotal + deliveryCharges + taxes;

  const canPlaceOrder = selectedAddress && selectedPayment && !anyOutOfStock;

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      Alert.alert('Validation Error', t('checkoutScreen.validation.selectAddress'));
      return;
    }
    if (!selectedPayment) {
      Alert.alert('Validation Error', t('checkoutScreen.validation.selectPayment'));
      return;
    }
    if (anyOutOfStock) {
      return;
    }

    setIsPlacingOrder(true);
    setTimeout(() => {
      setIsPlacingOrder(false);
      clearCart();
      navigation.navigate('OrderConfirmation');
    }, 2000);
  };

  const handleSaveAddress = () => {
    // Validate
    if (!formData.fullName || !formData.mobileNumber || !formData.houseFlatNo || !formData.streetArea || !formData.city || !formData.state || !formData.pincode) {
      Alert.alert('Error', t('checkoutScreen.validation.mandatoryFields'));
      return;
    }
    if (formData.mobileNumber.length !== 10) {
      Alert.alert('Error', t('checkoutScreen.validation.invalidMobile'));
      return;
    }
    if (formData.pincode.length !== 6) {
      Alert.alert('Error', t('checkoutScreen.validation.invalidPincode'));
      return;
    }

    setSelectedAddress({ ...formData, id: Date.now().toString() });
    setAddressModalVisible(false);
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>{t('checkoutScreen.title')}</ThemedText>
        <View style={styles.backBtn} />
      </View>

      {cartItems.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialCommunityIcons name="cart-off" size={64} color={borderColor} />
          <ThemedText style={{ marginTop: 16, textAlign: 'center' }}>{t('cartScreen.emptyCart')}</ThemedText>
          <CustomButton 
            title={t('checkoutScreen.goToCart')} 
            onPress={() => navigation.navigate('Cart')}
            style={{ marginTop: 24, width: '100%' }}
          />
        </View>
      ) : (
      <>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Out of Stock Banner */}
        {anyOutOfStock && (
          <View style={[styles.outOfStockBanner, { backgroundColor: Colors.light.red100, borderColor: errorColor }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color={errorColor} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <ThemedText style={{ color: errorColor, fontSize: 13 }}>{t('checkoutScreen.outOfStockBanner')}</ThemedText>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
              <ThemedText style={{ color: errorColor, fontWeight: 'bold' }}>{t('checkoutScreen.goToCart')}</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Delivery Address Section */}
        <View style={[styles.section, { backgroundColor: secondaryBackgroundColor }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold">{t('checkoutScreen.deliveryAddress')}</ThemedText>
            {selectedAddress && (
              <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
                <ThemedText style={{ color: primaryColor }}>{t('checkoutScreen.edit')}</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {selectedAddress ? (
            <View style={[styles.addressCard, { borderColor: primaryColor }]}>
              <View style={styles.addressRow}>
                <ThemedText style={{ fontWeight: 'bold' }}>{selectedAddress.fullName}</ThemedText>
                <ThemedText style={{ fontWeight: 'bold' }}>{selectedAddress.mobileNumber}</ThemedText>
              </View>
              <ThemedText style={{ marginTop: 4 }}>{selectedAddress.houseFlatNo}, {selectedAddress.streetArea}</ThemedText>
              <ThemedText style={{ marginTop: 2 }}>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</ThemedText>
              
              <View style={styles.addressFooter}>
                <View style={[styles.addressBadge, { backgroundColor: Colors.light.transparentGreen015 }]}>
                  <ThemedText style={{ color: primaryColor, fontSize: 12, fontWeight: 'bold' }}>{selectedAddress.addressType}</ThemedText>
                </View>
                <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
                  <ThemedText style={{ color: primaryColor, fontWeight: '600' }}>{t('checkoutScreen.change')}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <CustomButton 
              title={t('checkoutScreen.addDeliveryAddress')} 
              type="secondary"
              onPress={() => setAddressModalVisible(true)}
              style={{ borderColor: primaryColor, marginTop: 10 }}
            />
          )}
        </View>

        {/* Order Items Section */}
        <View style={[styles.section, { backgroundColor: secondaryBackgroundColor }]}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 10 }}>
            {t('checkoutScreen.orderItems')} ({cartItems.length})
          </ThemedText>
          
          {cartItems.slice(0, showAllItems ? cartItems.length : 2).map((item) => (
            <View key={item.id} style={[styles.itemRow, { borderBottomColor: borderColor }]}>
              <View style={styles.itemLeft}>
                <ThemedText style={{ fontSize: 20 }}>{item.emoji}</ThemedText>
                <View style={{ marginLeft: 10 }}>
                  <ThemedText>{item.name}</ThemedText>
                  <ThemedText useSecondaryText style={{ fontSize: 12 }}>Qty: {item.quantity}</ThemedText>
                </View>
              </View>
              <ThemedText type="defaultSemiBold">₹{item.price * item.quantity}</ThemedText>
            </View>
          ))}

          {cartItems.length > 2 && (
            <TouchableOpacity onPress={() => setShowAllItems(!showAllItems)} style={styles.viewAllBtn}>
              <ThemedText style={{ color: primaryColor, fontWeight: '600' }}>
                {showAllItems ? 'Show Less' : t('checkoutScreen.viewAllItems').replace('{count}', cartItems.length.toString())}
              </ThemedText>
              <MaterialCommunityIcons name={showAllItems ? "chevron-up" : "chevron-down"} size={20} color={primaryColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Order Summary Section */}
        <View style={[styles.section, { backgroundColor: secondaryBackgroundColor }]}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 10 }}>{t('checkoutScreen.orderSummary')}</ThemedText>
          
          <View style={styles.summaryRow}>
            <ThemedText useSecondaryText>{t('checkoutScreen.itemSubtotal')}</ThemedText>
            <ThemedText>₹{itemSubtotal}</ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText useSecondaryText>{t('checkoutScreen.deliveryCharges')}</ThemedText>
            <ThemedText style={{ color: deliveryCharges === 0 ? primaryColor : textColor }}>
              {deliveryCharges === 0 ? t('checkoutScreen.free') : `₹${deliveryCharges}`}
            </ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText useSecondaryText>{t('checkoutScreen.taxes')}</ThemedText>
            <ThemedText>₹{taxes.toFixed(2)}</ThemedText>
          </View>
          
          <View style={[styles.summaryDivider, { backgroundColor: borderColor }]} />
          
          <View style={styles.summaryRow}>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>{t('checkoutScreen.totalPayable')}</ThemedText>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 18, color: primaryColor }}>₹{totalPayable.toFixed(2)}</ThemedText>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={[styles.section, { backgroundColor: secondaryBackgroundColor }]}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 10 }}>{t('checkoutScreen.paymentMethod')}</ThemedText>
          
          {[
            { id: 'cod', title: t('checkoutScreen.cod'), icon: 'cash' },
            { id: 'upi', title: t('checkoutScreen.upi'), icon: 'qrcode' },
            { id: 'debit', title: t('checkoutScreen.debitCard'), icon: 'credit-card-outline' },
            { id: 'credit', title: t('checkoutScreen.creditCard'), icon: 'credit-card' },
            { id: 'netbanking', title: t('checkoutScreen.netBanking'), icon: 'bank' },
          ].map((method) => {
            const isSelected = selectedPayment === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                onPress={() => setSelectedPayment(method.id)}
                style={[
                  styles.paymentCard,
                  { borderColor: isSelected ? primaryColor : borderColor, backgroundColor: backgroundColor }
                ]}
              >
                <View style={styles.paymentLeft}>
                  <MaterialCommunityIcons name={method.icon as any} size={24} color={isSelected ? primaryColor : textColor} style={{ marginRight: 12 }} />
                  <ThemedText style={{ fontWeight: isSelected ? '600' : 'normal' }}>{method.title}</ThemedText>
                </View>
                <MaterialCommunityIcons 
                  name={isSelected ? "radiobox-marked" : "radiobox-blank"} 
                  size={24} 
                  color={isSelected ? primaryColor : Colors.light.gray400} 
                />
              </TouchableOpacity>
            )
          })}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor, borderTopColor: borderColor }]}>
        <CustomButton
          title={`${t('checkoutScreen.placeOrder')} • ₹${totalPayable.toFixed(2)}`}
          onPress={handlePlaceOrder}
          disabled={!canPlaceOrder}
          loading={isPlacingOrder}
          style={{ marginBottom: 0, opacity: canPlaceOrder ? 1 : 0.5 }}
        />
      </View>
      </>
      )}

      {/* Add Address Modal */}
      <Modal visible={isAddressModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">{t('checkoutScreen.addNewAddress')}</ThemedText>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <TextInput style={[styles.input, { borderColor, color: textColor }]} placeholder={t('checkoutScreen.fullName')} placeholderTextColor={Colors.light.gray400} value={formData.fullName} onChangeText={(t) => setFormData({...formData, fullName: t})} />
              <TextInput style={[styles.input, { borderColor, color: textColor }]} placeholder={t('checkoutScreen.mobileNumber')} placeholderTextColor={Colors.light.gray400} keyboardType="number-pad" maxLength={10} value={formData.mobileNumber} onChangeText={(t) => setFormData({...formData, mobileNumber: t})} />
              <TextInput style={[styles.input, { borderColor, color: textColor }]} placeholder={t('checkoutScreen.houseFlatNo')} placeholderTextColor={Colors.light.gray400} value={formData.houseFlatNo} onChangeText={(t) => setFormData({...formData, houseFlatNo: t})} />
              <TextInput style={[styles.input, { borderColor, color: textColor }]} placeholder={t('checkoutScreen.streetArea')} placeholderTextColor={Colors.light.gray400} value={formData.streetArea} onChangeText={(t) => setFormData({...formData, streetArea: t})} />
              <TextInput style={[styles.input, { borderColor, color: textColor }]} placeholder={t('checkoutScreen.landmark')} placeholderTextColor={Colors.light.gray400} value={formData.landmark} onChangeText={(t) => setFormData({...formData, landmark: t})} />
              <View style={styles.rowInputs}>
                <TextInput style={[styles.input, styles.halfInput, { borderColor, color: textColor }]} placeholder={t('checkoutScreen.city')} placeholderTextColor={Colors.light.gray400} value={formData.city} onChangeText={(t) => setFormData({...formData, city: t})} />
                <TextInput style={[styles.input, styles.halfInput, { borderColor, color: textColor }]} placeholder={t('checkoutScreen.state')} placeholderTextColor={Colors.light.gray400} value={formData.state} onChangeText={(t) => setFormData({...formData, state: t})} />
              </View>
              <TextInput style={[styles.input, { borderColor, color: textColor }]} placeholder={t('checkoutScreen.pincode')} placeholderTextColor={Colors.light.gray400} keyboardType="number-pad" maxLength={6} value={formData.pincode} onChangeText={(t) => setFormData({...formData, pincode: t})} />
              
              <ThemedText style={{ marginTop: 10, marginBottom: 10 }}>{t('checkoutScreen.addressType')}</ThemedText>
              <View style={styles.addressTypeRow}>
                {['Home', 'Work', 'Other'].map(type => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFormData({...formData, addressType: type})}
                    style={[
                      styles.typeBadge,
                      { borderColor: formData.addressType === type ? primaryColor : borderColor },
                      formData.addressType === type && { backgroundColor: Colors.light.transparentGreen015 }
                    ]}
                  >
                    <ThemedText style={{ color: formData.addressType === type ? primaryColor : textColor }}>
                      {type === 'Home' ? t('checkoutScreen.home') : type === 'Work' ? t('checkoutScreen.work') : t('checkoutScreen.other')}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <CustomButton title={t('checkoutScreen.saveAddress')} onPress={handleSaveAddress} style={{ marginTop: 20, marginBottom: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: ThemeDimension.borderRadius.m,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressCard: {
    borderWidth: 1,
    borderRadius: ThemeDimension.borderRadius.s,
    padding: 12,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  addressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  addressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryDivider: {
    height: 1,
    marginVertical: 8,
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: ThemeDimension.borderRadius.s,
    marginBottom: 8,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outOfStockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: ThemeDimension.borderRadius.m,
    borderWidth: 1,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalScroll: {
    //
  },
  input: {
    borderWidth: 1,
    borderRadius: ThemeDimension.borderRadius.s,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  addressTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  }
});
