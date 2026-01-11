import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Check, Mail, Code, Sparkles, GraduationCap } from 'lucide-react';
import axios from 'axios';

const StepOne = ({ data, updateData, onNext }) => (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
        <h2 className="text-3xl font-display font-black text-white">Who are you?</h2>
        <div className="space-y-4">
            <div>
                <label className="text-gray-400 text-sm font-bold ml-2">Display Name</label>
                <input 
                    type="text" 
                    value={data.displayName} 
                    onChange={e => updateData({ displayName: e.target.value })}
                    className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary transition-colors"
                />
            </div>
            <div>
                <label className="text-gray-400 text-sm font-bold ml-2">Unique Handle (@)</label>
                <input 
                    type="text" 
                    value={data.username || ''} 
                    onChange={e => updateData({ username: e.target.value })}
                    placeholder="gautam_dev"
                    className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary transition-colors"
                />
            </div>
            <div>
                <label className="text-gray-400 text-sm font-bold ml-2">Role</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    {['Student', 'Alumni'].map(role => (
                        <button 
                            key={role}
                            onClick={() => updateData({ role })}
                            className={`p-4 rounded-xl border font-bold transition-all ${data.role === role ? 'bg-primary text-black border-primary' : 'bg-surface border-white/10 text-gray-400 hover:border-white/30'}`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="text-gray-400 text-sm font-bold ml-2">LeetCode Username</label>
                <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-xl p-4 mt-2">
                    <Code className="text-gray-500" size={20} />
                    <input 
                        type="text" 
                        value={data.leetcodeUsername} 
                        onChange={e => updateData({ leetcodeUsername: e.target.value })}
                        placeholder="leetcode_warrior"
                        className="bg-transparent text-white outline-none w-full"
                    />
                </div>
            </div>
        </div>
        <button onClick={onNext} className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform">
            Next <ArrowRight size={20} />
        </button>
    </motion.div>
);

const StepTwo = ({ data, updateData, onNext, isLoading }) => (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <GraduationCap className="text-blue-500" size={40} />
            </div>
            <h2 className="text-3xl font-display font-black text-white">Prove it.</h2>
            <p className="text-gray-400 mt-2">Enter your college email (.edu.in). We'll send a 6-digit code.</p>
        </div>

        <div className="bg-surface border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <Mail className="text-gray-500" />
            <input 
                type="email" 
                value={data.collegeEmail} 
                onChange={e => updateData({ collegeEmail: e.target.value })}
                placeholder="you@college.edu.in"
                className="bg-transparent text-white outline-none w-full"
            />
        </div>

        <button 
            onClick={onNext} 
            disabled={isLoading || !data.collegeEmail}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
            {isLoading ? 'Sending Code...' : 'Send OTP Code'}
        </button>
    </motion.div>
);

const StepThree = ({ data, updateData, onNext, onResend, isLoading }) => (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <Code className="text-green-500" size={40} />
            </div>
            <h2 className="text-3xl font-display font-black text-white">Check Inbox.</h2>
            <p className="text-gray-400 mt-2">Enter the code sent to <br/><span className="text-white font-bold">{data.collegeEmail}</span></p>
        </div>

        <input 
            type="text" 
            placeholder="000000"
            maxLength={6}
            value={data.otp || ''}
            onChange={e => updateData({ otp: e.target.value })}
            className="w-full bg-surface border border-white/10 rounded-xl p-4 text-center text-3xl font-mono text-white tracking-[0.5em] outline-none focus:border-primary"
        />

        <div className="space-y-3">
            <button 
                onClick={onNext} 
                disabled={isLoading || data.otp?.length !== 6} 
                className="w-full bg-green-500 text-black font-black py-4 rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
            >
                {isLoading ? 'Verifying...' : "Verify & Launch 🚀"}
            </button>
            <button onClick={onResend} className="w-full text-gray-500 text-sm font-bold hover:text-white transition-colors">
                Resend Code
            </button>
        </div>
    </motion.div>
);

export default function Onboarding() {
    const { currentUser } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState({
        displayName: currentUser?.displayName || '',
        username: '',
        role: 'Student',
        leetcodeUsername: '',
        collegeEmail: '',
        otp: ''
    });

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const updateData = (newData) => setData(prev => ({ ...prev, ...newData }));

    const handleSendOTP = async () => {
        if (!data.collegeEmail.endsWith('.edu.in')) {
            alert("Please use a valid .edu.in email");
            return;
        }
        setIsLoading(true);
        try {
             await axios.post(`${API_BASE}/auth/send-otp`, { collegeEmail: data.collegeEmail });
             setStep(3);
        } catch (e) {
            alert("Error sending code. Tip: Check server logs if it's taking too long.");
            setStep(3); // Moving anyway for dev testing if they check console
        }
        setIsLoading(false);
    };

    const handleVerifyOTP = async () => {
        setIsLoading(true);
        try {
            await axios.post(`${API_BASE}/auth/verify-otp`, { 
                email: data.collegeEmail, 
                otp: data.otp,
                uid: currentUser.uid 
            });

            await axios.put(`${API_BASE}/auth/profile`, {
                uid: currentUser.uid,
                displayName: data.displayName,
                username: data.username,
                role: data.role,
                leetcodeUsername: data.leetcodeUsername
            });

            window.location.href = '/feed';
        } catch (e) {
            alert("Invalid Code. Please try again.");
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
             <div className="absolute top-0 w-full h-1 bg-surface">
                 <motion.div animate={{ width: `${(step/3)*100}%` }} className="h-full bg-primary" />
             </div>

             <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative z-10">
                 <AnimatePresence mode="wait">
                    {step === 1 && <StepOne key="1" data={data} updateData={updateData} onNext={() => setStep(2)} />}
                    {step === 2 && <StepTwo key="2" data={data} updateData={updateData} onNext={handleSendOTP} isLoading={isLoading} />}
                    {step === 3 && <StepThree key="3" data={data} updateData={updateData} onNext={handleVerifyOTP} onResend={handleSendOTP} isLoading={isLoading} />}
                 </AnimatePresence>
             </div>
        </div>
    );
}
