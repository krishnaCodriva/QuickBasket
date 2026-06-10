import React, { createContext, useContext, useState, useEffect , useMemo,
  useCallback} from 'react';
import { storage } from '../utils/storage';
import { sessionService } from '../services/session/sessionService';
import type { User } from '../core/types/domain';

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
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  /** Kept for Google mock sign-in flow */
  signup: (name: string, email: string, pass: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
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
          // If we have a user token, they are logged in.
          // For now, we set a mock user. Later, call a /me API.
          setUser({ id: 'restored', name: 'Logged In User', email: '' });
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
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (otp === '123456') {
          // mock valid OTP
          setUser({ id: `u_${Date.now()}`, name: 'Verified User', email: phone });
          resolve();
        } else {
          reject(new Error('Invalid OTP. Please try again.'));
        }
      }, 1000);
    });
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
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUser((prev) => {
          if (prev) {
            return { ...prev, ...updates };
          }
          // Allow profile editing even for guest users (creates mock user)
          return {
            id: `u_${Date.now()}`,
            name: updates.name ?? '',
            email: updates.email ?? '',
            mobile: updates.mobile,
            avatar: updates.avatar,
          };
        });
        resolve();
      }, 500);
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const contextValue = useMemo(
    () => ({ user, verifyOtp, signup, updateProfile, logout }),
    [user, verifyOtp, signup, updateProfile, logout],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, verifyOtp, signup, logout, updateProfile }}>
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
