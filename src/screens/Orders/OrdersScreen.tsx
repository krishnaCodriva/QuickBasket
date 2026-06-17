import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView, ThemedText, ScreenHeader, EmptyState } from '../../components';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOrder, Order, ORDER_STATUS_FLOW } from '../../context';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import type { RootStackParamList } from '../../core/types/navigation';
import { spacing, radius, typography, elevation } from '../../core/constants/theme';

export default function OrdersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { orders, fetchOrders, isLoading } = useOrder();
  const { t } = useTranslation();
  
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );
  
  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const errorColor = useThemeColor({ light: Colors.light.error, dark: Colors.dark.error }, 'error' as any);
  const successColor = useThemeColor({ light: Colors.light.success, dark: Colors.dark.success }, 'success' as any);

  const getStatusColor = (status: string) => {
    if (status === 'Delivered') return successColor;
    if (status === 'Cancelled') return errorColor;
    return primaryColor; // use existing primaryColor
  };

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

  const renderOrderItem = ({ item }: { item: Order }) => {
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <TouchableOpacity 
        style={[styles.orderCard, { backgroundColor: cardColor, borderColor }]}
        onPress={() => navigation.navigate('OrderStatus', { orderId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
              <Feather name="box" size={16} color={iconColor} style={{ marginRight: spacing.sm }} />
              <ThemedText style={styles.orderId}>{t(STRINGS.ordersScreen.orderId)}#{item.id.slice(-8).toUpperCase()}</ThemedText>
            </View>
            <ThemedText useSecondaryText style={styles.orderDate}>{formattedDate}</ThemedText>
          </View>
          <ThemedText style={[styles.orderAmount, { color: primaryColor }]}>₹{item.totalPayable.toFixed(2)}</ThemedText>
        </View>

        <View style={styles.cardBody}>
          <ThemedText useSecondaryText numberOfLines={1} style={styles.itemsSummary}>
            {item.items && item.items.length > 0 
              ? item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
              : `Payment Method: ${item.paymentMethod}`}
          </ThemedText>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: borderColor }]}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getTranslatedStatus(item.status)}
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={iconColor} />
        </View>
      </TouchableOpacity>
    );
  };

  if (orders.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader
            title={t(STRINGS.ordersScreen.title)}
            onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
          />
          <EmptyState
            emoji="🛍️"
            title={t(STRINGS.ordersScreen.noOrders)}
            subtitle={t(STRINGS.ordersScreen.noOrdersSub)}
            buttonText={t(STRINGS.cartScreen.startShopping)}
            onButtonPress={() => navigation.navigate('HomeTab', { screen: 'Home' })}
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title={t(STRINGS.ordersScreen.title)}
          onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        />
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchOrders}
          refreshing={isLoading}
        />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smd,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.size.xxl,
    marginBottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  orderCard: {
    borderRadius: radius.lg,
    marginBottom: spacing.mlg,
    ...elevation.sm,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    paddingBottom: spacing.smd,
  },
  orderId: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  orderDate: {
    fontSize: typography.size.md,
  },
  orderAmount: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  cardBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  itemsSummary: {
    fontSize: typography.size.md,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.smd,
    paddingHorizontal: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.smd,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
  },
  statusDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radius.xs,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
  },
});
