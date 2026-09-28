import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { getAvatarUrlWithFallback } from '../utils/avatarUtils';
import { 
  ShieldAlert, 
  Users, 
  Award, 
  Lightbulb, 
  Trash2, 
  Ban, 
  CheckCircle,
  BarChart3,
  Loader2,
  AlertTriangle,
  Search,
  School
} from 'lucide-react';
import api from '../api';
import { User } from '../types';

interface Stats {
  totalUsers: number;
  totalTeams: number;
  totalHackathons: number;
  totalIdeas: number;
  availableUsers: number;
  bannedUsers: number;
  domainStats: { _id: string; count: number }[];
  hackathonStats: { _id: string; count: number }[];
}

const AdminPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Protect route strictly on the frontend
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch platform stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data.data);

      // Fetch users list with filters
      const filterParams = new URLSearchParams();
      if (searchQuery.trim()) filterParams.append('search', searchQuery.trim());
      if (roleFilter) filterParams.append('role', roleFilter);

      const usersRes = await api.get(`/admin/users?${filterParams.toString()}`);
      setUsers(usersRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve admin resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [searchQuery, roleFilter]);

  const handleToggleBan = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await api.put(`/admin/users/${id}/ban`);
      alert(response.data.message);
      await fetchAdminData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update ban state.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const confirmDelete = window.confirm('CRITICAL WARNING: This will permanently delete this user account and clean up all their owned project ideas and team memberships. Are you sure you want to proceed?');
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      const response = await api.delete(`/admin/users/${id}`);
      alert(response.data.message);
      await fetchAdminData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete user account.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-brown" size={32} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Loading administrative controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Header */}
      <div className="mb-8">
        <span className="text-brown font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
          <ShieldAlert size={14} className="text-terracotta" /> Admin Console
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-brown tracking-tight">
          Platform Controls & Auditing
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Audit college user directories, disband spam team names, and monitor platform metrics.
        </p>
      </div>

      {error && (
        <div className="flex gap-2 p-3 bg-dusty-rose/20 text-brown border border-dusty-rose/50 rounded-xl text-xs mb-6 items-center">
          <AlertTriangle size={16} className="shrink-0 text-terracotta" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-cream/40 rounded-2xl border border-beige p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-cream text-brown border border-beige rounded-xl flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
              <h3 className="text-xl font-bold text-brown mt-0.5">{stats.totalUsers}</h3>
              <p className="text-[9px] text-slate-400 font-semibold">{stats.availableUsers} available matching</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-cream/40 rounded-2xl border border-beige p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-peach/20 text-brown border border-peach/40 rounded-xl flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Teams</p>
              <h3 className="text-xl font-bold text-brown mt-0.5">{stats.totalTeams}</h3>
              <p className="text-[9px] text-slate-400 font-semibold">Compiling rosters</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-cream/40 rounded-2xl border border-beige p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-sage/20 text-brown border border-sage/40 rounded-xl flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hackathons</p>
              <h3 className="text-xl font-bold text-brown mt-0.5">{stats.totalHackathons}</h3>
              <p className="text-[9px] text-slate-400 font-semibold">Active competitions</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-cream/40 rounded-2xl border border-beige p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-dusty-rose/20 text-brown border border-dusty-rose/40 rounded-xl flex items-center justify-center shrink-0">
              <Lightbulb size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Brainstorm Briefs</p>
              <h3 className="text-xl font-bold text-brown mt-0.5">{stats.totalIdeas}</h3>
              <p className="text-[9px] text-slate-400 font-semibold">Student submitted pitches</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Split Panels (Left: User Directory / Right: Platform distributions charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: User directory & Banning controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-brown uppercase mb-4 flex items-center gap-2">
              <Users size={14} /> Student Directories
            </h2>

            {/* Filter actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={12} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email..."
                  className="block w-full pl-9 pr-3 py-2 bg-cream border border-beige rounded-xl text-xs font-semibold text-brown focus:outline-none focus:ring-1 focus:ring-brown focus:bg-cream"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-cream border border-beige rounded-xl text-xs font-semibold text-brown focus:outline-none focus:ring-1 focus:ring-brown focus:bg-cream"
              >
                <option value="">All Roles</option>
                <option value="user">Users only</option>
                <option value="admin">Administrators only</option>
              </select>
            </div>

            {/* Users lists */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 select-text">
              {users.map((item) => (
                <div 
                  key={item._id} 
                  className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl border ${
                    item.isBanned 
                      ? 'bg-dusty-rose/10 border-dusty-rose/30' 
                      : 'bg-cream border border-beige'
                  } gap-3`}
                >
                  <div className="flex gap-3 text-left">
                    <img
                      src={getAvatarUrlWithFallback(item.profilePicture, item.name)}
                      alt={item.name}
                      className="w-8 h-8 rounded-full border border-beige shrink-0 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-brown">{item.name}</p>
                        {item.role === 'admin' && (
                          <span className="text-[8px] uppercase tracking-wider bg-brown text-white font-extrabold px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                        {item.isBanned && (
                          <span className="text-[8px] uppercase tracking-wider bg-dusty-rose/35 text-brown font-extrabold px-1.5 py-0.5 rounded border border-dusty-rose/50">
                            Banned
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 font-semibold line-clamp-1">{item.email}</p>
                      <p className="text-[8px] text-slate-400 flex items-center gap-1 mt-0.5 font-semibold">
                        <School size={9} /> {item.college}
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  {item._id !== currentUser?._id && (
                    <div className="flex gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleToggleBan(item._id)}
                        disabled={actionLoading}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-colors ${
                          item.isBanned 
                            ? 'bg-sage/20 border-sage/40 text-brown hover:bg-sage/30' 
                            : 'bg-dusty-rose/20 border border-dusty-rose/40 text-brown hover:bg-dusty-rose/30'
                        }`}
                      >
                        <Ban size={10} /> {item.isBanned ? 'Unban' : 'Ban'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(item._id)}
                        disabled={actionLoading}
                        className="p-1.5 text-slate-400 hover:text-brown hover:bg-dusty-rose/20 rounded-lg transition-colors border border-transparent hover:border-dusty-rose/40"
                        title="Delete user permanently"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Platform Distribution Statistics Charts */}
        <div className="space-y-6">
          <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm text-left">
            <h2 className="text-xs font-bold text-brown uppercase flex items-center gap-2 pb-2 border-b border-beige mb-4">
              <BarChart3 size={14} /> Domain Briefs Distribution
            </h2>

            {stats && stats.domainStats && stats.domainStats.length > 0 ? (
              <div className="space-y-4">
                {stats.domainStats.map((item) => {
                  const percent = Math.round((item.count / stats.totalIdeas) * 100) || 0;
                  return (
                    <div key={item._id} className="text-left">
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                        <span>{item._id || 'Other'}</span>
                        <span>{item.count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-beige/40 rounded-full h-1.5">
                        <div 
                          className="bg-brown rounded-full h-1.5 transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No brainstorm domain statistics available.</p>
            )}
          </div>

          {/* Hackathon Mode stats */}
          <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm text-left">
            <h2 className="text-xs font-bold text-brown uppercase flex items-center gap-2 pb-2 border-b border-beige mb-4">
              <BarChart3 size={14} /> Competition Formats
            </h2>

            {stats && stats.hackathonStats && stats.hackathonStats.length > 0 ? (
              <div className="space-y-4">
                {stats.hackathonStats.map((item) => {
                  const percent = Math.round((item.count / stats.totalHackathons) * 100) || 0;
                  return (
                    <div key={item._id} className="text-left">
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1 capitalize">
                        <span>{item._id}</span>
                        <span>{item.count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-beige/40 rounded-full h-1.5">
                        <div 
                          className="bg-terracotta rounded-full h-1.5 transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No hackathon format statistics available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
