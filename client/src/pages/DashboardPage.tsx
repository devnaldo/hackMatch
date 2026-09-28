import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { 
  Users, 
  Award, 
  Lightbulb, 
  Bell, 
  UserPlus, 
  FolderPlus, 
  Search, 
  ArrowRight,
  Loader2,
  CheckCircle,
  Circle,
  Activity,
  Check,
  X
} from 'lucide-react';
import api from '../api';
import { User, Hackathon, Team, TeamRequest, ProjectIdea } from '../types';
import UserCard from '../components/UserCard';
import HackathonCard from '../components/HackathonCard';

const DashboardPage: React.FC = () => {
  const { user, updateProfile, fetchCurrentUser } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  
  const [teammates, setTeammates] = useState<{ user: User; score: number }[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Fetch suggested teammates
      const teammatesRes = await api.get('/match/teammates');
      setTeammates(teammatesRes.data.data.slice(0, 3)); 

      // Fetch upcoming hackathons
      const hackathonsRes = await api.get('/hackathons?upcoming=true');
      setHackathons(hackathonsRes.data.data.slice(0, 2)); 

      // Fetch suggested project ideas
      const ideasRes = await api.get('/ideas');
      setIdeas(ideasRes.data.data.slice(0, 3));

      // Fetch user's team requests
      const requestsRes = await api.get('/requests/my-requests');
      setRequests(requestsRes.data.data);

      // Fetch active team details
      if (user?.teamsJoined && user.teamsJoined.length > 0) {
        const activeTeamId = typeof user.teamsJoined[0] === 'string' 
          ? user.teamsJoined[0] 
          : (user.teamsJoined[0] as any)._id;
          
        const teamRes = await api.get(`/teams/${activeTeamId}`);
        setTeam(teamRes.data.data);
      } else {
        setTeam(null);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    init();
  }, [user?._id]);

  // Handle toggling user availability status
  const handleToggleAvailability = async () => {
    if (!user) return;
    setStatusLoading(true);
    try {
      await updateProfile({ isAvailable: !user.isAvailable });
      // Refresh local user state
      await fetchCurrentUser();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle request actions (Accept/Reject)
  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    setActionLoadingId(requestId);
    try {
      await api.put(`/requests/${requestId}/${action}`);
      // Refresh Dashboard data after action
      await fetchDashboardData();
      await fetchCurrentUser();
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Synchronizing student workspace...</p>
        </div>
      </div>
    );
  }

  // Profile Checklist items
  const checklistItems = [
    { label: "Brief summary bio added", done: !!user?.bio },
    { label: "At least 3 core skills configured", done: (user?.skills?.length ?? 0) >= 3 },
    { label: "Developer profile connected (GitHub/LinkedIn)", done: !!(user?.githubUrl || user?.linkedinUrl) },
    { label: "Availability toggle set to active", done: !!user?.isAvailable }
  ];
  const completedChecklistCount = checklistItems.filter(item => item.done).length;
  const checklistPercentage = Math.round((completedChecklistCount / checklistItems.length) * 100);

  // Mock Activity feed timeline
  const mockActivities = [
    { text: "Amit Sharma upvoted 'Hostel Grievance Tracker' concept", time: "2 hours ago" },
    { text: "Green Energy Club updated Rules for Energy Buildathon", time: "5 hours ago" },
    { text: "Siddharth accepted invitation to join 'Alpha Code' team", time: "1 day ago" },
    { text: "Smart Campus Hackathon registration portal opened", time: "2 days ago" }
  ];

  // Incoming pending invitations for this user
  const incomingPendingInvitations = requests.filter(
    req => req.status === 'pending' && req.receiverId._id === user?._id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-brown font-sans">
      
      {/* Top Welcome Panel */}
      <div className="text-left mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-6 border-b border-beige">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brown tracking-tight">
            Student Workspace / <span className="text-primary">{user?.name}</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Access teammate directory matches, upvote student ideas, and configure team workspace modules.
          </p>
        </div>
        
        {/* Toggle Availability Controls */}
        <div className="flex items-center gap-3 bg-cream border border-beige rounded-lg px-4 py-2 self-start md:self-auto shadow-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${user?.isAvailable ? 'bg-primary' : 'bg-slate-300'}`} />
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">COLLABORATION PORTAL</p>
            <p className="text-xs font-semibold text-slate-700">
              {user?.isAvailable ? 'Looking for Teammates' : 'Status: Unavailable'}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={statusLoading}
            className={`ml-2 px-2.5 py-1 text-[10px] font-bold rounded border transition-colors ${
              user?.isAvailable 
                ? 'bg-rose-55 border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
            }`}
          >
            {statusLoading ? 'Updating...' : user?.isAvailable ? 'Set Inactive' : 'Set Active'}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column, Middle Column, Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (3 Columns): Profile Checklist, Actions, Team History */}
        <div className="lg:col-span-3 space-y-6 text-left">
          
          {/* Profile Onboarding Checklist */}
          <div className="bg-cream border border-beige rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-brown uppercase tracking-wider">Profile Checklist</h3>
              <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {checklistPercentage}%
              </span>
            </div>
            
            <div className="w-full bg-secondary-light border border-beige h-1.5 rounded overflow-hidden mb-4">
              <div 
                className="bg-primary h-full transition-all duration-500" 
                style={{ width: `${checklistPercentage}%` }}
              />
            </div>

            <ul className="space-y-2.5 text-[11px] text-slate-500">
              {checklistItems.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  {item.done ? (
                    <CheckCircle size={14} className="text-primary shrink-0" />
                  ) : (
                    <Circle size={14} className="text-slate-350 shrink-0" />
                  )}
                  <span className={item.done ? 'line-through text-slate-405' : ''}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            
            {checklistPercentage < 100 && (
              <Link 
                to="/profile" 
                className="mt-4 block text-center py-1.5 text-[10px] font-bold text-primary bg-secondary-light border border-beige hover:bg-cream rounded transition-colors"
              >
                Complete Skill Profile
              </Link>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-cream border border-beige rounded-lg p-4 shadow-sm">
            <h3 className="text-xs font-bold text-brown uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/teams/create"
                className="flex items-center justify-between p-2 text-xs text-slate-700 bg-secondary-light border border-beige rounded hover:border-primary transition-all"
              >
                <span className="flex items-center gap-2"><FolderPlus size={14} /> Create a Team</span>
                <ArrowRight size={12} />
              </Link>
              <Link
                to="/match"
                className="flex items-center justify-between p-2 text-xs text-slate-700 bg-secondary-light border border-beige rounded hover:border-primary transition-all"
              >
                <span className="flex items-center gap-2"><UserPlus size={14} /> Teammate Finder</span>
                <ArrowRight size={12} />
              </Link>
              <Link
                to="/ideas"
                className="flex items-center justify-between p-2 text-xs text-slate-700 bg-secondary-light border border-beige rounded hover:border-primary transition-all"
              >
                <span className="flex items-center gap-2"><Lightbulb size={14} /> Share Project Idea</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Active Teams & Participation History */}
          <div className="bg-cream border border-beige rounded-lg p-4 shadow-sm">
            <h3 className="text-xs font-bold text-brown uppercase tracking-wider mb-3">Participation History</h3>
            {team ? (
              <div className="space-y-3">
                <div className="border border-beige rounded p-2.5 bg-secondary-light">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">ACTIVE TEAM</span>
                  </div>
                  <h4 className="text-xs font-bold text-brown mt-1.5">{team.teamName}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{team.description}</p>
                  
                  <div className="mt-3 pt-2 border-t border-beige/65 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-semibold">{team.members.length} / {team.maxSize} members</span>
                    <Link to="/my-team" className="text-primary font-bold hover:underline flex items-center gap-0.5">
                      Manage <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-beige rounded text-[11px] text-slate-400 italic">
                No active teams joined yet. Use the Teammate Finder to establish invites.
              </div>
            )}
          </div>

        </div>

        {/* Middle Column (5 Columns): Hackathons & Project Ideas */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Upcoming Hackathons */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-brown uppercase tracking-wider flex items-center gap-1.5">
                <Award size={16} /> Upcoming Hackathons
              </h2>
              <Link to="/hackathons" className="text-[10px] text-primary font-bold hover:underline">
                View All Events
              </Link>
            </div>

            {hackathons.length === 0 ? (
              <div className="bg-cream border border-beige rounded-lg p-5 text-center text-xs text-slate-400 italic">
                No active hackathons are currently listed.
              </div>
            ) : (
              <div className="space-y-4">
                {hackathons.map((hackathon) => (
                  <HackathonCard key={hackathon._id} hackathon={hackathon} />
                ))}
              </div>
            )}
          </div>

          {/* Suggested Project Ideas */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-brown uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb size={16} /> Campus Project Ideas
              </h2>
              <Link to="/ideas" className="text-[10px] text-primary font-bold hover:underline">
                View Workspace Board
              </Link>
            </div>

            {ideas.length === 0 ? (
              <div className="bg-cream border border-beige rounded-lg p-5 text-center text-xs text-slate-400 italic">
                No project ideas submitted yet. Be the first to share one!
              </div>
            ) : (
              <div className="bg-cream border border-beige rounded-lg divide-y divide-beige overflow-hidden shadow-sm">
                {ideas.map((idea) => (
                  <div key={idea._id} className="p-3.5 hover:bg-secondary-light transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-secondary-light text-slate-500">
                            {idea.domain}
                          </span>
                          <h4 className="text-xs font-bold text-brown line-clamp-1">{idea.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{idea.description}</p>
                      </div>
                      <span className="text-[10px] font-bold text-primary bg-cream border border-beige px-1.5 py-0.5 rounded shrink-0">
                        ▲ {idea.upvotes?.length || 0}
                      </span>
                    </div>
                    
                    <div className="mt-2.5 flex items-center justify-between text-[9px] text-slate-400 font-semibold">
                      <span>By {idea.submittedBy?.name || 'Academic peer'}</span>
                      <span>{new Date(idea.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (4 Columns): Recommended Teammates, Team Invitations, Activity Feed */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* Active Team Invitations (Actionable) */}
          {incomingPendingInvitations.length > 0 && (
            <div className="bg-cream border border-beige rounded-lg p-4 shadow-sm border-l-4 border-l-primary">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-brown uppercase tracking-wider flex items-center gap-1.5">
                  <Bell size={14} className="text-primary" /> Team Invitations ({incomingPendingInvitations.length})
                </h3>
              </div>

              <div className="space-y-3">
                {incomingPendingInvitations.map((req) => (
                  <div key={req._id} className="border border-beige rounded p-3 bg-secondary-light text-left">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[10px] font-bold text-slate-700">
                        {req.type === 'join_request' 
                          ? `${req.senderId?.name} requested to join`
                          : `${req.senderId?.name} invited you to join`
                        }
                      </span>
                      <span className="text-[9px] font-bold uppercase bg-beige text-brown px-1.5 py-0.5 rounded">
                        {req.teamId?.teamName || 'Team'}
                      </span>
                    </div>
                    {req.message && (
                      <p className="text-[10px] text-slate-500 bg-cream border border-beige p-2 rounded italic mt-2 leading-relaxed">
                        "{req.message}"
                      </p>
                    )}
                    
                    <div className="mt-3 flex justify-end gap-2 text-[10px]">
                      <button
                        onClick={() => handleRequestAction(req._id, 'reject')}
                        disabled={actionLoadingId === req._id}
                        className="px-2 py-1 bg-cream border border-beige hover:bg-rose-50 text-slate-700 font-bold rounded"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleRequestAction(req._id, 'accept')}
                        disabled={actionLoadingId === req._id}
                        className="px-3 py-1 bg-primary text-white hover:bg-primary-hover font-bold rounded"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Teammates */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-brown uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} /> Recommended Teammates
              </h3>
              <Link to="/match" className="text-[10px] text-primary font-bold hover:underline">
                View Matches
              </Link>
            </div>

            {teammates.length === 0 ? (
              <div className="bg-cream border border-beige rounded-lg p-4 text-center text-xs text-slate-400 italic">
                No recommended peers at the moment. Try listing more skills in your profile.
              </div>
            ) : (
              <div className="space-y-4">
                {teammates.map(({ user: matchUser, score }) => (
                  <div key={matchUser._id} className="h-full">
                    <UserCard user={matchUser} compatibilityScore={score} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Timeline Feed */}
          <div className="bg-cream border border-beige rounded-lg p-4 shadow-sm">
            <h3 className="text-xs font-bold text-brown uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <Activity size={14} /> Workspace Activity
            </h3>
            
            <div className="relative pl-4 border-l border-beige space-y-4 text-left">
              {mockActivities.map((act, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline dot */}
                  <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary border border-cream" />
                  
                  <p className="text-[11px] text-brown leading-relaxed">
                    {act.text}
                  </p>
                  <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
