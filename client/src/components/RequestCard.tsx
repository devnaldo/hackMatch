import React, { useState } from 'react';
import { Check, X, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { TeamRequest } from '../types';
import { useAuthStore } from '../store/authStore';

interface RequestCardProps {
  request: TeamRequest;
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onAccept, onReject }) => {
  const { user } = useAuthStore();
  const [actionLoading, setActionLoading] = useState(false);

  if (!user) return null;

  const isIncoming = request.receiverId._id === user._id;
  const teamName = request.teamId?.teamName || 'Unknown Team';
  const senderName = request.senderId?.name || 'A user';
  const receiverName = request.receiverId?.name || 'A user';

  const handleAction = async (action: 'accept' | 'reject') => {
    setActionLoading(true);
    try {
      if (action === 'accept') {
        await onAccept(request._id);
      } else {
        await onReject(request._id);
      }
    } catch (error) {
      console.error(`Request action failed:`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7C9579]/10 text-[#7C9579] border border-[#7C9579]/20">Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">Declined</span>;
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={10} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-beige p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary text-left">
      <div className="flex gap-3">
        {/* Icon indicating incoming vs outgoing */}
        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border ${
          isIncoming 
            ? 'bg-[#FAF8F5] text-primary border-beige' 
            : 'bg-[#FAF8F5] text-slate-400 border-beige'
        }`}>
          {isIncoming ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
        </div>

        {/* Text descriptions */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              {request.type === 'join_request' 
                ? (isIncoming ? `${senderName} requested to join` : `You requested to join`)
                : (isIncoming ? `${senderName} invited you to join` : `You invited ${receiverName} to join`)
              }
            </span>
            <span className="text-[9px] font-bold uppercase bg-[#FAF8F5] border border-beige text-brown px-2 py-0.5 rounded">
              {teamName}
            </span>
          </div>

          {request.message && (
            <p className="text-[10px] text-slate-500 bg-[#FAF8F5] border border-beige rounded p-2 italic leading-relaxed max-w-xl">
              "{request.message}"
            </p>
          )}

          <p className="text-[9px] text-slate-400 font-medium">
            {new Date(request.createdAt).toLocaleDateString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              day: 'numeric',
              month: 'short'
            })}
          </p>
        </div>
      </div>

      {/* Actions (Accept/Reject for incoming pending, badge for others) */}
      <div className="flex items-center justify-end gap-2 self-end md:self-center shrink-0">
        {request.status === 'pending' && isIncoming ? (
          <div className="flex gap-2 text-[10px]">
            <button
              onClick={() => handleAction('reject')}
              disabled={actionLoading}
              className="px-2.5 py-1 rounded bg-white border border-beige hover:bg-rose-50 text-[#2D2D2D] hover:text-rose-700 font-bold disabled:opacity-50 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => handleAction('accept')}
              disabled={actionLoading}
              className="px-3 py-1 rounded bg-primary text-white hover:bg-primary-hover font-bold disabled:opacity-50 transition-colors shadow-sm"
            >
              Accept
            </button>
          </div>
        ) : (
          getStatusBadge(request.status)
        )}
      </div>
    </div>
  );
};

export default RequestCard;
