import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView, ThemedText, CustomButton, ScreenHeader } from '../../components';
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
import { StorageService, STORAGE_KEYS } from '../../services';
import { spacing, radius, typography, elevation } from '../../core/constants/theme';



export default function InvoiceScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { getOrderById } = useOrder();
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);

  const orderId = route.params?.orderId;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      import('../../services/orderApi').then(({ orderApi }) => {
        orderApi.getOrderById(orderId)
          .then(res => setOrder(res.data || res))
          .catch(console.error)
          .finally(() => setLoading(false));
      });
    } else {
      setLoading(false);
    }
  }, [orderId]);
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
      console.log('Error opening PDF: ', err);
      Alert.alert(t(STRINGS.invoiceScreen.error), t(STRINGS.invoiceScreen.errorOpenPdf));
    }
  };

  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const successColor = useThemeColor({ light: Colors.light.success, dark: Colors.dark.success }, 'success' as any);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title={t(STRINGS.invoiceScreen.title)} onBack={() => navigation.goBack()} />
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!order) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader
            title={t(STRINGS.invoiceScreen.notFound)}
            onBack={() => navigation.goBack()}
          />
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
          dialogTitle: t(STRINGS.invoiceScreen.share)
        });
      } else {
        Alert.alert(t(STRINGS.invoiceScreen.error), t(STRINGS.invoiceScreen.sharingUnavailable));
      }
    } catch (error) {
      console.log('Error sharing invoice:', error);
      Alert.alert(t(STRINGS.invoiceScreen.error), t(STRINGS.invoiceScreen.errorSharing));
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
              <div class="section-title" style="margin-top:0;">${t(STRINGS.invoiceScreen.pdfBilledTo)}</div>
              <strong>${order.customer?.name || order.address?.fullName || ''}</strong><br />
              ${order.deliveryAddress || order.address?.address || ''}<br />
              Mobile: ${order.customer?.phone || order.address?.mobile || ''}
            </div>
            <div class="text-right">
              <div class="section-title" style="margin-top:0;">${t(STRINGS.invoiceScreen.pdfInvoiceDetails)}</div>
              <strong>${t(STRINGS.invoiceScreen.pdfInvoiceNo)}</strong> ${invoiceNumber}<br />
              <strong>${t(STRINGS.invoiceScreen.pdfOrderId)}</strong> ${order.id}<br />
              <strong>${t(STRINGS.invoiceScreen.pdfOrderDate)}</strong> ${new Date(order.createdAt || order.date || new Date()).toLocaleDateString()}<br />
              <strong>${t(STRINGS.invoiceScreen.pdfPaymentMethod)}</strong> ${order.paymentMethodId ? t(`checkoutScreen.paymentMethods.${order.paymentMethodId}_label` as any, { defaultValue: order.paymentMethod }) : order.paymentMethod}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>${t(STRINGS.invoiceScreen.pdfItemDescription)}</th>
                <th class="text-center">${t(STRINGS.invoiceScreen.qty)}</th>
                <th class="text-right">${t(STRINGS.invoiceScreen.price)}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals-container">
            ${order.subtotal !== undefined ? `
            <div class="total-row">
              <span>${t(STRINGS.invoiceScreen.pdfSubtotal)}</span>
              <span>₹${Number(order.subtotal).toFixed(2)}</span>
            </div>` : ''}
            ${order.discount > 0 ? `
            <div class="total-row" style="color: #22c55e;">
              <span>${t(STRINGS.invoiceScreen.pdfDiscount)}</span>
              <span>-₹${Number(order.discount).toFixed(2)}</span>
            </div>` : ''}
            ${order.deliveryCharge !== undefined ? `
            <div class="total-row">
              <span>${t(STRINGS.invoiceScreen.pdfDelivery)}</span>
              <span>₹${Number(order.deliveryCharge).toFixed(2)}</span>
            </div>` : ''}
            ${order.taxes !== undefined ? `
            <div class="total-row">
              <span>${t(STRINGS.invoiceScreen.pdfTaxes)}</span>
              <span>₹${Number(order.taxes).toFixed(2)}</span>
            </div>` : ''}
            <div class="total-row grand-total">
              <span>${t(STRINGS.invoiceScreen.pdfGrandTotal)}</span>
              <span>₹${Number(order.totalPayable || order.totalAmount || order.grandTotal || 0).toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            ${t(STRINGS.invoiceScreen.pdfFooter)}
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
      t(STRINGS.invoiceScreen.downloadComplete),
      `${invoiceNum}.pdf ${t(STRINGS.invoiceScreen.downloadCompleteMsg)}`,
      [
        { text: t(STRINGS.invoiceScreen.later), style: 'cancel' },
        { text: t(STRINGS.invoiceScreen.openFile), onPress: () => openPdf(savedUri) }
      ]
    );
  };

  const handleDownloadInvoice = async () => {
    try {
      setIsGenerating(true);
      const html = generateInvoiceHtml();

      const { uri } = await Print.printToFileAsync({ html });

      if (Platform.OS === 'android') {
        const savedDirUri = await StorageService.getItem(STORAGE_KEYS.DOWNLOAD_DIRECTORY_URI);

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
          t(STRINGS.invoiceScreen.setupTitle),
          t(STRINGS.invoiceScreen.setupMessage),
          [
            { text: t(STRINGS.checkoutScreen.deleteAddressCancel), style: 'cancel' },
            {
              text: t(STRINGS.invoiceScreen.selectFolder),
              onPress: async () => {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (permissions.granted) {
                  await StorageService.setItem(STORAGE_KEYS.DOWNLOAD_DIRECTORY_URI, permissions.directoryUri);
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
      Alert.alert(t(STRINGS.invoiceScreen.error), t(STRINGS.invoiceScreen.errorDownload));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScreenHeader
          title={t(STRINGS.invoiceScreen.title)}
          onBack={() => navigation.goBack()}
          rightElement={
            <TouchableOpacity onPress={handleShare}>
              <Feather name="share-2" size={24} color={primaryColor} />
            </TouchableOpacity>
          }
        />

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
                <ThemedText>{new Date(order.createdAt || order.date || new Date()).toLocaleDateString()}</ThemedText>
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
              <ThemedText type="subtitle" style={{ marginBottom: spacing.sm, fontSize: typography.size.lg }}>{t(STRINGS.invoiceScreen.customerDetails)}</ThemedText>
              <ThemedText style={{ fontWeight: typography.weight.bold }}>{order.customer?.name || order.address?.fullName}</ThemedText>
              <ThemedText>{order.deliveryAddress || order.address?.address}</ThemedText>
              <ThemedText>Mobile: {order.customer?.phone || order.address?.mobile}</ThemedText>
            </View>

            {/* Product Table */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={{ marginBottom: spacing.smd, fontSize: typography.size.lg }}>{t(STRINGS.checkoutScreen.orderItems)}</ThemedText>

              <View style={[styles.tableHeader, { backgroundColor: borderColor, opacity: 0.8 }]}>
                <ThemedText style={[styles.tableCol, { flex: 3, fontWeight: typography.weight.bold }]}>{t(STRINGS.invoiceScreen.item)}</ThemedText>
                <ThemedText style={[styles.tableCol, { flex: 1, fontWeight: typography.weight.bold, textAlign: 'center' }]}>{t(STRINGS.invoiceScreen.qty)}</ThemedText>
                <ThemedText style={[styles.tableCol, { flex: 1, fontWeight: typography.weight.bold, textAlign: 'right' }]}>{t(STRINGS.invoiceScreen.price)}</ThemedText>
              </View>

              {(order.items || []).map((item: any) => (
                <View key={item.id || item.productId} style={[styles.tableRow, { borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                  <ThemedText style={[styles.tableCol, { flex: 3 }]}>{item.name}</ThemedText>
                  <ThemedText style={[styles.tableCol, { flex: 1, textAlign: 'center' }]}>{item.quantity}</ThemedText>
                  <ThemedText style={[styles.tableCol, { flex: 1, textAlign: 'right' }]}>₹{(item.price * item.quantity).toFixed(2)}</ThemedText>
                </View>
              ))}
            </View>

            {/* Totals */}
            <View style={[styles.section, { backgroundColor: borderColor, opacity: 0.9, borderRadius: 8, padding: 16, marginTop: 8 }]}>
              {order.subtotal !== undefined && <View style={styles.rowBetween}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.itemSubtotal)}</ThemedText><ThemedText>₹{Number(order.subtotal).toFixed(2)}</ThemedText></View>}
              {order.discount > 0 && <View style={styles.rowBetween}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.discounts)}</ThemedText><ThemedText style={{ color: successColor }}>-₹{Number(order.discount).toFixed(2)}</ThemedText></View>}
              {order.deliveryCharge !== undefined && <View style={styles.rowBetween}><ThemedText useSecondaryText>{t(STRINGS.invoiceScreen.deliveryFee)}</ThemedText><ThemedText>₹{Number(order.deliveryCharge).toFixed(2)}</ThemedText></View>}
              {order.taxes !== undefined && <View style={styles.rowBetween}><ThemedText useSecondaryText>{t(STRINGS.invoiceScreen.taxes)}</ThemedText><ThemedText>₹{Number(order.taxes).toFixed(2)}</ThemedText></View>}
              <View style={[styles.rowBetween, { borderTopWidth: 1, borderTopColor: cardColor, paddingTop: spacing.smd, marginTop: spacing.smd }]}>
                <ThemedText style={{ fontWeight: typography.weight.bold, fontSize: typography.size.lg }}>{t(STRINGS.invoiceScreen.grandTotal)}</ThemedText>
                <ThemedText style={{ fontWeight: typography.weight.bold, fontSize: typography.size.lg, color: primaryColor }}>₹{Number(order.totalPayable || order.totalAmount || order.grandTotal || 0).toFixed(2)}</ThemedText>
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
              type="secondary"
              onPress={handleShare}
              style={[styles.actionBtn, { borderColor: primaryColor, borderWidth: 1 }]}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smd,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: { fontSize: typography.size.xl, marginBottom: 0 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxxl },
  invoiceCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    paddingBottom: 0,
    ...elevation.sm,
  },
  section: {
    paddingVertical: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderRadius: radius.xs,
    marginBottom: spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  tableCol: {
    fontSize: typography.size.md,
  },
  footer: {
    marginTop: spacing.xl,
  },
  actionBtn: {
    width: '100%',
  }
});
