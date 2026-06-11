import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthApi } from '../services/api/auth.api';
import * as SecureStore from 'expo-secure-store';export type User = {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, pass: string) => Promise<void>; // keeping for google mock if needed
  updateProfile: (updates: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const existingToken = await SecureStore.getItemAsync('sessionToken');
        if (!existingToken) {
          console.log('No session token found. Creating guest session...');
          await AuthApi.createGuestSession();
        } else {
          console.log('Session token exists.');
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, []);
  const verifyOtp = async (phone: string, otp: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (otp === '123456') { // mock valid otp
          setUser({ id: `u_${Date.now()}`, name: 'Verified User', email: phone });
          resolve();
        } else {
          reject(new Error('Invalid OTP. Please try again.'));
        }
      }, 1000);
    });
  };

  const signup = async (name: string, email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (!name || !email || !pass) {
          reject(new Error('Missing mandatory fields'));
          return;
        }
        setUser({ id: `u_${Date.now()}`, name, email });
        resolve();
      }, 1000);
    });
  };

  const updateProfile = async (updates: Partial<User>) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUser(prev => {
          if (prev) {
            return { ...prev, ...updates };
          }
          // If editing profile while guest, create a mock user object
          return {
            id: `u_${Date.now()}`,
            name: updates.name || '',
            email: updates.email || '',
            mobile: updates.mobile,
            avatar: updates.avatar
          };
        });
        resolve();
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, verifyOtp, signup, logout, updateProfile }}>
      {!isInitializing && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
