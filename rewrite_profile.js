const fs = require('fs');
const path = './src/screens/Profile/ProfileScreen.tsx';

const code = `import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView, ThemedText } from '../../components';
import { useTranslation } from 'react-i18next';
import { Colors, STRINGS } from '../../constants';
import { useThemeColor } from '../../hooks';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.gray100 }, 'secondaryBackground' as any);
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const dangerColor = useThemeColor({ light: Colors.light.red600, dark: Colors.dark.error }, 'error' as any);
  const screenBg = useThemeColor({}, 'primaryBackground' as any);

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderGridCard = (icon: any, title: string, subtitle: string, onPress: () => void) => (
    <TouchableOpacity style={[styles.gridCard, { backgroundColor: cardColor, borderColor }]} onPress={onPress}>
      <View style={[styles.gridIconContainer, { backgroundColor: Colors.light.primary + '20' }]}>
        <Feather name={icon} size={20} color={primaryColor} />
      </View>
      <ThemedText style={styles.gridTitle}>{title}</ThemedText>
      <ThemedText useSecondaryText style={styles.gridSubtitle} numberOfLines={2}>{subtitle}</ThemedText>
    </TouchableOpacity>
  );

  const renderListItem = (icon: any, title: string, onPress: () => void, isLast: boolean = false) => (
    <TouchableOpacity style={[styles.listItem, !isLast && { borderBottomWidth: 1, borderBottomColor: borderColor }]} onPress={onPress}>
      <Feather name={icon} size={20} color={primaryColor} style={{ marginRight: 12 }} />
      <ThemedText style={styles.listTitle}>{title}</ThemedText>
      <Feather name="chevron-right" size={20} color={iconColor} style={{ opacity: 0.5 }} />
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        
        {/* Custom Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>{t(STRINGS.profileScreen.myAccount as any)}</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Profile Card */}
          <TouchableOpacity 
            style={[styles.profileCard, { backgroundColor: cardColor, borderColor }]} 
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={[styles.avatarContainer, { borderColor }]}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Feather name="user" size={32} color={iconColor} style={{ opacity: 0.5 }} />
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <ThemedText type="defaultSemiBold" style={styles.userName}>{user?.name || t(STRINGS.profileScreen.guestUser as any)}</ThemedText>
              {user?.mobile && <ThemedText useSecondaryText style={styles.userInfoText}>{user.mobile}</ThemedText>}
              <ThemedText useSecondaryText style={styles.userInfoText}>{user?.email || t(STRINGS.profileScreen.guestEmail as any)}</ThemedText>
            </View>
            
            <Feather name="chevron-right" size={20} color={iconColor} style={{ opacity: 0.5 }} />
          </TouchableOpacity>

          {/* Grid Cards */}
          <View style={styles.gridContainer}>
            {renderGridCard('package', t(STRINGS.profileScreen.myOrders), t(STRINGS.profileScreen.myOrdersDesc), () => navigation.navigate('HomeTab', { screen: 'OrdersTab' }))}
            {renderGridCard('home', t(STRINGS.profileScreen.savedAddresses), t(STRINGS.profileScreen.savedAddressesDesc), () => navigation.navigate('Location'))}
          </View>

          {/* Account Section */}
          <View style={styles.sectionContainer}>
            <ThemedText useSecondaryText style={styles.sectionHeader}>{t(STRINGS.profileScreen.accountSection as any)}</ThemedText>
            <View style={[styles.listGroup, { backgroundColor: cardColor, borderColor }]}>
              {renderListItem('user', t(STRINGS.profileScreen.editProfileTitle as any), () => navigation.navigate('EditProfile'))}
              {renderListItem('settings', t(STRINGS.profileScreen.settings as any), () => {}, true)}
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.sectionContainer}>
            <ThemedText useSecondaryText style={styles.sectionHeader}>{t(STRINGS.profileScreen.supportSection as any)}</ThemedText>
            <View style={[styles.listGroup, { backgroundColor: cardColor, borderColor }]}>
              {renderListItem('message-square', t(STRINGS.profileScreen.helpCenter as any), () => {})}
              {renderListItem('headphones', t(STRINGS.profileScreen.contactSupport as any), () => {}, true)}
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: cardColor, borderColor }]} onPress={handleLogout}>
            <Feather name="log-out" size={20} color={dangerColor} style={{ marginRight: 12 }} />
            <ThemedText style={[styles.logoutText, { color: dangerColor }]}>{t(STRINGS.profileScreen.logout)}</ThemedText>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.light.primary, // The screenshot uses a green gradient or solid green for "My Account"
  },
  
  profileCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    marginBottom: 2,
  },
  userInfoText: {
    fontSize: 13,
    marginTop: 2,
  },

  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginRight: 8,
  },
  gridIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gridSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },

  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  listGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  listTitle: {
    flex: 1,
    fontSize: 15,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  }
});
`;

fs.writeFileSync(path, code, 'utf8');
console.log('ProfileScreen.tsx rewritten');
