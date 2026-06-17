import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ThemedText, CustomButton } from '../../components';
import * as Location from 'expo-location';
import ThemedInput from '../../components/ThemedInput';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { spacing, radius, typography } from '../../core/constants/theme';

interface AddressFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  editingAddressId: string | null;
  form: any;
  onFormChange: (form: any) => void;
}

export default function AddressFormModal({ visible, onClose, onSave, editingAddressId, form, onFormChange }: AddressFormModalProps) {
  const { t } = useTranslation();
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(false);

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const gpsEnabled = await Location.hasServicesEnabledAsync();
      if (!gpsEnabled) {
        Alert.alert('GPS Disabled', 'Please turn on GPS to use this feature.');
        setIsLoadingLocation(false);
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to autofill address.');
        setIsLoadingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (location) {
        let addressObj = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (addressObj && addressObj.length > 0) {
          const first = addressObj[0];
          
          onFormChange({
            ...form,
            street: first.street || first.name || first.subregion || form.street,
            city: first.city || first.district || first.region || form.city,
            state: first.region || first.subregion || form.state,
            pincode: first.postalCode || form.pincode
          });
        }
      }
    } catch (e) {
      console.log('Error fetching location', e);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const modalBgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground' as any);

  const gray100Color = useThemeColor({ light: Colors.light.gray100, dark: Colors.dark.gray100 }, 'gray100' as any);
  const gray200Color = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray200 }, 'gray200' as any);
  const gray300Color = useThemeColor({ light: Colors.light.gray300, dark: Colors.dark.gray300 }, 'gray300' as any);

  const getAddressTypeLabel = (typeKey: string) => {
    if (typeKey === 'home') return t(STRINGS.checkoutScreen.home);
    if (typeKey === 'work') return t(STRINGS.checkoutScreen.work);
    return t(STRINGS.checkoutScreen.other);
  };

  const getAddressTypeIcon = (typeKey: string): any => {
    if (typeKey === 'home') return 'home';
    if (typeKey === 'work') return 'briefcase';
    return 'map-pin';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: modalBgColor }]}>
          <View style={[styles.dragHandle, { backgroundColor: gray300Color }]} />

          <View style={styles.modalHeader}>
            <ThemedText type="subtitle" style={{ fontSize: typography.size.xxl }}>
              {editingAddressId ? t(STRINGS.checkoutScreen.editAddressTitle) : t(STRINGS.checkoutScreen.addAddressTitle)}
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: gray100Color }]}>
              <Ionicons name="close" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            <TouchableOpacity 
              style={[styles.useLocationBtn, { backgroundColor: primaryColor + '15', borderColor: primaryColor }]} 
              onPress={handleUseCurrentLocation}
              disabled={isLoadingLocation}
            >
              <Feather name="map-pin" size={18} color={primaryColor} />
              <ThemedText style={{ color: primaryColor, marginLeft: 8, fontWeight: 'bold', flex: 1 }}>
                {isLoadingLocation ? 'Fetching location...' : 'Use Current Location'}
              </ThemedText>
              {isLoadingLocation && <ActivityIndicator size="small" color={primaryColor} />}
            </TouchableOpacity>

            <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.fullName)} value={form.fullName} onChangeText={(t) => onFormChange({ ...form, fullName: t })} styleWrapper={[styles.input, { borderColor: borderColor }]} />
            <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.mobile)} value={form.mobile} onChangeText={(t) => onFormChange({ ...form, mobile: t })} keyboardType="phone-pad" styleWrapper={[styles.input, { borderColor: borderColor }]} />

            <View style={[styles.inputDivider, { backgroundColor: gray200Color }]} />

            <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.flat)} value={form.flat} onChangeText={(t) => onFormChange({ ...form, flat: t })} styleWrapper={[styles.input, { borderColor: borderColor }]} />
            <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.street)} value={form.street} onChangeText={(t) => onFormChange({ ...form, street: t })} styleWrapper={[styles.input, { borderColor: borderColor }]} />
            <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.landmark)} value={form.landmark} onChangeText={(t) => onFormChange({ ...form, landmark: t })} styleWrapper={[styles.input, { borderColor: borderColor }]} />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.city)} value={form.city} onChangeText={(t) => onFormChange({ ...form, city: t })} styleWrapper={[styles.input, { flex: 1, borderColor: borderColor }]} />
              <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.state)} value={form.state} onChangeText={(t) => onFormChange({ ...form, state: t })} styleWrapper={[styles.input, { flex: 1, borderColor: borderColor }]} />
            </View>
            <ThemedInput icon={null} placeholder={t(STRINGS.checkoutScreen.pincode)} value={form.pincode} onChangeText={(t) => onFormChange({ ...form, pincode: t })} keyboardType="number-pad" styleWrapper={[styles.input, { borderColor: borderColor }]} />

            <View style={[styles.inputDivider, { backgroundColor: gray200Color }]} />

            <ThemedText style={{ marginBottom: spacing.smd, fontSize: typography.size.lg, fontWeight: typography.weight.semiBold }}>
              {t(STRINGS.checkoutScreen.addressType)}
            </ThemedText>
            <View style={styles.typeRow}>
              {['home', 'work', 'other'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeBtn,
                    form.type === type ? { backgroundColor: primaryColor, borderColor: primaryColor } : { borderColor: borderColor, backgroundColor: cardColor }
                  ]}
                  onPress={() => onFormChange({ ...form, type })}
                >
                  <Feather name={getAddressTypeIcon(type)} size={16} color={form.type === type ? '#FFF' : iconColor} style={{ marginRight: 6 }} />
                  <ThemedText style={{ color: form.type === type ? '#FFF' : iconColor, fontWeight: form.type === type ? 'bold' : '500' }}>
                    {getAddressTypeLabel(type)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <CustomButton
              title={t(STRINGS.checkoutScreen.saveAddress)}
              onPress={onSave}
              style={[styles.saveAddressBtn, { backgroundColor: primaryColor }]}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.mlg,
    paddingTop: spacing.smd,
    maxHeight: '90%',
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    padding: spacing.xs,
    borderRadius: radius.lg,
  },
  inputDivider: {
    height: 1,
    marginVertical: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  useLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: spacing.lg,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: spacing.smd,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveAddressBtn: {
    marginTop: spacing.smd,
    borderRadius: radius.md,
    paddingVertical: 14,
  }
});
