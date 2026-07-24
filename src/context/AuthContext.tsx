import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, rememberMe: boolean) => { success: boolean; error?: string };
  logout: () => void;
}

const ALLOWED_EMAIL =
  import.meta.env.NEXT_PUBLIC_ALLOWED_EMAIL || 'mahmoud@management.com';
const ALLOWED_PASS =
  import.meta.env.NEXT_PUBLIC_ALLOWED_PASSWORD || 'Mahmoud2026#';
const STORAGE_KEY = 'inventory_auth_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local or session storage on app mount
    const savedLocal = localStorage.getItem(STORAGE_KEY);
    const savedSession = sessionStorage.getItem(STORAGE_KEY);

    if (savedLocal) {
      try {
        setUser(JSON.parse(savedLocal));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    } else if (savedSession) {
      try {
        setUser(JSON.parse(savedSession));
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, pass: string, rememberMe: boolean) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Strict single user check
    if (trimmedEmail !== ALLOWED_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: 'عذراً، هذا النظام مخصص لمستخدم محدد فقط.',
      };
    }

    if (pass !== ALLOWED_PASS) {
      return {
        success: false,
        error: 'كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.',
      };
    }

    const authenticatedUser: User = {
      email: ALLOWED_EMAIL,
      name: 'محمود - المدير العام',
      role: 'مدير النظام',
    };

    setUser(authenticatedUser);

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
      localStorage.removeItem(STORAGE_KEY);
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
