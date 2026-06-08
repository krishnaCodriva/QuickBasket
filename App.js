import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider, OrderProvider } from './src/context';
import { LocalizationContextProvider } from "./src/context/localizationContext/LocaleContext";


export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <OrderProvider>
          <LocalizationContextProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </LocalizationContextProvider>
        </OrderProvider>
      </CartProvider>
    </SafeAreaProvider>
  );
}
