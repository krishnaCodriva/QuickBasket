import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '../../components/ThemedText';
import { CustomButton } from '../../components/CustomButton';
import { Colors, ThemeDimension } from '../../constants';
import { useThemeColor } from '../../hooks';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OrderConfirmationScreen({ route }: any) {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  
  // Theme Colors
  const backgroundColor = useThemeColor({}, 'primaryBackground');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');

  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    // Generate a random order ID (e.g. ORD-123456)
    setOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
  }, []);

  const handleBackToHome = () => {
    // Reset stack to Home to prevent going back to checkout
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'HomeTab' }],
      })
    );
  };

  const handleTrackOrder = () => {
    navigation.navigate('OrderTracking', { orderId });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="check-circle" size={100} color={primaryColor} />
        </View>
        
        <ThemedText type="title" style={styles.title}>
          {t('orderConfirmationScreen.title')}
        </ThemedText>
        
        <ThemedText style={styles.subtitle} useSecondaryText>
          {t('orderConfirmationScreen.successMessage')}
        </ThemedText>
        
        <View style={[styles.detailsCard, { backgroundColor: secondaryBackgroundColor }]}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="receipt" size={20} color={primaryColor} />
            <ThemedText style={styles.detailText}>
              {t('orderConfirmationScreen.orderId')}{orderId}
            </ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="clock-fast" size={20} color={primaryColor} />
            <ThemedText style={styles.detailText}>
              {t('orderConfirmationScreen.estimatedDelivery')}
            </ThemedText>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <CustomButton 
            title={t('orderConfirmationScreen.trackOrder')} 
            onPress={handleTrackOrder}
            style={styles.primaryButton}
          />
          <CustomButton 
            title={t('orderConfirmationScreen.backToHome')} 
            type="secondary"
            onPress={handleBackToHome}
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  detailsCard: {
    width: '100%',
    padding: 20,
    borderRadius: ThemeDimension.borderRadius.l,
    marginBottom: 40,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  actionsContainer: {
    width: '100%',
  },
  primaryButton: {
    marginBottom: 16,
  },
  secondaryButton: {
    borderColor: 'transparent',
  }
});
