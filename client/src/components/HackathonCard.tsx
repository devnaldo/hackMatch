import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Star, ArrowRight, Clock, Users } from 'lucide-react';
import { Hackathon } from '../types';
import api from '../api';
import { useAuthStore } from '../store/authStore';

interface HackathonCardProps {
  hackathon: Hackathon;
}

const HackathonCard: React.FC<HackathonCardProps> = ({ hackathon }) => {
  const { user, isAuthenticated, fetchCurrentUser } = useAuthStore();
  
  // Local interest state check
  const isInitiallyInterested = user?.hackathonsInterested
    ? (user.hackathonsInterested as string[]).includes(hackathon._id)
    : false;

  const [interested, setInterested] = useState(isInitiallyInterested);
  const [loading, setLoading] = useState(false);

  const handleInterestToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to express interest in hackathons.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post(`/hackathons/${hackathon._id}/interested`);
      setInterested(response.data.data.interested);
      await fetchCurrentUser(); // Refresh store user object
    } catch (error) {
      console.error('Failed to toggle interest:', error);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Date(hackathon.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const formattedDeadline = hackathon.registrationDeadline
    ? new Date(hackathon.registrationDeadline).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short'
      })
    : null;

  // Derive a realistic difficulty level based on tags or title length
  const getDifficulty = (): string => {
    const combinedTags = (hackathon.tags || []).join(' ').toLowerCase();
    if (combinedTags.includes('blockchain') || combinedTags.includes('ai') || combinedTags.includes('machine learning')) {
      return 'Intermediate - Hard';
    }
    return 'Open - All levels';
  };

  return (
    <div className="bg-white rounded-lg border border-beige hover:border-primary transition-all p-4 flex flex-col justify-between h-full shadow-sm text-left">
      <div>
        {/* Banner metadata (Mode, Difficulty, Star) */}
        <div className="flex justify-between items-center mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
              hackathon.mode === 'online' 
                ? 'bg-[#60737C]/10 text-[#60737C]' 
                : hackathon.mode === 'offline'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-beige text-slate-700'
            }`}>
              {hackathon.mode}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-beige/50 text-slate-600">
              {getDifficulty()}
            </span>
          </div>
          <button
            onClick={handleInterestToggle}
            disabled={loading}
            className={`p-1 rounded border transition-colors ${
              interested 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'bg-white text-slate-400 border-beige hover:text-primary hover:bg-[#FAF8F5]'
            }`}
            title={interested ? 'Interested' : 'Show Interest'}
          >
            <Star size={13} fill={interested ? 'var(--color-primary)' : 'transparent'} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-brown hover:text-primary transition-colors line-clamp-1">
          <Link to={`/hackathons/${hackathon._id}`}>{hackathon.title}</Link>
        </h3>
        
        {/* Organizer */}
        <p className="text-[10px] text-slate-400 font-semibold mb-3">Organized by {hackathon.organizer}</p>

        {/* Details list */}
        <div className="space-y-1.5 mb-4 text-[11px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-slate-400 shrink-0" />
            <span>Event: {formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span className="capitalize">Venue: {hackathon.location}</span>
          </div>
          {formattedDeadline && (
            <div className="flex items-center gap-2 text-rose-700 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 w-max">
              <Clock size={11} className="shrink-0" />
              <span className="text-[9px] font-bold">Register before: {formattedDeadline}</span>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1.5 text-slate-800 font-bold">
            <Trophy size={13} className="text-primary shrink-0" />
            <span>Prize Pool: <span className="text-brown">{hackathon.prizePool}</span></span>
          </div>
        </div>

        {/* Tags */}
        {hackathon.tags && hackathon.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {hackathon.tags.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded border border-beige bg-[#FAF8F5] text-slate-500 text-[9px] font-mono">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action links */}
      <div className="border-t border-beige pt-3 mt-auto flex justify-between items-center text-[10px]">
        <span className="text-slate-400 font-semibold flex items-center gap-1">
          <Users size={12} className="text-slate-400" />
          Size: {hackathon.teamSize?.min || 1}-{hackathon.teamSize?.max || 4} Members
        </span>
        <Link
          to={`/hackathons/${hackathon._id}`}
          className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
        >
          Workspace Details <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
};

export default HackathonCard;
