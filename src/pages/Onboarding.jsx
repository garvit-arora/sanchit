import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Check, Sparkles, Code, User as UserIcon } from 'lucide-react';
import axios from 'axios';

export default function Onboarding() {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();

    // Auto-redirect out if already onboarded
    React.useEffect(() => {
        if (userProfile?.username) {
            navigate('/feed');
        }
    }, [userProfile, navigate]);

    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState({
        displayName: currentUser?.displayName || '',
        username: '',
        role: 'Student',
        leetcodeUsername: '',
        bio: 'Just joined the Grid.'
    });

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const updateData = (newData) => setData(prev => ({ ...prev, ...newData }));

    const handleFinish = async () => {
        if (!data.username) {
            alert("Please pick a unique handle (@)");
            return;
        }
        setIsLoading(true);
        try {
            // Save info and INSTANTLY VERIFY
            await axios.put(`${API_BASE}/auth/profile`, {
                uid: currentUser.uid,
                displayName: data.displayName,
                username: data.username,
                role: data.role,
                leetcodeUsername: data.leetcodeUsername,
                bio: data.bio,
                isVerified: true, // Instant pass
                verified: true    // Instant pass
            });

            await refreshProfile();
            window.location.href = '/feed';
        } catch (e) {
            console.error(e);
            alert("Error finishing setup. Try a different username?");
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
             {/* Background Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

             <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] relative z-10 shadow-2xl"
             >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <Sparkles className="text-primary" size={40} />
                    </div>
                    <h1 className="text-4xl font-display font-black text-white italic">Welcome to the Grid.</h1>
                    <p className="text-gray-400 mt-2">Personalize your avatar below.</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-gray-400 text-sm font-bold ml-2">Display Name</label>
                        <div className="mt-2 bg-surface border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                            <UserIcon className="text-gray-500" size={20} />
                            <input 
                                type="text" 
                                value={data.displayName} 
                                onChange={e => updateData({ displayName: e.target.value })}
                                className="bg-transparent text-white outline-none w-full font-medium"
                                placeholder="Your Name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-400 text-sm font-bold ml-2">Unique Handle (@)</label>
                        <div className="mt-2 bg-surface border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                            <span className="text-primary font-bold">@</span>
                            <input 
                                type="text" 
                                value={data.username} 
                                onChange={e => updateData({ username: e.target.value })}
                                className="bg-transparent text-white outline-none w-full font-medium"
                                placeholder="username"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-400 text-sm font-bold ml-2">Who are you?</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {['Student', 'Alumni'].map(role => (
                                <button 
                                    key={role}
                                    onClick={() => updateData({ role })}
                                    className={`p-4 rounded-2xl border font-black transition-all ${data.role === role ? 'bg-primary text-black border-primary' : 'bg-surface border-white/10 text-gray-400 hover:border-white/30'}`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-400 text-sm font-bold ml-2">LeetCode Username</label>
                        <div className="mt-2 bg-surface border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                            <Code className="text-gray-500" size={20} />
                            <input 
                                type="text" 
                                value={data.leetcodeUsername} 
                                onChange={e => updateData({ leetcodeUsername: e.target.value })}
                                className="bg-transparent text-white outline-none w-full font-medium"
                                placeholder="Optional"
                            />
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleFinish} 
                    disabled={isLoading}
                    className="w-full mt-10 bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                >
                    {isLoading ? 'Entering the Grid...' : 'Launch App 🚀'}
                </button>
             </motion.div>
        </div>
    );
}
