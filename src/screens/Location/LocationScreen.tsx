import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { ThemedView, ThemedText, CustomButton } from "../../components";
import { STRINGS, ThemeDimension, Colors } from "../../constants";
import * as Location from "expo-location";
import { StorageService, STORAGE_KEYS } from "../../services";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "../../hooks";
import { useTranslation } from "react-i18next";
import { spacing, radius, typography } from "../../core/constants/theme";

type Props = {
  navigation: any;
};

type ViewState = "initial" | "denied" | "failed";

export default function LocationScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("initial");
  const { t } = useTranslation();

  const iconColor = useThemeColor(
    { light: Colors.light.black, dark: Colors.light.white },
    "primaryText" as any,
  );
  const circleIconBg = useThemeColor(
    { light: Colors.light.gray100, dark: Colors.dark.secondaryBackground },
    "secondaryBackground" as any,
  );
  const mapPlaceholderBg = useThemeColor(
    { light: Colors.light.gray200, dark: Colors.dark.gray500 },
    "secondaryBackground" as any,
  );
  const strikeIconColor = useThemeColor(
    { light: Colors.light.gray900, dark: Colors.dark.gray100 },
    "primaryText" as any,
  );
  const errorCircleBg = useThemeColor(
    { light: Colors.light.red100, dark: Colors.dark.transparentWhite01 },
    "error" as any,
  );
  const errorIconColor = useThemeColor(
    { light: Colors.light.red600, dark: Colors.dark.error },
    "error" as any,
  );

  const enableLocation = async () => {
    setLoading(true);
    try {
      const gpsEnabled = await Location.hasServicesEnabledAsync();
      if (!gpsEnabled) {
        setLoading(false);
        Alert.alert(
          t(STRINGS.locationScreen.turnOnGpsTitle),
          t(STRINGS.locationScreen.turnOnGpsMessage),
        );
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLoading(false);
        setViewState("denied");
        return;
      }

      // Tier 1: Attempt high-accuracy fresh fetch with a fast 4-second timeout
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
        console.log(
          "Balanced fetch failed or timed out. Trying Live Network fallback.",
        );

        // Tier 2: Instant live network fallback (Wifi/Cell Tower triangulation)
        // This avoids stale 'Last Known Location' data while bypassing GPS hardware freezes.
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
        });
      }

      if (location) {
        // Log the raw coordinates so the user can inspect them in the terminal!
        console.log(
          "\n📍 Raw GPS Coordinates Fetched:",
          JSON.stringify(location.coords, null, 2),
        );

        // Reverse geocode to get a human-readable address
        let addressStr = t(STRINGS.locationScreen.unknownLocation);
        try {
          let addressObj = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          // Log the reverse geocode response from the OS
          console.log(
            "\n🗺️ Raw Reverse Geocode Response:",
            JSON.stringify(addressObj, null, 2),
          );

          if (addressObj && addressObj.length > 0) {
            const first = addressObj[0];

            // If the native OS provides a beautifully pre-formatted full address, use it!
            if (first.formattedAddress) {
              addressStr = first.formattedAddress;
            } else {
              // Otherwise, manually piece together the best available components
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

        await StorageService.setItem(STORAGE_KEYS.USER_LOCATION, {
          type: "gps",
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: addressStr,
        });
        setLoading(false);
        navigation.navigate("HomeTab");
      }
    } catch (error) {
      setLoading(false);
      // If it throws or times out, show the Failed state
      setViewState("failed");
    }
  };

  const handleManualAddress = () => {
    navigation.navigate("ManualLocation");
  };

  const handleSkip = () => {
    // Navigate to Home without saving location to AsyncStorage
    // This ensures SplashScreen will redirect here again next time
    navigation.navigate("HomeTab");
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If arrived via replace (e.g., from Splash), go back to Splash
      navigation.replace("Splash");
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };
  const PrimaryButton = ({
    title,
    onPress,
    icon,
  }: {
    title: string;
    onPress: () => void;
    icon?: boolean;
  }) => (
    <CustomButton
      title={title}
      type="primary"
      onPress={onPress}
      loading={loading}
      icon={icon ? "reload" : undefined}
    />
  );

  const SecondaryButton = ({
    title,
    onPress,
  }: {
    title: string;
    onPress: () => void;
  }) => <CustomButton title={title} type="secondary" onPress={onPress} />;

  const renderInitialState = () => (
    <View style={styles.contentContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>QuickBasket</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.topSpacer} />

      <View style={styles.illustrationContainer}>
        <View
          style={[styles.mapPlaceholder, { backgroundColor: mapPlaceholderBg }]}
        >
          <Feather name="map-pin" size={40} color={Colors.light.gray400} />
        </View>
      </View>

      <View style={styles.textContainer}>
        <ThemedText type="title" style={styles.title}>
          {t(STRINGS.locationScreen.initialTitle)}
        </ThemedText>
        <ThemedText useSecondaryText style={styles.subtitle}>
          {t(STRINGS.locationScreen.initialSubtitle)}
        </ThemedText>
      </View>

      <View style={styles.bottomContainer}>
        <PrimaryButton
          title={t(STRINGS.locationScreen.enableButton)}
          onPress={enableLocation}
        />
        <View style={{ height: 12 }} />
        <SecondaryButton
          title={t(STRINGS.locationScreen.enterAddressButton)}
          onPress={handleManualAddress}
        />
        <TouchableOpacity style={styles.textLinkButton} onPress={handleSkip}>
          <ThemedText style={styles.textLink}>
            {t(STRINGS.locationScreen.chooseManuallyButton)}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDeniedState = () => (
    <View style={styles.contentContainer}>
      <View style={styles.headerRow}>
        <View style={{ width: 24 }} />
        <ThemedText style={styles.headerTitle}>QuickBasket</ThemedText>
        <Feather name="shopping-cart" size={24} color={iconColor} />
      </View>

      <View style={styles.topSpacer} />

      <View style={styles.illustrationContainer}>
        <View style={[styles.circleIcon, { backgroundColor: circleIconBg }]}>
          <Feather
            name="map-pin"
            size={40}
            color={strikeIconColor}
            style={styles.strikeIcon}
          />
          <View
            style={[styles.strikeLine, { backgroundColor: strikeIconColor }]}
          />
        </View>
      </View>

      <View style={styles.textContainer}>
        <ThemedText type="title" style={styles.title}>
          {t(STRINGS.locationScreen.deniedTitle)}
        </ThemedText>
        <ThemedText useSecondaryText style={styles.subtitle}>
          {t(STRINGS.locationScreen.deniedSubtitle)}
        </ThemedText>
      </View>

      <View style={styles.bottomContainer}>
        <PrimaryButton
          title={t(STRINGS.locationScreen.openSettingsButton)}
          onPress={openSettings}
        />
        <SecondaryButton
          title={t(STRINGS.locationScreen.enterAddressButton)}
          onPress={handleManualAddress}
        />
      </View>
    </View>
  );

  const renderFailedState = () => (
    <View style={styles.contentContainer}>
      <View style={styles.headerRow}>
        <View style={{ width: 24 }} />
        <ThemedText style={styles.headerTitle}>QuickBasket</ThemedText>
        <Feather name="shopping-cart" size={24} color={iconColor} />
      </View>

      <View style={styles.topSpacer} />

      <View style={styles.illustrationContainer}>
        <View style={[styles.circleIcon, { backgroundColor: errorCircleBg }]}>
          <Feather
            name="map-pin"
            size={40}
            color={errorIconColor}
            style={styles.strikeIconRed}
          />
          <View
            style={[styles.strikeLineRed, { backgroundColor: errorIconColor }]}
          />
        </View>
      </View>

      <View style={styles.textContainer}>
        <ThemedText type="title" style={styles.title}>
          {t(STRINGS.locationScreen.failedTitle)}
        </ThemedText>
        <ThemedText useSecondaryText style={styles.subtitle}>
          {t(STRINGS.locationScreen.failedSubtitle)}
        </ThemedText>
      </View>

      <View style={styles.bottomContainer}>
        <PrimaryButton
          title={t(STRINGS.locationScreen.retryButton)}
          onPress={enableLocation}
          icon
        />
        <SecondaryButton
          title={t(STRINGS.locationScreen.enterAddressButton)}
          onPress={handleManualAddress}
        />
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {viewState === "initial" && renderInitialState()}
      {viewState === "denied" && renderDeniedState()}
      {viewState === "failed" && renderFailedState()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  topSpacer: {
    flex: 0.8,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  mapPlaceholder: {
    width: 200,
    height: 250,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  circleIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  strikeIcon: {
    opacity: 0.8,
  },
  strikeLine: {
    position: "absolute",
    width: 60,
    height: 3,
    transform: [{ rotate: "-45deg" }],
  },
  strikeIconRed: {
    opacity: 0.9,
  },
  strikeLineRed: {
    position: "absolute",
    width: 60,
    height: 3,
    transform: [{ rotate: "-45deg" }],
  },
  textContainer: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  title: {
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: spacing.smd,
    lineHeight: 20,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: spacing.smd,
  },

  textLinkButton: {
    width: "100%",
    paddingVertical: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  textLink: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
  },
});
