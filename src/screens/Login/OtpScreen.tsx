import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, CustomButton } from '../../components';
import { Colors, ThemeDimension, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context';

const OTP_LENGTH = 6;
const CORRECT_OTP = '123456';
const TIMER_START = 30;

export default function OtpScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { phoneNumber, returnTo } = route.params || { phoneNumber: '+91 0000000000' };
  
  const { verifyOtp } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(TIMER_START);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const primaryColor = useThemeColor({}, 'primary');
  const bgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.primaryBackground }, 'primaryBackground' as any);
  const textColor = useThemeColor({}, 'primaryText');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const borderColor = useThemeColor({ light: Colors.light.gray300, dark: Colors.dark.gray300 }, 'gray300' as any);
  const inputBgColor = useThemeColor({ light: Colors.light.gray100, dark: Colors.dark.gray800 }, 'gray100' as any);
  const activeBorderColor = primaryColor;

  const isOtpComplete = otp.every(digit => digit !== '');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    
    // Handle pasting a full code
    if (text.length > 1) {
      const chars = text.replace(/[^0-9]/g, '').split('').slice(0, OTP_LENGTH);
      chars.forEach((char, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + chars.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      setErrorMsg('');
      return;
    }

    // Handle single digit
    newOtp[index] = text.replace(/[^0-9]/g, '');
    setOtp(newOtp);
    setErrorMsg('');

    if (text !== '' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      setErrorMsg('');
    }
  };

  const handleVerify = async () => {
    if (!isOtpComplete) return;

    if (timer === 0) {
      setErrorMsg(t(STRINGS.auth.expiredOtp));
      return;
    }

    setIsVerifying(true);
    try {
      const enteredOtp = otp.join('');
      // In a real app, you would pass the phone number and OTP to your backend.
      // Here, verifyOtp just expects '1234' for simplicity.
      await verifyOtp(phoneNumber, enteredOtp);
      
      if (returnTo) {
        navigation.replace(returnTo);
      } else {
        navigation.navigate('Home', { screen: 'Home' }); // default fallback
      }
    } catch (error: any) {
      setErrorMsg(error.message || t(STRINGS.auth.invalidOtp));
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    setTimer(TIMER_START);
    setOtp(Array(OTP_LENGTH).fill(''));
    setErrorMsg('');
    inputRefs.current[0]?.focus();
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>{t(STRINGS.auth.verifyOtpTitle)}</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.subtitle} useSecondaryText>
            {t(STRINGS.auth.otpSentTo)} <ThemedText style={[styles.boldText, { color: textColor }]}>{phoneNumber}</ThemedText>
          </ThemedText>

          {/* OTP Input Boxes */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => {
              const isActive = digit !== '';
              return (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpBox,
                    { 
                      backgroundColor: inputBgColor,
                      color: textColor,
                      borderColor: isOtpComplete ? primaryColor : (isActive ? primaryColor : borderColor),
                      borderWidth: isOtpComplete || isActive ? 2 : 1
                    }
                  ]}
                  keyboardType="numeric"
                  maxLength={6} // allow pasting multiple
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  textContentType="oneTimeCode" // Enables SMS autofill on iOS/Android
                />
              );
            })}
          </View>

          {errorMsg ? (
            <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
          ) : (
            <View style={styles.errorPlaceholder} />
          )}

          {/* Timer and Resend */}
          <View style={styles.timerContainer}>
            {timer > 0 ? (
              <ThemedText style={styles.timerText} useSecondaryText>
                {t(STRINGS.auth.resendOtpIn)} <ThemedText style={[styles.timerCountdown, { color: primaryColor }]}>{timer}s</ThemedText>
              </ThemedText>
            ) : (
              <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
                <ThemedText style={[styles.resendText, { color: primaryColor }]}>{t(STRINGS.auth.resendOtp)}</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          <CustomButton 
            title={t(STRINGS.auth.verifyOtp)} 
            onPress={handleVerify}
            disabled={!isOtpComplete}
            loading={isVerifying}
            style={[styles.verifyBtn, !isOtpComplete && { backgroundColor: Colors.light.gray400 }]}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    paddingTop: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: ThemeDimension.borderRadius.m,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorText: {
    color: Colors.light.red600,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorPlaceholder: {
    height: 34, // Matches error text height to prevent UI jumping
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    height: 24,
  },
  timerText: {
    fontSize: 14,
  },
  timerCountdown: {
    fontWeight: 'bold',
  },
  resendBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  verifyBtn: {
    width: '100%',
  },
});
