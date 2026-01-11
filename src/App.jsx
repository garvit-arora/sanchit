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

import Profile from './pages/Profile';
import Forum from './pages/Forum';
import Onboarding from './pages/Onboarding';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
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
                            <Route path="/feed" element={<Feed />} />
                            <Route path="/forum" element={<Forum />} />
                            <Route path="/reels" element={<Reels />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/opportunities" element={<Opportunities />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    </Layout>
                  </AuthGuard>
              } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
