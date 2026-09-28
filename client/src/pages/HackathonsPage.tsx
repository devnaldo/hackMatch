import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, Search, Filter, Loader2, RefreshCw } from 'lucide-react';
import api from '../api';
import { Hackathon } from '../types';
import HackathonCard from '../components/HackathonCard';

const HACKATHON_TAGS = ['AI', 'Web', 'Blockchain', 'Finance', 'Security', 'Go', 'Python', 'Machine Learning'];

const HackathonsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedMode, setSelectedMode] = useState(searchParams.get('mode') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [upcomingOnly, setUpcomingOnly] = useState(searchParams.get('upcoming') === 'true');

  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedMode) queryParams.append('mode', selectedMode);
        if (selectedTag) queryParams.append('tags', selectedTag);
        if (upcomingOnly) queryParams.append('upcoming', 'true');

        const response = await api.get(`/hackathons?${queryParams.toString()}`);
        setHackathons(response.data.data);
      } catch (error) {
        console.error('Failed to load hackathons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();

    // Synchronize search params in URL
    const newParams: Record<string, string> = {};
    if (selectedMode) newParams.mode = selectedMode;
    if (selectedTag) newParams.tag = selectedTag;
    if (upcomingOnly) newParams.upcoming = 'true';
    setSearchParams(newParams);
  }, [selectedMode, selectedTag, upcomingOnly, setSearchParams]);

  const handleResetFilters = () => {
    setSelectedMode('');
    setSelectedTag('');
    setUpcomingOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-brown tracking-tight">Browse Hackathons</h1>
        <p className="text-slate-500 text-xs mt-1">
          Explore upcoming innovation summits and competitions. Expression of interest will match you to teams.
        </p>
      </div>

      {/* Filters Panel */}
      <div className="bg-cream/40 border border-beige rounded-2xl p-5 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Mode select */}
          <div className="text-left">
            <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Mode</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="px-3 py-2 bg-cream border border-beige rounded-xl text-xs font-semibold text-brown focus:outline-none focus:ring-1 focus:ring-brown focus:bg-cream"
            >
              <option value="">All Modes</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Tags selection */}
          <div className="text-left">
            <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Domain Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 bg-cream border border-beige rounded-xl text-xs font-semibold text-brown focus:outline-none focus:ring-1 focus:ring-brown focus:bg-cream"
            >
              <option value="">All Tech Domains</option>
              {HACKATHON_TAGS.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Upcoming toggle */}
          <div className="flex items-center gap-2 mt-4 md:mt-2">
            <input
              id="upcoming"
              type="checkbox"
              checked={upcomingOnly}
              onChange={(e) => setUpcomingOnly(e.target.checked)}
              className="w-4 h-4 rounded text-brown focus:ring-brown border-beige bg-cream"
            />
            <label htmlFor="upcoming" className="text-xs font-semibold text-slate-600">
              Upcoming Events Only
            </label>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={handleResetFilters}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-beige hover:bg-beige/40 text-brown rounded-xl text-xs font-semibold transition-colors"
        >
          <RefreshCw size={12} /> Reset
        </button>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Loader2 className="animate-spin text-brown" size={32} />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Loading hackathons list...</p>
        </div>
      ) : hackathons.length === 0 ? (
        <div className="bg-cream/40 border border-beige rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto">
          <Award size={32} className="text-brown/20 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-brown">No Hackathons Found</h3>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-semibold">
            No events match your current filters. Reset filters or search for another term to explore opportunities.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-6 px-4 py-2 bg-brown hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {hackathons.map((hackathon) => (
            <HackathonCard key={hackathon._id} hackathon={hackathon} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HackathonsPage;
