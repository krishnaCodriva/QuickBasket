import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText, Badge } from "../components";
import { Colors, STRINGS } from "../constants";
import { useCart } from "../context";
import { useTranslation } from "react-i18next";
import { spacing, radius, typography } from "../core/constants/theme";
import {
  HomeScreen,
  CategoriesScreen,
  OrdersScreen,
  CartScreen,
  ProfileScreen,
} from "../screens";
import { useThemeColor } from "../hooks";
import type { TabParamList } from "../core/types/navigation";

const Tab = createBottomTabNavigator<TabParamList>();

// Custom Tab Bar Component to match Figma (Blue Pill for active tab)
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { totalItems } = useCart();
  const tabBarBg = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.secondaryBackground },
    "secondaryBackground" as never,
  );
  const tabBarBorder = useThemeColor(
    { light: Colors.light.gray200, dark: Colors.dark.gray300 },
    "gray200" as never,
  );
  const activeColor = useThemeColor(
    { light: Colors.light.blue900, dark: Colors.dark.blue900 },
    "primaryText" as never,
  );
  const inactiveColor = useThemeColor(
    { light: Colors.light.gray500, dark: Colors.light.gray400 },
    "secondaryText" as never,
  );
  const activeBg = useThemeColor(
    { light: Colors.light.blue100, dark: Colors.light.blue900 },
    "secondaryBackground" as never,
  );
  const bgColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.secondaryBackground },
    "secondaryBackground" as never,
  );

  const paddingBottom = Math.max(
    insets.bottom,
    Platform.OS === "ios" ? 20 : 10,
  );
  const height = (Platform.OS === "ios" ? 65 : 60) + insets.bottom;

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: tabBarBg,
          borderTopColor: tabBarBorder,
          paddingBottom,
          height,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Determine icon name
        let iconName: keyof typeof Ionicons.glyphMap = "home-outline";
        if (route.name === "Home")
          iconName = isFocused ? "home" : "home-outline";
        if (route.name === "CategoriesTab")
          iconName = isFocused ? "grid" : "grid-outline";
        if (route.name === "OrdersTab")
          iconName = isFocused ? "receipt" : "receipt-outline";
        if (route.name === "CartTab")
          iconName = isFocused ? "cart" : "cart-outline";
        if (route.name === "ProfileTab")
          iconName = isFocused ? "person" : "person-outline";

        const color = isFocused ? activeColor : inactiveColor;

        return (
          <View
            key={route.key}
            style={[styles.tabItemContainer, { flex: isFocused ? 1.8 : 1 }]}
          >
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              activeOpacity={0.7}
              style={[
                styles.tabItem,
                isFocused && { backgroundColor: activeBg }, // Light blue pill
              ]}
            >
              <View>
                <Ionicons name={iconName} size={24} color={color} />

                {/* Cart badge — shows real item count from cart context */}
                {route.name === "CartTab" && totalItems > 0 && (
                  <Badge
                    count={totalItems}
                    color="primary"
                    borderColor={bgColor}
                    style={styles.cartBadge}
                  />
                )}
              </View>

              {isFocused && (
                <ThemedText style={[styles.tabLabel, { color }]}>
                  {label as string}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

export default function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      id="MainTabNavigator"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: t(STRINGS.navigation.home) }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesScreen}
        options={{ tabBarLabel: t(STRINGS.navigation.categories) }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{ tabBarLabel: t(STRINGS.navigation.orders) }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{ tabBarLabel: t(STRINGS.navigation.cart) }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: t(STRINGS.navigation.profile) }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 90 : 80,
    paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    paddingHorizontal: spacing.smd,
  },
  tabItemContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill, // Pill shape
  },
  tabLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    marginLeft: spacing.sm,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -6,
  },
});
