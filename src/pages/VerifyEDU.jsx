import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestEduVerification, verifyOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, ShieldCheck, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VerifyEDU() {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRequest = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.toLowerCase().endsWith('.edu')) {
            setError('Please enter a valid institution email ending in .edu');
            return;
        }

        setIsLoading(true);
        try {
            await requestEduVerification(currentUser.uid, email);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send verification email');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await verifyOtp(currentUser.uid, otp);
            await refreshProfile();
            setStep(3); // Success
            setTimeout(() => navigate('/feed'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative z-10"
            >
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                    <ShieldCheck className="text-primary" size={32} />
                                </div>
                                <h1 className="text-3xl font-display font-black text-white italic">Identity Check.</h1>
                                <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                                    To access high-level opportunities and elite forum threads, verify your academic status.
                                </p>
                            </div>

                            <form onSubmit={handleRequest} className="space-y-4">
                                <div className="bg-surface/50 border border-white/10 rounded-2xl p-4 flex items-center gap-3 focus-within:border-primary/50 transition-all">
                                    <Mail className="text-gray-500" size={20} />
                                    <input
                                        type="email"
                                        placeholder="college-email@university.edu"
                                        className="bg-transparent text-white outline-none w-full font-medium"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && <p className="text-red-400 text-xs font-bold pl-2">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>Send Code <ArrowRight size={20} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                    <Sparkles className="text-primary" size={32} />
                                </div>
                                <h1 className="text-3xl font-display font-black text-white italic">Check your Inbox.</h1>
                                <p className="text-gray-400 mt-2 text-sm">
                                    We sent a unique code to <span className="text-white font-bold">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-4">
                                <div className="bg-surface/50 border border-white/10 rounded-2xl p-4 text-center focus-within:border-primary/50 transition-all">
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        maxLength={6}
                                        className="bg-transparent text-white outline-none w-full font-display font-black text-4xl text-center tracking-[12px] placeholder:tracking-normal placeholder:text-gray-700"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        required
                                    />
                                </div>

                                {error && <p className="text-red-400 text-xs font-bold pl-2">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Status'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-gray-500 text-sm font-bold mt-2 hover:text-white transition-colors"
                                >
                                    Use different email
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-10"
                        >
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                                <CheckCircle2 className="text-green-500" size={48} />
                            </div>
                            <h1 className="text-4xl font-display font-black text-white italic">Verified.</h1>
                            <p className="text-gray-400 mt-4 leading-relaxed px-4">
                                Identity confirmed. You now have unrestricted access to the Sanchit ecosystem.
                            </p>
                            <p className="text-primary font-bold mt-8 animate-pulse text-sm">REDIRECTING...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
