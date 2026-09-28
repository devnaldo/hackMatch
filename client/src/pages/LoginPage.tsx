import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, Loader2, AlertCircle, Terminal } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, error, loading, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState(false);

  useEffect(() => {
    clearError();
    if (searchParams.get('expired') === 'true') {
      setSessionExpiredMsg(true);
    }
  }, [clearError, searchParams]);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please provide a valid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#2C2C2B] font-sans">
      <div className="max-w-md w-full bg-white border border-beige p-6 rounded-lg shadow-sm text-left">
        
        {/* Logo and Headings */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 justify-center mb-3">
            <Terminal size={16} className="text-brown" />
            <span className="font-bold tracking-tight text-sm text-brown">
              Hack<span className="text-primary">Match</span> Portal
            </span>
          </div>
          <h2 className="text-lg font-bold text-brown tracking-tight">Access Campus Workspace</h2>
          <p className="mt-1 text-xs text-slate-500 font-semibold">
            Connect with student teams and manage sprint applications.
          </p>
        </div>

        {/* Session expiry or API Error alerts */}
        {sessionExpiredMsg && (
          <div className="flex gap-2 p-2.5 bg-amber-50 text-amber-800 rounded border border-amber-200 text-xs mb-4">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="flex gap-2 p-2.5 bg-rose-50 text-rose-800 rounded border border-rose-100 text-xs mb-4">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3.5">
            {/* Email input */}
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
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                  }}
                  placeholder="name@college.edu"
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

            {/* Password input */}
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
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  }}
                  placeholder="••••••••"
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
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 rounded text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm focus:outline-none"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={12} /> Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="text-center text-xs text-slate-500 mt-4 border-t border-beige pt-3 font-semibold">
            New to HackMatch?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
