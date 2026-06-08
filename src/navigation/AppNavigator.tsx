import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen, LocationScreen, ManualLocationScreen, ProductListingScreen, ProductDetailScreen, CartScreen, LoginScreen, CheckoutScreen, OtpScreen, DummyGoogleScreen, OrderSuccessScreen, OrderStatusScreen, InvoiceScreen } from '../screens';
import TabNavigator from './TabNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Location: undefined;
  ManualLocation: undefined;
  HomeTab: undefined;
  ProductListing: { category?: string; query?: string } | undefined;
  ProductDetail: { product: any } | undefined;
  Cart: undefined;
  Login: undefined;
  OtpScreen: { phoneNumber: string };
  DummyGoogleScreen: { returnTo?: string };
  Checkout: undefined;
  OrderSuccess: { txId: string };
  OrderStatus: { orderId: string };
  Invoice: { orderId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator id="RootStack" initialRouteName="Splash" screenOptions={{ headerShown: false }}>
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
    </Stack.Navigator>
  );
}
