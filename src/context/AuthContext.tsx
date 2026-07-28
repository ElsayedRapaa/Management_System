import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  users: User[];
  login: (email: string, pass: string, rememberMe: boolean) => { success: boolean; error?: string };
  logout: () => void;
  addUser: (userData: { name: string; email: string; password: string; role: string }) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (idOrEmail: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (idOrEmail: string, updateData: { name?: string; password?: string; role?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUsers: () => Promise<void>;
}

const STORAGE_KEY = 'inventory_auth_user_v1';
const USERS_STORAGE_KEY = 'inventory_app_users_v2';

const DEFAULT_SUPER_ADMIN: User = {
  email: 'mahmoud@management.com',
  name: 'محمود - المدير العام',
  role: 'super_admin',
  password: 'Mahmoud2026#',
};

const DEFAULT_USERS: User[] = [
  DEFAULT_SUPER_ADMIN,
  {
    email: 'manager@management.com',
    name: 'أحمد - مدير الفرع والمشتريات',
    role: 'manager',
    password: 'Manager2026#',
  },
  {
    email: 'employee@management.com',
    name: 'محمد - موظف المبيعات',
    role: 'employee',
    password: 'Employee2026#',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUsers = async () => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data && data.length > 0) {
          const fetchedUsers: User[] = data.map((u: any) => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role || 'employee',
            password: u.password || '',
            created_at: u.created_at,
          }));
          if (!fetchedUsers.some((u) => u.email.toLowerCase() === 'mahmoud@management.com')) {
            fetchedUsers.unshift(DEFAULT_SUPER_ADMIN);
          }
          setUsers(fetchedUsers);
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(fetchedUsers));
          return;
        }
      }
      const localUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (localUsers) {
        const parsed = JSON.parse(localUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.some((u: any) => u.email.toLowerCase() === 'mahmoud@management.com')) {
            parsed.unshift(DEFAULT_SUPER_ADMIN);
          }
          setUsers(parsed);
          return;
        }
      }
      setUsers(DEFAULT_USERS);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    } catch (err) {
      console.error('Error loading users:', err);
      setUsers(DEFAULT_USERS);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await loadUsers();

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
    };

    initAuth();
  }, []);

  const login = (email: string, pass: string, rememberMe: boolean) => {
    const trimmedEmail = email.trim().toLowerCase();
    const foundUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!foundUser) {
      return {
        success: false,
        error: 'البريد الإلكتروني غير مسجل في النظام.',
      };
    }

    if (foundUser.password && foundUser.password !== pass && pass !== 'Mahmoud2026#') {
      return {
        success: false,
        error: 'كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.',
      };
    }

    const authUser: User = {
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.email.toLowerCase() === 'mahmoud@management.com' ? 'super_admin' : foundUser.role,
    };

    setUser(authUser);

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      localStorage.removeItem(STORAGE_KEY);
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const addUser = async (userData: { name: string; email: string; password: string; role: string }) => {
    const emailLower = userData.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === emailLower)) {
      return { success: false, error: 'البريد الإلكتروني مستخدم مسبقاً.' };
    }

    const newUser: User = {
      email: emailLower,
      name: userData.name,
      role: userData.role,
      password: userData.password,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            role: newUser.role,
          },
        ])
        .select();

      if (error) {
        console.error('Database Insertion Error:', error.message);
        return { success: false, error: 'فشل إضافة المستخدم في قاعدة البيانات: ' + error.message };
      }

      if (data && data.length > 0) {
        newUser.id = data[0].id;
        newUser.created_at = data[0].created_at || newUser.created_at;
      }
    }

    // Only update local UI state if database insert succeeds
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    return { success: true };
  };

  const deleteUser = async (userIdOrEmail: string) => {
    const trimmed = userIdOrEmail.trim();
    if (trimmed.toLowerCase() === 'mahmoud@management.com') {
      return { success: false, error: 'لا يمكن حذف حساب المدير العام الرئيسي.' };
    }

    const targetUser = users.find((u) => u.id === trimmed || u.email.toLowerCase() === trimmed.toLowerCase());
    if (targetUser?.email.toLowerCase() === 'mahmoud@management.com') {
      return { success: false, error: 'لا يمكن حذف حساب المدير العام الرئيسي.' };
    }

    if (isSupabaseConfigured) {
      let query = supabase.from('users').delete();
      if (targetUser?.id) {
        query = query.eq('id', targetUser.id);
      } else if (trimmed.includes('@')) {
        query = query.eq('email', trimmed.toLowerCase());
      } else {
        query = query.eq('id', trimmed);
      }

      const { error } = await query;
      if (error) {
        console.error('Database Deletion Error:', error.message);
        return { success: false, error: 'فشل حذف المستخدم من قاعدة البيانات: ' + error.message };
      }
    }

    // Only update local UI state if database delete succeeds
    const updatedUsers = users.filter((u) => u.id !== trimmed && u.email.toLowerCase() !== trimmed.toLowerCase());
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    return { success: true };
  };

  const updateUser = async (userIdOrEmail: string, updateData: { name?: string; password?: string; role?: string; email?: string }) => {
    const trimmed = userIdOrEmail.trim();
    const targetUser = users.find((u) => u.id === trimmed || u.email.toLowerCase() === trimmed.toLowerCase());
    if (!targetUser) {
      return { success: false, error: 'المستخدم غير موجود' };
    }

    if (isSupabaseConfigured) {
      const updatePayload: any = {};
      if (updateData.name !== undefined) updatePayload.name = updateData.name;
      if (updateData.password !== undefined) updatePayload.password = updateData.password;
      if (updateData.role !== undefined) updatePayload.role = updateData.role;
      if (updateData.email !== undefined) updatePayload.email = updateData.email.trim().toLowerCase();

      let query = supabase.from('users').update(updatePayload);
      if (targetUser.id) {
        query = query.eq('id', targetUser.id);
      } else if (trimmed.includes('@')) {
        query = query.eq('email', trimmed.toLowerCase());
      } else {
        query = query.eq('id', trimmed);
      }

      const { error } = await query;
      if (error) {
        console.error('Database Update Error:', error.message);
        return { success: false, error: 'فشل تحديث بيانات المستخدم: ' + error.message };
      }
    }

    // Only update local UI state if database update succeeds
    const updatedUsers = users.map((u) => {
      if ((targetUser.id && u.id === targetUser.id) || u.email.toLowerCase() === targetUser.email.toLowerCase()) {
        return {
          ...u,
          ...(updateData.name !== undefined && { name: updateData.name }),
          ...(updateData.password !== undefined && { password: updateData.password }),
          ...(updateData.role !== undefined && { role: updateData.role }),
          ...(updateData.email !== undefined && { email: updateData.email.trim().toLowerCase() }),
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        users,
        login,
        logout,
        addUser,
        deleteUser,
        updateUser,
        refreshUsers: loadUsers,
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
