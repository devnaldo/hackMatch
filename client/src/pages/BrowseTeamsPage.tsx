import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Users, Search, RefreshCw, FolderPlus, Loader2 } from 'lucide-react';
import api from '../api';
import { Team, Hackathon } from '../types';
import TeamCard from '../components/TeamCard';

const SKILLS_LIST = ['React', 'Node.js', 'Python', 'Flutter', 'UI/UX Design', 'TypeScript', 'JavaScript', 'Machine Learning'];

const BrowseTeamsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [teams, setTeams] = useState<Team[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchVal, setSearchVal] = useState(searchParams.get('q') || '');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || '');
  const [selectedHackathon, setSelectedHackathon] = useState(searchParams.get('hackathon') || '');

  useEffect(() => {
    // Fetch filter reference hackathons
    const fetchHackathons = async () => {
      try {
        const res = await api.get('/hackathons');
        setHackathons(res.data.data);
      } catch (error) {
        console.error('Failed to load filter hackathons list:', error);
      }
    };
    fetchHackathons();
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('status', 'open'); // default browse only open teams

        if (selectedSkill) queryParams.append('skills', selectedSkill);
        if (selectedHackathon) queryParams.append('hackathonId', selectedHackathon);

        const response = await api.get(`/teams?${queryParams.toString()}`);
        let fetchedTeams = response.data.data as Team[];

        // Apply local search filtering for name/description match
        if (searchVal.trim()) {
          const queryStr = searchVal.toLowerCase();
          fetchedTeams = fetchedTeams.filter(team => 
            team.teamName.toLowerCase().includes(queryStr) || 
            team.description.toLowerCase().includes(queryStr)
          );
        }

        setTeams(fetchedTeams);
      } catch (error) {
        console.error('Failed to load teams list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();

    // Synchronize URL parameters
    const newParams: Record<string, string> = {};
    if (searchVal) newParams.q = searchVal;
    if (selectedSkill) newParams.skill = selectedSkill;
    if (selectedHackathon) newParams.hackathon = selectedHackathon;
    setSearchParams(newParams);
  }, [searchVal, selectedSkill, selectedHackathon, setSearchParams]);

  const handleReset = () => {
    setSearchVal('');
    setSelectedSkill('');
    setSelectedHackathon('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brown tracking-tight">Browse Open Teams</h1>
          <p className="text-slate-500 text-sm mt-1">
            Search for teams that have open slots and request to join their sprint.
          </p>
        </div>
        <Link
          to="/teams/create"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brown text-white text-sm font-bold rounded-xl shadow-sm hover:bg-primary-hover self-start sm:self-auto transition-colors"
        >
          <FolderPlus size={16} /> Create a Team
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-cream/40 border border-beige rounded-xl p-5 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          {/* Search bar */}
          <div className="text-left">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Search Keywords</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </div>
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search name, bio..."
                className="block w-full pl-9 pr-3 py-2 bg-cream border border-beige rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brown focus:bg-cream"
              />
            </div>
          </div>

          {/* Skills list */}
          <div className="text-left">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Skill Wanted</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="block w-full px-3 py-2 bg-cream border border-beige rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brown focus:bg-cream"
            >
              <option value="">Any Skill</option>
              {SKILLS_LIST.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          {/* Hackathons lists */}
          <div className="text-left">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hackathon Target</label>
            <select
              value={selectedHackathon}
              onChange={(e) => setSelectedHackathon(e.target.value)}
              className="block w-full px-3 py-2 bg-cream border border-beige rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brown focus:bg-cream"
            >
              <option value="">Any Hackathon</option>
              {hackathons.map(h => (
                <option key={h._id} value={h._id}>{h.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-beige hover:bg-beige/40 text-brown rounded-xl text-sm font-semibold self-end lg:self-center h-[38px] mt-1 lg:mt-0 transition-colors"
        >
          <RefreshCw size={14} /> Reset
        </button>
      </div>

      {/* Team Listings */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Loader2 className="animate-spin text-brown" size={32} />
          <p className="text-slate-500 text-sm font-semibold">Retrieving teams list...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-cream/40 border border-beige rounded-xl p-12 text-center max-w-md mx-auto">
          <Users size={36} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-brown">No Teams Found</h3>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
            No teams match your filters. You can clear the search or create a new team to get started.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-beige hover:bg-beige/40 text-brown rounded-xl text-xs font-bold transition-colors"
            >
              Clear Filters
            </button>
            <Link
              to="/teams/create"
              className="px-4 py-2 bg-brown hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Create a Team
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map((team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseTeamsPage;
