import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../../components';
import ThemedInput from '../../components/ThemedInput';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { spacing, radius, typography } from '../../core/constants/theme';

interface PaymentMethodSectionProps {
  paymentMethods: any[];
  selectedPayment: string;
  onSelect: (id: string) => void;
  paymentDetails: any;
  onPaymentDetailsChange: (details: any) => void;
}

export default function PaymentMethodSection({ paymentMethods, selectedPayment, onSelect, paymentDetails, onPaymentDetailsChange }: PaymentMethodSectionProps) {
  const { t } = useTranslation();

  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={[styles.sectionTitle, { marginBottom: spacing.md }]}>{t(STRINGS.checkoutScreen.paymentMethod)}</ThemedText>
      {paymentMethods.map((pm) => (
        <View key={pm.id} style={{ marginBottom: spacing.smd }}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: cardColor, borderColor: selectedPayment === pm.id ? primaryColor : borderColor, borderWidth: selectedPayment === pm.id ? 2 : 1, marginBottom: 0 }
            ]}
            onPress={() => onSelect(pm.id)}
          >
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold" style={{ fontSize: typography.size.lg }}>
                {t(`checkoutScreen.paymentMethods.${pm.id}_label` as any, { defaultValue: pm.label })}
              </ThemedText>
              <ThemedText useSecondaryText style={{ fontSize: typography.size.md }}>
                {t(`checkoutScreen.paymentMethods.${pm.id}_details` as any, { defaultValue: pm.details })}
              </ThemedText>
            </View>
            <View style={[
              styles.radioButton,
              selectedPayment === pm.id ? { borderColor: primaryColor } : { borderColor: borderColor }
            ]}>
              {selectedPayment === pm.id && <View style={[styles.radioButtonInner, { backgroundColor: primaryColor }]} />}
            </View>
          </TouchableOpacity>

          {selectedPayment === pm.id && (pm.id === 'pm_credit' || pm.id === 'pm_debit') && (
            <View style={[styles.paymentForm, { backgroundColor: cardColor, borderColor: primaryColor }]}>
              <ThemedInput
                icon={null}
                placeholder={t(STRINGS.checkoutScreen.paymentForms.cardNumber as any)}
                keyboardType="number-pad"
                value={paymentDetails.cardNumber}
                onChangeText={(t) => onPaymentDetailsChange({ ...paymentDetails, cardNumber: t })}
                styleWrapper={[styles.input, { borderColor: borderColor, marginBottom: 12 }]}
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <ThemedInput
                  icon={null}
                  placeholder={t(STRINGS.checkoutScreen.paymentForms.expiryDate as any)}
                  value={paymentDetails.cardExpiry}
                  onChangeText={(t) => onPaymentDetailsChange({ ...paymentDetails, cardExpiry: t })}
                  styleWrapper={[styles.input, { flex: 1, borderColor: borderColor, marginBottom: 0 }]}
                />
                <ThemedInput
                  icon={null}
                  placeholder={t(STRINGS.checkoutScreen.paymentForms.cvv as any)}
                  keyboardType="number-pad"
                  secureTextEntry
                  value={paymentDetails.cardCvv}
                  onChangeText={(t) => onPaymentDetailsChange({ ...paymentDetails, cardCvv: t })}
                  styleWrapper={[styles.input, { flex: 1, borderColor: borderColor, marginBottom: 0 }]}
                />
              </View>
            </View>
          )}

          {selectedPayment === pm.id && pm.id === 'pm_upi' && (
            <View style={[styles.paymentForm, { backgroundColor: cardColor, borderColor: primaryColor }]}>
              <ThemedInput
                icon={null}
                placeholder={t(STRINGS.checkoutScreen.paymentForms.upiId as any)}
                value={paymentDetails.upiId}
                onChangeText={(t) => onPaymentDetailsChange({ ...paymentDetails, upiId: t })}
                styleWrapper={[styles.input, { borderColor: borderColor, marginBottom: 0 }]}
              />
            </View>
          )}

          {selectedPayment === pm.id && pm.id === 'pm_netbanking' && (
            <View style={[styles.paymentForm, { backgroundColor: cardColor, borderColor: primaryColor, paddingVertical: 16 }]}>
              <ThemedText useSecondaryText style={{ textAlign: 'center' }}>{t(STRINGS.checkoutScreen.paymentForms.netbankingRedirect as any)}</ThemedText>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  optionCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.smd,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentForm: {
    padding: spacing.md,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    borderWidth: 2,
    borderTopWidth: 0,
    marginTop: -4,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: radius.circle,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.smd,
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
  },
  input: {
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  }
});
