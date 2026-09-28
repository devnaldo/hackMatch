import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api';
import { User } from '../types';
import UserCard from '../components/UserCard';

const FindTeammatesPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [matches, setMatches] = useState<{ user: User; score: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/match/teammates');
      setMatches(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve teammates recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left text-[#2C2C2B] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 pb-6 border-b border-beige">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-primary" /> Student Compatibility Core
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D2D2D] tracking-tight">
            Teammate Discovery Directory
          </h1>
          <p className="text-[#5A5A57] text-xs mt-1">
            Recommended classmates sorted by stack compatibility, active coursework tags, and availability.
          </p>
        </div>

        <button
          onClick={fetchMatches}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-beige bg-white hover:bg-[#FAF8F5] text-brown rounded text-xs font-bold transition-colors shrink-0 self-start sm:self-auto"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh recommendations
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Retrieving recommended classmate cards...</p>
        </div>
      ) : error ? (
        <div className="flex gap-2 p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs max-w-md mx-auto items-center">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white border border-beige rounded-lg p-12 text-center max-w-md mx-auto">
          <Sparkles size={32} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-xs font-bold text-[#2D2D2D]">No Matches Identified</h3>
          <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed font-semibold">
            No matches found. Try defining more specific technical skills in your profile to trigger classmate alignment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {matches.map(({ user: matchUser, score }) => (
            <UserCard key={matchUser._id} user={matchUser} compatibilityScore={score} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FindTeammatesPage;
