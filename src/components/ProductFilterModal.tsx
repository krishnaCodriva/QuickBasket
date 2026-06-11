import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { CustomButton } from './CustomButton';
import { STRINGS, Colors } from '../constants';
import { useThemeColor } from '../hooks';
import { useTranslation } from 'react-i18next';
import { spacing, radius, typography } from '../core/constants/theme';
import { useCategories } from '../hooks';

interface ProductFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filterCategoryId: string | null;
  setFilterCategoryId: (val: string | null) => void;
  filterSubCategoryId?: string | null;
  setFilterSubCategoryId?: (val: string | null) => void;
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
  filterCategoryId,
  setFilterCategoryId,
  filterSubCategoryId,
  setFilterSubCategoryId,
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
  const { categories } = useCategories();
  const selectedCategory = categories.find(c => c.id === filterCategoryId);
  const subCategories = selectedCategory?.subcategories || [];
  
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
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
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.filterGridOption, { borderColor }, filterCategoryId === cat.id && { borderColor: primaryColor, backgroundColor: actionBtnBg }]}
                    onPress={() => {
                      handleFilterToggle(setFilterCategoryId, cat.id, filterCategoryId);
                      if (setFilterSubCategoryId && cat.id !== filterCategoryId) {
                        // clear subcategory if category changes
                        setFilterSubCategoryId(null);
                      }
                    }}
                  >
                    <ThemedText style={[styles.filterGridOptionText, filterCategoryId === cat.id && { color: primaryColor }]}>{t(cat.nameKey)}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {filterCategoryId && subCategories.length > 0 && setFilterSubCategoryId && (
                <>
                  <ThemedText style={styles.filterSectionTitle}>Sub-Categories</ThemedText>
                  <View style={styles.filterOptionsGrid}>
                    {subCategories.map(subCat => (
                      <TouchableOpacity
                        key={subCat.id}
                        style={[styles.filterGridOption, { borderColor }, filterSubCategoryId === subCat.id && { borderColor: primaryColor, backgroundColor: actionBtnBg }]}
                        onPress={() => handleFilterToggle(setFilterSubCategoryId, subCat.id, filterSubCategoryId)}
                      >
                        <ThemedText style={[styles.filterGridOptionText, filterSubCategoryId === subCat.id && { color: primaryColor }]}>{t(subCat.nameKey)}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

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
              style={{ marginTop: spacing.lg, marginBottom: Platform.OS === 'ios' ? spacing.mlg : 0 }}
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
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.gray200,
  },
  modalOptionText: {
    fontSize: typography.size.lg,
  },
  filterSectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginTop: spacing.md,
    marginBottom: spacing.smd,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterGridOption: {
    borderWidth: 1,
    paddingHorizontal: spacing.smd,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterGridOptionText: {
    fontSize: typography.size.md,
  }
});

export default ProductFilterModal;
