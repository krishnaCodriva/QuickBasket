import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView, ThemedText, CustomButton } from '../../components';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useOrder } from '../../context';
import { useTranslation } from 'react-i18next';

export default function InvoiceScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { getOrderById } = useOrder();
  const { t } = useTranslation();
  
  const orderId = route.params?.orderId;
  const order = getOrderById(orderId);

  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);

  if (!order) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color={iconColor} />
            </TouchableOpacity>
            <ThemedText type="subtitle">Invoice Not Found</ThemedText>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const invoiceNumber = `INV-${order.id.slice(-8).toUpperCase()}`;
  
  const handleShare = async () => {
    try {
      const message = `
${t(STRINGS.invoiceScreen.title)}: ${invoiceNumber}
${t(STRINGS.invoiceScreen.orderId)} ${order.id}
${t(STRINGS.invoiceScreen.orderDate)} ${new Date(order.date).toLocaleDateString()}
${t(STRINGS.invoiceScreen.grandTotal)}: ₹${order.totalPayable.toFixed(2)}
${t(STRINGS.checkoutScreen.paymentMethod)}: ${order.paymentMethod}

Thank you for shopping with QuickBasket!
      `.trim();
      
      await Share.share({
        message,
        title: `Invoice ${invoiceNumber}`,
      });
    } catch (error) {
      console.log('Error sharing invoice:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>{t(STRINGS.invoiceScreen.title)}</ThemedText>
          <TouchableOpacity onPress={handleShare} style={styles.backBtn}>
            <Feather name="share-2" size={24} color={primaryColor} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.invoiceCard, { backgroundColor: cardColor, borderColor }]}>
            {/* Header */}
            <View style={[styles.section, { borderBottomColor: borderColor, borderBottomWidth: 1 }]}>
              <View style={styles.rowBetween}>
                <ThemedText type="subtitle">QuickBasket Ltd.</ThemedText>
                <ThemedText style={{ fontWeight: 'bold' }}>{invoiceNumber}</ThemedText>
              </View>
              <ThemedText useSecondaryText>123 Grocery Lane, Fresh City</ThemedText>
              <ThemedText useSecondaryText>GSTIN: 22AAAAA0000A1Z5</ThemedText>
            </View>

            {/* Order Info */}
            <View style={[styles.section, { borderBottomColor: borderColor, borderBottomWidth: 1 }]}>
              <View style={styles.rowBetween}>
                <ThemedText useSecondaryText>{t(STRINGS.invoiceScreen.orderId)}</ThemedText>
                <ThemedText>{order.id}</ThemedText>
              </View>
              <View style={styles.rowBetween}>
                <ThemedText useSecondaryText>{t(STRINGS.invoiceScreen.orderDate)}</ThemedText>
                <ThemedText>{new Date(order.date).toLocaleDateString()}</ThemedText>
              </View>
              <View style={styles.rowBetween}>
                <ThemedText useSecondaryText>{t(STRINGS.invoiceScreen.deliveryDate)}</ThemedText>
                <ThemedText>
                  {order.status === 'Delivered' ? new Date().toLocaleDateString() : 'Pending'}
                </ThemedText>
              </View>
            </View>

            {/* Customer Info */}
            <View style={[styles.section, { borderBottomColor: borderColor, borderBottomWidth: 1 }]}>
              <ThemedText type="subtitle" style={{ marginBottom: 8, fontSize: 16 }}>{t(STRINGS.invoiceScreen.customerDetails)}</ThemedText>
              <ThemedText style={{ fontWeight: 'bold' }}>{order.address?.fullName}</ThemedText>
              <ThemedText>{order.address?.address}</ThemedText>
              <ThemedText>Mobile: {order.address?.mobile}</ThemedText>
            </View>

            {/* Product Table */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={{ marginBottom: 12, fontSize: 16 }}>{t(STRINGS.checkoutScreen.orderItems)}</ThemedText>
              
              <View style={[styles.tableHeader, { backgroundColor: borderColor, opacity: 0.8 }]}>
                <ThemedText style={[styles.tableCol, { flex: 3, fontWeight: 'bold' }]}>{t(STRINGS.invoiceScreen.item)}</ThemedText>
                <ThemedText style={[styles.tableCol, { flex: 1, fontWeight: 'bold', textAlign: 'center' }]}>{t(STRINGS.invoiceScreen.qty)}</ThemedText>
                <ThemedText style={[styles.tableCol, { flex: 1, fontWeight: 'bold', textAlign: 'right' }]}>{t(STRINGS.invoiceScreen.price)}</ThemedText>
              </View>

              {order.items.map(item => (
                <View key={item.id} style={[styles.tableRow, { borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                  <ThemedText style={[styles.tableCol, { flex: 3 }]}>{item.name}</ThemedText>
                  <ThemedText style={[styles.tableCol, { flex: 1, textAlign: 'center' }]}>{item.quantity}</ThemedText>
                  <ThemedText style={[styles.tableCol, { flex: 1, textAlign: 'right' }]}>₹{(item.price * item.quantity).toFixed(2)}</ThemedText>
                </View>
              ))}
            </View>

            {/* Totals */}
            <View style={[styles.section, { backgroundColor: borderColor, opacity: 0.9, borderRadius: 8, padding: 16, marginTop: 8 }]}>
              <View style={styles.rowBetween}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.itemSubtotal)}</ThemedText><ThemedText>₹{order.subtotal?.toFixed(2)}</ThemedText></View>
              {order.discount > 0 && <View style={styles.rowBetween}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.discounts)}</ThemedText><ThemedText style={{ color: '#22c55e' }}>-₹{order.discount?.toFixed(2)}</ThemedText></View>}
              <View style={styles.rowBetween}><ThemedText useSecondaryText>{t(STRINGS.invoiceScreen.deliveryFee)}</ThemedText><ThemedText>₹{order.deliveryCharge?.toFixed(2)}</ThemedText></View>
              <View style={styles.rowBetween}><ThemedText useSecondaryText>{t(STRINGS.invoiceScreen.taxes)}</ThemedText><ThemedText>₹{order.taxes?.toFixed(2)}</ThemedText></View>
              <View style={[styles.rowBetween, { borderTopWidth: 1, borderTopColor: cardColor, paddingTop: 12, marginTop: 12 }]}>
                <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>{t(STRINGS.invoiceScreen.grandTotal)}</ThemedText>
                <ThemedText style={{ fontWeight: 'bold', fontSize: 16, color: primaryColor }}>₹{order.totalPayable?.toFixed(2)}</ThemedText>
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <ThemedText useSecondaryText style={{ textAlign: 'center', fontSize: 12 }}>
                {t(STRINGS.checkoutScreen.paymentMethod)}: {order.paymentMethod}
              </ThemedText>
              <ThemedText useSecondaryText style={{ textAlign: 'center', fontSize: 12, marginTop: 4 }}>
                This is a computer generated invoice and does not require a physical signature.
              </ThemedText>
            </View>
          </View>

          <View style={styles.footer}>
            <CustomButton 
              title={t(STRINGS.invoiceScreen.share)} 
              icon="share-2"
              onPress={handleShare} 
              style={styles.actionBtn}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, marginBottom: 0 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  invoiceCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    paddingBottom: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  section: {
    paddingVertical: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableCol: {
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
  },
  actionBtn: {
    width: '100%',
  }
});
