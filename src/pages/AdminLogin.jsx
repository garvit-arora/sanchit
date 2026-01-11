import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowRight, Zap } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Hardcoded as requested by user
        if (email === 'garvit.university@gmail.com' && password === 'garvit123') {
            localStorage.setItem('admin_token', 'grid_master_access_granted');
            window.location.href = '/admin';
        } else {
            setError('Invalid credentials. Access denied.');
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-surface/50 border border-white/10 p-10 rounded-[32px] backdrop-blur-xl shadow-2xl"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                        <Shield className="text-red-500" size={32} />
                    </div>
                </div>

                <h1 className="text-3xl font-display font-black text-center text-white mb-2 italic">Control Room Login</h1>
                <p className="text-gray-500 text-center mb-10 font-medium">Restricted Access • Authorized Persons Only</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-widest ml-1">Email Identifier</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 mt-2 text-white outline-none focus:border-red-500 transition-colors"
                            placeholder="garvit.university@gmail.com"
                        />
                    </div>

                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-widest ml-1">Security Key</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 mt-2 text-white outline-none focus:border-red-500 transition-colors tracking-widest"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20 italic">
                            {error}
                        </p>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-red-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                    >
                        INITIALIZE ACCESS <ArrowRight size={20} />
                    </button>
                </form>
            </motion.div>

            <div className="mt-8 flex items-center gap-2 text-gray-700 font-mono text-xs uppercase tracking-[0.2em]">
                <Zap size={14} /> Localhost Security Protocol V2
            </div>
        </div>
    );
}
