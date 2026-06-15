import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView, ThemedText, CustomButton } from "../../components";
import { useTranslation } from "react-i18next";
import { Colors, STRINGS } from "../../constants";
import { useThemeColor } from "../../hooks";
import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import {
  spacing,
  radius,
  typography,
  elevation,
} from "../../core/constants/theme";
import { formatImageUrl } from "../../config/api.config";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const cardColor = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.gray100 },
    "secondaryBackground" as never,
  );
  const borderColor = useThemeColor(
    { light: Colors.light.gray200, dark: Colors.dark.gray300 },
    "gray200" as never,
  );
  const primaryColor = useThemeColor({}, "primary");
  const iconColor = useThemeColor(
    { light: Colors.light.black, dark: Colors.light.white },
    "primaryText" as never,
  );
  const dangerColor = useThemeColor(
    { light: Colors.light.red600, dark: Colors.dark.error },
    "error" as never,
  );
  const screenBg = useThemeColor({}, "primaryBackground");
  const modalOverlayBg = useThemeColor(
    { light: Colors.light.transparentBlack05, dark: "rgba(0,0,0,0.7)" },
    "primaryBackground" as never,
  );

  const handleLogoutPress = () => {
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalVisible(false);
    logout();
    // Redirect to HomeTab as a guest user instead of forcing Login screen
    navigation.navigate("HomeTab", { screen: "Home" });
  };

  const renderGridCard = (
    icon: any,
    title: string,
    subtitle: string,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      style={[styles.gridCard, { backgroundColor: cardColor, borderColor }]}
      onPress={onPress}
    >
      <View
        style={[
          styles.gridIconContainer,
          { backgroundColor: Colors.light.primary + "20" },
        ]}
      >
        <Feather name={icon} size={20} color={primaryColor} />
      </View>
      <ThemedText style={styles.gridTitle}>{title}</ThemedText>
      <ThemedText
        useSecondaryText
        style={styles.gridSubtitle}
        numberOfLines={2}
      >
        {subtitle}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderListItem = (
    icon: any,
    title: string,
    onPress: () => void,
    isLast: boolean = false,
  ) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        !isLast && { borderBottomWidth: 1, borderBottomColor: borderColor },
      ]}
      onPress={onPress}
    >
      <Feather
        name={icon}
        size={20}
        color={primaryColor}
        style={{ marginRight: 12 }}
      />
      <ThemedText style={styles.listTitle}>{title}</ThemedText>
      <Feather
        name="chevron-right"
        size={20}
        color={iconColor}
        style={{ opacity: 0.5 }}
      />
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <ThemedText
              type="title"
              style={[styles.headerTitle, { color: primaryColor }]}
            >
              {t(STRINGS.profileScreen.myAccount)}
            </ThemedText>
          </View>
          <View style={styles.guestContainer}>
            <View
              style={[
                styles.guestIconContainer,
                { backgroundColor: primaryColor + "15" },
              ]}
            >
              <Feather name="user" size={64} color={primaryColor} />
            </View>
            <ThemedText type="title" style={styles.guestTitle}>
              Welcome to QuickBasket
            </ThemedText>
            <ThemedText useSecondaryText style={styles.guestSubtitle}>
              Login or sign up to track your orders, save delivery addresses, and manage your profile.
            </ThemedText>
            <CustomButton
              title="Login / Sign Up"
              onPress={() => navigation.navigate("Login")}
              style={styles.loginBtn}
            />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Custom Header */}
        <View style={styles.header}>
          <ThemedText
            type="title"
            style={[styles.headerTitle, { color: primaryColor }]}
          >
            {t(STRINGS.profileScreen.myAccount)}
          </ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <TouchableOpacity
            style={[
              styles.profileCard,
              { backgroundColor: cardColor, borderColor },
            ]}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <View style={[styles.avatarContainer, { borderColor }]}>
              {user?.avatar || user?.avatarUrl ? (
                <Image
                  source={{ uri: formatImageUrl(user.avatar || user.avatarUrl) }}
                  style={styles.avatarImage}
                />
              ) : (
                <Feather
                  name="user"
                  size={32}
                  color={iconColor}
                  style={{ opacity: 0.5 }}
                />
              )}
            </View>

            <View style={styles.profileInfo}>
              <ThemedText type="defaultSemiBold" style={styles.userName}>
                {user?.name || t(STRINGS.profileScreen.guestUser as any)}
              </ThemedText>
              {(user?.mobile || user?.phone) && (
                <ThemedText useSecondaryText style={styles.userInfoText}>
                  {user.mobile || user.phone}
                </ThemedText>
              )}
              <ThemedText useSecondaryText style={styles.userInfoText}>
                {user?.email || t(STRINGS.profileScreen.guestEmail as any)}
              </ThemedText>
            </View>

            <Feather
              name="chevron-right"
              size={20}
              color={iconColor}
              style={{ opacity: 0.5 }}
            />
          </TouchableOpacity>

          {/* Grid Cards */}
          <View style={styles.gridContainer}>
            {renderGridCard(
              "package",
              t(STRINGS.profileScreen.myOrders),
              t(STRINGS.profileScreen.myOrdersDesc),
              () => navigation.navigate("HomeTab", { screen: "OrdersTab" }),
            )}
            {renderGridCard(
              "home",
              t(STRINGS.profileScreen.savedAddresses),
              t(STRINGS.profileScreen.savedAddressesDesc),
              () => navigation.navigate("Location"),
            )}
          </View>

          {/* Account Section */}
          <View style={styles.sectionContainer}>
            <ThemedText useSecondaryText style={styles.sectionHeader}>
              {t(STRINGS.profileScreen.accountSection)}
            </ThemedText>
            <View
              style={[
                styles.listGroup,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              {renderListItem(
                "user",
                t(STRINGS.profileScreen.editProfileTitle),
                () => navigation.navigate("EditProfile" as never),
              )}
              {renderListItem(
                "settings",
                t(STRINGS.profileScreen.settings),
                () => {},
                true,
              )}
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.sectionContainer}>
            <ThemedText useSecondaryText style={styles.sectionHeader}>
              {t(STRINGS.profileScreen.supportSection)}
            </ThemedText>
            <View
              style={[
                styles.listGroup,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              {renderListItem(
                "message-square",
                t(STRINGS.profileScreen.helpCenter),
                () => {},
              )}
              {renderListItem(
                "headphones",
                t(STRINGS.profileScreen.contactSupport),
                () => {},
                true,
              )}
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={[
              styles.logoutBtn,
              { backgroundColor: cardColor, borderColor },
            ]}
            onPress={handleLogoutPress}
          >
            <Feather
              name="log-out"
              size={20}
              color={dangerColor}
              style={{ marginRight: 12 }}
            />
            <ThemedText style={[styles.logoutText, { color: dangerColor }]}>
              {t(STRINGS.profileScreen.logout)}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>

        {/* Logout Confirmation Modal */}
        <Modal
          visible={isLogoutModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsLogoutModalVisible(false)}
        >
          <View
            style={[styles.modalOverlay, { backgroundColor: modalOverlayBg }]}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setIsLogoutModalVisible(false)}
            />
            <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
              <View style={styles.modalHandle} />

              <View
                style={[
                  styles.modalIconContainer,
                  { backgroundColor: dangerColor + "20" },
                ]}
              >
                <Feather name="log-out" size={28} color={dangerColor} />
              </View>

              <ThemedText type="title" style={styles.modalTitle}>
                {t(STRINGS.profileScreen.logout)}
              </ThemedText>
              <ThemedText useSecondaryText style={styles.modalSubtitle}>
                {t(STRINGS.profileScreen.logoutConfirmDesc)}
              </ThemedText>

              <CustomButton
                title={t(STRINGS.profileScreen.logout)}
                onPress={confirmLogout}
                style={[
                  styles.modalBtn,
                  { backgroundColor: Colors.light.red600 },
                ]} // Always red as per screenshot
              />
              <CustomButton
                title={t(STRINGS.profileScreen.cancel)}
                type="secondary"
                onPress={() => setIsLogoutModalVisible(false)}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smd,
  },
  headerTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.black,
  },
  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: 80,
  },
  guestIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  guestTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  guestSubtitle: {
    fontSize: typography.size.mdlg,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  loginBtn: {
    width: "100%",
  },

  profileCard: {
    flexDirection: "row",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.lg,
    ...elevation.sm,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.size.xl,
    marginBottom: spacing.xxs,
  },
  userInfoText: {
    fontSize: typography.size.smmd,
    marginTop: spacing.xxs,
  },

  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  gridCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    ...elevation.sm,
    marginRight: spacing.sm,
  },
  gridIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.smd,
  },
  gridTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  gridSubtitle: {
    fontSize: typography.size.sm,
    lineHeight: 16,
  },

  sectionContainer: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.smd,
    marginLeft: spacing.sm,
    letterSpacing: 0.5,
  },
  listGroup: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    ...elevation.sm,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  listTitle: {
    flex: 1,
    fontSize: typography.size.mdlg,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    ...elevation.sm,
  },
  logoutText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: Colors.light.transparentBlack05,
  },
  modalContent: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
    alignItems: "center",
    paddingBottom: 40,
    width: "100%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: Colors.light.gray300,
    marginBottom: spacing.lg,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    textAlign: "center",
    fontSize: typography.size.mdlg,
    marginBottom: 32,
    paddingHorizontal: spacing.mlg,
    lineHeight: 22,
  },
  modalBtn: {
    width: "100%",
    marginBottom: spacing.smd,
  },
});
