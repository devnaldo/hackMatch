import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import SkillSelector from '../components/SkillSelector';
import { getAvatarUrlWithFallback } from '../utils/avatarUtils';
import { 
  User as UserIcon, 
  Mail, 
  School, 
  BookOpen, 
  Globe, 
  Check, 
  AlertCircle, 
  Loader2,
  Lock,
  Award,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

// Custom inline SVG icons for robust version compatibility
const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import api from '../api';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, fetchCurrentUser, error: authError } = useAuthStore();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setCollege(user.college || '');
      setBranch(user.branch || '');
      setGithubUrl(user.githubUrl || '');
      setLinkedinUrl(user.linkedinUrl || '');
      setPortfolioUrl(user.portfolioUrl || '');
      setIsAvailable(user.isAvailable);
      setSkills(user.skills || []);
      setExperience(user.experience || 'beginner');
    }
  }, [user]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!college.trim()) errs.college = 'College is required';
    
    // Check URLs prefix
    const urlCheck = (val: string) => !val || val.startsWith('http://') || val.startsWith('https://');
    if (!urlCheck(githubUrl)) errs.githubUrl = 'URL must start with http:// or https://';
    if (!urlCheck(linkedinUrl)) errs.linkedinUrl = 'URL must start with http:// or https://';
    if (!urlCheck(portfolioUrl)) errs.portfolioUrl = 'URL must start with http:// or https://';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccessMsg('');
    
    const data = {
      name,
      bio,
      college,
      branch,
      githubUrl: githubUrl || undefined,
      linkedinUrl: linkedinUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      isAvailable,
      skills,
      experience
    };

    const success = await updateProfile(data);
    if (success) {
      setSuccessMsg('Profile updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await fetchCurrentUser();
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!oldPassword || !newPassword) {
      setPasswordMsg({ text: 'Please fill out both password fields.', isError: true });
      return;
    }

    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      setPasswordMsg({ text: 'New password must be at least 8 characters and contain at least one number.', isError: true });
      return;
    }

    setPwdLoading(true);
    try {
      const response = await api.put('/auth/change-password', { oldPassword, newPassword });
      setPasswordMsg({ text: response.data.message, isError: false });
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to change password.',
        isError: true
      });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="text-left mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-brown tracking-tight">Edit Profile</h1>
        <p className="text-slate-500 text-xs mt-1">
          Customize your credentials and select your technical skill tags.
        </p>
      </div>

      {/* Success / Auth Error alerts */}
      {successMsg && (
        <div className="flex gap-2 p-3 bg-sage/20 text-brown border border-sage/40 rounded-xl text-xs text-left mb-6 font-semibold items-center">
          <Check size={16} className="shrink-0 text-sage" />
          <span>{successMsg}</span>
        </div>
      )}

      {authError && (
        <div className="flex gap-2 p-3 bg-dusty-rose/20 text-brown border border-dusty-rose/50 rounded-xl text-xs text-left mb-6 items-center">
          <AlertCircle size={16} className="shrink-0 text-terracotta" />
          <span>{authError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Public profile details */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleProfileSubmit} className="space-y-6 bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-brown text-left pb-3 border-b border-beige">
              Personal Information
            </h2>

            <div className="space-y-4 text-left">
              {/* Name & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon size={14} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-terracotta mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Availability Status</label>
                  <button
                    type="button"
                    onClick={() => setIsAvailable(!isAvailable)}
                    className="flex items-center justify-between w-full px-4 py-1.5 border border-beige bg-cream hover:bg-beige/40 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <span>{isAvailable ? 'Looking for teammates' : 'Already in a team'}</span>
                    {isAvailable ? (
                      <ToggleRight size={24} className="text-sage" />
                    ) : (
                      <ToggleLeft size={24} className="text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell potential teammates about your interests, past hackathons, or what kind of projects you would love to build..."
                  rows={4}
                  maxLength={500}
                  className="block w-full px-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown placeholder-slate-400"
                />
                <span className="text-[10px] text-slate-400 block mt-1 text-right">
                  {bio.length} / 500 characters
                </span>
              </div>

              {/* College & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">College</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <School size={14} />
                    </div>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown"
                    />
                  </div>
                  {errors.college && <p className="text-xs text-terracotta mt-1">{errors.college}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Branch / Domain</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <BookOpen size={14} />
                    </div>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown"
                    />
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Hackathon Experience</label>
                <div className="grid grid-cols-3 gap-2 bg-beige/40 p-1 rounded-xl">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setExperience(level)}
                      className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        experience === level
                          ? 'bg-brown text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social URLs */}
              <h3 className="text-xs font-bold text-brown uppercase pt-4 pb-2 border-b border-beige">
                Links & Portfolios
              </h3>

              <div className="space-y-3">
                {/* Github */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <GithubIcon size={14} />
                    </div>
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="block w-full pl-9 pr-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown"
                    />
                  </div>
                  {errors.githubUrl && <p className="text-xs text-terracotta mt-1">{errors.githubUrl}</p>}
                </div>

                {/* Linkedin */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <LinkedinIcon size={14} />
                    </div>
                    <input
                      type="text"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="block w-full pl-9 pr-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown"
                    />
                  </div>
                  {errors.linkedinUrl && <p className="text-xs text-terracotta mt-1">{errors.linkedinUrl}</p>}
                </div>

                {/* Portfolio */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Globe size={14} />
                    </div>
                    <input
                      type="text"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://mywebsite.com"
                      className="block w-full pl-9 pr-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown"
                    />
                  </div>
                  {errors.portfolioUrl && <p className="text-xs text-terracotta mt-1">{errors.portfolioUrl}</p>}
                </div>
              </div>

              {/* Skill Selector integration */}
              <h3 className="text-xs font-bold text-brown uppercase pt-4 pb-2 border-b border-beige">
                Skills Selection
              </h3>
              <SkillSelector selectedSkills={skills} onChange={setSkills} />
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-beige flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-brown text-white text-xs rounded-xl hover:bg-primary-hover disabled:opacity-50 font-bold transition-colors flex items-center shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={14} /> Saving Changes...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Badges & Change Password */}
        <div className="space-y-8">
          {/* Avatar view */}
          <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm text-center">
            <img
              src={getAvatarUrlWithFallback(user?.profilePicture, user?.name)}
              alt={user?.name}
              className="w-20 h-20 rounded-full border border-beige mx-auto"
            />
            <h3 className="text-sm font-bold text-brown mt-3">{user?.name}</h3>
            <p className="text-xs text-slate-400 font-semibold">{user?.email}</p>
          </div>

          {/* Badges Display */}
          <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm text-left">
            <h2 className="text-xs font-bold text-brown uppercase flex items-center gap-2 mb-3">
              <Award className="text-terracotta" size={16} /> Earned Badges
            </h2>
            {user?.badges && user.badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge) => (
                  <span
                    key={badge.skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-peach/20 text-brown border border-peach/40 shadow-sm"
                    title={`Earned on ${new Date(badge.earnedAt).toLocaleDateString()}`}
                  >
                    <span>🎖️</span> {badge.skill}
                    <span className="text-[9px] uppercase bg-peach/40 text-brown px-1 rounded">
                      {badge.level}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No badges earned yet. Add technical skills to earn skill badges automatically!</p>
            )}
          </div>

          {/* Change Password Form */}
          <form onSubmit={handlePasswordSubmit} className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm text-left space-y-4">
            <h2 className="text-xs font-bold text-brown uppercase flex items-center gap-2 pb-2 border-b border-beige">
              <Lock size={14} /> Change Password
            </h2>

            {passwordMsg && (
              <div className={`p-2.5 rounded-lg text-xs flex gap-1.5 ${
                passwordMsg.isError ? 'bg-dusty-rose/20 text-brown border border-dusty-rose/50' : 'bg-sage/20 text-brown border border-sage/40'
              }`}>
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full px-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, 1 number"
                className="block w-full px-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown"
              />
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full py-2 bg-brown hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center"
            >
              {pwdLoading ? (
                <>
                  <Loader2 className="animate-spin mr-1.5" size={14} /> Saving Password...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
