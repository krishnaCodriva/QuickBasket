import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, CustomButton } from '../../components';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { spacing, radius, typography, elevation } from '../../core/constants/theme';
import { useAuth } from '../../context';

export default function LoginScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const returnTo = route.params?.returnTo;

  const { signup, sendOtp } = useAuth(); // for google mock, and actual API

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const primaryColor = useThemeColor({}, 'primary');
  const bgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.primaryBackground }, 'primaryBackground' as any);
  const textColor = useThemeColor({}, 'primaryText');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const borderColor = useThemeColor({ light: Colors.light.gray300, dark: Colors.dark.gray300 }, 'gray300' as any);
  const inputBgColor = useThemeColor({ light: Colors.light.gray100, dark: Colors.dark.gray800 }, 'gray100' as any);

  const isPhoneValid = phoneNumber.length === 10;
  const showError = hasInteracted && !isPhoneValid && phoneNumber.length > 0;

  const handleGoogleLogin = () => {
    navigation.navigate('DummyGoogleScreen', { returnTo });
  };

  const handleSendOtp = async () => {
    if (isPhoneValid) {
      setIsOtpLoading(true);
      try {
        await sendOtp(`+91${phoneNumber}`);
        // Pass returnTo parameter so OtpScreen knows where to go after verifying
        navigation.navigate('OtpScreen', { phoneNumber: `+91 ${phoneNumber}`, returnTo });
      } catch (error: any) {
        Alert.alert(t(STRINGS.auth.errorTitle) || 'Error', error?.response?.data?.message || 'Failed to send OTP. Please try again.');
      } finally {
        setIsOtpLoading(false);
      }
    }
  };

  const onChangePhone = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhoneNumber(cleaned);
    setHasInteracted(true);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
      {returnTo === 'Checkout' && (
        <View style={[styles.banner, { backgroundColor: Colors.light.transparentGreen015 }]}>
          <Ionicons name="information-circle" size={20} color={primaryColor} style={styles.bannerIcon} />
          <ThemedText style={[styles.bannerText, { color: primaryColor }]}>{t(STRINGS.auth.cartProtection)}</ThemedText>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.replace('HomeTab')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>{t(STRINGS.auth.loginTitle)}</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: Colors.light.white, borderColor }]}
            onPress={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color={Colors.light.gray900} />
            ) : (
              <View style={styles.googleBtnContent}>
                <Image source={require('../../../assets/google_logo.png')} style={styles.googleIconImage} resizeMode="contain" />
                <ThemedText style={styles.googleText}>{t(STRINGS.auth.continueWithGoogle)}</ThemedText>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
            <ThemedText style={styles.dividerText}>{t(STRINGS.auth.or)}</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
          </View>

          <ThemedText style={styles.sectionTitle}>{t(STRINGS.auth.loginWithMobile)}</ThemedText>

          <View style={[styles.phoneInputContainer, { borderColor: showError ? Colors.light.red600 : borderColor, backgroundColor: inputBgColor }]}>
            <View style={[styles.countryCode, { borderRightColor: borderColor }]}>
              <ThemedText style={styles.countryCodeText}>+91</ThemedText>
            </View>
            <TextInput
              style={[styles.phoneInput, { color: textColor }]}
              placeholder={t(STRINGS.auth.enterMobileNumber)}
              placeholderTextColor={secondaryTextColor}
              keyboardType="numeric"
              maxLength={10}
              value={phoneNumber}
              onChangeText={onChangePhone}
            />
          </View>

          {showError && (
            <ThemedText style={styles.errorText}>{t(STRINGS.auth.invalidMobile)}</ThemedText>
          )}

          <CustomButton
            title={t(STRINGS.auth.sendOtp)}
            onPress={handleSendOtp}
            disabled={!isPhoneValid}
            loading={isOtpLoading}
            style={[styles.sendOtpBtn, !isPhoneValid && { backgroundColor: Colors.light.gray400 }]}
          />
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText} useSecondaryText>
            {t(STRINGS.auth.termsText)}
          </ThemedText>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smd,
  },
  bannerIcon: {
    marginRight: spacing.sm,
  },
  bannerText: {
    fontSize: typography.size.smmd,
    flex: 1,
    fontWeight: typography.weight.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: spacing.md,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.size.xl,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.mlg,
    paddingTop: 30,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: radius.lg,
    borderWidth: 1,
    ...elevation.md,
    marginBottom: 30,
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIconImage: {
    width: 24,
    height: 24,
    marginRight: spacing.smd,
  },
  googleText: {
    color: Colors.light.gray900,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.sm,
    color: Colors.light.gray500,
    fontWeight: typography.weight.semiBold,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    marginBottom: spacing.md,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  countryCode: {
    paddingHorizontal: spacing.md,
    borderRightWidth: 1,
    height: '100%',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    fontSize: typography.size.lg,
    letterSpacing: 1,
  },
  errorText: {
    color: Colors.light.red600,
    fontSize: typography.size.sm,
    marginBottom: spacing.smd,
    marginLeft: spacing.xs,
  },
  sendOtpBtn: {
    marginTop: spacing.md,
  },
  footer: {
    padding: spacing.mlg,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.mlg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.size.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
});
