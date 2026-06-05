/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiFetch } from '../api/client';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to log in
  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("recipehub_local_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // Function to log out
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("recipehub_local_user");
    setToken(null);
    setUser(null);
  };

  // On mount check token and rehydrate user
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        try {
          // Rehydrate by calling GET /api/auth/me
          const fetchedUser = await apiFetch("/api/auth/me", { method: "GET" });
          setUser(fetchedUser);
          setToken(savedToken);
        } catch (err) {
          console.error("Auth rehydration failed, logging out.", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
