import { api } from './client';
import type { User } from '../types';

export function normalizeUser(backendUser: any): User {
  return {
    _id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    bio: backendUser.bio,
    avatarUrl: backendUser.avatarUrl,
    createdAt: backendUser.createdAt,
  };
}

export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password });

export const register = (name: string, email: string, password: string, bio?: string) =>
  api.post('/api/auth/register', { name, email, password, bio: bio?.trim() || undefined });

export const getMe = () => api.get('/api/auth/me');
