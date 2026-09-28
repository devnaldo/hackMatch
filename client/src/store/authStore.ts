import { create } from 'zustand';
import api from '../api';
import { User, ApiResponse } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: Partial<User> & { password?: string }) => Promise<boolean>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  setProfilePicture: (url: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('hackmatch_token'),
  isAuthenticated: !!localStorage.getItem('hackmatch_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      localStorage.setItem('hackmatch_token', token);
      set({
        token,
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ loading: false, error: message });
      return false;
    }
  },

  register: async (registerData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', registerData);
      const { token, user } = response.data.data;
      
      localStorage.setItem('hackmatch_token', token);
      set({
        token,
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed.';
      set({ loading: false, error: message });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('hackmatch_token');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  },

  fetchCurrentUser: async () => {
    const token = localStorage.getItem('hackmatch_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      set({
        user: response.data.data,
        isAuthenticated: true,
        loading: false
      });
    } catch (err: any) {
      localStorage.removeItem('hackmatch_token');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Session expired. Please login again.'
      });
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put<ApiResponse<User>>('/users/profile', profileData);
      set({
        user: response.data.data,
        loading: false,
        error: null
      });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update profile.';
      set({ loading: false, error: message });
      return false;
    }
  },

  setProfilePicture: (url) => {
    set((state) => ({
      user: state.user ? { ...state.user, profilePicture: url } : null
    }));
  },

  clearError: () => set({ error: null })
}));
