import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getAvatarUrlWithFallback } from '../utils/avatarUtils';
import { 
  School, 
  BookOpen, 
  Github, 
  Linkedin, 
  Globe, 
  Award,
  ChevronLeft,
  Loader2,
  Sparkles
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
import { User } from '../types';
import SkillBadge from '../components/SkillBadge';
import CompatibilityBadge from '../components/CompatibilityBadge';

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [compatibilityScore, setCompatibilityScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        // 1. Fetch public profile
        const response = await api.get(`/users/${id}`);
        setProfileUser(response.data.data);

        // 2. Fetch compatibility score if logged in and profile belongs to someone else
        if (isAuthenticated && currentUser && currentUser._id !== id) {
          const scoreResponse = await api.get(`/users/${currentUser._id}/compatibility/${id}`);
          setCompatibilityScore(scoreResponse.data.data.score);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to retrieve profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, currentUser, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-brown" size={32} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Retrieving profile details...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-cream/40 rounded-2xl p-8 border border-beige shadow-sm max-w-md mx-auto">
          <p className="text-slate-500 text-xs font-semibold mb-6">
            {error || 'The profile you are looking for does not exist.'}
          </p>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 bg-brown hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const joinDate = new Date(profileUser.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Back link */}
      <Link to={isAuthenticated ? '/dashboard' : '/'} className="inline-flex items-center gap-1 text-slate-500 hover:text-brown text-xs font-bold mb-6 transition-colors uppercase tracking-wider">
        <ChevronLeft size={14} /> Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Avatar Card */}
        <div className="space-y-6">
          <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-brown" />

            <img
              src={getAvatarUrlWithFallback(profileUser.profilePicture, profileUser.name)}
              alt={profileUser.name}
              className="w-24 h-24 rounded-full border border-beige mx-auto mt-2"
            />
            <h2 className="text-lg font-bold text-brown mt-4 leading-tight">{profileUser.name}</h2>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Joined in {joinDate}</p>

            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-4 border ${
              profileUser.isAvailable 
                ? 'bg-sage/20 text-brown border-sage/40' 
                : 'bg-cream border border-beige text-slate-400'
            }`}>
              {profileUser.isAvailable ? 'Looking for Teammates' : 'Unavailable'}
            </span>

            {/* Compatibility details */}
            {compatibilityScore !== undefined && compatibilityScore !== null && (
              <div className="mt-6 pt-6 border-t border-beige flex flex-col items-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles size={11} className="text-terracotta" /> Compatibility Match
                </span>
                <CompatibilityBadge score={compatibilityScore} size="lg" />
              </div>
            )}
          </div>

          {/* Social connections */}
          <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-brown uppercase mb-4 pb-2 border-b border-beige">
              Connections
            </h3>
            <div className="space-y-3.5">
              {profileUser.githubUrl ? (
                <a
                  href={profileUser.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-slate-600 hover:text-brown transition-colors text-xs font-semibold group"
                >
                  <GithubIcon size={16} className="text-slate-400 group-hover:text-brown" />
                  <span className="truncate">GitHub Profile</span>
                </a>
              ) : (
                <div className="flex items-center gap-2.5 text-slate-400 text-xs italic">
                  <GithubIcon size={16} />
                  <span>No GitHub listed</span>
                </div>
              )}

              {profileUser.linkedinUrl ? (
                <a
                  href={profileUser.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-slate-600 hover:text-brown transition-colors text-xs font-semibold group"
                >
                  <LinkedinIcon size={16} className="text-slate-400 group-hover:text-brown" />
                  <span className="truncate">LinkedIn Profile</span>
                </a>
              ) : (
                <div className="flex items-center gap-2.5 text-slate-400 text-xs italic">
                  <LinkedinIcon size={16} />
                  <span>No LinkedIn listed</span>
                </div>
              )}

              {profileUser.portfolioUrl ? (
                <a
                  href={profileUser.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-slate-600 hover:text-brown transition-colors text-xs font-semibold group"
                >
                  <Globe size={16} className="text-slate-400 group-hover:text-brown" />
                  <span className="truncate">Portfolio Website</span>
                </a>
              ) : (
                <div className="flex items-center gap-2.5 text-slate-400 text-xs italic">
                  <Globe size={16} />
                  <span>No portfolio website</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Bio, skills, badges */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm space-y-6">
            {/* Header info */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Education & Branch</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brown">
                  <School size={14} className="text-slate-400" />
                  <span>{profileUser.college}</span>
                </div>
                {profileUser.branch && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brown">
                    <BookOpen size={14} className="text-slate-400" />
                    <span>{profileUser.branch}</span>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-beige/40 text-brown border border-beige/60">
                  Experience: {profileUser.experience}
                </span>
              </div>
            </div>

            {/* Bio */}
            {profileUser.bio && (
              <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1.5 border-b border-beige">About Me</h3>
                <p className="text-slate-600 text-xs leading-relaxed mt-2.5 font-medium italic">
                  "{profileUser.bio}"
                </p>
              </div>
            )}

            {/* Skills */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1.5 border-b border-beige">Skills</h3>
              {profileUser.skills && profileUser.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profileUser.skills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic mt-3">No skills selected.</p>
              )}
            </div>

            {/* Earned Badges */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1.5 border-b border-beige flex items-center gap-1">
                <Award size={13} className="text-terracotta" /> Earned Badges
              </h3>
              {profileUser.badges && profileUser.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profileUser.badges.map((badge) => (
                    <span
                      key={badge.skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-peach/20 text-brown border border-peach/40 shadow-sm"
                    >
                      <span>🎖️</span> {badge.skill}
                      <span className="text-[9px] bg-peach/40 text-brown px-1 rounded uppercase">
                        {badge.level}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic mt-3">No badges earned yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
