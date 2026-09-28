import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, GraduationCap, Folder } from 'lucide-react';
import { User } from '../types';
import SkillBadge from './SkillBadge';
import { getAvatarUrlWithFallback } from '../utils/avatarUtils';
import CompatibilityBadge from './CompatibilityBadge';

interface UserCardProps {
  user: User;
  compatibilityScore?: number;
}

const getPreferredRole = (skills: string[] = []): string => {
  const sk = skills.map(s => s.toLowerCase());
  if (sk.some(s => s.includes('react') || s.includes('vue') || s.includes('angular') || s.includes('frontend') || s.includes('css') || s.includes('html'))) {
    return 'Frontend Developer';
  }
  if (sk.some(s => s.includes('node') || s.includes('django') || s.includes('spring') || s.includes('backend') || s.includes('python') || s.includes('java') || s.includes('sql'))) {
    return 'Backend Engineer';
  }
  if (sk.some(s => s.includes('flutter') || s.includes('react native') || s.includes('kotlin') || s.includes('android') || s.includes('ios') || s.includes('swift'))) {
    return 'Mobile Developer';
  }
  if (sk.some(s => s.includes('figma') || s.includes('ui') || s.includes('ux') || s.includes('designer') || s.includes('design'))) {
    return 'UI/UX Designer';
  }
  if (sk.some(s => s.includes('tensorflow') || s.includes('pytorch') || s.includes('ai') || s.includes('ml') || s.includes('python') || s.includes('data'))) {
    return 'AI/ML Specialist';
  }
  return 'Fullstack Developer';
};

const getCollegeYear = (user: User): string => {
  let year = "3rd Year";
  if (user.experience === 'beginner') year = "2nd Year";
  else if (user.experience === 'advanced') year = "4th Year";
  
  const branchName = user.branch || "CSE";
  return `${year} ${branchName}`;
};

const getPreviousProjects = (skills: string[] = [], name: string = ""): string[] => {
  const sk = skills.map(s => s.toLowerCase());
  const projects: string[] = [];
  
  if (sk.some(s => s.includes('flutter') || s.includes('android') || s.includes('mobile'))) {
    projects.push("Smart Attendance QR App");
  }
  if (sk.some(s => s.includes('react') || s.includes('web') || s.includes('node'))) {
    projects.push("Hostel Maintenance Grievance Portal");
  }
  if (sk.some(s => s.includes('python') || s.includes('ml') || s.includes('ai'))) {
    projects.push("Campus Food Waste Predictor");
  }
  if (projects.length === 0) {
    const charCode = name.charCodeAt(0) || 0;
    if (charCode % 2 === 0) {
      projects.push("Local Donation Directory App");
    } else {
      projects.push("Automated Smart Library Tracker");
    }
  }
  
  if (projects.length < 2) {
    projects.push("Academic Marks Dashboard");
  }
  
  return projects.slice(0, 2);
};

const UserCard: React.FC<UserCardProps> = ({ user, compatibilityScore }) => {
  const preferredRole = getPreferredRole(user.skills);
  const collegeYear = getCollegeYear(user);
  const previousProjects = getPreviousProjects(user.skills, user.name);

  return (
    <div className="bg-white rounded-lg border border-beige hover:border-primary transition-all p-4 flex flex-col justify-between h-full shadow-sm text-left">
      <div>
        {/* Avatar, Compatibility Score and Availability Toggle indicator */}
        <div className="flex justify-between items-start mb-3">
          <div className="relative">
            <img
              src={getAvatarUrlWithFallback(user.profilePicture, user.name)}
              alt={user.name}
              className="w-11 h-11 rounded border border-beige object-cover"
            />
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
              user.isAvailable ? 'bg-[#7C9579]' : 'bg-slate-300'
            }`} title={user.isAvailable ? 'Available for team matching' : 'Unavailable'} />
          </div>
          {compatibilityScore !== undefined && (
            <CompatibilityBadge score={compatibilityScore} />
          )}
        </div>

        {/* Student Name */}
        <h3 className="text-sm font-bold text-brown line-clamp-1">
          {user.name}
        </h3>
        
        {/* Derived Preferred Role & College Year */}
        <div className="mt-1 flex flex-wrap gap-1.5 items-center">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#60737C]/10 text-[#60737C]">
            {preferredRole}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-beige/50 text-brown">
            {collegeYear}
          </span>
        </div>

        {/* Institution Info */}
        <div className="my-3 text-slate-500 text-[10px] space-y-1">
          <div className="flex items-center gap-1.5">
            <GraduationCap size={12} className="text-slate-400 shrink-0" />
            <span className="line-clamp-1 font-semibold">{user.college}</span>
          </div>
        </div>

        {/* Previous Academic Projects Showcase */}
        <div className="mb-3.5 pt-2 border-t border-beige/65">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
            <Folder size={10} /> Course Projects
          </p>
          <div className="space-y-1">
            {previousProjects.map((proj, idx) => (
              <div key={idx} className="text-[10px] text-slate-600 bg-[#FAF8F5] border border-beige/50 px-2 py-0.5 rounded font-mono truncate">
                {proj}
              </div>
            ))}
          </div>
        </div>

        {/* Core skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {user.skills.slice(0, 3).map(skill => (
                <SkillBadge key={skill} skill={skill} />
              ))}
              {user.skills.length > 3 && (
                <span className="text-[8px] text-slate-500 font-bold px-1 py-0.5 bg-[#FAF8F5] border border-beige rounded">
                  +{user.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Button Action */}
      <div className="border-t border-beige pt-3 mt-auto">
        <Link
          to={`/profile/${user._id}`}
          className="block text-center w-full py-1.5 text-[10px] font-bold bg-white text-brown hover:bg-[#FAF8F5] border border-beige rounded transition-all"
        >
          View Profile Details
        </Link>
      </div>
    </div>
  );
};

export default UserCard;
