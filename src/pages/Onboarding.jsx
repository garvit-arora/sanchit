import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { ArrowRight, Check, Sparkles, Code, User as UserIcon, MapPin, Search, Brain, FileText } from 'lucide-react';
import SlotMachineLoader from '../components/SlotMachineLoader';
import UserAvatar from '../components/UserAvatar';
import { notify } from '../utils/notify';

const COLLEGES = [
    'IIT Delhi', 'NSUT', 'DTU', 'BITs Pilani', 'VIT', 'SRM', 'BPIT', 'MAIT', 'MSIT', 'BVCOE'
];

export default function Onboarding() {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [showSlotMachine, setShowSlotMachine] = useState(false);

    // Auto-redirect out if already onboarded (check for campus and skills as strictly required now)
    React.useEffect(() => {
        if (userProfile?.username && userProfile?.campus && userProfile?.skills?.length > 0 && !showSlotMachine) {
            navigate('/feed');
        }
    }, [userProfile, navigate, showSlotMachine]);

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState({
        displayName: userProfile?.displayName || currentUser?.displayName || '',
        username: userProfile?.username || '',
        role: userProfile?.role || 'Student',
        leetcodeUsername: userProfile?.leetcodeUsername || '',
        campus: userProfile?.campus || userProfile?.college || '',
        department: userProfile?.department || '',
        bio: userProfile?.bio || 'Just joined the Grid.',
        skills: userProfile?.skills?.join(', ') || ''
    });

    const updateData = (newData) => setData(prev => ({ ...prev, ...newData }));

    const handleNext = () => {
        if (step === 1) {
            if (!data.username) {
                notify("Please pick a unique handle (@)", "warning");
                return;
            }
            if (!data.displayName) {
                notify("Please enter your name.", "warning");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!data.skills.trim()) {
                notify("Please add at least one skill.", "warning");
                return;
            }
            setStep(3);
        }
    };

    const handleFinish = async () => {
        if (!data.campus) {
            notify("Please select your campus node.", "warning");
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.put('/auth/profile', {
                uid: currentUser.uid,
                ...data,
                skills: data.skills.split(',').map(s => s.trim()).filter(Boolean)
            });
            setShowSlotMachine(true);
        } catch (error) {
            console.error("Profile update failed:", error);
            notify("Failed to save profile. Please try again.", "error");
            setIsLoading(false);
        }
    };

    const handleSpinComplete = async () => {
        setIsLoading(true);
        try {
            await new Promise(r => setTimeout(r, 500));
            await refreshProfile();
            navigate('/feed');
        } catch (e) {
            console.error("Onboarding error:", e);
            notify("Error finishing setup.", "error");
            setShowSlotMachine(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (showSlotMachine) {
        return <SlotMachineLoader targetCollege={data.campus} onComplete={handleSpinComplete} />;
    }

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
                    <div className="flex justify-center mb-6">
                        <UserAvatar 
                            src={currentUser?.photoURL} 
                            name={currentUser?.displayName} 
                            size="xl" 
                            className="ring-4 ring-primary/20 shadow-2xl"
                        />
                    </div>
                    <h1 className="text-4xl font-display font-black text-white italic">The Grid awaits<span className="text-primary">.</span></h1>
                    <p className="text-gray-400 mt-2">Personalize your neural interface.</p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? 'w-8 bg-primary' : 'w-2 bg-white/10'}`} />
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="text-gray-400 text-sm font-bold ml-2 uppercase tracking-widest text-[10px]">Real Name</label>
                                <div className="mt-2 bg-surface border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                                    <UserIcon size={18} className="text-primary" />
                                    <input
                                        type="text"
                                        value={data.displayName}
                                        onChange={e => updateData({ displayName: e.target.value })}
                                        className="bg-transparent text-white outline-none w-full font-bold"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-gray-400 text-sm font-bold ml-2 uppercase tracking-widest text-[10px]">Neural Handle</label>
                                <div className="mt-2 bg-surface border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                                    <span className="text-primary font-black">@</span>
                                    <input
                                        type="text"
                                        value={data.username}
                                        onChange={e => updateData({ username: e.target.value })}
                                        className="bg-transparent text-white outline-none w-full font-bold"
                                        placeholder="username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-gray-400 text-sm font-bold ml-2 uppercase tracking-widest text-[10px]">Role</label>
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

                            <button
                                onClick={handleNext}
                                className="w-full mt-6 bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                            >
                                Continue <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="text-gray-400 text-sm font-bold ml-2 uppercase tracking-widest text-[10px]">Bio</label>
                                <div className="mt-2 bg-surface border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                                    <FileText size={18} className="text-primary mt-1" />
                                    <textarea
                                        value={data.bio}
                                        onChange={e => updateData({ bio: e.target.value })}
                                        className="bg-transparent text-white outline-none w-full font-bold min-h-[80px] resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-gray-400 text-sm font-bold ml-2 uppercase tracking-widest text-[10px]">Skills (Comma Separated)</label>
                                <div className="mt-2 bg-surface border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                                    <Brain size={18} className="text-primary" />
                                    <input
                                        type="text"
                                        value={data.skills}
                                        onChange={e => updateData({ skills: e.target.value })}
                                        className="bg-transparent text-white outline-none w-full font-bold"
                                        placeholder="React, Node.js, Python..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-gray-400 text-sm font-bold ml-2 uppercase tracking-widest text-[10px]">LeetCode (Optional)</label>
                                <div className="mt-2 bg-surface border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                                    <Code size={18} className="text-yellow-500" />
                                    <input
                                        type="text"
                                        value={data.leetcodeUsername}
                                        onChange={e => updateData({ leetcodeUsername: e.target.value })}
                                        className="bg-transparent text-white outline-none w-full font-bold"
                                        placeholder="leetcode_user"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full mt-6 bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                            >
                                Continue <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="text-gray-400 text-sm font-bold ml-2 uppercase tracking-widest text-[10px]">Department / Major</label>
                                <div className="mt-2 bg-surface border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                                    <Brain size={18} className="text-primary" />
                                    <input
                                        type="text"
                                        value={data.department}
                                        onChange={e => updateData({ department: e.target.value })}
                                        className="bg-transparent text-white outline-none w-full font-bold"
                                        placeholder="Computer Science, ECE..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-gray-400 text-sm font-bold ml-2 uppercase tracking-widest text-[10px]">Select Campus Node</label>
                                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto no-scrollbar pr-2">
                                    {COLLEGES.map(college => (
                                        <button
                                            key={college}
                                            onClick={() => updateData({ campus: college })}
                                            className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${data.campus === college ? 'bg-primary/20 border-primary text-white' : 'bg-surface border-white/5 text-gray-500'}`}
                                        >
                                            <span className="font-bold">{college}</span>
                                            {data.campus === college && <Check size={16} className="text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleFinish}
                                disabled={isLoading}
                                className="w-full mt-6 bg-primary text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                            >
                                {isLoading ? 'Initializing Node...' : 'Initialize Interface'} <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
