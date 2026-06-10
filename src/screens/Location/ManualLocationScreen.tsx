
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedView, ThemedText, ThemedInput } from '../../components';
import { ThemeDimension, Colors, STRINGS } from '../../constants';
import { Feather, Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useThemeColor } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { STRINGS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ManualLocation'>;
};

export default function ManualLocationScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const locationIconBg = useThemeColor({ light: Colors.light.gray100, dark: Colors.dark.gray300 }, 'gray100' as any);
  const locationIconColor = useThemeColor({ light: Colors.light.gray500, dark: Colors.light.gray400 }, 'gray500' as any);
  const primaryColor = useThemeColor({}, 'primary');
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  // Debounced OpenStreetMap Nominatim API Fetch
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const timerId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`, {
          headers: {
            'User-Agent': 'QuickBasketApp/1.0',
            'Accept-Language': 'en-US,en;q=0.9'
          }
        });
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.warn('Search error', error);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timerId);
  }, [query]);

  const handleSelectAddress = async (item: any) => {
    await AsyncStorage.setItem('@user_location', JSON.stringify({
      type: 'manual',
      address: item.display_name.split(',').slice(0, 3).join(','), // Take first 3 parts for cleaner UI
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon)
    }));
    navigation.navigate('HomeTab');
  };

  const handleUseCurrentLocation = async () => {
    // Ideally this requests permission, but for mock we just navigate or save a dummy GPS
    await AsyncStorage.setItem('@user_location', JSON.stringify({
      type: 'gps',
      address: 'Current Location',
      latitude: 28.6139,
      longitude: 77.2090
    }));
    navigation.navigate('HomeTab');
  };



  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>{t(STRINGS.manualLocationScreen.title)}</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ThemedInput
          placeholder={t(STRINGS.manualLocationScreen.placeholder)}
          autoFocus
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          isLoading={isLoading}
          styleWrapper={{ marginBottom: 20 }}
        />

        {query.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item, index) => item.place_id ? item.place_id.toString() : index.toString()}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.content}>
                  <ThemedText style={styles.placeholderText}>{t(STRINGS.manualLocationScreen.noResults)}</ThemedText>
                </View>
              ) : null
            }
            renderItem={({ item }) => {
              const parts = item.display_name.split(', ');
              const main = parts[0];
              const sub = parts.slice(1).join(', ');
              return (
                <TouchableOpacity style={styles.addressItem} onPress={() => handleSelectAddress(item)}>
                  <View style={[styles.locationIconBg, { backgroundColor: locationIconBg }]}>
                    <Ionicons name="location-outline" size={20} color={locationIconColor} />
                  </View>
                  <View style={styles.addressTextContainer}>
                    <ThemedText style={styles.addressMain} numberOfLines={1}>{main}</ThemedText>
                    <ThemedText style={styles.addressSub} useSecondaryText numberOfLines={2}>{sub}</ThemedText>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <View style={styles.content}>
            <TouchableOpacity style={styles.currentLocationBtn} onPress={handleUseCurrentLocation}>
              <Ionicons name="locate" size={20} color={primaryColor} />
              <ThemedText style={[styles.currentLocationText, { color: primaryColor }]}>
                {t(STRINGS.manualLocationScreen.useCurrent)}
              </ThemedText>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <Feather name="map" size={48} color={Colors.light.gray300} style={styles.placeholderIcon} />
            <ThemedText style={styles.placeholderText}>{t(STRINGS.manualLocationScreen.deliverySearch)}</ThemedText>
          </View>
        )}
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: ThemeDimension.spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  content: {
    flex: 1,
    alignItems: 'center',
  },
  placeholderIcon: {
    marginBottom: 16,
  },
  placeholderText: {
    color: Colors.light.gray400,
    fontSize: 16,
  },
  listContent: {
    paddingTop: 8,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.gray300,
  },
  locationIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  addressMain: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressSub: {
    fontSize: 13,
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    width: '100%',
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.gray300,
    width: '100%',
    marginVertical: 24,
  }
});
