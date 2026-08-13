import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { authApi } from '@/api/auth';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; phone?: string; password: string }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fitscan_token'));
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('fitscan_token')) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await authApi.getMe();
      setUser(data.user);
    } catch {
      localStorage.removeItem('fitscan_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('fitscan_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload: { name: string; email: string; phone?: string; password: string }) => {
    const { data } = await authApi.register(payload);
    localStorage.setItem('fitscan_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('fitscan_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
