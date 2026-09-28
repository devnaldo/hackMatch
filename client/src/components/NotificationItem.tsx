import React from 'react';
import { Bell, Check, Users, MessageSquare, AlertCircle, XCircle } from 'lucide-react';
import { Notification } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => Promise<void>;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead }) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'join_request':
      case 'invitation':
        return <Users size={14} className="text-brown" />;
      case 'acceptance':
        return <Check size={14} className="text-brown" />;
      case 'rejection':
      case 'left_team':
        return <XCircle size={14} className="text-brown" />;
      case 'deadline':
        return <AlertCircle size={14} className="text-brown" />;
      default:
        return <Bell size={14} className="text-brown" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'join_request':
      case 'invitation':
        return 'bg-cream border-beige';
      case 'acceptance':
        return 'bg-sage/20 border-sage/40';
      case 'rejection':
      case 'left_team':
        return 'bg-dusty-rose/20 border-dusty-rose/40';
      case 'deadline':
        return 'bg-peach/20 border-peach/40';
      default:
        return 'bg-cream border-beige';
    }
  };

  return (
    <div className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
      notification.isRead 
        ? 'bg-cream/20 border-beige/60 opacity-60' 
        : 'bg-cream border-beige shadow-sm'
    }`}>
      <div className="flex gap-3 items-start text-left">
        {/* Icon */}
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${getNotificationBg(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </div>

        {/* Details */}
        <div>
          <p className={`text-xs ${notification.isRead ? 'text-slate-500' : 'text-brown font-semibold'}`}>
            {notification.text}
          </p>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {new Date(notification.createdAt).toLocaleDateString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              day: 'numeric',
              month: 'short'
            })}
          </span>
        </div>
      </div>

      {/* Action to mark read */}
      {!notification.isRead && (
        <button
          onClick={() => onRead(notification._id)}
          className="shrink-0 text-[10px] font-bold text-brown hover:text-primary-hover px-2.5 py-1 hover:bg-beige/40 rounded-lg transition-colors border border-beige"
        >
          Mark Read
        </button>
      )}
    </div>
  );
};

export default NotificationItem;
