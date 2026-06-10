import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView, ThemedText, CustomButton, ScreenHeader } from '../../components';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useOrder, ORDER_STATUS_FLOW } from '../../context';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '../../core/types/navigation';
import { spacing, radius, typography, zIndex } from '../../core/constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderStatus'>;

export default function OrderStatusScreen({ navigation, route }: Props) {
  const { getOrderById } = useOrder();
  const { t } = useTranslation();

  const orderId = route.params?.orderId;

  const order = getOrderById(orderId);

  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as never);
  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as never);
  const errorColor = useThemeColor({ light: Colors.light.error, dark: Colors.dark.error }, 'error' as never);
  const successColor = useThemeColor({ light: Colors.light.success, dark: Colors.dark.success }, 'success' as never);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!order) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title="Order Not Found" onBack={() => navigation.goBack()} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const currentStatusIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';

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

    return (
      <View style={styles.timelineContainer}>
        {ORDER_STATUS_FLOW.map((status, index) => {
          const isActive = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const isLast = index === ORDER_STATUS_FLOW.length - 1;

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
                {isCurrent && (
                  <Animated.View style={{ opacity: fadeAnim }}>
                    <ThemedText useSecondaryText style={styles.timelineSubText}>
                      {getTranslatedStatus(status)}
                    </ThemedText>
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

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryHeader}>
            <ThemedText type="title" style={styles.txId}>#{order.id.slice(-8)}</ThemedText>
            <ThemedText useSecondaryText>{new Date(order.date).toLocaleString()}</ThemedText>
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
                {order.estimatedDelivery === 'Arriving in 30-45 mins' 
                  ? t(STRINGS.orderStatusScreen.estimatedDeliveryMock as any) 
                  : order.estimatedDelivery}
              </ThemedText>
            </View>

            <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
              <ThemedText type="subtitle" style={styles.cardTitle}>{t(STRINGS.orderStatusScreen.deliveryAddress)}</ThemedText>
              <ThemedText style={{ fontWeight: typography.weight.bold, marginBottom: spacing.xs }}>{order.address?.fullName}</ThemedText>
              <ThemedText>{order.address?.address}</ThemedText>
              <ThemedText style={{ marginTop: spacing.xs }}>Mobile: {order.address?.mobile}</ThemedText>
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
              {order.items?.map(item => (
                <View key={item.id} style={styles.itemRow}>
                  <ThemedText style={{ fontSize: typography.size.xl }}>{item.emoji}</ThemedText>
                  <ThemedText style={{ flex: 1, marginLeft: spacing.smd }}>{item.name} <ThemedText useSecondaryText>x{item.quantity}</ThemedText></ThemedText>
                  <ThemedText>₹{(item.price * item.quantity).toFixed(2)}</ThemedText>
                </View>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
              <ThemedText type="subtitle" style={styles.cardTitle}>{t(STRINGS.checkoutScreen.total)}</ThemedText>
              <View style={styles.amountRow}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.itemSubtotal)}</ThemedText><ThemedText>₹{order.subtotal?.toFixed(2)}</ThemedText></View>
              {order.discount > 0 && <View style={styles.amountRow}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.discounts)}</ThemedText><ThemedText style={{ color: successColor }}>-₹{order.discount?.toFixed(2)}</ThemedText></View>}
              <View style={styles.amountRow}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.deliveryCharges)}</ThemedText><ThemedText>₹{order.deliveryCharge?.toFixed(2)}</ThemedText></View>
              <View style={styles.amountRow}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.taxes)}</ThemedText><ThemedText>₹{order.taxes?.toFixed(2)}</ThemedText></View>
              <View style={[styles.amountRow, { borderTopWidth: 1, borderTopColor: borderColor, paddingTop: spacing.smd, marginTop: spacing.smd }]}><ThemedText style={{ fontWeight: typography.weight.bold, fontSize: typography.size.lg }}>{t(STRINGS.cartScreen.totalPayable)}</ThemedText><ThemedText style={{ fontWeight: typography.weight.bold, fontSize: typography.size.lg }}>₹{order.totalPayable?.toFixed(2)}</ThemedText></View>
            </View>
          </View>

          {/* Invoice Actions */}
          {order.status === 'Delivered' && (
            <View style={styles.invoiceActions}>
              <CustomButton 
                title={t(STRINGS.orderStatusScreen.viewInvoice)} 
                icon="receipt"
                onPress={() => navigation.navigate('Invoice', { orderId: order.id })}
                style={styles.invoiceBtn}
              />
            </View>
          )}
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
