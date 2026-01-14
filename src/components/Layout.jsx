import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlaySquare, Briefcase, MessageSquare, Menu, User, Shield, Trophy, X, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
            <span className="font-bold tracking-wide text-lg">{label}</span>
        </NavLink>
    );
};

export default function Layout({ children }) {
    const location = useLocation();
    const { userProfile, currentUser } = useAuth();
    const isLanding = location.pathname === '/';
    const isReels = location.pathname === '/reels';

    if (isLanding) return <>{children}</>;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const isAdmin = userProfile?.role === 'Admin' || currentUser?.email === 'garvit.university@gmail.com';

    return (
        <div className="min-h-screen bg-background text-text flex">
            {/* Desktop Sidebar */}
            {!isReels && (
                <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 border-r border-white/10 p-6 bg-background/50 backdrop-blur-xl z-50">
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
                </aside>
            )}

            {/* Mobile Header with Hamburger */}
            {!isReels && (
                <div className="md:hidden fixed top-0 left-0 right-0 p-4 z-50 flex justify-between items-center bg-background/80 backdrop-blur-md border-b border-white/10">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-white">
                        <Menu size={24} />
                    </button>
                    <NavLink to="/feed">
                        <h1 className="text-2xl font-display font-black tracking-tighter text-white">
                            San<span className="text-primary">chit</span>.
                        </h1>
                    </NavLink>
                    <NavLink to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                        <img
                            src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName}&background=0D8ABC&color=fff`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </NavLink>
                </div>
            )}

            {/* Mobile Sidebar Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/80 z-[60] md:hidden backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-3/4 bg-surface z-[70] md:hidden p-6 flex flex-col border-r border-white/10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-white">Menu</h2>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <nav className="space-y-2 flex-1 overflow-y-auto">
                                <SidebarLink to="/feed" icon={Home} label="Feed" />
                                <SidebarLink to="/forum" icon={MessageSquare} label="Forum" />
                                <SidebarLink to="/reels" icon={PlaySquare} label="Reels" />
                                <SidebarLink to="/leaderboard" icon={Trophy} label="Rankings" />
                                <SidebarLink to="/chat" icon={MessageSquare} label="DMs" />
                                <SidebarLink to="/opportunities" icon={Briefcase} label="Gigs" />
                                <SidebarLink to="/hackathons" icon={Trophy} label="Hackathons" />
                                <SidebarLink to="/profile" icon={UserIcon} label="Profile" />
                                {isAdmin && (
                                    <SidebarLink to="/admin" icon={Shield} label="Admin" />
                                )}
                            </nav>
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); window.dispatchEvent(new CustomEvent('open-premium')); }}
                                className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-2xl flex items-center gap-3 text-black font-black shadow-lg"
                            >
                                <Trophy size={20} className="text-black" />
                                <div>
                                    <p className="text-sm">Get Premium</p>
                                    <p className="text-[10px] opacity-75">Unlock Exclusive Features</p>
                                </div>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Top Right Profile Nav (Desktop) */}
            {!isReels && (
                <div className="fixed top-6 right-8 z-50 hidden md:block group">
                    <NavLink to="/profile" className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-1.5 pl-5 rounded-full border border-white/10 hover:border-primary/50 transition-all hover:bg-black/60 group-hover:shadow-[0_0_25px_rgba(234,179,8,0.3)]">
                        <div className="overflow-hidden w-0 group-hover:w-auto transition-all duration-500 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100">
                            <span className="font-mono text-sm font-bold text-primary mr-2 typing-effect">view_profile()</span>
                        </div>
                        <div className="w-12 h-12 rounded-full border-2 border-primary shadow-[0_0_15px_rgba(234,179,8,0.6)] overflow-hidden relative ring-2 ring-primary/20">
                            <img
                                src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName}&background=0D8ABC&color=fff`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </NavLink>
                </div>
            )}

            {/* Main Content Area */}
            <main className={`flex-1 min-h-screen overflow-x-hidden md:pl-0 ${isReels ? '' : 'pt-20 md:pt-0'} pb-0`}>
                <div className={`${isReels || location.pathname === '/chat' ? 'h-full w-full max-w-none p-0' : 'max-w-5xl mx-auto p-4 md:p-8 pb-20 md:pb-8'}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
