import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView, ThemedText, CustomButton } from '../../components';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useOrder } from '../../context';
import { useTranslation } from 'react-i18next';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function InvoiceScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { getOrderById } = useOrder();
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const orderId = route.params?.orderId;
  const order = getOrderById(orderId);
  const [isSharing, setIsSharing] = useState(false);

  const openPdf = async (fileUri: string) => {
    try {
      let contentUri = fileUri;
      if (fileUri.startsWith('file://')) {
        contentUri = await FileSystem.getContentUriAsync(fileUri);
      }
      
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: 'application/pdf'
      });
    } catch (err) {
      console.log("Error opening PDF: ", err);
      Alert.alert("Error", "Could not open the PDF. Please check your chosen folder to view it.");
    }
  };

  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const successColor = useThemeColor({ light: Colors.light.success, dark: Colors.dark.success }, 'success' as any);

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
      setIsSharing(true);
      const html = generateInvoiceHtml();
      
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { 
          UTI: '.pdf', 
          mimeType: 'application/pdf',
          dialogTitle: 'Share Invoice'
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      console.log('Error sharing invoice:', error);
      Alert.alert("Error", "Could not share the invoice.");
    } finally {
      setIsSharing(false);
    }
  };

  const generateInvoiceHtml = () => {
    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td>${item.name}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #0f9b58; padding-bottom: 20px; margin-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #0f9b58; }
            .invoice-title { font-size: 20px; color: #555; margin-top: 5px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .section-title { font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; color: #333; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals-container { margin-top: 30px; width: 50%; float: right; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .grand-total { font-size: 20px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
            .footer { margin-top: 100px; text-align: center; color: #888; font-size: 12px; clear: both; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">QuickBasket</div>
            <div class="invoice-title">Tax Invoice / Bill of Supply</div>
          </div>

          <div class="row">
            <div>
              <div class="section-title" style="margin-top:0;">Billed To</div>
              <strong>${order.address?.fullName}</strong><br />
              ${order.address?.address}<br />
              Mobile: ${order.address?.mobile}
            </div>
            <div class="text-right">
              <div class="section-title" style="margin-top:0;">Invoice Details</div>
              <strong>Invoice #:</strong> ${invoiceNumber}<br />
              <strong>Order ID:</strong> ${order.id}<br />
              <strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString()}<br />
              <strong>Payment Method:</strong> ${order.paymentMethodId ? t(`checkoutScreen.paymentMethods.${order.paymentMethodId}_label` as any, { defaultValue: order.paymentMethod }) : order.paymentMethod}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals-container">
            <div class="total-row">
              <span>Subtotal</span>
              <span>₹${order.subtotal?.toFixed(2)}</span>
            </div>
            ${order.discount > 0 ? `
            <div class="total-row" style="color: #22c55e;">
              <span>Discount</span>
              <span>-₹${order.discount?.toFixed(2)}</span>
            </div>` : ''}
            <div class="total-row">
              <span>Delivery</span>
              <span>₹${order.deliveryCharge?.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Taxes</span>
              <span>₹${order.taxes?.toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <span>Grand Total</span>
              <span>₹${order.totalPayable?.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            This is a computer-generated invoice and does not require a physical signature.<br />
            Thank you for shopping with QuickBasket!
          </div>
        </body>
      </html>
    `;
  };

  const savePdfToAndroidDir = async (pdfUri: string, directoryUri: string, invoiceNum: string) => {
    const base64 = await FileSystem.readAsStringAsync(pdfUri, { encoding: FileSystem.EncodingType.Base64 });
    const savedUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, invoiceNum, 'application/pdf');
    await FileSystem.writeAsStringAsync(savedUri, base64, { encoding: FileSystem.EncodingType.Base64 });
    
    Alert.alert(
      'Download Complete',
      `${invoiceNum}.pdf has been saved to your chosen folder.`,
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Open File', onPress: () => openPdf(savedUri) }
      ]
    );
  };

  const handleDownloadInvoice = async () => {
    try {
      setIsGenerating(true);
      const html = generateInvoiceHtml();
      
      const { uri } = await Print.printToFileAsync({ html });
      
      if (Platform.OS === 'android') {
        const savedDirUri = await AsyncStorage.getItem('downloadDirectoryUri');

        if (savedDirUri) {
          try {
            await savePdfToAndroidDir(uri, savedDirUri, invoiceNumber);
            return;
          } catch (e) {
            // Permission might have been revoked or folder deleted, fall through to ask again
            console.log("Failed to use saved directory URI, asking again.");
          }
        }

        // If no saved dir or it failed, ask once
        Alert.alert(
          "One-Time Setup",
          "Android requires you to select a folder (like Downloads) to save your invoices. We will remember this folder for all future automatic downloads.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Select Folder", 
              onPress: async () => {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (permissions.granted) {
                  await AsyncStorage.setItem('downloadDirectoryUri', permissions.directoryUri);
                  await savePdfToAndroidDir(uri, permissions.directoryUri, invoiceNumber);
                }
              }
            }
          ]
        );
      } else {
        // iOS: The standard way to download a file is through the share sheet (Save to Files)
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { 
            UTI: '.pdf', 
            mimeType: 'application/pdf',
            dialogTitle: 'Download Invoice'
          });
        }
      }
    } catch (error) {
      console.log('Error generating PDF:', error);
      Alert.alert("Error", "Could not download the invoice.");
    } finally {
      setIsGenerating(false);
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
                <ThemedText type="subtitle">{t(STRINGS.invoiceScreen.companyName as any)}</ThemedText>
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
              {order.discount > 0 && <View style={styles.rowBetween}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.discounts)}</ThemedText><ThemedText style={{ color: successColor }}>-₹{order.discount?.toFixed(2)}</ThemedText></View>}
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
                {t(STRINGS.checkoutScreen.paymentMethod)}: {order.paymentMethodId ? t(`checkoutScreen.paymentMethods.${order.paymentMethodId}_label` as any, { defaultValue: order.paymentMethod }) : order.paymentMethod}
              </ThemedText>
              <ThemedText useSecondaryText style={{ textAlign: 'center', fontSize: 12, marginTop: 4 }}>
                {t(STRINGS.invoiceScreen.computerGenerated as any)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.footer}>
            <CustomButton 
              title={isGenerating ? "Generating PDF..." : "Download PDF Invoice"} 
              icon="download"
              onPress={handleDownloadInvoice} 
              style={[styles.actionBtn, { marginBottom: 12 }]}
              loading={isGenerating}
            />
            <CustomButton 
              title={isSharing ? "Preparing PDF..." : t(STRINGS.invoiceScreen.share)} 
              icon="share-variant"
              onPress={handleShare} 
              style={[styles.actionBtn, { backgroundColor: cardColor, borderColor: primaryColor, borderWidth: 1 }]}
              loading={isSharing}
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
