import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';
import { getSocket, disconnectSocket } from './utils/socket';
import { Loader2 } from 'lucide-react';

// Components
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import HackathonsPage from './pages/HackathonsPage';
import HackathonDetailPage from './pages/HackathonDetailPage';
import BrowseTeamsPage from './pages/BrowseTeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import CreateTeamPage from './pages/CreateTeamPage';
import MyTeamPage from './pages/MyTeamPage';
import FindTeammatesPage from './pages/FindTeammatesPage';
import ProjectIdeasPage from './pages/ProjectIdeasPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';

// Protected Route wrapper component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const { isAuthenticated, token, fetchCurrentUser, user } = useAuthStore();
  const { addNotification, fetchNotifications } = useNotificationStore();

  // 1. Fetch user data on startup if token exists
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // 2. Manage Socket.io connections for real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !token || !user) {
      disconnectSocket();
      return;
    }

    const socket = getSocket(token);

    if (!socket.connected) {
      socket.connect();
    }

    // Join personal notification room
    socket.emit('join_room', { userId: user._id });

    // Listeners
    socket.on('receive_notification', (notification: any) => {
      addNotification(notification);
    });

    socket.on('badge_update', () => {
      fetchNotifications();
    });

    return () => {
      socket.off('receive_notification');
      socket.off('badge_update');
    };
  }, [isAuthenticated, token, user, addNotification, fetchNotifications]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50">
        {/* Navigation bar */}
        <Navbar />

        {/* Viewport page container */}
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile/:id" element={<UserProfilePage />} />
            <Route path="/hackathons" element={<HackathonsPage />} />
            <Route path="/hackathons/:id" element={<HackathonDetailPage />} />
            <Route path="/ideas" element={<ProjectIdeasPage />} />

            {/* Protected user routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teams" 
              element={
                <ProtectedRoute>
                  <BrowseTeamsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teams/:id" 
              element={
                <ProtectedRoute>
                  <TeamDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teams/create" 
              element={
                <ProtectedRoute>
                  <CreateTeamPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-team" 
              element={
                <ProtectedRoute>
                  <MyTeamPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/match" 
              element={
                <ProtectedRoute>
                  <FindTeammatesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />

            {/* Catch all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
