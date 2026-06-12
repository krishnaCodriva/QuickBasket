import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ThemedView, ThemedText, ThemedInput, ScreenHeader, EmptyState } from "../../components";
import { ThemeDimension, Colors, STRINGS } from "../../constants";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StorageService, STORAGE_KEYS } from '../../services';
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useThemeColor, useLocationServiceability } from "../../hooks";
import { useTranslation } from "react-i18next";
import { spacing, radius, typography, elevation } from '../../core/constants/theme';
import { MOCK_RECENT_SEARCHES, MOCK_POPULAR_AREAS } from "../../data/mockData";
import * as Location from "expo-location";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ManualLocation">;
};

export default function ManualLocationScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const iconColor = useThemeColor(
    { light: Colors.light.black, dark: Colors.light.white },
    "primaryText" as any,
  );
  const locationIconBg = useThemeColor(
    { light: Colors.light.gray100, dark: Colors.dark.gray300 },
    "gray100" as any,
  );
  const locationIconColor = useThemeColor(
    { light: Colors.light.gray500, dark: Colors.light.gray400 },
    "gray500" as any,
  );
  const primaryColor = useThemeColor({}, "primary");
  const sectionTitleColor = useThemeColor({ light: Colors.light.gray500, dark: Colors.light.gray400 }, "secondaryText" as any);
  const cardBg = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, "primaryBackground" as any);
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, "secondaryBackground" as any);
  const lightGreenBg = useThemeColor({ light: Colors.light.transparentGreen015, dark: Colors.dark.transparentGreen015 }, "secondaryBackground" as any);
  const searchInputBg = useThemeColor({ light: Colors.light.blue100, dark: Colors.dark.secondaryBackground }, "secondaryBackground" as any);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { verifyLocation } = useLocationServiceability();

  // Debounced OpenStreetMap Nominatim API Fetch
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const timerId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
          {
            headers: {
              "User-Agent": "QuickBasketApp/1.0",
              "Accept-Language": "en-US,en;q=0.9",
            },
          },
        );
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.warn("Search error", error);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timerId);
  }, [query]);

  const handleSelectAddress = async (item: any) => {
    setIsLoading(true);
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    
    // Check serviceability
    const isServiceable = await verifyLocation(lat, lon);
    
    if (!isServiceable) {
      setIsLoading(false);
      Alert.alert(
        "Out of Delivery Zone",
        "Sorry, we don't deliver to this area yet. Please select a different location."
      );
      return;
    }

    await StorageService.setItem(STORAGE_KEYS.USER_LOCATION, {
      type: "manual",
      address: item.display_name.split(",").slice(0, 3).join(","), // Take first 3 parts for cleaner UI
      latitude: lat,
      longitude: lon,
    });
    setIsLoading(false);
    navigation.reset({ index: 0, routes: [{ name: "HomeTab" }] });
  };

  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const gpsEnabled = await Location.hasServicesEnabledAsync();
      if (!gpsEnabled) {
        setIsLoading(false);
        Alert.alert(
          t(STRINGS.locationScreen.turnOnGpsTitle),
          t(STRINGS.locationScreen.turnOnGpsMessage),
        );
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setIsLoading(false);
        Alert.alert(
          t(STRINGS.locationScreen.deniedTitle),
          t(STRINGS.locationScreen.deniedSubtitle)
        );
        return;
      }

      let location;
      try {
        let locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        let timeoutPromise = new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 4000),
        );

        location = await Promise.race([locationPromise, timeoutPromise]);
      } catch (err) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
        });
      }

      if (location) {
        let addressStr = t(STRINGS.locationScreen.unknownLocation);
        try {
          let addressObj = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (addressObj && addressObj.length > 0) {
            const first = addressObj[0];
            if (first.formattedAddress) {
              addressStr = first.formattedAddress;
            } else {
              const part1 = first.street || first.name || first.subregion || "";
              const part2 = first.city || first.district || first.region || "";
              if (part1 && part2 && part1 !== part2) {
                addressStr = `${part1}, ${part2}`;
              } else if (part1 || part2) {
                addressStr = part1 || part2;
              }
            }
          }
        } catch (e) {
          console.log("Reverse geocode failed", e);
        }

        // Check serviceability
        const isServiceable = await verifyLocation(location.coords.latitude, location.coords.longitude);
        
        if (!isServiceable) {
          setIsLoading(false);
          Alert.alert(
            "Out of Delivery Zone",
            "Sorry, we don't deliver to this area yet. Please select a different location."
          );
          return;
        }

        await StorageService.setItem(STORAGE_KEYS.USER_LOCATION, {
          type: "gps",
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: addressStr,
        });
        setIsLoading(false);
        navigation.reset({ index: 0, routes: [{ name: "HomeTab" }] });
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        t(STRINGS.locationScreen.failedTitle),
        t(STRINGS.locationScreen.failedSubtitle)
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ThemedView style={styles.container}>
        <ScreenHeader 
          title={t(STRINGS.common.appName)} 
          titleStyle={{ color: primaryColor }}
          onBack={() => navigation.goBack()} 
          showBorder={false}
          rightElement={<Ionicons name="help-circle-outline" size={24} color={iconColor} />}
          style={{ paddingHorizontal: 0, paddingTop: 0 }}
        />

        <ThemedInput
          placeholder={t(STRINGS.manualLocationScreen.placeholder)}
          autoFocus
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery("")}
          isLoading={isLoading}
          styleWrapper={{ 
            marginBottom: spacing.xl, 
            borderColor: primaryColor, 
            borderWidth: 1,
            backgroundColor: searchInputBg
          }}
        />

        {query.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item, index) =>
              item.place_id ? item.place_id.toString() : index.toString()
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !isLoading ? (
                <EmptyState 
                  icon={<Feather name="search" size={48} color={Colors.light.gray300} />}
                  title={t(STRINGS.manualLocationScreen.noResults)}
                />
              ) : null
            }
            renderItem={({ item }) => {
              const parts = item.display_name.split(", ");
              const main = parts[0];
              const sub = parts.slice(1).join(", ");
              return (
                <TouchableOpacity
                  style={styles.addressItem}
                  onPress={() => handleSelectAddress(item)}
                >
                  <View
                    style={[
                      styles.locationIconBg,
                      { backgroundColor: locationIconBg },
                    ]}
                  >
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={locationIconColor}
                    />
                  </View>
                  <View style={styles.addressTextContainer}>
                    <ThemedText style={styles.addressMain} numberOfLines={1}>
                      {main}
                    </ThemedText>
                    <ThemedText
                      style={styles.addressSub}
                      useSecondaryText
                      numberOfLines={2}
                    >
                      {sub}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <View style={styles.content}>
            <TouchableOpacity
              style={[styles.useCurrentCard, { backgroundColor: cardBg }]}
              onPress={handleUseCurrentLocation}
            >
              <View style={[styles.targetIconBg, { backgroundColor: lightGreenBg }]}>
                <MaterialCommunityIcons name="target" size={20} color={primaryColor} />
              </View>
              <View style={styles.useCurrentTextContainer}>
                <ThemedText style={[styles.useCurrentTitle, { color: primaryColor }]}>
                  {t(STRINGS.manualLocationScreen.useCurrent)}
                </ThemedText>
                <ThemedText useSecondaryText style={styles.useCurrentSubtitle}>
                  {t(STRINGS.manualLocationScreen.autoDetectLocation)}
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={iconColor} />
            </TouchableOpacity>

            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
              {t(STRINGS.manualLocationScreen.recentSearches)}
            </ThemedText>
            
            <View style={[styles.mockListCard, { backgroundColor: cardBg }]}>
              {MOCK_RECENT_SEARCHES.map((item, index) => (
                <View key={item.id}>
                  <TouchableOpacity style={styles.mockListItem} onPress={() => setQuery(item.title)}>
                    <MaterialCommunityIcons name="history" size={22} color={locationIconColor} style={styles.mockListIcon} />
                    <View style={styles.mockListTextContainer}>
                      <ThemedText style={styles.mockListTitle}>{item.title}</ThemedText>
                      <ThemedText useSecondaryText style={styles.mockListSubtitle}>{item.subtitle}</ThemedText>
                    </View>
                  </TouchableOpacity>
                  {index < MOCK_RECENT_SEARCHES.length - 1 && <View style={[styles.mockDivider, { backgroundColor: borderColor }]} />}
                </View>
              ))}
            </View>

            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, marginTop: spacing.xl }]}>
              {t(STRINGS.manualLocationScreen.popularNearbyAreas)}
            </ThemedText>

            <View style={[styles.mockListCard, { backgroundColor: cardBg }]}>
              {MOCK_POPULAR_AREAS.map((item, index) => (
                <View key={item.id}>
                  <TouchableOpacity style={styles.mockListItem} onPress={() => setQuery(item.title)}>
                    <Ionicons name="location-outline" size={22} color={locationIconColor} style={styles.mockListIcon} />
                    <View style={styles.mockListTextContainer}>
                      <ThemedText style={styles.mockListTitle}>{item.title}</ThemedText>
                      <ThemedText useSecondaryText style={styles.mockListSubtitle}>{item.subtitle}</ThemedText>
                    </View>
                  </TouchableOpacity>
                  {index < MOCK_POPULAR_AREAS.length - 1 && <View style={[styles.mockDivider, { backgroundColor: borderColor }]} />}
                </View>
              ))}
            </View>
          </View>
        )}
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  headerTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingTop: spacing.sm,
  },
  addressItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.smd,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.gray300,
  },
  locationIconBg: {
    width: 40,
    height: 40,
    borderRadius: radius.circle,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.smd,
  },
  addressTextContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  addressMain: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    marginBottom: spacing.xs,
  },
  addressSub: {
    fontSize: typography.size.sm,
  },
  useCurrentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.xxxl,
    ...elevation.sm,
  },
  targetIconBg: {
    width: 40,
    height: 40,
    borderRadius: radius.circle,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  useCurrentTextContainer: {
    flex: 1,
  },
  useCurrentTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  useCurrentSubtitle: {
    fontSize: typography.size.sm,
    marginTop: spacing.xxs,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.md,
  },
  mockListCard: {
    borderRadius: radius.lg,
    overflow: "hidden",
    ...elevation.sm,
  },
  mockListItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  mockListIcon: {
    marginRight: spacing.md,
  },
  mockListTextContainer: {
    flex: 1,
  },
  mockListTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
  },
  mockListSubtitle: {
    fontSize: typography.size.sm,
    marginTop: spacing.xxs,
  },
  mockDivider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
});
