import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { CustomButton } from './CustomButton';
import { STRINGS, Colors } from '../constants';
import { useThemeColor } from '../hooks';
import { useTranslation } from 'react-i18next';

interface ProductFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filterCategory: string | null;
  setFilterCategory: (val: string | null) => void;
  filterPrice: string | null;
  setFilterPrice: (val: string | null) => void;
  filterTag: string | null;
  setFilterTag: (val: string | null) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  outOfStockOnly: boolean;
  setOutOfStockOnly: (val: boolean) => void;
  onFilterChange: () => void;
}

const ProductFilterModal: React.FC<ProductFilterModalProps> = ({
  visible,
  onClose,
  filterCategory,
  setFilterCategory,
  filterPrice,
  setFilterPrice,
  filterTag,
  setFilterTag,
  inStockOnly,
  setInStockOnly,
  outOfStockOnly,
  setOutOfStockOnly,
  onFilterChange
}) => {
  const { t } = useTranslation();
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const primaryColor = useThemeColor({}, 'primary');
  const actionBtnBg = useThemeColor({ light: Colors.light.green100, dark: Colors.light.transparentWhite02 }, 'secondaryBackground' as any);
  const modalBgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground' as any);
  const borderColor = useThemeColor({ light: Colors.light.gray300, dark: Colors.dark.gray700 }, 'primaryText' as any);

  const handleApply = () => {
    onClose();
  };

  const handleFilterToggle = (setter: any, value: any, currentValue: any) => {
    setter(currentValue === value ? null : value);
    onFilterChange();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: modalBgColor }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="subtitle">{t(STRINGS.productListing.filtersBtn)}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ThemedText style={styles.filterSectionTitle}>{t(STRINGS.productListing.filterCategories)}</ThemedText>
            <View style={styles.filterOptionsGrid}>
              {Object.values(STRINGS.common.categories).map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterGridOption, { borderColor }, filterCategory === cat && { borderColor: primaryColor, backgroundColor: actionBtnBg }]}
                  onPress={() => handleFilterToggle(setFilterCategory, cat, filterCategory)}
                >
                  <ThemedText style={[styles.filterGridOptionText, filterCategory === cat && { color: primaryColor }]}>{t(cat)}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={styles.filterSectionTitle}>{t(STRINGS.productListing.filterPrice)}</ThemedText>
            <View style={styles.filterOptionsGrid}>
              {Object.values(STRINGS.productListing.priceRanges).map(price => (
                <TouchableOpacity
                  key={price}
                  style={[styles.filterGridOption, { borderColor }, filterPrice === price && { borderColor: primaryColor, backgroundColor: actionBtnBg }]}
                  onPress={() => handleFilterToggle(setFilterPrice, price, filterPrice)}
                >
                  <ThemedText style={[styles.filterGridOptionText, filterPrice === price && { color: primaryColor }]}>{t(price)}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={styles.filterSectionTitle}>{t(STRINGS.productListing.filterTags)}</ThemedText>
            <View style={styles.filterOptionsGrid}>
              {Object.values(STRINGS.homeScreen.tags).filter(t => t !== 'All').map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.filterGridOption, { borderColor }, filterTag === tag && { borderColor: primaryColor, backgroundColor: actionBtnBg }]}
                  onPress={() => handleFilterToggle(setFilterTag, tag, filterTag)}
                >
                  <ThemedText style={[styles.filterGridOptionText, filterTag === tag && { color: primaryColor }]}>{t(tag)}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={styles.filterSectionTitle}>{t(STRINGS.productListing.filterAvailability)}</ThemedText>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                const val = !inStockOnly;
                setInStockOnly(val);
                if (val) setOutOfStockOnly(false);
                onFilterChange();
              }}
            >
              <ThemedText style={styles.modalOptionText}>{t(STRINGS.productListing.inStockOnly)}</ThemedText>
              <Ionicons name={inStockOnly ? "checkbox" : "square-outline"} size={24} color={inStockOnly ? primaryColor : Colors.light.gray400} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                const val = !outOfStockOnly;
                setOutOfStockOnly(val);
                if (val) setInStockOnly(false);
                onFilterChange();
              }}
            >
              <ThemedText style={styles.modalOptionText}>{t(STRINGS.productListing.outOfStockOnly)}</ThemedText>
              <Ionicons name={outOfStockOnly ? "checkbox" : "square-outline"} size={24} color={outOfStockOnly ? primaryColor : Colors.light.gray400} />
            </TouchableOpacity>
          </ScrollView>
          <CustomButton
            title={t(STRINGS.productListing.apply)}
            type="primary"
            onPress={handleApply}
            style={{ marginTop: 24, marginBottom: Platform.OS === 'ios' ? 20 : 0 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.light.transparentBlack05,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.gray200,
  },
  modalOptionText: {
    fontSize: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterGridOption: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterGridOptionText: {
    fontSize: 14,
  }
});

export default ProductFilterModal;
