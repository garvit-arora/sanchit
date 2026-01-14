import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Sparkles, Zap } from 'lucide-react';

export default function PremiumModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-premium', handleOpen);
        return () => window.removeEventListener('open-premium', handleOpen);
    }, []);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-surface border border-yellow-500/30 rounded-3xl w-full max-w-md overflow-hidden relative shadow-[0_0_50px_rgba(234,179,8,0.2)]"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 text-black text-center relative overflow-hidden">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 bg-black/10 p-2 rounded-full hover:bg-black/20 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <Sparkles className="mx-auto mb-4" size={48} />
                        <h2 className="text-3xl font-display font-black uppercase tracking-tighter">Sanchit Premium</h2>
                        <p className="font-bold opacity-80 mt-2">Level up your coding career.</p>
                    </div>

                    <div className="p-8">
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="bg-green-500/20 p-1 rounded-full text-green-500"><Check size={16} /></div>
                                <span className="font-medium">Exclusive "Pro Coder" Badge</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="bg-green-500/20 p-1 rounded-full text-green-500"><Check size={16} /></div>
                                <span className="font-medium">Apply to Premium Gigs First</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="bg-green-500/20 p-1 rounded-full text-green-500"><Check size={16} /></div>
                                <span className="font-medium">Custom User Profile Themes</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="bg-green-500/20 p-1 rounded-full text-green-500"><Check size={16} /></div>
                                <span className="font-medium">Direct DM Access to Recruiters</span>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <span className="text-4xl font-black text-white">₹90</span>
                            <span className="text-gray-500 font-bold"> / month</span>
                            <p className="text-xs text-secondary mt-2 font-bold animate-pulse">LIMITED TIME LAUNCH OFFER</p>
                        </div>

                        <button
                            onClick={() => alert("Payment Gateway Integration Coming Soon!")}
                            className="w-full bg-primary text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                        >
                            <Zap size={20} fill="currentColor" /> Subscribe Now
                        </button>

                        <p className="text-center text-xs text-gray-600 mt-4 font-medium">
                            Cancel anytime. Secure payment handled by Razorpay.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
