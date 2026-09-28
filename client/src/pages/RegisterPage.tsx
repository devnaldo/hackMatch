import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { User as UserIcon, Mail, Lock, School, BookOpen, ChevronRight, Loader2, AlertCircle, Terminal } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { register, error, loading, clearError } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    clearError();
  }, [clearError]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) {
      errors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please provide a valid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/\d/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }

    if (!college.trim()) {
      errors.college = 'College or University name is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      college: college.trim(),
      branch: branch.trim() || undefined,
      experience
    });

    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 text-[#2C2C2B] font-sans">
      <div className="max-w-md w-full bg-white border border-beige p-6 rounded-lg shadow-sm text-left">
        
        {/* Headings */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 justify-center mb-3">
            <Terminal size={16} className="text-brown" />
            <span className="font-bold tracking-tight text-sm text-brown">
              Hack<span className="text-primary">Match</span> Workspace
            </span>
          </div>
          <h2 className="text-lg font-bold text-brown tracking-tight">Create Workspace Account</h2>
          <p className="mt-1 text-xs text-slate-500 font-semibold">
            Establish your skill card to coordinate sprints with peer classmates.
          </p>
        </div>

        {error && (
          <div className="flex gap-2 p-2.5 bg-rose-50 text-rose-800 rounded border border-rose-100 text-xs mb-4">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3.5 text-left">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon size={12} />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                  }}
                  placeholder="Amit Sharma"
                  className={`block w-full pl-9 pr-3 py-1.5 bg-white border rounded text-xs focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.name
                      ? 'border-rose-300 focus:ring-rose-450 focus:border-rose-450'
                      : 'border-beige focus:ring-primary focus:border-primary'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[10px] text-rose-700 mt-1 font-bold">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={12} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  placeholder="amit@college.edu"
                  className={`block w-full pl-9 pr-3 py-1.5 bg-white border rounded text-xs focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.email
                      ? 'border-rose-300 focus:ring-rose-450 focus:border-rose-450'
                      : 'border-beige focus:ring-primary focus:border-primary'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[10px] text-rose-700 mt-1 font-bold">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={12} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  placeholder="Min 8 chars, 1 number"
                  className={`block w-full pl-9 pr-3 py-1.5 bg-white border rounded text-xs focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.password
                      ? 'border-rose-300 focus:ring-rose-450 focus:border-rose-450'
                      : 'border-beige focus:ring-primary focus:border-primary'
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-[10px] text-rose-700 mt-1 font-bold">{fieldErrors.password}</p>
              )}
            </div>

            {/* College */}
            <div>
              <label htmlFor="college" className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                College Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <School size={12} />
                </div>
                <input
                  id="college"
                  type="text"
                  value={college}
                  onChange={(e) => {
                    setCollege(e.target.value);
                    if (fieldErrors.college) setFieldErrors({ ...fieldErrors, college: '' });
                  }}
                  placeholder="e.g. IIT Delhi"
                  className={`block w-full pl-9 pr-3 py-1.5 bg-white border rounded text-xs focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.college
                      ? 'border-rose-300 focus:ring-rose-450 focus:border-rose-450'
                      : 'border-beige focus:ring-primary focus:border-primary'
                  }`}
                />
              </div>
              {fieldErrors.college && (
                <p className="text-[10px] text-rose-700 mt-1 font-bold">{fieldErrors.college}</p>
              )}
            </div>

            {/* Branch */}
            <div>
              <label htmlFor="branch" className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Branch / Field (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <BookOpen size={12} />
                </div>
                <input
                  id="branch"
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="block w-full pl-9 pr-3 py-1.5 bg-white border border-beige rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Experience level segment control */}
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Hackathon Experience Level
              </label>
              <div className="grid grid-cols-3 gap-2 bg-[#FAF8F5] border border-beige p-0.5 rounded">
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setExperience(level)}
                    className={`py-1 rounded text-[10px] font-bold capitalize transition-all ${
                      experience === level
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-[#5A5A57] hover:text-[#2C2C2B]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2 px-4 rounded text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm focus:outline-none mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={12} /> Generating profile...
              </>
            ) : (
              <span className="flex items-center gap-1">Register Account <ChevronRight size={14} /></span>
            )}
          </button>

          <div className="text-center text-xs text-slate-500 mt-4 border-t border-beige pt-3 font-semibold">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
