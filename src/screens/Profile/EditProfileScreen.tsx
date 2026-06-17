import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView, ThemedText, CustomButton, ScreenHeader, FormInput } from '../../components';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, STRINGS, ThemeDimension } from '../../constants';
import { useThemeColor } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import type { RootStackParamList } from '../../core/types/navigation';
import { spacing, radius, typography } from '../../core/constants/theme';
import { formatImageUrl } from '../../config/api.config';

type EditProfileNav = NativeStackNavigationProp<RootStackParamList>;

export default function EditProfileScreen() {
  const navigation = useNavigation<EditProfileNav>();
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.phone || user?.mobile || '');
  const [avatar, setAvatar] = useState(user?.avatarUrl || user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{name?: string, email?: string, mobile?: string}>({});

  const cardColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.secondaryBackground }, 'secondaryBackground');
  const borderColor = useThemeColor({ light: Colors.light.gray200, dark: Colors.dark.gray300 }, 'gray200' as any);
  const primaryColor = useThemeColor({}, 'primary');
  const iconColor = useThemeColor({ light: Colors.light.black, dark: Colors.light.white }, 'primaryText' as any);
  const dangerColor = useThemeColor({ light: Colors.light.red600, dark: Colors.dark.error }, 'error' as any);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSave = async () => {
    let newErrors: any = {};
    if (!name.trim()) newErrors.name = t(STRINGS.editProfileScreen.mandatoryFields);
    if (!mobile.trim()) newErrors.mobile = t(STRINGS.editProfileScreen.mandatoryFields);
    
    if (email.trim() && !validateEmail(email)) {
      newErrors.email = t(STRINGS.editProfileScreen.invalidEmail);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert(t(STRINGS.editProfileScreen.validationError), t(STRINGS.editProfileScreen.mandatoryFields));
      return;
    }

    setIsSaving(true);
    setErrors({});
    
    try {
      await updateProfile({ name, email, avatar }); // Mobile intentionally excluded so it can never be changed
      Alert.alert(t(STRINGS.editProfileScreen.success), t(STRINGS.editProfileScreen.profileUpdated), [
        { text: 'OK', onPress: () => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.reset({ index: 0, routes: [{ name: 'HomeTab' }] });
          }
        }}
      ]);
    } catch (error) {
      console.log('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t(STRINGS.editProfileScreen.permissionRequired as any, { defaultValue: 'Permission Required' }), t(STRINGS.editProfileScreen.galleryPermission as any, { defaultValue: 'Permission to access gallery is required!' }));
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title={t(STRINGS.editProfileScreen.title)}
          onBack={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.reset({ index: 0, routes: [{ name: 'HomeTab' }] });
            }
          }}
        />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarSection}>
              <View style={[styles.avatarContainer, { borderColor }]}>
                {avatar ? (
                  <Image source={{ uri: formatImageUrl(avatar) }} style={styles.avatarImage} />
                ) : (
                  <Feather name="user" size={60} color={iconColor} style={{ opacity: 0.5 }} />
                )}
                <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: Colors.light.gray200 }]} onPress={pickImage}>
                  <Feather name="camera" size={16} color={Colors.light.black} />
                </TouchableOpacity>
              </View>
              <ThemedText useSecondaryText style={styles.changePictureText}>{t(STRINGS.editProfileScreen.changePicture)}</ThemedText>
            </View>

            <View style={[styles.formContainer, { backgroundColor: cardColor, borderColor }]}>
              <FormInput
                label={t(STRINGS.editProfileScreen.fullName)}
                required
                value={name}
                onChangeText={(text) => { setName(text); setErrors({...errors, name: undefined}); }}
                placeholder={t(STRINGS.editProfileScreen.fullName)}
                error={errors.name}
              />

              <FormInput
                label={t(STRINGS.editProfileScreen.mobile)}
                required
                value={mobile}
                onChangeText={(text) => { setMobile(text); setErrors({...errors, mobile: undefined}); }}
                keyboardType="phone-pad"
                placeholder={t(STRINGS.editProfileScreen.mobile)}
                error={errors.mobile}
                editable={false}
                style={{ opacity: 0.5 }}
              />

              <FormInput
                label={t(STRINGS.editProfileScreen.email)}
                value={email}
                onChangeText={(text) => { setEmail(text); setErrors({...errors, email: undefined}); }}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder={t(STRINGS.editProfileScreen.email)}
                error={errors.email}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor: cardColor }]}>
          <CustomButton 
            title={t(STRINGS.editProfileScreen.cancel)} 
            type="secondary"
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.reset({ index: 0, routes: [{ name: 'HomeTab' }] });
              }
            }} 
            style={styles.cancelBtn}
            disabled={isSaving}
          />
          <CustomButton 
            title={t(STRINGS.editProfileScreen.saveChanges)} 
            onPress={handleSave} 
            loading={isSaving}
            style={styles.saveBtn}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smd,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: { fontSize: typography.size.xl },
  scrollContent: { padding: spacing.md },
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.smd,
  },
  avatarImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  changePictureText: {
    fontSize: typography.size.md,
  },
  formContainer: {
    padding: spacing.mlg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  inputGroup: {
    marginBottom: spacing.mlg,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: Colors.light.red600,
    fontSize: typography.size.sm,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 0 : spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelBtn: {
    flex: 1,
    marginRight: spacing.sm,
    marginBottom: 0,
  },
  saveBtn: {
    flex: 1,
    marginLeft: spacing.sm,
    marginBottom: 0,
  }
});
