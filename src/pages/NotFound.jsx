import React from 'react';
import { motion } from 'framer-motion';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
            {/* Glitchy Background Effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-[120px] animate-bounce" />
            </div>

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative z-10"
            >
                <div className="relative inline-block">
                    <Ghost size={120} className="text-white mb-8 animate-bounce" />
                    <motion.div 
                        animate={{ 
                            opacity: [0, 1, 0, 1, 0],
                            x: [-2, 2, -2, 2, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-4 -right-4 text-primary font-black text-64px"
                    >
                        ?
                    </motion.div>
                </div>

                <h1 className="text-8xl font-black text-white mb-4 tracking-tighter">
                    404<span className="text-primary">.</span>
                </h1>
                
                <h2 className="text-2xl font-bold text-gray-400 mb-8 max-w-md mx-auto">
                   Whoops! You've wandered into the <span className="text-white">Void</span>. 
                   Even the packets are lost here.
                </h2>

                <div className="bg-surface border border-white/10 p-4 rounded-2xl mb-12 max-w-xs mx-auto">
                    <p className="text-sm font-mono text-primary italic">
                        "I used to be a web page, but then I took an arrow to the router."
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                    >
                        <ArrowLeft size={20} /> Go Back
                    </button>
                    <button 
                        onClick={() => navigate('/feed')}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-black rounded-2xl font-bold hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                    >
                        <Home size={20} /> Exit the Void
                    </button>
                </div>
            </motion.div>

            {/* Matrix-like floating numbers in background */}
            <div className="absolute bottom-10 left-10 text-white/5 font-mono text-xs hidden md:block">
                ERR_PAGE_NOT_FOUND_IN_THE_GRID<br/>
                LOCATION: SECTOR_7G<br/>
                STATUS: DISCONNECTED
            </div>
        </div>
    );
}
