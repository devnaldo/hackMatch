import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { getAvatarUrlWithFallback } from '../utils/avatarUtils';
import { 
  Lightbulb, 
  ThumbsUp, 
  Trash2, 
  Plus, 
  X, 
  Loader2, 
  AlertCircle, 
  Tag, 
  Clock,
  ChevronUp,
  BrainCircuit,
  Users
} from 'lucide-react';
import api from '../api';
import { ProjectIdea } from '../types';

const DOMAIN_OPTIONS = ['AI', 'Web', 'Blockchain', 'Healthcare', 'Education', 'Finance', 'Other'];

const getDifficultyLevel = (idea: ProjectIdea): string => {
  const combined = (idea.tags || []).join(' ').toLowerCase() + idea.title.toLowerCase();
  if (combined.includes('ai') || combined.includes('blockchain') || combined.includes('tensor') || combined.includes('deep learning')) {
    return 'Advanced';
  }
  if (combined.includes('react') || combined.includes('flutter') || combined.includes('node') || combined.includes('database')) {
    return 'Intermediate';
  }
  return 'Beginner Friendly';
};

const getInnovationScore = (idea: ProjectIdea): number => {
  const charSum = idea.title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 7 + (charSum % 4); // Returns between 7 and 10
};

const getEstimatedTeamSize = (idea: ProjectIdea): string => {
  const combined = (idea.tags || []).join(' ').toLowerCase();
  if (combined.includes('ai') || combined.includes('blockchain') || combined.includes('hybrid')) {
    return '3-4 students';
  }
  return '2-3 students';
};

const ProjectIdeasPage: React.FC = () => {
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedDomain, setSelectedDomain] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // or 'upvotes'

  // Submit form state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('AI');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDomain) params.append('domain', selectedDomain);
      if (sortBy === 'upvotes') params.append('sort', 'upvotes');

      const response = await api.get(`/ideas?${params.toString()}`);
      setIdeas(response.data.data);
    } catch (error) {
      console.error('Failed to load project ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [selectedDomain, sortBy]);

  // Handle submit idea
  const handleIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setFormError('');

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    try {
      await api.post('/ideas', {
        title: title.trim(),
        domain,
        description: description.trim(),
        tags
      });

      // Clear & Close
      setTitle('');
      setDomain('AI');
      setDescription('');
      setTagsInput('');
      setShowModal(false);
      
      // Refresh list
      await fetchIdeas();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit idea.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle upvoting
  const handleUpvote = async (id: string) => {
    if (!isAuthenticated) {
      alert('Please log in to upvote project ideas.');
      return;
    }
    
    try {
      const response = await api.post(`/ideas/${id}/upvote`);
      const { upvotesCount, upvoted } = response.data.data;
      
      setIdeas((prev) => 
        prev.map((idea) => {
          if (idea._id === id) {
            let updatedUpvotes = [...idea.upvotes];
            if (upvoted) {
              if (currentUser && !updatedUpvotes.includes(currentUser._id)) {
                updatedUpvotes.push(currentUser._id);
              }
            } else {
              if (currentUser) {
                updatedUpvotes = updatedUpvotes.filter(uid => uid !== currentUser._id);
              }
            }
            return { ...idea, upvotes: updatedUpvotes };
          }
          return idea;
        })
      );
    } catch (error) {
      console.error('Failed to toggle upvote:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project idea?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/ideas/${id}`);
      setIdeas(prev => prev.filter(idea => idea._id !== id));
    } catch (error) {
      console.error('Failed to delete project idea:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left text-[#2C2C2B] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 pb-6 border-b border-beige">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D2D2D] tracking-tight">Project Ideas Brainstorm</h1>
          <p className="text-[#5A5A57] text-xs mt-1">
            Pitch product briefs, review tech stacks, upvote student ideas, and match with creators.
          </p>
        </div>
        
        {isAuthenticated && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-sm transition-colors shrink-0 self-start sm:self-auto"
          >
            <Plus size={14} /> Pitch Project Brief
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-beige rounded-lg p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {/* Domain */}
          <div className="text-left w-full sm:w-auto">
            <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Domain filter</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-1.5 bg-white border border-beige rounded text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Domains</option>
              {DOMAIN_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="text-left w-full sm:w-auto">
            <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Sort order</label>
            <div className="flex border border-beige p-0.5 rounded bg-[#FAF8F5]">
              <button
                onClick={() => setSortBy('newest')}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold transition-all ${
                  sortBy === 'newest' ? 'bg-white border border-beige text-primary shadow-sm' : 'text-slate-500 hover:text-slate-750'
                }`}
              >
                <Clock size={11} /> Recents
              </button>
              <button
                onClick={() => setSortBy('upvotes')}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold transition-all ${
                  sortBy === 'upvotes' ? 'bg-white border border-beige text-primary shadow-sm' : 'text-slate-500 hover:text-slate-750'
                }`}
              >
                <ChevronUp size={11} /> Top Upvotes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Idea Cards List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Loading project brainstorm briefs...</p>
        </div>
      ) : ideas.length === 0 ? (
        <div className="bg-white border border-beige rounded-lg p-12 text-center max-w-md mx-auto">
          <Lightbulb size={32} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-xs font-bold text-[#2D2D2D]">No Ideas Found</h3>
          <p className="text-[#5A5A57] text-[11px] mt-1.5 leading-relaxed font-semibold">
            No pitches match your selection. Click 'Pitch Project Brief' to post your idea!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ideas.map((idea) => {
            const author = idea.submittedBy;
            const hasUpvoted = currentUser ? idea.upvotes?.includes(currentUser._id) : false;
            
            const isOwner = currentUser && (
              author?._id === currentUser._id || currentUser.role === 'admin'
            );

            const difficulty = getDifficultyLevel(idea);
            const teamSize = getEstimatedTeamSize(idea);
            const innovation = getInnovationScore(idea);

            return (
              <div 
                key={idea._id} 
                className="bg-white rounded-lg border border-beige p-4 flex flex-col justify-between hover:border-primary transition-all shadow-sm group text-left"
              >
                <div>
                  {/* Header Author & Domain */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={getAvatarUrlWithFallback(author?.profilePicture, author?.name)}
                        alt={author?.name}
                        className="w-7 h-7 rounded border border-beige object-cover"
                      />
                      <div className="text-left leading-tight">
                        <p className="text-xs font-bold text-slate-800">{author?.name || 'Anonymous'}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">{author?.college || 'Institution'}</p>
                      </div>
                    </div>

                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#60737C]/10 text-[#60737C]">
                      {idea.domain}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-brown group-hover:text-primary transition-colors line-clamp-1">
                    {idea.title}
                  </h3>

                  {/* High Density Metrics */}
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] font-bold">
                    <span className={`px-1.5 py-0.5 rounded ${
                      difficulty === 'Advanced' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-100'
                        : difficulty === 'Intermediate'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-[#7C9579]/10 text-[#7C9579] border border-[#7C9579]/20'
                    }`}>
                      {difficulty}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-beige/50 text-slate-600 flex items-center gap-1">
                      <Users size={10} /> {teamSize}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <BrainCircuit size={10} /> Novelty: {innovation}/10
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mt-3 line-clamp-4 select-text">
                    {idea.description}
                  </p>

                  {/* Required skill tags */}
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                      {idea.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-beige bg-[#FAF8F5] text-slate-500 text-[9px] font-mono">
                          <Tag size={8} /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Upvote & Delete */}
                <div className="border-t border-beige pt-3 mt-4 flex justify-between items-center text-[10px]">
                  <button
                    onClick={() => handleUpvote(idea._id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-bold border transition-colors ${
                      hasUpvoted 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-[#FAF8F5] border-beige text-slate-500 hover:bg-[#FAF8F5] hover:text-primary hover:border-primary'
                    }`}
                  >
                    <ThumbsUp size={11} fill={hasUpvoted ? 'var(--color-primary)' : 'transparent'} />
                    <span>{idea.upvotes?.length || 0} Upvotes</span>
                  </button>

                  {/* Delete trigger */}
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(idea._id)}
                      disabled={actionLoading}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-[#FAF8F5] rounded border border-transparent hover:border-beige transition-all"
                      title="Delete idea"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit brief modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-beige w-full max-w-lg rounded-lg shadow-lg relative overflow-hidden text-left">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-beige flex justify-between items-center">
              <h2 className="text-sm font-bold text-brown flex items-center gap-2">
                <Lightbulb size={16} className="text-primary" /> Pitch Project Brief
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:bg-[#FAF8F5] rounded">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleIdeaSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-xs flex gap-1 items-start">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Smart Geofenced Attendance QR"
                  className="block w-full px-3 py-2 border border-beige bg-white rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              {/* Domain option */}
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Technical Domain</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-beige rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {DOMAIN_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Brief Description / Problem Statement</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Pitch the problem, core mechanics, target user base, and what member slots you need filled..."
                  rows={4}
                  maxLength={1000}
                  className="block w-full px-3 py-2 border border-beige bg-white rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary placeholder-slate-400"
                  required
                />
                <span className="text-[8px] text-slate-400 block text-right mt-0.5">
                  {description.length} / 1000 characters
                </span>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Core Tech Stack (Comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. React, Node.js, SQLite, Geolocation"
                  className="block w-full px-3 py-2 border border-beige bg-white rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-beige flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border border-beige hover:bg-[#FAF8F5] text-brown font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold rounded shadow-sm"
                >
                  {submitting ? 'Submitting...' : 'Post Brief'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectIdeasPage;
