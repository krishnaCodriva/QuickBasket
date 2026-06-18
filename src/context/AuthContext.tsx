import React, {
  createContext, useContext, useState, useEffect, useMemo,
  useCallback
} from 'react';
import { storage } from '../utils/storage';
import { sessionService } from '../services/session/sessionService';
import { authService } from '../services/auth/authService';
import { userService } from '../services/user/userService';
import { GOOGLE_WEB_CLIENT_ID } from '../config/api.config';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { User } from '../core/types/domain';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Safe mock for Expo Go
let GoogleSignin: any = {
  configure: () => { },
  hasPlayServices: async () => { },
  signIn: async () => { throw new Error('Google Sign-In is not supported in Expo Go. Please use the EAS APK.'); },
  signOut: async () => { },
};
let isSuccessResponse: any = () => false;
console.log(isExpoGo, 4444)
if (!isExpoGo) {
  try {
    const RNGoogleSignin = require('@react-native-google-signin/google-signin');
    GoogleSignin = RNGoogleSignin.GoogleSignin;
    isSuccessResponse = RNGoogleSignin.isSuccessResponse;

    console.log('--- GOOGLE_WEB_CLIENT_ID AT RUNTIME ---', GOOGLE_WEB_CLIENT_ID);
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  } catch (e) {
    console.warn('Google Signin module not found (Native code missing)');
  }
}

export type User = {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean; // Added for initial bootstrap state
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  /** Kept for Google mock sign-in flow */
  signup: (name: string, email: string, pass: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
};

// ─── Context (null-initialized — safe guard enforced in useAuth) ───────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Bootstrap app on start
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const userToken = await storage.getUserToken();
        if (userToken) {
          // If we have a user token, fetch real user profile
          try {
            const res = await userService.getProfile();
            if (res.success && res.data) {
              setUser(res.data);
            }
          } catch (profileError) {
            console.error('Failed to fetch user profile, but token exists.', profileError);
          }
        } else {
          // If not logged in, check for a guest token
          const guestToken = await storage.getGuestToken();
          if (!guestToken) {
            // If completely new user, get a guest token
            await sessionService.createGuestSession();
          }
        }
      } catch (e) {
        console.error('Failed to bootstrap app state:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    try {
      const data = await authService.verifyOtp(phone, otp);
      // Backend returns: data.data.accessToken and data.data.user
      const token = data?.data?.accessToken;
      const verifiedUser = data?.data?.user;

      if (token && verifiedUser) {
        await storage.setUserToken(token); // Save secure token
        setUser(verifiedUser);             // Set user state
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid OTP. Please try again.';
      throw new Error(msg);
    }
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    // Calling the service layer
    await authService.sendOtp(phone);
  }, []);

  const signup = useCallback(
    async (name: string, email: string, pass: string) => {
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
    },
    [],
  );

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      // Map the frontend updates object to the backend payload structure
      const payload = {
        name: updates.name,
        email: updates.email,
        phone: updates.phone || updates.mobile,
        avatarUrl: updates.avatarUrl || updates.avatar,
      };

      const res = await userService.updateProfile(payload);

      if (res.success && res.data) {
        setUser((prev) => ({
          ...prev,
          ...res.data,
        }));
      } else {
        throw new Error(res.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error in AuthContext:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    try {
      await storage.clearTokens();
      await GoogleSignin.signOut();

      // Immediately create a new guest session so the user can continue shopping as a guest
      await sessionService.createGuestSession();
    } catch (e) {
      console.error('Logout error:', e);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      console.log(123456)

      const response = await GoogleSignin.signIn();
      console.log(response, 123456)
      if (isSuccessResponse(response) && response.data.idToken) {
        const guestToken = await storage.getGuestToken() || undefined;
        const res = await authService.googleLogin(response.data.idToken, guestToken);

        if (res.success && res.data) {
          const { accessToken, user: userProfile } = res.data;
          await storage.setUserToken(accessToken);
          if (guestToken) {
            await storage.clearGuestToken();
          }
          setUser(userProfile);
        } else {
          throw new Error(res.message || 'Google Login failed');
        }
      } else {
        throw new Error('No ID Token from Google');
      }
    } catch (error) {
      console.error('Failed to login with Google:', JSON.stringify(error));
      throw error;
    }
  }, []);

  const contextValue = useMemo(
    () => ({ user, isLoading, sendOtp, verifyOtp, signup, updateProfile, loginWithGoogle, logout }),
    [user, isLoading, sendOtp, verifyOtp, signup, updateProfile, loginWithGoogle, logout],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
