import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Globe, Terminal, UserCheck, Flame } from 'lucide-react';

const GlitchText = ({ text }) => {
    return (
        <div className="relative inline-block font-black text-4xl sm:text-6xl md:text-9xl tracking-tighter text-white mb-6">
            <span className="relative z-10">{text}</span>
            <span className="absolute top-0 left-0 -z-10 text-primary opacity-70 animate-pulse translate-x-1">{text}</span>
            <span className="absolute top-0 left-0 -z-10 text-secondary opacity-70 animate-bounce translate-x-[-2px]">{text}</span>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <motion.div 
        whileHover={{ y: -10 }}
        className="bg-surface border border-white/5 p-8 rounded-3xl relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon size={48} className="text-white/5 rotate-12" />
        </div>
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-primary">
            <Icon size={32} />
        </div>
        <h3 className="text-2xl font-display font-black text-white mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
    </motion.div>
);

const Step = ({ num, title, desc }) => (
    <div className="flex flex-col md:flex-row items-center gap-8 mb-12 last:mb-0">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-4xl text-black shrink-0 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            {num}
        </div>
        <div>
            <h3 className="text-3xl font-display font-black text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-xl">{desc}</p>
        </div>
    </div>
);

export default function Landing() {
    const navigate = useNavigate();
    const [studentsOnline, setStudentsOnline] = useState(1420);

    useEffect(() => {
        const interval = setInterval(() => {
            setStudentsOnline(prev => prev + Math.floor(Math.random() * 5) - 2);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
            <div className="fixed bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />

            {/* Navbar */}
            <nav className="p-6 md:px-12 flex justify-between items-center z-50 sticky top-0 bg-background/80 backdrop-blur-md border-b border-white/5">
                <h1 className="text-2xl font-bold font-display text-white">San<span className="text-primary">chit</span>.</h1>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 border border-white/20 rounded-full text-white font-bold hover:bg-white/10 transition-all font-display"
                >
                    Log In
                </button>
            </nav>

            {/* Hero Section */}
            <header className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative z-10 pt-20 pb-32">
                <div className="mb-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-white/10">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                    </span>
                    <span className="text-sm font-bold text-gray-400 font-mono">{studentsOnline} students online now</span>
                </div>

                <GlitchText text="YOUR CAMPUS" />
                <GlitchText text="IS ONLINE." />

                <p className="max-w-2xl text-gray-400 text-xl md:text-2xl mt-8 font-medium leading-relaxed">
                    The exclusive digital playground for engineers. <br/>
                    <span className="text-white">Connect. Compete. Flex.</span>
                </p>

                <div className="flex flex-col md:flex-row gap-4 mt-12">
                     <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/login')}
                        className="bg-white text-black text-xl font-black px-10 py-5 rounded-full flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all"
                    >
                        JOIN THE CULT <Zap className="fill-black" />
                    </motion.button>
                     <button className="px-10 py-5 rounded-full border border-white/20 text-white font-bold hover:bg-white/5 transition-colors">
                        View Demo
                    </button>
                </div>
            </header>

            {/* Marquee */}
            <div className="py-6 bg-primary overflow-hidden whitespace-nowrap -rotate-1 mb-20 origin-left">
                <motion.div 
                    animate={{ x: [0, -1000] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="flex gap-8 text-black font-black text-4xl md:text-6xl"
                >
                    {[...Array(10)].map((_, i) => (
                        <span key={i}>DON'T BE A NPC • TOUCH GRASS LATER • SHIPPED BY ENGINEERS •</span>
                    ))}
                </motion.div>
            </div>

            {/* Features Grid */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-4">Why Sanchit?</h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Traditional college apps are boring. We built the OS for your campus life that you actually want to use.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={Shield} 
                        title="Community Only" 
                        desc="No bots. No randoms. Join the exclusive network of engineers and coders." 
                    />
                    <FeatureCard 
                        icon={Globe} 
                        title="Global Rankings" 
                        desc="Sync your LeetCode & GitHub. Compete on the leaderboard against students from IITs, NITs, and IIITs." 
                    />
                    <FeatureCard 
                        icon={Terminal} 
                        title="Anonymous Rant" 
                        desc="Need to vent about the cafeteria food or that one professor? Go anonymous. We won't spill." 
                    />
                </div>
            </section>

             {/* How it Works */}
            <section className="bg-surface border-y border-white/5 py-20 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                             <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-12">How to Enter the System</h2>
                             <Step num="01" title="Sign Up" desc="Login with Google. Fast, secure, and easy." />
                             <Step num="02" title="Claim Profile" desc="Set your alias. Sync your coding stats. Start climbing." />
                             <Step num="03" title="Start Coding" desc="Connect with peers and skip the boring stuff." />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-[100px] opacity-20" />
                            <div className="bg-black border border-white/10 rounded-3xl p-6 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500" />
                                    <div>
                                        <div className="h-3 w-32 bg-white/20 rounded mb-2" />
                                        <div className="h-2 w-20 bg-white/10 rounded" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-24 w-full bg-white/10 rounded-xl" />
                                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 text-center px-4">
                 <h2 className="text-5xl md:text-8xl font-display font-black text-white mb-8">Ready to Plug In?</h2>
                 <button 
                    onClick={() => navigate('/login')}
                    className="bg-primary text-black text-2xl font-black px-12 py-6 rounded-full hover:scale-110 hover:rotate-2 transition-all shadow-[0_0_50px_rgba(234,179,8,0.5)]"
                >
                    LAUNCH APP
                 </button>
            </section>
        </div>
    );
}
