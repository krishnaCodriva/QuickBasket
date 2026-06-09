import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../../components';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useTranslation } from 'react-i18next';

interface AddressSectionProps {
  addresses: any[];
  selectedAddress: string;
  onSelect: (id: string) => void;
  onEdit: (addr: any) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export default function AddressSection({ addresses, selectedAddress, onSelect, onEdit, onDelete, onAddNew }: AddressSectionProps) {
  const { t } = useTranslation();

  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const errorColor = useThemeColor({ light: Colors.light.error, dark: Colors.dark.error }, 'error' as any);

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
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>{t(STRINGS.checkoutScreen.deliveryAddress)}</ThemedText>
        <TouchableOpacity onPress={onAddNew}>
          <ThemedText style={{ color: primaryColor, fontWeight: 'bold' }}>{t(STRINGS.checkoutScreen.addNew)}</ThemedText>
        </TouchableOpacity>
      </View>

      {addresses.map((addr) => (
        <View
          key={addr.id}
          style={[
            styles.optionCard,
            { backgroundColor: cardColor, borderColor: selectedAddress === addr.id ? primaryColor : borderColor, borderWidth: selectedAddress === addr.id ? 2 : 1 }
          ]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => onSelect(addr.id)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Feather name={getAddressTypeIcon(addr.label)} size={16} color={iconColor} style={{ marginRight: 6 }} />
              <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>{getAddressTypeLabel(addr.label)}</ThemedText>
            </View>
            <ThemedText useSecondaryText style={{ fontSize: 14, lineHeight: 20 }}>{addr.address}</ThemedText>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => onEdit(addr)} style={{ padding: 8 }}>
              <Feather name="edit-2" size={18} color={iconColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(addr.id)} style={{ padding: 8 }}>
              <Feather name="trash-2" size={18} color={errorColor} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  }
});
