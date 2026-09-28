import { create } from 'zustand';
import api from '../api';
import { Notification, ApiResponse } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const response = await api.get<ApiResponse<Notification[]>>('/notifications');
      const notifications = response.data.data;
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      
      set({
        notifications,
        unreadCount,
        loading: false
      });
    } catch (error) {
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      
      set((state) => {
        const updated = state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        );
        const unreadCount = updated.filter((n) => !n.isRead).length;
        
        return {
          notifications: updated,
          unreadCount
        };
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      
      set((state) => {
        const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
        return {
          notifications: updated,
          unreadCount: 0
        };
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  addNotification: (notification) => {
    set((state) => {
      // Avoid duplicate adding
      if (state.notifications.some((n) => n._id === notification._id)) {
        return state;
      }
      const updated = [notification, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length
      };
    });
  }
}));
