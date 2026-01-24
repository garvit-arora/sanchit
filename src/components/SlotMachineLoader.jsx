import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLLEGES = [
    { name: 'IIT Delhi', logo: '🏛️' },
    { name: 'NSUT', logo: '🏫' },
    { name: 'DTU', logo: '🏢' },
    { name: 'BITs Pilani', logo: '🎓' },
    { name: 'VIT', logo: '📚' },
    { name: 'SRM', logo: '📜' },
    { name: 'BPIT', logo: '🏗️' },
    { name: 'MAIT', logo: '🧪' },
    { name: 'MSIT', logo: '💻' },
    { name: 'BVCOE', logo: '🔧' }
];

export default function SlotMachineLoader({ onComplete, targetCollege }) {
    const [spinning, setSpinning] = useState(true);
    const [visibleLogoIndex, setVisibleLogoIndex] = useState(0);

    useEffect(() => {
        let interval;
        if (spinning) {
            let speed = 50;
            interval = setInterval(() => {
                setVisibleLogoIndex(prev => (prev + 1) % COLLEGES.length);
            }, speed);
        }

        const timer = setTimeout(() => {
            setSpinning(false);
            clearInterval(interval);
            // Find target college index or default to 0
            const targetIndex = COLLEGES.findIndex(c => c.name.toLowerCase().includes(targetCollege?.toLowerCase())) || 0;
            setVisibleLogoIndex(targetIndex === -1 ? 0 : targetIndex);

            setTimeout(() => {
                onComplete();
            }, 1000);
        }, 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [spinning, onComplete, targetCollege]);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />

            <div className="relative z-10 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8"
                >
                    <h2 className="text-gray-500 font-black uppercase tracking-[0.3em] text-sm mb-4 italic">Calculating Campus Node</h2>
                    <h1 className="text-6xl font-display font-black text-white italic tracking-tighter">Synchronizing<span className="text-primary">.</span></h1>
                </motion.div>

                {/* Slot Machine Container */}
                <div className="h-64 w-80 bg-white/5 border-t-8 border-b-8 border-white/10 rounded-[40px] relative overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-20" />
                    <div className="absolute left-0 right-0 h-1 bg-primary/20 top-1/2 -translate-y-1/2 z-10" />

                    <div className="relative z-30 flex flex-col items-center justify-center h-full w-full">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={visibleLogoIndex}
                                initial={{ y: spinning ? 50 : 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: spinning ? -50 : -20, opacity: 0 }}
                                transition={{ duration: spinning ? 0.05 : 0.5, ease: "easeInOut" }}
                                className="flex flex-col items-center"
                            >
                                <span className="text-8xl mb-4 filter drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                                    {COLLEGES[visibleLogoIndex].logo}
                                </span>
                                <TextTransition text={COLLEGES[visibleLogoIndex].name} spinning={spinning} />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Side decorative lines */}
                    <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-white/5" />
                    <div className="absolute right-6 top-0 bottom-0 w-[1px] bg-white/5" />
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 flex items-center justify-center gap-4"
                >
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                    <span className="text-primary font-black uppercase tracking-widest text-xs">Neural Sync in Progress</span>
                </motion.div>
            </div>
        </div>
    );
}

function TextTransition({ text, spinning }) {
    return (
        <div className="h-8 overflow-hidden">
            <motion.p
                className={`text-2xl font-black italic tracking-tighter ${spinning ? 'text-gray-500' : 'text-primary'}`}
            >
                {text}
            </motion.p>
        </div>
    );
}
