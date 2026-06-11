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
} from "react-native";
import { ThemedView, ThemedText, ThemedInput, ScreenHeader, EmptyState } from "../../components";
import { ThemeDimension, Colors, STRINGS } from "../../constants";
import { Feather, Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StorageService, STORAGE_KEYS } from '../../services';
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useThemeColor } from "../../hooks";
import { useTranslation } from "react-i18next";
import { spacing, radius, typography } from '../../core/constants/theme';

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

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    await StorageService.setItem(STORAGE_KEYS.USER_LOCATION, {
      type: "manual",
      address: item.display_name.split(",").slice(0, 3).join(","), // Take first 3 parts for cleaner UI
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    });
    navigation.navigate("HomeTab");
  };

  const handleUseCurrentLocation = async () => {
    // Ideally this requests permission, but for mock we just navigate or save a dummy GPS
    await StorageService.setItem(STORAGE_KEYS.USER_LOCATION, {
      type: "gps",
      address: "Current Location",
      latitude: 28.6139,
      longitude: 77.209,
    });
    navigation.navigate("HomeTab");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ThemedView style={styles.container}>
        <ScreenHeader 
          title={t(STRINGS.manualLocationScreen.title)} 
          onBack={() => navigation.goBack()} 
          showBorder={false}
          style={{ paddingHorizontal: 0, paddingTop: 0 }}
        />

        <ThemedInput
          placeholder={t(STRINGS.manualLocationScreen.placeholder)}
          autoFocus
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery("")}
          isLoading={isLoading}
          styleWrapper={{ marginBottom: 20 }}
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
              style={styles.currentLocationBtn}
              onPress={handleUseCurrentLocation}
            >
              <Ionicons name="locate" size={20} color={primaryColor} />
              <ThemedText
                style={[styles.currentLocationText, { color: primaryColor }]}
              >
                {t(STRINGS.manualLocationScreen.useCurrent)}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.divider} />

            <EmptyState 
              icon={<Feather name="map" size={48} color={Colors.light.gray300} />}
              title={t(STRINGS.manualLocationScreen.deliverySearch)}
              containerStyle={{ marginTop: spacing.xl }}
            />
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
  currentLocationBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: spacing.smd,
    width: "100%",
  },
  currentLocationText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    marginLeft: spacing.smd,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.gray300,
    width: "100%",
    marginVertical: spacing.xl,
  },
});
