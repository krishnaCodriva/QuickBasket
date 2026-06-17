import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView, ThemedText, CustomButton } from '../../components';
import { Feather } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '../../core/types/navigation';
import { spacing, radius, typography, elevation } from '../../core/constants/theme';
import { orderApi } from '../../services/orderApi';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderSuccess'>;

const formatEstimatedDelivery = (dateStr?: string) => {
  if (!dateStr) return 'Standard Delivery';
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  return dateStr;
};

export default function OrderSuccessScreen({ navigation, route }: Props) {
  const { t } = useTranslation();

  const passedOrder = route.params?.order;
  const passedId = passedOrder?.id;
  
  const [order, setOrder] = useState<any>(passedOrder?.items ? passedOrder : null);
  const [loading, setLoading] = useState(!passedOrder?.items && !!passedId);

  const txId = order?.id || passedId || 'N/A';
  
  const scaleValue = useRef(new Animated.Value(0)).current;
  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as never);
  const successColor = useThemeColor({ light: Colors.light.success, dark: Colors.dark.success }, 'success' as never);


  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    if (!passedOrder?.items && passedId) {
      orderApi.getOrderById(passedId)
        .then(res => {
          setOrder(res.data || res);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [passedId]);

  const handleContinueShopping = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'HomeTab' }],
      })
    );
  };

  const handleViewOrder = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'HomeTab', params: { screen: 'OrdersTab' } }],
      })
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.successHeader}>
            <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleValue }], backgroundColor: primaryColor }]}>
              <Feather name="check" size={50} color={Colors.light.white} />
            </Animated.View>
            
            <ThemedText type="title" style={styles.title}>{t(STRINGS.orderSuccessScreen.title)}</ThemedText>
            <ThemedText useSecondaryText style={styles.subtitle}>
              {t(STRINGS.orderSuccessScreen.subtitle)}
            </ThemedText>
            
            <View style={[styles.txBox, { backgroundColor: cardColor, borderColor, borderWidth: 1 }]}>
              <ThemedText useSecondaryText style={styles.txLabel}>{t(STRINGS.invoiceScreen.orderId)}</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.txId}>#{txId.slice(-8).toUpperCase()}</ThemedText>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: spacing.xl }} />
          ) : order && (
            <View style={styles.detailsContainer}>
              <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                <ThemedText type="subtitle" style={styles.cardTitle}>{t(STRINGS.orderStatusScreen.estimatedDelivery)}</ThemedText>
                <ThemedText>
                  {formatEstimatedDelivery(order.estimatedDelivery || order.estimatedDeliveryTime)}
                </ThemedText>
              </View>

              <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                <ThemedText type="subtitle" style={styles.cardTitle}>{t(STRINGS.orderStatusScreen.deliveryAddress)}</ThemedText>
                {(order.customer?.name || order.address?.fullName) && (
                  <ThemedText style={{ fontWeight: typography.weight.bold, marginBottom: spacing.xs }}>
                    {order.customer?.name || order.address?.fullName}
                  </ThemedText>
                )}
                <ThemedText>{order.deliveryAddress || order.address?.address || order.address?.addressLine1}</ThemedText>
                {(order.customer?.phone || order.address?.mobile) && (
                  <ThemedText style={{ marginTop: spacing.xs }}>Mobile: {order.customer?.phone || order.address?.mobile}</ThemedText>
                )}
              </View>

              <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                <ThemedText type="subtitle" style={styles.cardTitle}>{t(STRINGS.checkoutScreen.paymentMethod)}</ThemedText>
                <ThemedText>
                  {order.paymentMethodId 
                    ? t(`checkoutScreen.paymentMethods.${order.paymentMethodId}_label` as any, { defaultValue: order.paymentMethod })
                    : order.paymentMethod}
                </ThemedText>
              </View>

              <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                <ThemedText type="subtitle" style={styles.cardTitle}>{t(STRINGS.checkoutScreen.orderItems)} ({order.items?.length})</ThemedText>
                {order.items?.map((item: any) => (
                  <View key={item.id || item.productId} style={styles.itemRow}>
                    <ThemedText style={{ fontSize: typography.size.xl }}>{item.emoji || '📦'}</ThemedText>
                    <ThemedText style={{ flex: 1, marginLeft: spacing.smd }}>
                      {item.name || item.Product?.name} <ThemedText useSecondaryText>x{item.quantity}</ThemedText>
                    </ThemedText>
                    <ThemedText>₹{(item.price * item.quantity).toFixed(2)}</ThemedText>
                  </View>
                ))}
              </View>

              <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                <ThemedText type="subtitle" style={styles.cardTitle}>{t(STRINGS.checkoutScreen.total)}</ThemedText>
                {order.subtotal !== undefined && <View style={styles.amountRow}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.itemSubtotal)}</ThemedText><ThemedText>₹{Number(order.subtotal).toFixed(2)}</ThemedText></View>}
                {order.discount > 0 && <View style={styles.amountRow}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.discounts)}</ThemedText><ThemedText style={{ color: successColor }}>-₹{Number(order.discount).toFixed(2)}</ThemedText></View>}
                {order.deliveryCharge !== undefined && <View style={styles.amountRow}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.deliveryCharges)}</ThemedText><ThemedText>₹{Number(order.deliveryCharge).toFixed(2)}</ThemedText></View>}
                {order.taxes !== undefined && <View style={styles.amountRow}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.taxes)}</ThemedText><ThemedText>₹{Number(order.taxes).toFixed(2)}</ThemedText></View>}
                <View style={[styles.amountRow, { borderTopWidth: 1, borderTopColor: borderColor, paddingTop: spacing.smd, marginTop: spacing.smd }]}><ThemedText style={{ fontWeight: typography.weight.bold, fontSize: typography.size.lg }}>{t(STRINGS.cartScreen.totalPayable)}</ThemedText><ThemedText style={{ fontWeight: typography.weight.bold, fontSize: typography.size.lg }}>₹{Number(order.totalPayable || order.totalAmount || order.grandTotal || 0).toFixed(2)}</ThemedText></View>
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <CustomButton 
              title={t(STRINGS.orderSuccessScreen.viewOrder)} 
              type="secondary"
              onPress={handleViewOrder} 
              style={[styles.homeBtn, { marginBottom: spacing.md }]}
            />
            <CustomButton 
              title={t(STRINGS.orderSuccessScreen.continueShopping)} 
              onPress={handleContinueShopping} 
              style={styles.homeBtn}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  successHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...elevation.md,
  },
  title: {
    fontSize: typography.size.xxl,
    textAlign: 'center',
    marginBottom: spacing.smd,
  },
  subtitle: {
    fontSize: typography.size.lg,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  txBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    width: '100%',
  },
  txLabel: {
    fontSize: typography.size.md,
    marginBottom: spacing.xs,
  },
  txId: {
    fontSize: typography.size.xl,
    letterSpacing: 1,
  },
  detailsContainer: {
    paddingHorizontal: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardTitle: {
    marginBottom: spacing.smd,
    fontSize: typography.size.lg,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.smd,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  homeBtn: {
    width: '100%',
  }
});
