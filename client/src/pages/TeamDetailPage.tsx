import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getAvatarUrlWithFallback } from '../utils/avatarUtils';
import { 
  Users, 
  MapPin, 
  Clock, 
  Tag, 
  ChevronLeft, 
  MessageSquare,
  AlertCircle,
  Loader2,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import api from '../api';
import { Team, User, TeamRequest } from '../types';
import SkillBadge from '../components/SkillBadge';
import CompatibilityBadge from '../components/CompatibilityBadge';
import { calculateTeamCompatibility } from '../utils/matching';

const TeamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [myRequests, setMyRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Join request form state
  const [requestMsg, setRequestMsg] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const teamRes = await api.get(`/teams/${id}`);
        setTeam(teamRes.data.data);

        // Fetch my requests to check pending states
        const requestsRes = await api.get('/requests/my-requests');
        setMyRequests(requestsRes.data.data);
      } catch (error) {
        console.error('Failed to load team details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [id, requestSent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-brown" size={36} />
          <p className="text-sm font-semibold text-slate-500">Retrieving team details...</p>
        </div>
      </div>
    );
  }

  if (!team || !currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-cream/40 rounded-xl p-8 border border-beige max-w-md mx-auto">
          <p className="text-slate-500 font-medium mb-6">Team details not found.</p>
          <Link to="/teams" className="px-5 py-2.5 bg-brown text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary-hover transition-colors">
            Back to Browse Teams
          </Link>
        </div>
      </div>
    );
  }

  const membersList = (team.members || []) as User[];
  const isMember = membersList.some(m => m._id === currentUser._id);
  const isLeader = typeof team.leaderId === 'string' 
    ? team.leaderId === currentUser._id 
    : (team.leaderId as User)._id === currentUser._id;

  const isFull = membersList.length >= team.maxSize;

  // Check if there is already a pending request sent by the current user to this team
  const pendingRequest = myRequests.find(r => 
    r.teamId?._id === team._id && 
    r.senderId?._id === currentUser._id && 
    r.status === 'pending'
  );

  const teamScore = calculateTeamCompatibility(currentUser, membersList);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSubmittingRequest(true);
    setErrorMsg('');
    try {
      await api.post('/requests/join', {
        teamId: id,
        message: requestMsg.trim() || undefined
      });
      setRequestSent(true);
      setRequestMsg('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit join request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Back Link */}
      <Link to="/teams" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm font-semibold mb-6 transition-colors">
        <ChevronLeft size={16} /> Back to Open Teams
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Team Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-cream/40 border border-beige rounded-xl p-6">
            {/* Headers */}
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isFull 
                  ? 'bg-rose/10 text-brown border border-rose/30' 
                  : 'bg-sage/20 text-brown border border-sage/40'
              }`}>
                {isFull ? 'Full' : 'Open'}
              </span>
              <span className="flex items-center gap-1 text-slate-500 text-xs">
                <Users size={14} />
                {membersList.length} / {team.maxSize} members
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-brown tracking-tight leading-tight">
              {team.teamName}
            </h1>

            {/* Hackathon title */}
            {team.hackathonId && (
              <p className="text-sm font-semibold text-terracotta mt-1">
                Competing in:{' '}
                <Link to={`/hackathons/${(team.hackathonId as any)._id}`} className="hover:underline font-bold">
                  {(team.hackathonId as any).title}
                </Link>
              </p>
            )}

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-beige mb-3">
                Team Description
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {team.description}
              </p>
            </div>

            {/* Project Idea brief */}
            {team.projectIdea && (
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-beige mb-3">
                  Project Brief
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium bg-cream p-4 rounded-xl border border-beige">
                  {team.projectIdea}
                </p>
              </div>
            )}

            {/* Tags */}
            {team.tags && team.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-beige mb-3">
                  Tech Tags
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {team.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-beige/40 text-brown text-xs font-semibold uppercase">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Members detail list */}
          <div>
            <h2 className="text-lg font-bold text-brown mb-4">Team Roster</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {membersList.map((member) => (
                <div
                  key={member._id}
                  className="bg-cream/40 rounded-xl border border-beige p-4 flex gap-3 text-left items-start"
                >
                  <img
                    src={getAvatarUrlWithFallback(member.profilePicture, member.name)}
                    alt={member.name}
                    className="w-10 h-10 rounded-full border border-beige shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-brown">{member.name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold line-clamp-1">{member.college}</p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-beige/40 text-brown mt-1">
                      {member.experience}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {member.skills?.slice(0, 3).map(skill => (
                        <SkillBadge key={skill} skill={skill} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic interaction actions (Join, stats, compatibility) */}
        <div className="space-y-6">
          {/* Compatibility info */}
          {!isMember && (
            <div className="bg-beige/35 border border-beige text-slate-800 rounded-xl p-6 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                <Sparkles size={12} className="text-terracotta" /> Team Compatibility
              </span>
              <CompatibilityBadge score={teamScore} size="lg" />
              <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium">
                This is the average compatibility score between you and all current members of the team roster.
              </p>
            </div>
          )}

          {/* Action Form */}
          <div className="bg-cream/40 border border-beige rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-brown pb-2 border-b border-beige text-left">
              Join Team
            </h3>

            {isMember ? (
              <div className="text-center py-4">
                <CheckCircle size={32} className="text-sage mx-auto mb-2" />
                <p className="text-sm font-bold text-brown">You are a team member</p>
                <Link
                  to="/my-team"
                  className="mt-4 block text-center w-full py-2 bg-brown hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  Enter Team Room Chat
                </Link>
              </div>
            ) : pendingRequest ? (
              <div className="p-3 bg-peach/20 text-brown rounded-xl border border-peach/40 text-xs text-left">
                <div className="font-bold flex items-center gap-1">
                  <Clock size={14} /> Join Request Pending
                </div>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  You have already sent a request to join this team. The leader will review your credentials.
                </p>
              </div>
            ) : isFull ? (
              <div className="p-3 bg-rose/10 text-brown rounded-xl border border-rose/30 text-xs text-left">
                <div className="font-bold flex items-center gap-1">
                  <AlertCircle size={14} /> Team Roster is Full
                </div>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  This team has reached its capacity. You cannot send a request at this time.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4 text-left">
                {errorMsg && (
                  <div className="p-2.5 bg-rose/10 text-brown rounded-xl text-xs flex gap-1 items-start">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {requestSent ? (
                  <div className="p-3 bg-sage/20 text-brown rounded-xl border border-sage/40 text-xs">
                    <div className="font-bold flex items-center gap-1">
                      <CheckCircle size={14} className="text-sage" /> Request Sent!
                    </div>
                    <p className="mt-1 text-slate-600 leading-relaxed">
                      Your join request was sent to the leader. You will be notified of their decision.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Optional Message</label>
                      <textarea
                        value={requestMsg}
                        onChange={(e) => setRequestMsg(e.target.value)}
                        placeholder="Say hello and summarize how your skills fit the team needs..."
                        rows={3}
                        maxLength={250}
                        className="block w-full px-3 py-2 border border-beige bg-cream rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown placeholder-slate-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingRequest}
                      className="w-full py-2.5 bg-brown hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center"
                    >
                      {submittingRequest ? (
                        <>
                          <Loader2 className="animate-spin mr-1.5" size={14} /> Submitting Request...
                        </>
                      ) : (
                        'Request to Join'
                      )}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailPage;
