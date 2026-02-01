import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }) {
    const { currentUser, userProfile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-gray-500 font-mono text-sm animate-pulse">Authenticating...</p>
            </div>
        );
    }

    if (!currentUser) {
        // Redirect them to the /login page, but save the current location they were testing to try and go to
        // so we can send them there after they login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Gate: Ensure user has completed basic profile setup (username, campus, and skills)
    // BYPASS: If offline, skip this check to allow access to cached pages (like Tutor)
    if (navigator.onLine && currentUser && (!userProfile?.username || !userProfile?.campus || !userProfile?.skills || userProfile?.skills.length === 0) && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
}
