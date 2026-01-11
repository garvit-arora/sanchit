import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Mail, CheckCircle, XCircle, Search, RefreshCw, Trash2, Edit } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
    const { userProfile, currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0, verified: 0, alumni: 0 });

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/users/admin/all`);
            setUsers(res.data);
            
            // Calculate Stats
            const v = res.data.filter(u => u.isVerified).length;
            const a = res.data.filter(u => u.role === 'Alumni').length;
            setStats({ total: res.data.length, verified: v, alumni: a });
        } catch (err) {
            console.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    // Filter users based on search
    const filteredUsers = users.filter(u => 
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.collegeEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pt-4 pb-20 max-w-7xl mx-auto px-4">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-display font-black text-white mb-2 flex items-center gap-4">
                        Control Room <Shield className="text-primary" size={32} />
                    </h1>
                    <p className="text-gray-400 text-xl font-medium">Manage the citizens of Localhost.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by name, email, or @handle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <button 
                        onClick={fetchAllUsers}
                        className="p-3 bg-surface border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all shadow-lg"
                    >
                        <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'Total Citizens', value: stats.total, color: 'text-primary' },
                    { label: 'Verified Students', value: stats.verified, color: 'text-green-500' },
                    { label: 'Alumni Network', value: stats.alumni, color: 'text-blue-500' },
                ].map((s, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="bg-surface border border-white/5 rounded-3xl p-6"
                    >
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">{s.label}</p>
                        <h3 className={`text-4xl font-black ${s.color}`}>{s.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Users Table */}
            <div className="bg-surface border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-6 text-gray-400 font-bold uppercase text-xs tracking-widest">User</th>
                                <th className="p-6 text-gray-400 font-bold uppercase text-xs tracking-widest">Handles</th>
                                <th className="p-6 text-gray-400 font-bold uppercase text-xs tracking-widest">Edu Email</th>
                                <th className="p-6 text-gray-400 font-bold uppercase text-xs tracking-widest">Status</th>
                                <th className="p-6 text-gray-400 font-bold uppercase text-xs tracking-widest">Role</th>
                                <th className="p-6 text-gray-400 font-bold uppercase text-xs tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((u, i) => (
                                <motion.tr 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={u._id} 
                                    className="hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}&background=0D8ABC&color=fff`} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/5" alt="" />
                                            <div>
                                                <p className="text-white font-black text-lg">{u.displayName}</p>
                                                <p className="text-gray-500 text-xs truncate max-w-[150px]">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="space-y-1">
                                            <p className="text-primary font-mono text-sm">@{u.username || 'unknown'}</p>
                                            <p className="text-gray-500 text-xs">LC: {u.leetcodeUsername || 'none'}</p>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Mail size={16} className="text-gray-500" />
                                            <span className="font-medium">{u.collegeEmail || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {(u.isVerified || u.verified) ? (
                                            <span className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-green-500/20">
                                                <CheckCircle size={14} /> Verified
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-gray-500 bg-white/5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-white/10">
                                                <XCircle size={14} /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-md ${
                                            u.role === 'Admin' ? 'bg-red-500/20 text-red-500 ring-1 ring-red-500/40' : 
                                            u.role === 'Alumni' ? 'bg-blue-500/20 text-blue-500 ring-1 ring-blue-500/40' :
                                            'bg-white/10 text-gray-300'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-red-500/20 rounded-xl text-gray-500 hover:text-red-500 transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-20 text-center">
                        <Users size={64} className="mx-auto text-gray-800 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No citizens found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
