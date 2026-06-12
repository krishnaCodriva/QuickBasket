import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { ThemedView, ThemedText, CustomButton, ScreenHeader } from "../../components";
import { STRINGS, ThemeDimension, Colors } from "../../constants";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StorageService, STORAGE_KEYS } from "../../services";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useThemeColor, useLocationServiceability } from "../../hooks";
import { useTranslation } from "react-i18next";
import { spacing, radius, typography, elevation } from "../../core/constants/theme";

type Props = {
  navigation: any;
};

type ViewState = "initial" | "denied" | "failed";

export default function LocationScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("initial");
  const { verifyLocation } = useLocationServiceability();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

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
  
  const primaryBrandColor = useThemeColor({}, "primary" as any);
  const badgeBgColor = useThemeColor({ light: '#F3F4F6', dark: Colors.dark.gray800 }, "background" as any);
  const badgeTextColor = useThemeColor({ light: Colors.light.gray700, dark: Colors.dark.gray300 }, "primaryText" as any);


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

        // Check serviceability
        const isServiceable = await verifyLocation(location.coords.latitude, location.coords.longitude);
        
        if (!isServiceable) {
          setLoading(false);
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
        setLoading(false);
        navigation.reset({ index: 0, routes: [{ name: "HomeTab" }] });
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
    navigation.reset({ index: 0, routes: [{ name: "HomeTab" }] });
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
    <View style={{ flex: 1 }}>
      <ScreenHeader 
        title={t(STRINGS.common.appName)} 
        onBack={handleBack}
        showBorder={false}
        rightElement={
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={24} color={iconColor} />
          </TouchableOpacity>
        }
      />
      <View style={styles.contentContainer}>
        <View style={styles.illustrationContainer}>
        <Image 
          source={require('../../../assets/location_illustration.jpg')} 
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.textContainer}>
        <ThemedText type="title" style={styles.title}>
          {t(STRINGS.locationScreen.initialTitle)}
        </ThemedText>
        <ThemedText useSecondaryText style={styles.subtitle}>
          {t(STRINGS.locationScreen.initialSubtitle)}
        </ThemedText>
        
        <View style={[styles.privacyBadge, { backgroundColor: badgeBgColor }]}>
          <Feather name="lock" size={12} color={primaryBrandColor} style={{ marginRight: 6 }} />
          <ThemedText style={[styles.privacyText, { color: badgeTextColor }]}>
            {t(STRINGS.locationScreen.privacyBadge)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <CustomButton
          title={t(STRINGS.locationScreen.enableButton)}
          type="primary"
          onPress={enableLocation}
          loading={loading}
          icon="crosshairs-gps"
        />
        <CustomButton
          title={t(STRINGS.locationScreen.enterAddressButton)}
          type="secondary"
          onPress={handleManualAddress}
          icon="home-outline"
        />
        <TouchableOpacity style={styles.textLinkButton} onPress={handleSkip}>
          <ThemedText useSecondaryText style={styles.textLink}>
            {t(STRINGS.locationScreen.chooseManuallyButton)}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <View style={[styles.mapBackground, { backgroundColor: mapPlaceholderBg }]} />
      
      <View style={[styles.bottomSheet, { backgroundColor: badgeBgColor }]}>
        <View style={styles.dragPillContainer}>
          <View style={[styles.dragPill, { backgroundColor: mapPlaceholderBg }]} />
        </View>
        
        <View style={styles.errorIconContainer}>
          <View style={[styles.circleIconSmall, { backgroundColor: errorCircleBg }]}>
            <MaterialCommunityIcons
              name="map-marker-off"
              size={36}
              color={errorIconColor}
            />
          </View>
        </View>

        <View style={styles.errorTextContainer}>
          <ThemedText type="title" style={styles.errorTitle}>
            {t(STRINGS.locationScreen.errorTitle)}
          </ThemedText>
          <ThemedText useSecondaryText style={styles.errorSubtitle}>
            {t(STRINGS.locationScreen.errorSubtitle)}
          </ThemedText>
        </View>

        <View style={styles.errorActions}>
          <CustomButton
            title={t(STRINGS.locationScreen.tryAgainButton)}
            type="primary"
            onPress={enableLocation}
            icon="reload"
            loading={loading}
          />
          <CustomButton
            title={t(STRINGS.locationScreen.enterAddressButton)}
            type="tertiary"
            onPress={handleManualAddress}
          />
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {viewState === "initial" ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            {
              paddingTop: Math.max(insets.top + spacing.md, spacing.xxxl),
              paddingBottom: Math.max(insets.bottom + spacing.sm, spacing.smd),
            },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {renderInitialState()}
        </ScrollView>
      ) : (
        renderErrorState()
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  illustrationContainer: {
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
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
    borderRadius: radius.circle,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  errorContainer: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.md,
    alignItems: 'center',
    ...elevation.xl,
  },
  dragPillContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dragPill: {
    width: 48,
    height: 5,
    borderRadius: radius.pill,
  },
  errorIconContainer: {
    marginBottom: spacing.lg,
  },
  circleIconSmall: {
    width: 80,
    height: 80,
    borderRadius: radius.circle,
    justifyContent: "center",
    alignItems: "center",
  },
  errorTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  errorSubtitle: {
    textAlign: "center",
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.xl,
  },
  errorTextContainer: {
    alignItems: "center",
    width: '100%',
  },
  errorActions: {
    width: '100%',
  },
  textContainer: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.extraBold,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: spacing.smd,
    lineHeight: typography.lineHeight.relaxed,
    fontSize: typography.size.md,
    marginBottom: spacing.lg,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
  },
  privacyText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 0,
    paddingBottom: spacing.sm,
  },
  textLinkButton: {
    width: "100%",
    paddingVertical: spacing.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  textLink: {
    fontSize: typography.size.smmd,
    fontWeight: typography.weight.semiBold,
  },
  helpButton: {
    padding: spacing.sm,
    marginRight: -spacing.sm,
  },
  heroImage: {
    width: '100%',
    height: 280,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
});
