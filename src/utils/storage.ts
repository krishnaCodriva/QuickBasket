import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  USER_TOKEN: 'user_token',
  GUEST_TOKEN: 'guest_token',
  USER_DATA: 'user_data',
};

export const storage = {
  // User Token (Secure)
  setUserToken: async (token: string) => {
    try {
      await SecureStore.setItemAsync(KEYS.USER_TOKEN, token);
    } catch (e) {
      console.error('Error saving user token to SecureStore', e);
    }
  },
  getUserToken: async () => {
    try {
      return await SecureStore.getItemAsync(KEYS.USER_TOKEN);
    } catch (e) {
      console.error('Error reading user token from SecureStore', e);
      return null;
    }
  },

  // Guest Token (Secure)
  setGuestToken: async (token: string) => {
    try {
      await SecureStore.setItemAsync(KEYS.GUEST_TOKEN, token);
    } catch (e) {
      console.error('Error saving guest token to SecureStore', e);
    }
  },
  getGuestToken: async () => {
    try {
      return await SecureStore.getItemAsync(KEYS.GUEST_TOKEN);
    } catch (e) {
      console.error('Error reading guest token from SecureStore', e);
      return null;
    }
  },

  // Clear All
  clearTokens: async () => {
    try {
      await SecureStore.deleteItemAsync(KEYS.USER_TOKEN);
      await SecureStore.deleteItemAsync(KEYS.GUEST_TOKEN);
      await AsyncStorage.removeItem(KEYS.USER_DATA);
    } catch (e) {
      console.error('Error clearing tokens', e);
    }
  },

  clearGuestToken: async () => {
    try {
      await SecureStore.deleteItemAsync(KEYS.GUEST_TOKEN);
    } catch (e) {
      console.error('Error clearing guest token', e);
    }
  },
};
