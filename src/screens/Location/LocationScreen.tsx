
import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { ThemedView, ThemedText, CustomButton } from '../../components';
import { STRINGS, ThemeDimension, Colors } from '../../constants';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks';
import { useTranslation } from 'react-i18next';

type Props = {
  navigation: any;
};

type ViewState = 'initial' | 'denied' | 'failed';

export default function LocationScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('initial');
  const { t } = useTranslation();
  
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const circleIconBg = useThemeColor({ light: Colors.light.gray100, dark: Colors.dark.secondaryBackground }, 'secondaryBackground' as any);

  const enableLocation = async () => {
    setLoading(true);
    try {
      const gpsEnabled = await Location.hasServicesEnabledAsync();
      if (!gpsEnabled) {
        setLoading(false);
        alert('Please turn on GPS');
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLoading(false);
        setViewState('denied');
        return;
      }

      // Permission granted, now fetch location. Add timeout to prevent infinite hang if GPS is off.
      let locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      let timeoutPromise = new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 8000)
      );

      let location = await Promise.race([locationPromise, timeoutPromise]);
      
      if (location) {
        // Log the raw coordinates so the user can inspect them in the terminal!
        console.log('\n📍 Raw GPS Coordinates Fetched:', JSON.stringify(location.coords, null, 2));

        // Reverse geocode to get a human-readable address
        let addressStr = 'Unknown Location';
        try {
          let addressObj = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
          
          // Log the reverse geocode response from the OS
          console.log('\n🗺️ Raw Reverse Geocode Response:', JSON.stringify(addressObj, null, 2));

          if (addressObj && addressObj.length > 0) {
            const first = addressObj[0];
            
            // If the native OS provides a beautifully pre-formatted full address, use it!
            if (first.formattedAddress) {
              addressStr = first.formattedAddress;
            } else {
              // Otherwise, manually piece together the best available components
              const part1 = first.street || first.name || first.subregion || '';
              const part2 = first.city || first.district || first.region || '';
              if (part1 && part2 && part1 !== part2) {
                 addressStr = `${part1}, ${part2}`;
              } else if (part1 || part2) {
                 addressStr = part1 || part2;
              }
            }
          }
        } catch (e) {
          console.log('Reverse geocode failed', e);
        }

        await AsyncStorage.setItem('@user_location', JSON.stringify({
          type: 'gps',
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: addressStr
        }));
        setLoading(false);
        navigation.navigate('HomeTab');
      }
    } catch (error) {
      setLoading(false);
      // If it throws or times out, show the Failed state
      setViewState('failed');
    }
  };

  const handleManualAddress = () => {
    navigation.navigate('ManualLocation'); 
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If arrived via replace (e.g., from Splash), go back to Splash
      navigation.replace('Splash');
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };
  const PrimaryButton = ({ title, onPress, icon }: { title: string, onPress: () => void, icon?: boolean }) => (
    <CustomButton title={title} type="primary" onPress={onPress} loading={loading} icon={icon ? "reload" : undefined} />
  );

  const SecondaryButton = ({ title, onPress }: { title: string, onPress: () => void }) => (
    <CustomButton title={title} type="secondary" onPress={onPress} />
  );

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
        <View style={styles.mapPlaceholder}>
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
        <PrimaryButton title={t(STRINGS.locationScreen.enableButton)} onPress={enableLocation} />
        <TouchableOpacity style={styles.textLinkButton} onPress={handleManualAddress}>
          <ThemedText style={styles.textLink}>{t(STRINGS.locationScreen.chooseManuallyButton)}</ThemedText>
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
          <Feather name="map-pin" size={40} color={Colors.light.gray900} style={styles.strikeIcon} />
          <View style={styles.strikeLine} />
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
        <PrimaryButton title={t(STRINGS.locationScreen.openSettingsButton)} onPress={openSettings} />
        <SecondaryButton title={t(STRINGS.locationScreen.enterAddressButton)} onPress={handleManualAddress} />
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
        <View style={[styles.circleIcon, { backgroundColor: Colors.light.red100 }]}>
          <Feather name="map-pin" size={40} color={Colors.light.red600} style={styles.strikeIconRed} />
          <View style={styles.strikeLineRed} />
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
        <PrimaryButton title={t(STRINGS.locationScreen.retryButton)} onPress={enableLocation} icon />
        <SecondaryButton title={t(STRINGS.locationScreen.enterAddressButton)} onPress={handleManualAddress} />
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {viewState === 'initial' && renderInitialState()}
      {viewState === 'denied' && renderDeniedState()}
      {viewState === 'failed' && renderFailedState()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: ThemeDimension.spacing.xl,
    paddingTop: 50,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  topSpacer: {
    flex: 0.8,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mapPlaceholder: {
    width: 200,
    height: 250,
    backgroundColor: Colors.light.gray200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  strikeIcon: {
    opacity: 0.8,
  },
  strikeLine: {
    position: 'absolute',
    width: 60,
    height: 3,
    backgroundColor: Colors.light.gray900,
    transform: [{ rotate: '-45deg' }],
  },
  strikeIconRed: {
    opacity: 0.9,
  },
  strikeLineRed: {
    position: 'absolute',
    width: 60,
    height: 3,
    backgroundColor: Colors.light.red600,
    transform: [{ rotate: '-45deg' }],
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: Colors.light.black, 
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: Colors.light.white,
    fontSize: ThemeDimension.fontSize.m,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: Colors.light.white,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: ThemeDimension.fontSize.m,
    color: Colors.light.black,
    fontWeight: 'bold',
  },
  textLinkButton: {
    width: '100%',
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textLink: {
    fontSize: ThemeDimension.fontSize.m,
    fontWeight: '600',
  }
});
