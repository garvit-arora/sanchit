import React from 'react';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Feed from './pages/Feed';
import Opportunities from './pages/Opportunities';
import Login from './pages/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import Chat from './pages/Chat';
import Reels from './pages/Reels';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Forum from './pages/Forum';
import Onboarding from './pages/Onboarding';
import VerifyEDU from './pages/VerifyEDU';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import NotFound from './pages/NotFound';
import Hackathons from './pages/Hackathons';
import PremiumModal from './components/PremiumModal';

const queryClient = new QueryClient();

// Helper to check for Hardcoded Admin Access
const AdminGuard = ({ children }) => {
  const adminToken = localStorage.getItem('admin_token');
  if (adminToken === 'grid_master_access_granted') {
    return children;
  }
  return <AdminLogin />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/*" element={
              <AuthGuard>
                <Layout>
                  <Routes>
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/verify-edu" element={<VerifyEDU />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/reels" element={<Reels />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/opportunities" element={<Opportunities />} />
                    <Route path="/hackathons" element={<Hackathons />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/user/:uid" element={<Profile />} />
                    <Route path="/admin" element={<AdminGuard><AdminPanel /></AdminGuard>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <PremiumModal />
                </Layout>
              </AuthGuard>
            } />

            {/* 404 Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
