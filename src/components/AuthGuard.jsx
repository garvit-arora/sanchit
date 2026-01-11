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

    // Strict Verification Gate
    // If user is logged in but NOT verified, FORCE them to /onboarding
    // Except if they are already on /onboarding to avoid loop
    if (currentUser && !userProfile?.isVerified && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
}
