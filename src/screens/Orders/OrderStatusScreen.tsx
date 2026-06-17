import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView, ThemedText, CustomButton, ScreenHeader, RefreshableScrollView } from '../../components';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor, useRefresh } from '../../hooks';
import { useOrder, ORDER_STATUS_FLOW } from '../../context';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '../../core/types/navigation';
import { spacing, radius, typography, zIndex } from '../../core/constants/theme';
import { orderApi } from '../../services/orderApi';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderStatus'>;

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

export default function OrderStatusScreen({ navigation, route }: Props) {
  const { getOrderById } = useOrder();
  const { t } = useTranslation();

  const orderId = route.params?.orderId;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as never);
  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as never);
  const errorColor = useThemeColor({ light: Colors.light.error, dark: Colors.dark.error }, 'error' as never);
  const successColor = useThemeColor({ light: Colors.light.success, dark: Colors.dark.success }, 'success' as never);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await orderApi.getOrderById(orderId);
      setOrder(res.data || res);
    } catch (err) {
      console.error(err);
    }
  }, [orderId]);

  const { refreshing, onRefresh } = useRefresh(fetchOrderDetails);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    if (orderId) {
      fetchOrderDetails().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId, fetchOrderDetails]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title={t(STRINGS.orderStatusScreen.title)} onBack={() => navigation.goBack()} />
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
          <ScreenHeader title="Order Not Found" onBack={() => navigation.goBack()} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const getFlowIndex = (statusStr: string) => {
    const s = (statusStr || '').toLowerCase();
    if (s.includes('place') || s.includes('pending')) return 0;
    if (s.includes('process')) return 1;
    if (s.includes('out') || s.includes('delivery')) return 2;
    if (s.includes('deliver')) return 3;
    return -1;
  };

  let currentStatusIndex = ORDER_STATUS_FLOW.indexOf(order.status as any);
  if (currentStatusIndex === -1) {
    currentStatusIndex = getFlowIndex(order.status);
  }
  if (currentStatusIndex === -1) currentStatusIndex = 0;

  const isCancelled = order.status === 'Cancelled' || order.status === 'cancelled';
  const isDelivered = order.status === 'Delivered' || order.status === 'delivered';
  const isCod = order.paymentMethodId === 'cod' || order.paymentMethod?.toLowerCase() === 'cod' || order.paymentMethod?.toLowerCase().includes('cash on delivery');

  const getTranslatedStatus = (status: string) => {
    switch (status) {
      case 'Order Placed': return t(STRINGS.ordersScreen.status.placed);
      case 'Order Confirmed': return t(STRINGS.ordersScreen.status.confirmed);
      case 'Processing': return t(STRINGS.ordersScreen.status.processing);
      case 'Packed': return t(STRINGS.ordersScreen.status.packed);
      case 'Out for Delivery': return t(STRINGS.ordersScreen.status.outForDelivery);
      case 'Delivered': return t(STRINGS.ordersScreen.status.delivered);
      case 'Cancelled': return t(STRINGS.ordersScreen.status.cancelled);
      default: return status;
    }
  };

  const renderTimeline = () => {
    if (isCancelled) {
      return (
        <View style={styles.timelineContainer}>
          <View style={styles.timelineStep}>
            <View style={[styles.timelineDot, { backgroundColor: errorColor, borderColor: errorColor }]} />
            <View style={styles.timelineTextContainer}>
              <ThemedText style={[styles.timelineTitle, { color: errorColor }]}>{t(STRINGS.ordersScreen.status.cancelled)}</ThemedText>
            </View>
          </View>
        </View>
      );
    }

    const timelineMap: Record<number, any> = {};
    if (Array.isArray(order.timeline)) {
      order.timeline.forEach((event: any) => {
        const idx = getFlowIndex(event.status);
        if (idx !== -1) timelineMap[idx] = event;
      });
    }
    
    // Always enforce the actual creation date for the 'Order Placed' step (idx 0),
    // because admin edits while pending shouldn't change the placement time.
    if (timelineMap[0]) {
      timelineMap[0] = { ...timelineMap[0], timestamp: order.createdAt || order.date || timelineMap[0].timestamp };
    } else if (order.createdAt || order.date) {
      timelineMap[0] = { timestamp: order.createdAt || order.date };
    }

    return (
      <View style={styles.timelineContainer}>
        {ORDER_STATUS_FLOW.map((status, index) => {
          const isActive = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const isLast = index === ORDER_STATUS_FLOW.length - 1;
          const event = timelineMap[index];

          return (
            <View key={status} style={styles.timelineStep}>
              <View style={styles.timelineLineContainer}>
                <View style={[
                  styles.timelineDot, 
                  isActive ? { backgroundColor: primaryColor, borderColor: primaryColor } : { backgroundColor: cardColor, borderColor: borderColor }
                ]}>
                  {isActive && <Feather name="check" size={12} color="#FFF" />}
                </View>
                {!isLast && (
                  <View style={[
                    styles.timelineLine, 
                    index < currentStatusIndex ? { backgroundColor: primaryColor } : { backgroundColor: borderColor }
                  ]} />
                )}
              </View>
              
              <View style={styles.timelineTextContainer}>
                <ThemedText style={[styles.timelineTitle, isActive ? { color: primaryColor } : { color: iconColor }]}>
                  {getTranslatedStatus(status)}
                </ThemedText>
                
                {isActive && (
                  <Animated.View style={isCurrent ? { opacity: fadeAnim } : {}}>
                    {event?.timestamp && (
                      <ThemedText useSecondaryText style={styles.timelineSubText}>
                        {formatEstimatedDelivery(event.timestamp)}
                      </ThemedText>
                    )}
                    {event?.notes ? (
                      <ThemedText useSecondaryText style={[styles.timelineSubText, { marginTop: 4, fontStyle: 'italic' }]}>
                        {event.notes}
                      </ThemedText>
                    ) : null}
                  </Animated.View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScreenHeader
          title={t(STRINGS.orderStatusScreen.title)}
          onBack={() => navigation.goBack()}
        />

        <RefreshableScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        >
          <View style={styles.summaryHeader}>
            <ThemedText type="title" style={styles.txId}>#{order.id.slice(-8).toUpperCase()}</ThemedText>
            <ThemedText useSecondaryText>{new Date(order.createdAt || order.created_at || order.date || new Date()).toLocaleString()}</ThemedText>
          </View>

          {/* Tracking Timeline */}
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            <ThemedText type="subtitle" style={styles.cardTitle}>{t(STRINGS.orderStatusScreen.title)}</ThemedText>
            {renderTimeline()}
          </View>

          {/* Details Reused from Success Screen */}
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
              <ThemedText type="subtitle" style={styles.cardTitle}>{t(STRINGS.checkoutScreen.orderItems)} ({order.items?.length || 0})</ThemedText>
              {order.items?.map((item: any) => (
                <View key={item.id || item.productId} style={styles.itemRow}>
                  <ThemedText style={{ fontSize: typography.size.xl }}>{item.emoji || '📦'}</ThemedText>
                  <ThemedText style={{ flex: 1, marginLeft: spacing.smd }}>{item.name || item.Product?.name} <ThemedText useSecondaryText>x{item.quantity}</ThemedText></ThemedText>
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

          {/* Invoice Actions */}
          {!isCancelled && (!isCod || isDelivered) && (
            <View style={styles.invoiceActions}>
              <CustomButton 
                title={t(STRINGS.orderStatusScreen.viewInvoice)} 
                icon="receipt"
                onPress={() => navigation.navigate('Invoice', { orderId: order.id })}
                style={styles.invoiceBtn}
              />
            </View>
          )}
        </RefreshableScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smd,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.size.xl,
    marginBottom: 0,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  summaryHeader: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  txId: {
    fontSize: typography.size.xxxl,
    marginBottom: spacing.xs,
  },
  detailsContainer: {
    paddingHorizontal: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  cardTitle: {
    marginBottom: spacing.md,
    fontSize: typography.size.xl,
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
  
  // Timeline Styles
  timelineContainer: {
    paddingLeft: spacing.sm,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLineContainer: {
    alignItems: 'center',
    width: spacing.xl,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: radius.circle,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: zIndex.base,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: -2,
    marginBottom: -2,
  },
  timelineTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
    paddingBottom: spacing.xl,
  },
  timelineTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  timelineSubText: {
    fontSize: typography.size.md,
  },
  invoiceActions: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  invoiceBtn: {
    width: '100%',
  }
});
