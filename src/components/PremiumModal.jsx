import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Zap, Shield, Rocket, Brain, MessageCircle, Star } from 'lucide-react';

export default function PremiumModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-premium', handleOpen);
        return () => window.removeEventListener('open-premium', handleOpen);
    }, []);

    if (!isOpen) return null;

    const premiumFeatures = [
        { icon: <Brain size={16} />, text: "RunAnywhere AI Co-pilot" },
        { icon: <MessageCircle size={16} />, text: "AI Council Access" },
        { icon: <Star size={16} />, text: "Alumni Direct Access" },
        { icon: <Rocket size={16} />, text: "1:1 Mentorship" },
        { icon: <Shield size={16} />, text: "Verified Pro Badge" },
        { icon: <Zap size={16} />, text: "Priority Gig Placement" },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop with extreme blur and dark tint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] w-full max-w-2xl max-h-[95vh] overflow-hidden relative shadow-[0_0_80px_rgba(234,179,8,0.1)] flex flex-col md:flex-row"
                >
                    {/* Compact Hero Side */}
                    <div className="w-full md:w-5/12 bg-gradient-to-br from-primary via-orange-500 to-primary p-6 md:p-8 flex flex-col justify-center items-center text-black relative shrink-0">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-spin-slow bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:30px_30px]" />
                        </div>

                        <Sparkles size={40} md:size={50} strokeWidth={2.5} className="animate-pulse" />

                        <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tighter text-center mt-3 leading-none">
                            Vibe<br />Pro
                        </h2>

                        <div className="mt-3 bg-black/10 backdrop-blur-md px-3 py-1 rounded-full border border-black/5 text-[8px] font-black tracking-widest uppercase">
                            Early Access
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="md:hidden absolute top-4 right-4 bg-black/10 p-1.5 rounded-full"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Compact Features Side */}
                    <div className="w-full md:w-7/12 p-5 md:p-8 relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hidden md:block absolute top-4 right-4 text-gray-600 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-white text-lg md:text-xl font-black tracking-tight leading-none">Elevate Your Vibe</h3>
                                <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1.5 bg-white/5 inline-block px-2 py-0.5 rounded border border-white/5">
                                    P2P DM: Always Free ⚡
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {premiumFeatures.map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-3 bg-white/5 border border-white/10 rounded-xl group hover:border-primary/50 transition-all flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all shrink-0">
                                            {React.cloneElement(feature.icon, { size: 14 })}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-white text-[11px] font-black tracking-tight leading-tight uppercase group-hover:text-primary transition-colors">{feature.text}</h4>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-white">₹99</span>
                                            <span className="text-[10px] font-bold text-gray-600 line-through">₹499</span>
                                        </div>
                                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Lifetime Access</p>
                                    </div>
                                    <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded border border-primary/20">
                                        80% OFF
                                    </span>
                                </div>

                                <button
                                    onClick={() => alert("Payment Gateway Integration Coming Soon!")}
                                    className="w-full bg-primary text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-primary/10 group text-[11px]"
                                >
                                    ACTIVATE PRO <Rocket size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>

                                <p className="text-center text-[7px] text-gray-600 mt-2 font-black uppercase tracking-[0.2em]">
                                    Unlimited AI • Secure Transmissions
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
