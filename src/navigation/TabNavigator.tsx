import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../src/components';
import { Colors, STRINGS } from '../constants';
import { useTranslation } from 'react-i18next';
import { 
  HomeScreen, 
  CategoriesScreen, 
  OrdersScreen, 
  CartScreen, 
  ProfileScreen 
} from '../screens';
import { useThemeColor } from '../../src/hooks';

export type TabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  OrdersTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Custom Tab Bar Component to match Figma (Blue Pill for active tab)
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const tabBarBg = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground' as any);
  const tabBarBorder = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const activeColor = useThemeColor({ light: Colors.light.blue900, dark: Colors.dark.blue900 }, 'primaryText' as any);
  const inactiveColor = useThemeColor({ light: Colors.light.gray500, dark: Colors.light.gray400 }, 'secondaryText' as any);
  const activeBg = useThemeColor({ light: Colors.light.blue100, dark: Colors.light.blue900 }, 'secondaryBackground' as any);

  const paddingBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10);
  const height = (Platform.OS === 'ios' ? 65 : 60) + insets.bottom;

  return (
    <View style={[styles.tabBar, { backgroundColor: tabBarBg, borderTopColor: tabBarBorder, paddingBottom, height }]}>
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
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Determine icon name
        let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
        if (route.name === 'HomeTab') iconName = isFocused ? 'home' : 'home-outline';
        if (route.name === 'CategoriesTab') iconName = isFocused ? 'grid' : 'grid-outline';
        if (route.name === 'OrdersTab') iconName = isFocused ? 'receipt' : 'receipt-outline';
        if (route.name === 'CartTab') iconName = isFocused ? 'cart' : 'cart-outline';
        if (route.name === 'ProfileTab') iconName = isFocused ? 'person' : 'person-outline';

        const color = isFocused ? activeColor : inactiveColor;

        return (
          <View key={route.key} style={[styles.tabItemContainer, { flex: isFocused ? 1.8 : 1 }]}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              activeOpacity={0.7}
              style={[
                styles.tabItem, 
                isFocused && { backgroundColor: activeBg } // Light blue pill
              ]}
            >
              <View>
                <Ionicons name={iconName} size={24} color={color} />
                
                {/* Red dot for Cart */}
                {route.name === 'CartTab' && (
                  <View style={styles.notificationDot} />
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
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen 
        name="HomeTab" 
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
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 85 : 70,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    borderTopWidth: 1,
    paddingHorizontal: 10,
  },
  tabItemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24, // Pill shape
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.red600, // Red
    borderWidth: 1,
    borderColor: Colors.light.white,
  }
});
