import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView, ThemedText, CustomButton } from '../../components';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { Order } from '../../context';
import { useTranslation } from 'react-i18next';

export default function OrderSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  
  const order: Order = route.params?.order;
  const txId = order?.id || route.params?.txId || 'TXN' + Math.floor(Math.random() * 1000000000);
  
  const scaleValue = useRef(new Animated.Value(0)).current;
  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);

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
              <ThemedText type="defaultSemiBold" style={styles.txId}>{txId}</ThemedText>
            </View>
          </View>

          {order && (
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
                <ThemedText style={{ fontWeight: 'bold', marginBottom: 4 }}>{order.address?.fullName}</ThemedText>
                <ThemedText>{order.address?.address}</ThemedText>
                <ThemedText style={{ marginTop: 4 }}>Mobile: {order.address?.mobile}</ThemedText>
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
                    <ThemedText style={{ fontSize: 18 }}>{item.emoji}</ThemedText>
                    <ThemedText style={{ flex: 1, marginLeft: 12 }}>{item.name} <ThemedText useSecondaryText>x{item.quantity}</ThemedText></ThemedText>
                    <ThemedText>₹{(item.price * item.quantity).toFixed(2)}</ThemedText>
                  </View>
                ))}
              </View>

              <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                <ThemedText type="subtitle" style={styles.cardTitle}>{t(STRINGS.checkoutScreen.total)}</ThemedText>
                <View style={styles.amountRow}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.itemSubtotal)}</ThemedText><ThemedText>₹{order.subtotal?.toFixed(2)}</ThemedText></View>
                {order.discount > 0 && <View style={styles.amountRow}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.discounts)}</ThemedText><ThemedText style={{ color: '#22c55e' }}>-₹{order.discount?.toFixed(2)}</ThemedText></View>}
                <View style={styles.amountRow}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.deliveryCharges)}</ThemedText><ThemedText>₹{order.deliveryCharge?.toFixed(2)}</ThemedText></View>
                <View style={styles.amountRow}><ThemedText useSecondaryText>{t(STRINGS.cartScreen.taxes)}</ThemedText><ThemedText>₹{order.taxes?.toFixed(2)}</ThemedText></View>
                <View style={[styles.amountRow, { borderTopWidth: 1, borderTopColor: borderColor, paddingTop: 12, marginTop: 12 }]}><ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>{t(STRINGS.cartScreen.totalPayable)}</ThemedText><ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>₹{order.totalPayable?.toFixed(2)}</ThemedText></View>
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <CustomButton 
              title={t(STRINGS.orderSuccessScreen.viewOrder)} 
              type="secondary"
              onPress={handleViewOrder} 
              style={[styles.homeBtn, { marginBottom: 16 }]}
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
    paddingBottom: 40,
  },
  successHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  txBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  txLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  txId: {
    fontSize: 18,
    letterSpacing: 1,
  },
  detailsContainer: {
    paddingHorizontal: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 12,
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  homeBtn: {
    width: '100%',
  }
});
