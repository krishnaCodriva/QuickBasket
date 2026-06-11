/**
 * AuthContext.tsx
 * Refactored under the QuickBasket Enterprise Architecture Plan.
 *
 * Changes:
 * - User type imported from core/types (single source of truth, removed local duplicate)
 * - Context initialized with null + guard in useAuth (fixes `{} as AuthContextType` anti-pattern)
 * - Context value memoized with useMemo to prevent unnecessary re-renders
 * - All async functions retain existing behavior (no logic changes, only type safety)
 * - Re-exports User type for backward compatibility
 */

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import type { User } from '../core/types/domain';

// Re-export for backward compatibility with existing imports
export type { User };

// ─── Context type ─────────────────────────────────────────────────────────────

type AuthContextType = {
  user: User | null;
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
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
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
