import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components';
import { STRINGS, Colors } from '../constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useThemeColor } from '../hooks';
import { useTranslation } from 'react-i18next';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

export default function SplashScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const translateX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 200, 
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true, 
      })
    );
    animation.start();

    const checkLocationAndNavigate = async () => {
      let hasLocation = false;
      try {
        const savedLocation = await AsyncStorage.getItem('@user_location');
        if (savedLocation) hasLocation = true;
      } catch (e) {
        console.warn('Error reading async storage', e);
      }

      // Navigate after splash simulation
      timer = setTimeout(() => {
        navigation.replace(hasLocation ? 'HomeTab' : 'Location');
      }, 2500);
    };

    let timer: NodeJS.Timeout;
    checkLocationAndNavigate();

    // Cleanup to prevent memory leaks
    return () => {
      animation.stop();
      if (timer) clearTimeout(timer);
    };
  }, [navigation, translateX]);

  // Use the exact solid colors requested by the user from Figma
  const bgColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.primaryBackground }, 'primaryBackground' as any);
  const trackColor = useThemeColor({ light: Colors.light.transparentBlack01, dark: Colors.dark.transparentWhite01 }, 'transparentBlack01' as any);
  const barColor = useThemeColor({ light: Colors.light.primary, dark: Colors.light.white }, 'primary' as any);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/Logo_margin.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        
        <ThemedText type="title" style={styles.title}>
          {t(STRINGS.splashScreen.title)}
        </ThemedText>
        <ThemedText useSecondaryText style={styles.subtitle}>
          {t(STRINGS.splashScreen.subtitle)}
        </ThemedText>
      </View>

      <View style={[styles.progressBarContainer, { backgroundColor: trackColor }]}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { transform: [{ translateX }], backgroundColor: barColor }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 28,
  },
  title: {
    marginBottom: 8,
    fontSize: 28,
  },
  subtitle: {
    fontSize: 16,
  },
  progressBarContainer: {
    width: 150, 
    height: 3, 
    borderRadius: 2,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 80, 
  },
  progressBar: {
    width: 60, 
    height: '100%',
    borderRadius: 2,
  }
});
