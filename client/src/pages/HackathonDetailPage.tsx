import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Star, ChevronLeft, ArrowRight, ExternalLink, Users, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api';
import { Hackathon, Team } from '../types';
import { useAuthStore } from '../store/authStore';
import TeamCard from '../components/TeamCard';

const HackathonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, fetchCurrentUser } = useAuthStore();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [interestLoading, setInterestLoading] = useState(false);

  const isInterested = user?.hackathonsInterested
    ? (user.hackathonsInterested as string[]).includes(id || '')
    : false;

  useEffect(() => {
    const fetchHackathonDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const hackathonRes = await api.get(`/hackathons/${id}`);
        setHackathon(hackathonRes.data.data);

        // Fetch teams registered for this hackathon
        const teamsRes = await api.get(`/teams?hackathonId=${id}`);
        setTeams(teamsRes.data.data);
      } catch (error) {
        console.error('Failed to load hackathon details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathonDetails();
  }, [id]);

  const handleInterestToggle = async () => {
    if (!isAuthenticated || !hackathon) {
      alert('Please log in to express interest in hackathons.');
      return;
    }

    setInterestLoading(true);
    try {
      await api.post(`/hackathons/${hackathon._id}/interested`);
      await fetchCurrentUser(); // refresh user store
    } catch (error) {
      console.error('Failed to toggle interest:', error);
    } finally {
      setInterestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-brown" size={32} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-cream/40 rounded-2xl p-8 border border-beige max-w-md mx-auto shadow-sm">
          <p className="text-slate-500 text-xs font-semibold mb-6">Hackathon event not found.</p>
          <Link to="/hackathons" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-sm">
            Back to Hackathons
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(hackathon.date).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedDeadline = new Date(hackathon.registrationDeadline).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Back button */}
      <Link to="/hackathons" className="inline-flex items-center gap-1 text-slate-500 hover:text-brown text-xs font-bold mb-6 transition-colors uppercase tracking-wider">
        <ChevronLeft size={14} /> Back to Hackathons
      </Link>

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Info Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              hackathon.mode === 'online' 
                ? 'bg-cream text-brown border-beige' 
                : hackathon.mode === 'offline'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-beige/50 text-slate-700 border-beige'
            }`}>
              {hackathon.mode}
            </span>

            <h1 className="text-xl sm:text-2xl font-bold text-brown tracking-tight mt-3 leading-tight">
              {hackathon.title}
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Organized by {hackathon.organizer}</p>

            <div className="mt-6">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-beige mb-3">
                Event Description
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                {hackathon.description}
              </p>
            </div>

            {hackathon.rules && (
              <div className="mt-6">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-beige mb-3">
                  Rules & Guidelines
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap font-medium bg-cream border border-beige p-4 rounded-xl">
                  {hackathon.rules}
                </p>
              </div>
            )}
          </div>

          {/* Subscribed Teams list */}
          <div>
            <h2 className="text-sm font-bold text-brown uppercase mb-4">Teams Competing ({teams.length})</h2>
            {teams.length === 0 ? (
              <div className="bg-cream/40 border border-beige rounded-2xl p-8 text-center text-slate-400 text-xs italic shadow-sm font-semibold">
                No teams have registered for this hackathon on HackMatch yet. Create one to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {teams.map((team) => (
                  <TeamCard key={team._id} team={team} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Info: Event Specs */}
        <div className="space-y-6">
          <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-brown uppercase pb-3 border-b border-beige text-left">
              Event Details
            </h3>

            {/* Quick stats list */}
            <div className="space-y-4 text-left">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-600 block mb-0.5">Event Date</label>
                <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold">
                  <Calendar size={14} className="text-slate-400" />
                  <span>{formattedDate}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-600 block mb-0.5">Deadline</label>
                <div className="flex items-center gap-2 text-primary text-xs font-bold">
                  <AlertCircle size={14} className="text-primary" />
                  <span>{formattedDeadline}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-600 block mb-0.5">Location</label>
                <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="capitalize">{hackathon.location}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-600 block mb-0.5">Prize Pool</label>
                <div className="flex items-center gap-2 text-brown text-xs font-bold">
                  <Trophy size={14} className="text-primary" />
                  <span>{hackathon.prizePool}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-600 block mb-0.5">Team Limits</label>
                <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold">
                  <Users size={14} className="text-slate-400" />
                  <span>{hackathon.teamSize?.min || 1} to {hackathon.teamSize?.max || 4} Members</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-4 border-t border-beige">
              <button
                onClick={handleInterestToggle}
                disabled={interestLoading}
                className={`w-full py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                  isInterested 
                    ? 'bg-primary/20 text-primary border-primary/30' 
                    : 'bg-cream text-brown border-beige hover:bg-beige/40'
                }`}
              >
                <Star size={14} fill={isInterested ? 'var(--color-primary)' : 'transparent'} className={isInterested ? 'text-primary' : 'text-slate-400'} />
                <span>{isInterested ? 'Interested' : 'Show Interest'}</span>
              </button>

              {hackathon.registrationLink && (
                <a
                  href={hackathon.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  Register Externally <ExternalLink size={12} />
                </a>
              )}

              <Link
                to={`/teams/create?hackathonId=${hackathon._id}`}
                className="w-full py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                Form a Team <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDetailPage;
