import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_LOCATION: '@user_location',
  DOWNLOAD_DIRECTORY_URI: 'downloadDirectoryUri',
};

class StorageService {
  /**
   * Set an item in AsyncStorage
   */
  static async setItem(key: string, value: string | object): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`Error saving item ${key} to storage:`, error);
    }
  }

  /**
   * Get a string item from AsyncStorage
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error retrieving item ${key} from storage:`, error);
      return null;
    }
  }

  /**
   * Get an object item from AsyncStorage
   */
  static async getObject<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
      return null;
    } catch (error) {
      console.error(`Error retrieving object ${key} from storage:`, error);
      return null;
    }
  }

  /**
   * Remove an item from AsyncStorage
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
    }
  }
}

export { StorageService, STORAGE_KEYS };
