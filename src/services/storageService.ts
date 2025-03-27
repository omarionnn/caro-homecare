import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service for handling secure storage operations
 * Uses EncryptedStorage for sensitive data and AsyncStorage for non-sensitive data
 */
class StorageService {
  /**
   * Store a value securely
   * @param key Storage key
   * @param value Value to store (will be stringified)
   * @param secure Whether to use encrypted storage
   */
  async setItem(key: string, value: any, secure: boolean = false): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (secure) {
      await EncryptedStorage.setItem(key, stringValue);
    } else {
      await AsyncStorage.setItem(key, stringValue);
    }
  }

  /**
   * Retrieve a stored value
   * @param key Storage key
   * @param secure Whether to use encrypted storage
   * @param parseJson Whether to parse the result as JSON
   * @returns The stored value or null if not found
   */
  async getItem(key: string, secure: boolean = false, parseJson: boolean = true): Promise<any> {
    try {
      let value;
      
      if (secure) {
        value = await EncryptedStorage.getItem(key);
      } else {
        value = await AsyncStorage.getItem(key);
      }
      
      if (value === null) return null;
      
      if (parseJson) {
        try {
          return JSON.parse(value);
        } catch (e) {
          // If parsing fails, return the raw value
          return value;
        }
      }
      
      return value;
    } catch (error) {
      console.error('Error retrieving data from storage:', error);
      return null;
    }
  }

  /**
   * Remove a stored value
   * @param key Storage key
   * @param secure Whether to use encrypted storage
   */
  async removeItem(key: string, secure: boolean = false): Promise<void> {
    if (secure) {
      await EncryptedStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }

  /**
   * Clear all stored values
   * @param secure Whether to clear encrypted storage
   */
  async clear(secure: boolean = false): Promise<void> {
    if (secure) {
      await EncryptedStorage.clear();
    } else {
      await AsyncStorage.clear();
    }
  }

  /**
   * Get all storage keys
   * @param secure Whether to get keys from encrypted storage
   * @returns Array of storage keys
   */
  async getAllKeys(secure: boolean = false): Promise<string[]> {
    if (secure) {
      // EncryptedStorage doesn't support getAllKeys directly
      // This would be implementation-specific
      return [];
    } else {
      return await AsyncStorage.getAllKeys();
    }
  }
}

export const storageService = new StorageService();
