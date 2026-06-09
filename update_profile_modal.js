const fs = require('fs');
const path = './src/screens/Profile/ProfileScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Modal and useState imports
content = content.replace(
  "import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';",
  "import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Modal, TouchableWithoutFeedback } from 'react-native';"
);
content = content.replace(
  "import React from 'react';",
  "import React, { useState } from 'react';"
);

// 2. Add CustomButton import
content = content.replace(
  "import { ThemedView, ThemedText } from '../../components';",
  "import { ThemedView, ThemedText, CustomButton } from '../../components';"
);

// 3. Add state
content = content.replace(
  "const { user, logout } = useAuth();",
  "const { user, logout } = useAuth();\n  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);"
);

// 4. Update handleLogout to just show modal, and create actual confirmLogout
content = content.replace(
  `  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };`,
  `  const handleLogoutPress = () => {
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalVisible(false);
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };`
);

// 5. Update the logout button onPress
content = content.replace(
  "onPress={handleLogout}",
  "onPress={handleLogoutPress}"
);

// 6. Add Modal UI before the closing </ThemedView>
const modalUI = `
      {/* Logout Confirmation Modal */}
      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsLogoutModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
              <View style={styles.modalHandle} />
              
              <View style={[styles.modalIconContainer, { backgroundColor: dangerColor + '20' }]}>
                <Feather name="log-out" size={28} color={dangerColor} />
              </View>
              
              <ThemedText type="title" style={styles.modalTitle}>{t(STRINGS.profileScreen.logout)}</ThemedText>
              <ThemedText useSecondaryText style={styles.modalSubtitle}>
                {t(STRINGS.profileScreen.logoutConfirmDesc as any)}
              </ThemedText>
              
              <CustomButton 
                title={t(STRINGS.profileScreen.logout)} 
                onPress={confirmLogout} 
                style={[styles.modalBtn, { backgroundColor: Colors.light.red600 }]} // Always red as per screenshot
              />
              <CustomButton 
                title={t(STRINGS.profileScreen.cancel as any)} 
                type="secondary"
                onPress={() => setIsLogoutModalVisible(false)} 
                style={styles.modalBtn}
              />
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
`;

content = content.replace(
  "      </SafeAreaView>\n    </ThemedView>",
  modalUI + "\n      </SafeAreaView>\n    </ThemedView>"
);

// 7. Add Modal styles
const modalStyles = `
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  modalBtn: {
    width: '100%',
    marginBottom: 12,
  }
});`;

content = content.replace("});", modalStyles);

fs.writeFileSync(path, content, 'utf8');
console.log('Done adding modal');
