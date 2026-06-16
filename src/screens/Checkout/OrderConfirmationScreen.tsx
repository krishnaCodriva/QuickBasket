import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '../../components/ThemedText';
import { CustomButton } from '../../components/CustomButton';
import { Colors, ThemeDimension } from '../../constants';
import { useThemeColor } from '../../hooks';
import type { RootStackParamList } from '../../core/types/navigation';
import { spacing, typography, elevation } from '../../core/constants/theme';

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
    navigation.navigate('OrderStatus', { orderId });
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
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    ...elevation.md,
  },
  title: {
    fontSize: typography.size.xxxl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.size.lg,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  detailsCard: {
    width: '100%',
    padding: spacing.mlg,
    borderRadius: ThemeDimension.borderRadius.l,
    marginBottom: spacing.xxxl,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  detailText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    marginLeft: spacing.smd,
  },
  actionsContainer: {
    width: '100%',
  },
  primaryButton: {
    marginBottom: spacing.md,
  },
  secondaryButton: {
    borderColor: 'transparent',
  }
});
