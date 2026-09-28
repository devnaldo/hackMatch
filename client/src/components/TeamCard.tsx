import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Tag, AlertCircle, ArrowRight } from 'lucide-react';
import { Team, User } from '../types';
import SkillBadge from './SkillBadge';
import { getAvatarUrlWithFallback } from '../utils/avatarUtils';

interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const membersList = (team.members || []) as User[];
  const leader = team.leaderId as User;
  const memberCount = membersList.length;
  const isFull = memberCount >= team.maxSize;

  return (
    <div className="bg-white rounded-lg border border-beige hover:border-primary transition-all p-4 flex flex-col justify-between h-full shadow-sm text-left">
      <div>
        {/* Header (Status & maxSize) */}
        <div className="flex justify-between items-start mb-2.5">
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
            isFull 
              ? 'bg-rose-50 text-rose-700 border border-rose-100' 
              : 'bg-[#7C9579]/10 text-[#7C9579] border border-[#7C9579]/20'
          }`}>
            {isFull ? 'Full' : 'Open Positions'}
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
            <Users size={12} className="text-slate-400" />
            {memberCount} / {team.maxSize}
          </span>
        </div>

        {/* Team Name */}
        <h3 className="text-sm font-bold text-brown line-clamp-1">
          <Link to={`/teams/${team._id}`} className="hover:underline">{team.teamName}</Link>
        </h3>

        {/* Hackathon relation */}
        {team.hackathonId && (
          <p className="text-[10px] text-primary font-bold uppercase mt-0.5">
            For: {(team.hackathonId as any).title || 'Hackathon event'}
          </p>
        )}

        {/* Description */}
        <p className="text-[11px] text-slate-500 line-clamp-2 mt-2 leading-relaxed">
          {team.description}
        </p>

        {/* Required Skills */}
        <div className="mt-3.5 pt-3 border-t border-beige/65">
          {team.requiredSkills && team.requiredSkills.length > 0 ? (
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Roles Needed:</p>
              <div className="flex flex-wrap gap-1">
                {team.requiredSkills.slice(0, 3).map(skill => (
                  <SkillBadge key={skill} skill={skill} />
                ))}
                {team.requiredSkills.length > 3 && (
                  <span className="text-[8px] text-slate-500 font-bold px-1.5 py-0.5 bg-[#FAF8F5] border border-beige rounded">
                    +{team.requiredSkills.length - 3}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold">
              <AlertCircle size={12} />
              <span>General collaboration welcome</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer (Leader and CTA) */}
      <div className="border-t border-beige pt-3 mt-4 flex justify-between items-center text-[10px]">
        {leader && (
          <div className="flex items-center gap-2">
            <img
              src={getAvatarUrlWithFallback(leader.profilePicture, leader.name)}
              alt={leader.name}
              className="w-6 h-6 rounded border border-beige object-cover"
            />
            <div className="text-left leading-tight">
              <p className="font-bold text-slate-700 max-w-[100px] truncate">{leader.name}</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase">Leader</p>
            </div>
          </div>
        )}
        <Link
          to={`/teams/${team._id}`}
          className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
        >
          View Team <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
};

export default TeamCard;
