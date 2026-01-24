import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Check, Sparkles, Code, User as UserIcon, MapPin, Search } from 'lucide-react';
import SlotMachineLoader from '../components/SlotMachineLoader';

const COLLEGES = [
    'IIT Delhi', 'NSUT', 'DTU', 'BITs Pilani', 'VIT', 'SRM', 'BPIT', 'MAIT', 'MSIT', 'BVCOE'
];

export default function Onboarding() {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();

    // Auto-redirect out if already onboarded
    React.useEffect(() => {
        if (userProfile?.username && !showSlotMachine) {
            navigate('/feed');
        }
    }, [userProfile, navigate]);

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showSlotMachine, setShowSlotMachine] = useState(false);
    const [data, setData] = useState({
        displayName: currentUser?.displayName || '',
        username: '',
        role: 'Student',
        leetcodeUsername: '',
        campus: '',
        bio: 'Just joined the Grid.'
    });

    const updateData = (newData) => setData(prev => ({ ...prev, ...newData }));

    const handleNext = () => {
        if (step === 1 && !data.username) {
            alert("Please pick a unique handle (@)");
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleFinish = async () => {
        if (!data.campus) {
            alert("Please select your campus node.");
            return;
        }
        setShowSlotMachine(true);
    };

    const handleSpinComplete = async () => {
        setIsLoading(true);
        try {
            await new Promise(r => setTimeout(r, 500));
            await refreshProfile();
            navigate('/feed');
        } catch (e) {
            console.error("Onboarding error:", e);
            alert("Error finishing setup.");
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
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <Sparkles className="text-primary" size={40} />
                    </div>
                    <h1 className="text-4xl font-display font-black text-white italic">The Grid awaits<span className="text-primary">.</span></h1>
                    <p className="text-gray-400 mt-2">Personalize your neural interface.</p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
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
                                Next Step <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                        >
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
                                <div className="mt-4 bg-surface border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                                    <Search className="text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={data.campus}
                                        onChange={e => updateData({ campus: e.target.value })}
                                        className="bg-transparent text-white outline-none w-full font-bold text-sm"
                                        placeholder="Or type custom campus..."
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleFinish}
                                className="w-full mt-6 bg-primary text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                Launch Synchronization 🚀
                            </button>
                            <button onClick={() => setStep(1)} className="w-full text-gray-600 font-bold text-xs uppercase tracking-widest mt-2">Back</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
