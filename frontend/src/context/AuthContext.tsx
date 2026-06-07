import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';
import { setAccessToken } from '../api/client';
import { normalizeUser, refreshToken as apiRefreshToken, logout as apiLogout } from '../api/auth';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = (newToken: string, newUser: User) => {
    setAccessToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore errors — still clear local state
    }
    setAccessToken(null);
    setToken(null);
    setUser(null);
  };

  // Silent auth on mount: try to refresh the access token using the HttpOnly cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const refreshRes = await apiRefreshToken();
        const newToken: string = refreshRes.data.accessToken;
        setAccessToken(newToken);
        setToken(newToken);

        const meRes = await api.get('/api/auth/me');
        const fetchedUser = normalizeUser(meRes.data.user);
        setUser(fetchedUser);
      } catch {
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
