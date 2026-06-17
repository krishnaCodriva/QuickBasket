/**
 * AppNavigator.tsx
 * Refactored under the QuickBasket Enterprise Architecture Plan.
 *
 * Changes:
 * - RootStackParamList imported from core/types (single source of truth)
 * - ProductDetail param typed with Product (no more `any`)
 * - Import is re-exported so other files can use it from the same location
 */

import React from 'react';
import { useColorScheme } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  SplashScreen,
  LocationScreen,
  ManualLocationScreen,
  ProductListingScreen,
  ProductDetailScreen,
  CartScreen,
  LoginScreen,
  CheckoutScreen,
  OtpScreen,
  DummyGoogleScreen,
  OrderSuccessScreen,
  OrderStatusScreen,
  InvoiceScreen,
  EditProfileScreen,
  OrdersScreen,
} from '../screens';
import TabNavigator from './TabNavigator';
import { Colors } from '../constants/colors';
import type { RootStackParamList } from '../core/types/navigation';

// Re-export so screens can import from here or from core/types
export type { RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const isDark = useColorScheme() === 'dark';

  return (
    <Stack.Navigator
      id="RootStack"
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark
            ? Colors.dark.primaryBackground
            : Colors.light.primaryBackground,
        },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Location" component={LocationScreen} />
      <Stack.Screen name="ManualLocation" component={ManualLocationScreen} />
      <Stack.Screen name="HomeTab" component={TabNavigator} />
      <Stack.Screen name="ProductListing" component={ProductListingScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OtpScreen" component={OtpScreen} />
      <Stack.Screen name="DummyGoogleScreen" component={DummyGoogleScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
    </Stack.Navigator>
  );
}
