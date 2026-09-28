import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getAvatarUrlWithFallback } from '../utils/avatarUtils';
import { 
  Users, 
  MessageSquare, 
  AlertCircle, 
  Settings, 
  LogOut, 
  Trash2, 
  Check, 
  X, 
  Mail, 
  Loader2, 
  Sparkles,
  Award,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import api from '../api';
import { Team, User, TeamRequest } from '../types';
import ChatWindow from '../components/ChatWindow';
import SkillBadge from '../components/SkillBadge';

const MyTeamPage: React.FC = () => {
  const { user: currentUser, fetchCurrentUser } = useAuthStore();
  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [pendingRequests, setPendingRequests] = useState<TeamRequest[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [candidates, setCandidates] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchTeamInfo = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        if (currentUser.teamsJoined && currentUser.teamsJoined.length > 0) {
          const teamId = typeof currentUser.teamsJoined[0] === 'string' 
            ? currentUser.teamsJoined[0] 
            : (currentUser.teamsJoined[0] as any)._id;
          
          // Fetch populated team
          const teamRes = await api.get(`/teams/${teamId}`);
          setTeam(teamRes.data.data);

          // If leader, fetch pending join requests & matching candidates
          const isLeaderUser = typeof teamRes.data.data.leaderId === 'string'
            ? teamRes.data.data.leaderId === currentUser._id
            : (teamRes.data.data.leaderId as User)._id === currentUser._id;

          if (isLeaderUser) {
            const requestsRes = await api.get(`/requests/team/${teamId}`);
            setPendingRequests(requestsRes.data.data);

            const matchRes = await api.get('/match/teammates');
            setCandidates(matchRes.data.data.map((m: any) => m.user));
          }
        } else {
          setTeam(null);
        }
      } catch (error) {
        console.error('Failed to load team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamInfo();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-brown" size={32} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Loading your team configuration...</p>
        </div>
      </div>
    );
  }

  // Handle invitation submission
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !inviteEmail.trim()) return;

    setInviteLoading(true);
    setInviteSuccess('');
    setInviteError('');

    try {
      // Find candidate by email first
      const searchRes = await api.get(`/users?email=${inviteEmail.trim().toLowerCase()}`);
      const matchingUser = searchRes.data.data?.users?.[0];
      
      if (!matchingUser) {
        setInviteError('No user found with this email address.');
        setInviteLoading(false);
        return;
      }

      await api.post('/requests/invite', {
        userId: matchingUser._id,
        teamId: team._id,
        message: inviteMsg.trim() || undefined
      });

      setInviteSuccess(`Invitation sent to ${matchingUser.name}!`);
      setInviteEmail('');
      setInviteMsg('');
    } catch (err: any) {
      setInviteError(err.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  // Handle accepting join requests
  const handleAcceptRequest = async (id: string) => {
    setActionLoading(true);
    try {
      await api.put(`/requests/${id}/accept`);
      // Refresh current user & reload
      await fetchCurrentUser();
    } catch (error) {
      console.error('Failed to accept request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle rejecting join requests
  const handleRejectRequest = async (id: string) => {
    setActionLoading(true);
    try {
      await api.put(`/requests/${id}/reject`);
      // Refresh pending list
      if (team) {
        const requestsRes = await api.get(`/requests/team/${team._id}`);
        setPendingRequests(requestsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to decline request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle removing members
  const handleRemoveMember = async (userId: string) => {
    if (!team) return;
    if (!window.confirm('Are you sure you want to kick this member from the team?')) return;

    setActionLoading(true);
    try {
      await api.delete(`/teams/${team._id}/members/${userId}`);
      await fetchCurrentUser();
    } catch (error) {
      console.error('Failed to remove member:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle leaving team
  const handleLeaveTeam = async () => {
    if (!team) return;
    const leaveConfirm = window.confirm('Are you sure you want to leave this team?');
    if (!leaveConfirm) return;

    setActionLoading(true);
    try {
      await api.delete(`/teams/${team._id}/leave`);
      await fetchCurrentUser();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to leave team:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle disbanding team
  const handleDisbandTeam = async () => {
    if (!team) return;
    const disbandConfirm = window.confirm('CRITICAL WARNING: This will permanently delete this team and remove all current members. Are you sure you want to disband?');
    if (!disbandConfirm) return;

    setActionLoading(true);
    try {
      await api.delete(`/teams/${team._id}`);
      await fetchCurrentUser();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to disband team:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (!team || !currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-cream/40 border border-beige p-8 rounded-2xl max-w-md mx-auto shadow-sm">
          <Users size={40} className="text-brown/30 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-brown">No Active Team</h2>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed font-medium">
            You are not currently part of any hackathon teams. Find an open team to join or create your own workspace!
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/teams"
              className="px-4 py-2 border border-beige hover:bg-beige/40 text-brown text-xs font-bold rounded-xl transition-colors"
            >
              Search Open Teams
            </Link>
            <Link
              to="/teams/create"
              className="px-4 py-2 bg-brown hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Create a Team
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const membersList = (team.members || []) as User[];
  const isLeader = typeof team.leaderId === 'string'
    ? team.leaderId === currentUser._id
    : (team.leaderId as User)._id === currentUser._id;

  const isFull = membersList.length >= team.maxSize;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div>
          <span className="text-brown font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <span>✨</span> Team Control Center
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-brown tracking-tight leading-tight">
            {team.teamName}
          </h1>
          {team.hackathonId && (
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              Registered for: <span className="text-brown font-bold">{(team.hackathonId as any).title}</span>
            </p>
          )}
        </div>

        {/* Roster actions */}
        <div className="flex gap-2 shrink-0 self-start sm:self-auto">
          {isLeader ? (
            <button
              onClick={handleDisbandTeam}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-dusty-rose/50 bg-dusty-rose/20 text-brown hover:bg-dusty-rose/30 rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Trash2 size={12} /> Disband Team
            </button>
          ) : (
            <button
              onClick={handleLeaveTeam}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-beige bg-cream hover:bg-beige/40 text-brown rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <LogOut size={12} /> Leave Team
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Chat Window and Members list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Socket Chat */}
          <ChatWindow teamId={team._id} teamName={team.teamName} />

          {/* Roster Management */}
          <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-brown uppercase mb-4 flex items-center gap-2">
              <Users size={14} /> Roster Members ({membersList.length} / {team.maxSize})
            </h2>

            <div className="space-y-3">
              {membersList.map((member) => {
                const isMemberLeader = typeof team.leaderId === 'string'
                  ? team.leaderId === member._id
                  : (team.leaderId as User)._id === member._id;

                return (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 bg-cream border border-beige rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrlWithFallback(member.profilePicture, member.name)}
                        alt={member.name}
                        className="w-8 h-8 rounded-full border border-beige"
                      />
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-brown">{member.name}</p>
                          {isMemberLeader && (
                            <span className="text-[8px] uppercase tracking-wider bg-brown text-white font-extrabold px-1.5 py-0.5 rounded">
                              Leader
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-semibold line-clamp-1">{member.college}</p>
                      </div>
                    </div>

                    {/* Leader actions (Remove non-leader member) */}
                    {isLeader && !isMemberLeader && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={actionLoading}
                        className="px-2.5 py-1 text-[9px] font-bold text-brown bg-dusty-rose/20 hover:bg-dusty-rose/30 border border-dusty-rose/40 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Invite & Requests (Only visible to Leader) */}
        <div className="space-y-6">
          {isLeader ? (
            <>
              {/* Invitations panel */}
              <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm text-left">
                <h3 className="text-xs font-bold text-brown uppercase flex items-center gap-2 pb-2 border-b border-beige mb-4">
                  <Mail size={14} /> Invite Teammates
                </h3>

                {inviteSuccess && (
                  <div className="p-2 bg-sage/20 text-brown rounded-xl text-xs mb-3 border border-sage/40 flex items-center gap-1.5">
                    <Check size={12} className="text-sage shrink-0" />
                    <span>{inviteSuccess}</span>
                  </div>
                )}

                {inviteError && (
                  <div className="p-2 bg-dusty-rose/20 text-brown rounded-xl text-xs mb-3 border border-dusty-rose/40 flex items-center gap-1.5">
                    <AlertCircle size={12} className="text-terracotta shrink-0" />
                    <span>{inviteError}</span>
                  </div>
                )}

                {isFull ? (
                  <div className="p-3 bg-peach/20 text-brown rounded-xl text-xs border border-peach/40">
                    <p className="font-bold">Team is full</p>
                    <p className="mt-0.5 text-slate-500 leading-relaxed font-semibold">
                      Roster has hit maximum limits. Disband a slot or remove a member to send more invites.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInviteSubmit} className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="candidate@college.edu"
                        className="block w-full px-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Invitation Pitch</label>
                      <textarea
                        value={inviteMsg}
                        onChange={(e) => setInviteMsg(e.target.value)}
                        placeholder="E.g. Hey, we saw you have great frontend skills. Join us for our Smart Attendance project!"
                        rows={3}
                        className="block w-full px-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown placeholder-slate-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="w-full py-2 bg-brown hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center"
                    >
                      {inviteLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-1.5" size={11} /> Sending invite...
                        </>
                      ) : (
                        'Send Invitation'
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Pending Join Requests */}
              <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm text-left">
                <h3 className="text-xs font-bold text-brown uppercase pb-2 border-b border-beige mb-4 flex items-center gap-2">
                  <ShieldAlert size={14} /> Pending Requests ({pendingRequests.length})
                </h3>

                {pendingRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No pending join requests from developers.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((req) => {
                      const reqUser = req.senderId;
                      return (
                        <div key={req._id} className="border border-beige rounded-xl p-3 bg-cream/30 space-y-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={getAvatarUrlWithFallback(reqUser.profilePicture, reqUser.name)}
                              alt={reqUser.name}
                              className="w-6 h-6 rounded-full border border-beige"
                            />
                            <div className="text-left">
                              <h4 className="text-xs font-bold text-brown">{reqUser.name}</h4>
                              <p className="text-[8px] text-slate-400 font-semibold">{reqUser.experience} level</p>
                            </div>
                          </div>

                          {req.message && (
                            <p className="text-[10px] text-slate-500 bg-cream p-2 border border-beige rounded-lg italic">
                              "{req.message}"
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1">
                            {reqUser.skills?.slice(0, 3).map(skill => (
                              <SkillBadge key={skill} skill={skill} />
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-1.5 justify-end">
                            <button
                              onClick={() => handleRejectRequest(req._id)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 border border-beige bg-cream hover:bg-beige/40 text-brown rounded-lg text-[9px] font-bold shadow-sm"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleAcceptRequest(req._id)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 bg-brown hover:bg-primary-hover text-white rounded-lg text-[9px] font-bold shadow-sm"
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm text-left">
              <h3 className="text-xs font-bold text-brown uppercase mb-3 flex items-center gap-2">
                <Sparkles size={14} className="text-terracotta" /> Team Requirements
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                You are currently a team developer. Only the team leader can accept new join requests or invite outside users.
              </p>

              {team.requiredSkills && team.requiredSkills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-beige">
                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-2">Looking for skills:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {team.requiredSkills.map(skill => (
                      <SkillBadge key={skill} skill={skill} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTeamPage;
