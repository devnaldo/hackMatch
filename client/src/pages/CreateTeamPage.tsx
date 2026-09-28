import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Users, FolderPlus, Award, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api';
import { Hackathon } from '../types';
import SkillSelector from '../components/SkillSelector';

const CreateTeamPage: React.FC = () => {
  const { fetchCurrentUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedHackathonId = searchParams.get('hackathonId') || '';

  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [maxSize, setMaxSize] = useState(4);
  const [hackathonId, setHackathonId] = useState(preselectedHackathonId);
  const [projectIdea, setProjectIdea] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const res = await api.get('/hackathons?upcoming=true');
        setHackathons(res.data.data);
      } catch (error) {
        console.error('Failed to load upcoming hackathons:', error);
      }
    };
    fetchHackathons();
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!teamName.trim()) {
      errs.teamName = 'Team name is required';
    } else if (teamName.trim().length < 3) {
      errs.teamName = 'Team name must be at least 3 characters';
    }

    if (!description.trim()) {
      errs.description = 'Description is required';
    } else if (description.trim().length > 500) {
      errs.description = 'Description cannot exceed 500 characters';
    }

    if (maxSize < 2 || maxSize > 6) {
      errs.maxSize = 'Team size must be between 2 and 6';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError('');

    // Parse comma-separated tags
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const payload = {
      teamName: teamName.trim(),
      description: description.trim(),
      maxSize,
      hackathonId: hackathonId || undefined,
      projectIdea: projectIdea.trim() || undefined,
      requiredSkills,
      tags
    };

    try {
      const response = await api.post('/teams', payload);
      await fetchCurrentUser(); // Update local teamsJoined list
      navigate(`/teams/${response.data.data._id}`);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to create team. Team name might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-brown tracking-tight">Create a Team</h1>
        <p className="text-slate-500 text-xs mt-1">
          Form a new roster, specify the technical skill gaps you need filled, and find teammates.
        </p>
      </div>

      {submitError && (
        <div className="flex gap-2 p-3 bg-dusty-rose/20 text-brown border border-dusty-rose/50 rounded-xl text-xs mb-6 items-center">
          <AlertCircle size={16} className="shrink-0 text-terracotta" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-cream/40 border border-beige rounded-2xl p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          {/* Team Name & Size limit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  if (errors.teamName) setErrors({ ...errors, teamName: '' });
                }}
                placeholder="e.g. smart attendance crew"
                className={`block w-full px-3 py-2 bg-cream border rounded-xl text-xs focus:outline-none focus:ring-1 transition-colors ${
                  errors.teamName
                    ? 'border-dusty-rose focus:ring-dusty-rose focus:border-dusty-rose'
                    : 'border-beige focus:ring-brown focus:border-brown'
                }`}
              />
              {errors.teamName && <p className="text-xs text-terracotta mt-1">{errors.teamName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Max Size</label>
              <input
                type="number"
                min={2}
                max={6}
                value={maxSize}
                onChange={(e) => setMaxSize(parseInt(e.target.value) || 4)}
                className="block w-full px-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown"
              />
              {errors.maxSize && <p className="text-xs text-terracotta mt-1">{errors.maxSize}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Team Description</label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              placeholder="Tell other builders what your team aims to achieve and what type of work environment you have..."
              rows={4}
              maxLength={500}
              className={`block w-full px-3 py-2 bg-cream border rounded-xl text-xs focus:outline-none focus:ring-1 transition-colors ${
                errors.description
                  ? 'border-dusty-rose focus:ring-dusty-rose focus:border-dusty-rose'
                  : 'border-beige focus:ring-brown focus:border-brown'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-xs text-terracotta font-medium">{errors.description}</p>
              ) : (
                <span />
              )}
              <span className="text-[10px] text-slate-400">{description.length} / 500 characters</span>
            </div>
          </div>

          {/* Target Hackathon selection */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
              Target Hackathon (Optional)
            </label>
            <select
              value={hackathonId}
              onChange={(e) => setHackathonId(e.target.value)}
              className="block w-full px-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown"
            >
              <option value="">No specific event (General project team)</option>
              {hackathons.map(hackathon => (
                <option key={hackathon._id} value={hackathon._id}>
                  {hackathon.title} ({hackathon.mode})
                </option>
              ))}
            </select>
          </div>

          {/* Project Brief */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Project Idea (Optional)</label>
            <textarea
              value={projectIdea}
              onChange={(e) => setProjectIdea(e.target.value)}
              placeholder="Briefly pitch the initial project idea or technical stack details..."
              rows={3}
              className="block w-full px-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown placeholder-slate-400"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
              Tech Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. React, SQL, Hostel maintenance"
              className="block w-full px-3 py-2 bg-cream border border-beige rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brown"
            />
          </div>

          {/* Skill Gaps Selector */}
          <div>
            <label className="block text-xs font-bold text-brown uppercase mb-3 pt-4 border-t border-beige">
              Required Teammate Skills
            </label>
            <SkillSelector selectedSkills={requiredSkills} onChange={setRequiredSkills} />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-beige flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/teams')}
            className="px-4 py-2 border border-beige hover:bg-beige/40 text-brown rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-brown text-white text-xs rounded-xl hover:bg-primary-hover font-bold transition-colors flex items-center shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={14} /> Creating Team...
              </>
            ) : (
              <span className="flex items-center gap-1.5"><FolderPlus size={14} /> Create Team</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeamPage;
