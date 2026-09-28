import React, { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { Bell, Check, Loader2, RefreshCw } from 'lucide-react';
import NotificationItem from '../components/NotificationItem';

const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brown tracking-tight">System Alerts</h1>
          <p className="text-slate-500 text-xs mt-1">
            Stay updated on join requests, team invitation approvals, and hackathon schedules.
          </p>
        </div>

        <div className="flex gap-2 shrink-0 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-beige hover:bg-beige/40 text-brown text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Check size={14} /> Clear All Unread
            </button>
          )}

          <button
            onClick={() => fetchNotifications()}
            disabled={loading}
            className="inline-flex items-center justify-center p-2 border border-beige bg-cream hover:bg-beige/40 text-brown rounded-xl transition-colors shadow-sm"
            title="Refresh alerts"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Loader2 className="animate-spin text-brown" size={32} />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Loading system alerts...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-cream/40 border border-beige rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto">
          <Bell size={32} className="text-brown/20 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-brown">Inbox Empty</h3>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-semibold">
            You don't have any notifications yet. When you receive join requests, invitations, or acceptances, they will appear here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onRead={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
