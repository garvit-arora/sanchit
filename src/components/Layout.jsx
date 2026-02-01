import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlaySquare, Briefcase, MessageSquare, Menu, User, Shield, Trophy, X, User as UserIcon, BookOpen, ChevronRight, Search, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import MiniLeaderboard from './MiniLeaderboard';
import ToastHost from './ToastHost';
import { pythonClient } from '../services/apiClient';

const SidebarLink = ({ to, icon: Icon, label, collapsed }) => {
    return (
        <NavLink to={to} className={({ isActive }) => `
            flex items-center ${collapsed ? 'justify-center p-3' : 'gap-4 p-4'} rounded-2xl transition-all duration-300 group
            ${isActive ? 'bg-surface border border-secondary/30 text-secondary shadow-[0_0_15px_rgba(217,70,239,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}
        `} title={collapsed ? label : ''}>
            <Icon size={24} strokeWidth={2.5} />
            {!collapsed && <span className="font-bold tracking-wide text-lg">{label}</span>}
        </NavLink>
    );
};

export default function Layout({ children }) {
    const location = useLocation();
    const { userProfile, currentUser } = useAuth();
    const isLanding = location.pathname === '/';
    const isReels = location.pathname === '/reels';
    const isTutor = location.pathname === '/tutor';
    const isCollapsed = isTutor || isReels;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [gestureEnabled, setGestureEnabled] = React.useState(false);
    const [gestureStatus, setGestureStatus] = React.useState('idle');
    const videoRef = React.useRef(null);
    const streamRef = React.useRef(null);
    const lastYRef = React.useRef(null);
    const rafRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const inflightRef = React.useRef(false);
    const lastSentRef = React.useRef(0);

    if (isLanding) return <>{children}</>;

    const isAdmin = userProfile?.role === 'Admin' || currentUser?.email === 'garvit.university@gmail.com';

    React.useEffect(() => {
        const stopStream = () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

        const startGesture = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                setGestureStatus('unsupported');
                return;
            }
            setGestureStatus('checking');
            try {
                await pythonClient.get('/health');
            } catch (error) {
                setGestureStatus('backend-offline');
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
                setGestureStatus('active');
                if (!canvasRef.current) {
                    const canvas = document.createElement('canvas');
                    canvas.width = 320;
                    canvas.height = 240;
                    canvasRef.current = canvas;
                }
                const loop = async (time) => {
                    if (!gestureEnabled) return;
                    if (!videoRef.current || videoRef.current.readyState < 2) {
                        rafRef.current = requestAnimationFrame(loop);
                        return;
                    }
                    if (inflightRef.current || time - lastSentRef.current < 300) {
                        rafRef.current = requestAnimationFrame(loop);
                        return;
                    }
                    inflightRef.current = true;
                    lastSentRef.current = time;
                    const ctx = canvasRef.current.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                        const image = canvasRef.current.toDataURL('image/jpeg', 0.6);
                        try {
                            const response = await pythonClient.post('/vision/gesture/scroll', {
                                image,
                                previousY: lastYRef.current,
                                sensitivity: 900
                            });
                            const { scrollDelta, currentY } = response.data || {};
                            if (typeof currentY === 'number') {
                                lastYRef.current = currentY;
                            }
                            if (typeof scrollDelta === 'number') {
                                const clamped = Math.max(Math.min(scrollDelta, 120), -120);
                                if (Math.abs(clamped) > 8) {
                                    window.scrollBy({ top: clamped, behavior: 'smooth' });
                                }
                            }
                        } catch (error) {
                            setGestureStatus('backend-offline');
                        }
                    }
                    inflightRef.current = false;
                    rafRef.current = requestAnimationFrame(loop);
                };
                rafRef.current = requestAnimationFrame(loop);
            } catch (error) {
                if (error?.name === 'NotAllowedError') {
                    setGestureStatus('denied');
                } else if (error?.name === 'NotFoundError') {
                    setGestureStatus('no-camera');
                } else {
                    setGestureStatus('camera-error');
                }
            }
        };

        if (gestureEnabled) {
            startGesture();
        } else {
            stopStream();
            setGestureStatus('idle');
            lastYRef.current = null;
        }

        return () => {
            stopStream();
        };
    }, [gestureEnabled]);

    return (
        <div className="min-h-screen bg-background text-text flex">
            {/* Desktop Sidebar */}
            {(true) && (
                <aside className={`hidden md:flex flex-col ${isCollapsed ? 'w-20 p-3 items-center' : 'w-72 p-6'} h-screen sticky top-0 border-r border-white/10 bg-background/50 backdrop-blur-xl z-50 transition-all duration-300`}>
                    <div className={`${isCollapsed ? 'mb-4' : 'mb-8'}`}>
                        <NavLink to="/feed">
                            {isCollapsed ? (
                                <h1 className="text-2xl font-display font-black tracking-tighter text-white hover:opacity-80 transition-opacity">S<span className="text-primary">.</span></h1>
                            ) : (
                                <h1 className="text-3xl font-display font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
                                    San<span className="text-primary">chit</span>.
                                </h1>
                            )}
                        </NavLink>
                    </div>

                    <nav className={`flex-1 space-y-4 mb-6 overflow-y-auto pr-2 scrollbar-hide ${isCollapsed ? 'w-full' : ''}`}>
                        <SidebarLink to="/feed" icon={Home} label="Feed" collapsed={isCollapsed} />
                        <SidebarLink to="/reels" icon={PlaySquare} label="Reels" collapsed={isCollapsed} />
                        <SidebarLink to="/study" icon={BookOpen} label="Study Zone" collapsed={isCollapsed} />
                        <SidebarLink to="/opportunities" icon={Briefcase} label="Gigs" collapsed={isCollapsed} />
                        <SidebarLink to="/leaderboard" icon={Trophy} label="Rankings" collapsed={isCollapsed} />
                        <SidebarLink to="/forum" icon={MessageSquare} label="Forum" collapsed={isCollapsed} />
                        <SidebarLink to="/chat" icon={MessageSquare} label="DMs" collapsed={isCollapsed} />
                        {isAdmin && (
                            <SidebarLink to="/admin" icon={Shield} label="Admin" collapsed={isCollapsed} />
                        )}
                    </nav>

                    {/* Premium Button */}
                    {!isCollapsed ? (
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
                    ) : (
                        <button 
                             onClick={() => window.dispatchEvent(new CustomEvent('open-premium'))}
                             className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-xl flex items-center justify-center text-black font-black shadow-lg hover:scale-[1.02] transition-transform"
                             title="Get Premium"
                        >
                            <Trophy size={20} className="text-black" />
                        </button>
                    )}
                </aside>
            )}

            {/* Desktop Top Right Profile Icon - Hidden on Reels */}
            {!isReels && (
                <div className="hidden md:block fixed top-6 right-6 z-50">
                    <NavLink to="/profile" className="block w-10 h-10 rounded-full overflow-hidden border border-white/20 hover:border-primary transition-colors shadow-lg">
                        <img
                            src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName}&background=0D8ABC&color=fff`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </NavLink>
                </div>
            )}

            {/* Mobile Header with Hamburger */}
            {!isReels && !isTutor && (
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
                            className="fixed inset-0 bg-black/80 z-50 md:hidden backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-surface border-r border-white/10 z-50 md:hidden flex flex-col p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-display font-black text-white">Menu</h2>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex-1 space-y-2 overflow-y-auto">
                                <SidebarLink to="/profile" icon={User} label="Profile" />
                                <SidebarLink to="/feed" icon={Home} label="Feed" />
                                <SidebarLink to="/reels" icon={PlaySquare} label="Reels" />
                                <SidebarLink to="/study" icon={BookOpen} label="Study Zone" />
                                <SidebarLink to="/opportunities" icon={Briefcase} label="Gigs" />
                                <SidebarLink to="/leaderboard" icon={Trophy} label="Rankings" />
                                <SidebarLink to="/chat" icon={MessageSquare} label="DMs" />
                                <SidebarLink to="/forum" icon={MessageSquare} label="Forum" />
                                {isAdmin && (
                                    <SidebarLink to="/admin" icon={Shield} label="Admin" />
                                )}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className={`flex-1 min-h-screen overflow-x-hidden md:pl-0 ${isReels || location.pathname === '/chat' || location.pathname === '/tutor' ? 'h-full w-full max-w-none p-0' : 'max-w-5xl mx-auto p-4 md:p-8 pb-20 md:pb-8'} pb-0`}>
                {children}
            </main>

            {/* Right Sidebar (Desktop only) - Visible only on Reels */}
            {false && (
                <aside className="hidden lg:block w-80 shrink-0 sticky top-0 h-screen p-6 overflow-y-auto scrollbar-hide border-l border-white/10">
                    <div className="relative mb-8">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-full bg-surface border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    
                    <MiniLeaderboard />

                    <div className="mt-6 p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-white mb-2">Weekly Challenge</h3>
                        <p className="text-xs text-gray-400 mb-3">Solve 5 dynamic programming problems to win a badge!</p>
                        <button className="w-full py-2 bg-primary text-black text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors">
                            Join Now
                        </button>
                    </div>
                </aside>
            )}

            {/* Mobile Bottom Nav */}
            {!isReels && !location.pathname.startsWith('/chat') && !location.pathname.startsWith('/tutor') && (
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-white/10 p-4 flex justify-around z-40 pb-safe">
                    <NavLink to="/feed" className={({ isActive }) => `p-2 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                        <Home size={24} />
                    </NavLink>
                    <NavLink to="/forum" className={({ isActive }) => `p-2 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                        <MessageSquare size={24} />
                    </NavLink>
                    <div className="relative -top-12">
                        <NavLink to="/create" className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                            <PlusIcon />
                        </NavLink>
                    </div>
                    <NavLink to="/reels" className={({ isActive }) => `p-2 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                        <PlaySquare size={24} />
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `p-2 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                        <User size={24} />
                    </NavLink>
                </nav>
            )}

            <video ref={videoRef} className="hidden" muted playsInline />

            <div className="fixed bottom-24 left-4 md:bottom-6 md:right-6 md:left-auto z-50">
                <button
                    onClick={() => setGestureEnabled((prev) => !prev)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full border text-sm font-black shadow-lg transition-all ${gestureEnabled ? 'bg-primary text-black border-primary' : 'bg-surface text-white border-white/10'}`}
                >
                    <Hand size={16} />
                    {gestureEnabled ? 'Gesture Scroll On' : 'Gesture Scroll Off'}
                </button>
                <div className="mt-2 text-[10px] text-gray-500 uppercase tracking-widest text-center">
                    {gestureStatus === 'active' ? 'Camera live' : gestureStatus.replace('-', ' ')}
                </div>
            </div>
            <ToastHost />
        </div>
    );
}

const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);
