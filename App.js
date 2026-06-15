import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { View, useColorScheme } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { CartProvider, OrderProvider, AuthProvider, AddressProvider } from "./src/context";
import { LocalizationContextProvider } from "./src/context/localizationContext/LocaleContext";
import { Colors } from "./src/constants/colors";

export default function App() {
  const scheme = useColorScheme() ?? "light";

  const appDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.primaryBackground,
    },
  };

  const appLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.primaryBackground,
    },
  };

  return (
    <SafeAreaProvider>
    <AuthProvider>
      <AddressProvider>
        <CartProvider>
          <OrderProvider>
            <LocalizationContextProvider>
              <View
                style={{
                  flex: 1,
                  backgroundColor:
                    scheme === "dark"
                      ? Colors.dark.primaryBackground
                      : Colors.light.primaryBackground,
                }}
              >
                <NavigationContainer
                  theme={scheme === "dark" ? appDarkTheme : appLightTheme}
                >
                  <StatusBar style="auto" />
                  <AppNavigator />
                </NavigationContainer>
              </View>
            </LocalizationContextProvider>
          </OrderProvider>
        </CartProvider>
      </AddressProvider>
     </AuthProvider>
    </SafeAreaProvider>
  );
}
