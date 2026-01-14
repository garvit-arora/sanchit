import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlaySquare, Briefcase, MessageSquare, Menu, User, Shield, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import MiniLeaderboard from './MiniLeaderboard';

const SidebarLink = ({ to, icon: Icon, label }) => {
    return (
        <NavLink to={to} className={({ isActive }) => `
            flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group
            ${isActive ? 'bg-surface border border-secondary/30 text-secondary shadow-[0_0_15px_rgba(217,70,239,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}
        `}>
            <Icon size={24} strokeWidth={2.5} />
            <span className="font-bold tracking-wide text-lg hidden md:block">{label}</span>
        </NavLink>
    );
};

export default function Layout({ children }) {
    const location = useLocation();
    const { userProfile, currentUser } = useAuth();
    const isLanding = location.pathname === '/';

    if (isLanding) return <>{children}</>;

    const isAdmin = userProfile?.role === 'Admin' || currentUser?.email === 'garvit.university@gmail.com';

    return (
        <div className="min-h-screen bg-background text-text flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 border-r border-white/10 p-6 bg-background/50 backdrop-blur-xl">
                <div className="mb-8">
                    <NavLink to="/feed">
                        <h1 className="text-3xl font-display font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
                            San<span className="text-primary">chit</span>.
                        </h1>
                    </NavLink>
                </div>

                <nav className="flex-1 space-y-4 mb-6 overflow-y-auto pr-2 scrollbar-hide">
                    <SidebarLink to="/feed" icon={Home} label="Feed" />
                    <SidebarLink to="/forum" icon={MessageSquare} label="Forum" />
                    <SidebarLink to="/reels" icon={PlaySquare} label="Reels" />
                    <SidebarLink to="/leaderboard" icon={Trophy} label="Rankings" />
                    <SidebarLink to="/chat" icon={MessageSquare} label="DMs" />
                    <SidebarLink to="/opportunities" icon={Briefcase} label="Gigs" />
                    <SidebarLink to="/hackathons" icon={Trophy} label="Hackathons" />
                    {isAdmin && (
                        <SidebarLink to="/admin" icon={Shield} label="Admin" />
                    )}
                </nav>

                {/* Premium Button */}
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-premium'))}
                    className="mb-4 mx-2 bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-2xl flex items-center gap-3 text-black font-black shadow-lg hover:scale-[1.02] transition-transform"
                >
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Trophy size={20} className="text-black" />
                    </div>
                    <div>
                        <p className="text-sm">Get Premium</p>
                        <p className="text-[10px] opacity-75">Unlock Exclusive Features</p>
                    </div>
                </button>

                <div className="mt-4 pt-6 border-t border-white/10">
                    <NavLink to="/profile" className={({ isActive }) => `
                        flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group
                        ${isActive ? 'bg-surface border border-secondary/30 text-secondary' : 'text-gray-500 hover:text-white hover:bg-white/5'}
                    `}>
                        <UserAvatar src={currentUser?.photoURL} name={userProfile?.displayName} size="sm" />
                        <span className="font-bold tracking-wide text-lg hidden md:block">Profile</span>
                    </NavLink>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-white/10 z-50 flex justify-around p-4 pb-6">
                <NavLink to="/feed" className={({ isActive }) => isActive ? "text-secondary" : "text-gray-500"}><Home size={26} /></NavLink>
                <NavLink to="/leaderboard" className={({ isActive }) => isActive ? "text-secondary" : "text-gray-500"}><Trophy size={26} /></NavLink>
                <NavLink to="/reels" className={({ isActive }) => isActive ? "text-secondary" : "text-gray-500"}><PlaySquare size={26} /></NavLink>
                <NavLink to="/chat" className={({ isActive }) => isActive ? "text-secondary" : "text-gray-500"}><MessageSquare size={26} /></NavLink>
                <NavLink to="/opportunities" className={({ isActive }) => isActive ? "text-secondary" : "text-gray-500"}><Briefcase size={26} /></NavLink>
                {isAdmin && (
                    <NavLink to="/admin" className={({ isActive }) => isActive ? "text-secondary" : "text-gray-500"}><Shield size={26} /></NavLink>
                )}
                <NavLink to="/profile" className={({ isActive }) => isActive ? "border-2 border-secondary rounded-full" : ""}>
                    <UserAvatar src={currentUser?.photoURL} name={userProfile?.displayName} size="sm" />
                </NavLink>
            </nav>

            {/* Main Content Area */}
            <main className={`flex-1 min-h-screen overflow-x-hidden md:pl-0 ${location.pathname === '/reels' || location.pathname === '/chat' ? '' : 'pb-24 md:pb-0'}`}>
                <div className={`${location.pathname === '/reels' || location.pathname === '/chat' ? 'h-full w-full max-w-none p-0' : 'max-w-5xl mx-auto p-4 md:p-8 pb-20 md:pb-8'}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
