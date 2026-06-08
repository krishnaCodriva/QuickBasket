import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, CustomButton } from '../../components';
import { Colors, ThemeDimension, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context';

export default function LoginScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const returnTo = route.params?.returnTo;

  const { signup } = useAuth(); // for google mock

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

  const handleSendOtp = () => {
    if (isPhoneValid) {
      setIsOtpLoading(true);
      setTimeout(() => {
        setIsOtpLoading(false);
        // Pass returnTo parameter so OtpScreen knows where to go after verifying
        navigation.navigate('OtpScreen', { phoneNumber: `+91 ${phoneNumber}`, returnTo });
      }, 1000);
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
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
            <ThemedText style={styles.errorText}>Please enter a valid 10-digit mobile number</ThemedText>
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
    padding: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIcon: {
    marginRight: 8,
  },
  bannerText: {
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: ThemeDimension.borderRadius.l,
    borderWidth: 1,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIconImage: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleText: {
    color: Colors.light.gray900,
    fontSize: 16,
    fontWeight: 'bold',
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
    marginHorizontal: 10,
    color: Colors.light.gray500,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    height: 54,
    borderRadius: ThemeDimension.borderRadius.m,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  countryCode: {
    paddingHorizontal: 16,
    borderRightWidth: 1,
    height: '100%',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    letterSpacing: 1,
  },
  errorText: {
    color: Colors.light.red600,
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  sendOtpBtn: {
    marginTop: 16,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
