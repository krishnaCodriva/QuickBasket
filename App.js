import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { View, useColorScheme, ActivityIndicator } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { CartProvider, OrderProvider, AuthProvider, AddressProvider } from "./src/context";
import { LocalizationContextProvider } from "./src/context/localizationContext/LocaleContext";
import { Colors } from "./src/constants/colors";
import { useAuth } from "./src/context/AuthContext";

const RootContent = ({ scheme, appDarkTheme, appLightTheme }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor:
            scheme === "dark"
              ? Colors.dark.primaryBackground
              : Colors.light.primaryBackground,
        }}
      >
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
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
  );
};

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
        <RootContent
          scheme={scheme}
          appDarkTheme={appDarkTheme}
          appLightTheme={appLightTheme}
        />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
