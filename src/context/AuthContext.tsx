import React, { createContext, useContext, useState } from 'react';

export type User = {
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
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
