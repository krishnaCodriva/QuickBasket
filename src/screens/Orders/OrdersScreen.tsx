import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView, ThemedText, CustomButton } from '../../components';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useOrder, Order, ORDER_STATUS_FLOW } from '../../context';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useTranslation } from 'react-i18next';

export default function OrdersScreen() {
  const navigation = useNavigation<any>();
  const { orders } = useOrder();
  const { t } = useTranslation();
  
  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);

  const getStatusColor = (status: string) => {
    if (status === 'Delivered') return '#22c55e'; // Green
    if (status === 'Cancelled') return '#ef4444'; // Red
    return primaryColor; // Active color for processing, packed, out for delivery
  };

  const getTranslatedStatus = (status: string) => {
    switch (status) {
      case 'Order Placed': return t(STRINGS.ordersScreen.status.placed);
      case 'Confirmed': return t(STRINGS.ordersScreen.status.confirmed);
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Feather name="box" size={16} color={iconColor} style={{ marginRight: 8 }} />
              <ThemedText style={styles.orderId}>{t(STRINGS.ordersScreen.orderId)}#{item.id.slice(-8)}</ThemedText>
            </View>
            <ThemedText useSecondaryText style={styles.orderDate}>{formattedDate}</ThemedText>
          </View>
          <ThemedText style={[styles.orderAmount, { color: primaryColor }]}>₹{item.totalPayable.toFixed(2)}</ThemedText>
        </View>

        <View style={styles.cardBody}>
          <ThemedText useSecondaryText numberOfLines={1} style={styles.itemsSummary}>
            {item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
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
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            {navigation.canGoBack() && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Feather name="arrow-left" size={24} color={iconColor} />
              </TouchableOpacity>
            )}
            <ThemedText type="subtitle" style={[styles.headerTitle, navigation.canGoBack() && { marginLeft: 16 }]}>{t(STRINGS.ordersScreen.title)}</ThemedText>
            {navigation.canGoBack() && <View style={{ width: 24 }} />}
          </View>
          <View style={styles.emptyContainer}>
            <Feather name="shopping-bag" size={64} color={borderColor} style={{ marginBottom: 16 }} />
            <ThemedText style={{ fontSize: 18, marginBottom: 8 }}>No Orders Yet</ThemedText>
            <ThemedText useSecondaryText style={{ textAlign: 'center', marginBottom: 24 }}>
              Looks like you haven't placed any orders yet.
            </ThemedText>
            <CustomButton 
              title={t(STRINGS.cartScreen.startShopping)} 
              onPress={() => navigation.navigate('HomeTab', { screen: 'Home' })} 
              style={{ width: 200 }}
            />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color={iconColor} />
            </TouchableOpacity>
          )}
          <ThemedText type="subtitle" style={[styles.headerTitle, navigation.canGoBack() && { marginLeft: 16 }]}>{t(STRINGS.ordersScreen.title)}</ThemedText>
          {navigation.canGoBack() && <View style={{ width: 24 }} />}
        </View>
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    marginBottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  itemsSummary: {
    fontSize: 14,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
