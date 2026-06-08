import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemedView, ThemedText } from '../../components';
import { Colors } from '../../constants';
import { useAuth } from '../../context';

export default function DummyGoogleScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { returnTo } = route.params || {};
  const { signup } = useAuth();

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
        <ThemedText style={styles.title}>Sign in with Google</ThemedText>
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
    padding: 20,
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: '80%',
    paddingVertical: 40,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.gray900,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  }
});
