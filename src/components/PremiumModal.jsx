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
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {/* Free Plan */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 opacity-50">
                                <h3 className="text-lg font-black text-white mb-2">Basic</h3>
                                <p className="text-2xl font-bold text-gray-400 mb-4">₹0</p>
                                <ul className="space-y-2 text-xs text-gray-400">
                                    <li className="flex gap-2"><Check size={12} /> Public Forum</li>
                                    <li className="flex gap-2"><Check size={12} /> Apply to Gigs</li>
                                    <li className="flex gap-2"><Check size={12} /> View Reels</li>
                                </ul>
                            </div>

                            {/* Premium Plan */}
                            <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-bl-lg">POPULAR</div>
                                <h3 className="text-lg font-black text-white mb-2">Pro</h3>
                                <p className="text-2xl font-bold text-yellow-400 mb-4">₹90</p>
                                <ul className="space-y-2 text-xs text-gray-200">
                                    <li className="flex gap-2"><Check size={12} className="text-yellow-400" /> <b>Pro Badge</b></li>
                                    <li className="flex gap-2"><Check size={12} className="text-yellow-400" /> <b>Priority Applications</b></li>
                                    <li className="flex gap-2"><Check size={12} className="text-yellow-400" /> Custom Themes</li>
                                    <li className="flex gap-2"><Check size={12} className="text-yellow-400" /> Direct DMs</li>
                                </ul>
                            </div>
                        </div>

                        <div className="text-center mb-6">
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
