import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemedView, ThemedText } from '../../components';
import { Colors, STRINGS } from '../../constants';
import { useAuth } from '../../context';
import { useTranslation } from 'react-i18next';
import { spacing, radius, typography, elevation } from '../../core/constants/theme';

export default function DummyGoogleScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { returnTo } = route.params || {};
  const { signup } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    // Simulate a fake authentication delay, then log them in
    const timer = setTimeout(async () => {
      try {
        await signup('Mock Google User', 'google@example.com', 'mockpass');
      } catch(e) {}
      
      if (returnTo) {
        navigation.replace(returnTo);
      } else {
        navigation.navigate('HomeTab', { screen: 'Home' });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../../assets/google_logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <ThemedText style={styles.title}>{t(STRINGS.auth.signInWithGoogle)}</ThemedText>
        <ThemedText style={styles.subtitle} useSecondaryText>
          Connecting to Mock Google Account...
        </ThemedText>
        <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 30 }} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: spacing.mlg,
    backgroundColor: Colors.light.white,
    borderRadius: radius.lg,
    ...elevation.md,
    width: '80%',
    paddingVertical: 40,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: spacing.mlg,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: Colors.light.gray900,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.md,
    textAlign: 'center',
  }
});
