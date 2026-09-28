import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { getAvatarUrlWithFallback } from '../utils/avatarUtils';
import { 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  Users, 
  Award, 
  Lightbulb, 
  Search,
  Settings
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const activeLink = (path: string) => {
    return location.pathname === path 
      ? 'text-brown font-bold border-b-2 border-terracotta' 
      : 'text-slate-600 hover:text-brown transition-all';
  };

  const activeMobileLink = (path: string) => {
    return location.pathname === path 
      ? 'bg-beige/40 text-brown font-bold' 
      : 'text-slate-600 hover:bg-cream';
  };

  return (
    <nav className="sticky top-0 z-50 bg-cream border-b border-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-1.5 select-none">
              <span className="text-lg font-extrabold tracking-tight text-brown font-mono">
                &gt;_
              </span>
              <span className="text-lg font-bold tracking-tight text-brown">
                Hack<span className="text-terracotta">Match</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          {isAuthenticated ? (
            <div className="hidden md:flex space-x-6 items-center">
              <Link to="/dashboard" className={`flex items-center gap-1.5 px-1 py-4.5 text-xs font-semibold uppercase tracking-wider ${activeLink('/dashboard')}`}>
                Dashboard
              </Link>
              <Link to="/hackathons" className={`flex items-center gap-1.5 px-1 py-4.5 text-xs font-semibold uppercase tracking-wider ${activeLink('/hackathons')}`}>
                Hackathons
              </Link>
              <Link to="/match" className={`flex items-center gap-1.5 px-1 py-4.5 text-xs font-semibold uppercase tracking-wider ${activeLink('/match')}`}>
                Team Builder
              </Link>
              <Link to="/ideas" className={`flex items-center gap-1.5 px-1 py-4.5 text-xs font-semibold uppercase tracking-wider ${activeLink('/ideas')}`}>
                Project Ideas
              </Link>
              <Link to="/notifications" className={`flex items-center gap-1.5 px-1 py-4.5 text-xs font-semibold uppercase tracking-wider relative ${activeLink('/notifications')}`}>
                Invitations
                {unreadCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-none bg-terracotta text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className={`flex items-center gap-1.5 px-1 py-4.5 text-xs font-semibold uppercase tracking-wider ${activeLink('/profile')}`}>
                Profile
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex space-x-6 items-center">
              <Link to="/hackathons" className={`flex items-center gap-1.5 px-1 py-4.5 text-xs font-semibold uppercase tracking-wider ${activeLink('/hackathons')}`}>
                Hackathons
              </Link>
              <Link to="/ideas" className={`flex items-center gap-1.5 px-1 py-4.5 text-xs font-semibold uppercase tracking-wider ${activeLink('/ideas')}`}>
                Project Ideas
              </Link>
            </div>
          )}

          {/* Right Section: Auth or CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Profile Avatar & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none rounded-full p-1 hover:bg-beige/40 transition-colors"
                  >
                    <img
                      src={getAvatarUrlWithFallback(user.profilePicture, user.name)}
                      alt={user.name}
                      className="w-7 h-7 rounded-full border border-beige"
                    />
                    <span className="text-xs font-semibold text-slate-700 hidden lg:block">{user.name.split(' ')[0]}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-sm py-1 bg-cream border border-beige ring-1 ring-black ring-opacity-5">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-beige/40 font-semibold"
                      >
                        <UserIcon size={14} /> Edit Profile
                      </Link>
                      
                      <Link
                        to="/my-team"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-beige/40 font-semibold"
                      >
                        <Users size={14} /> My Team workspace
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-brown font-bold hover:bg-beige/40"
                        >
                          <Settings size={14} /> Admin Panel
                        </Link>
                      )}

                      <hr className="border-beige" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-brown hover:bg-rose/20 font-bold"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-brown transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-colors">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger icon */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-beige/40 hover:text-slate-900 focus:outline-none"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-beige bg-cream">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${activeMobileLink('/dashboard')}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/hackathons"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${activeMobileLink('/hackathons')}`}
                >
                  Hackathons
                </Link>
                <Link
                  to="/match"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${activeMobileLink('/match')}`}
                >
                  Team Builder
                </Link>
                <Link
                  to="/ideas"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${activeMobileLink('/ideas')}`}
                >
                  Project Ideas
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm ${activeMobileLink('/notifications')}`}
                >
                  <span>Invitations</span>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-terracotta text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${activeMobileLink('/profile')}`}
                >
                  Profile
                </Link>
                <hr className="border-beige my-2" />
                <Link
                  to="/my-team"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-beige/40 font-semibold"
                >
                  My Team workspace
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-brown font-bold hover:bg-beige/40"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-xl text-sm text-brown hover:bg-rose/20 font-bold"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="p-2 space-y-1">
                <Link
                  to="/hackathons"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${activeMobileLink('/hackathons')}`}
                >
                  Hackathons
                </Link>
                <Link
                  to="/ideas"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${activeMobileLink('/ideas')}`}
                >
                  Project Ideas
                </Link>
                <div className="pt-2 border-t border-beige space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-center w-full py-2 text-xs font-semibold border border-beige rounded-xl text-slate-700 hover:bg-beige/40"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block text-center w-full py-2 text-xs font-semibold bg-primary hover:bg-primary-hover rounded-xl text-white shadow-sm"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
