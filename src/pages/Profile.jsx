import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Link as LinkIcon, Calendar, Edit3, Award, Code, Terminal, LogOut, ShieldCheck, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import EditProfileModal from '../components/EditProfileModal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { fetchUserPosts } from '../services/api';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-surface border border-white/5 p-4 rounded-2xl flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-black`}>
            <Icon size={24} />
        </div>
        <div>
            <h3 className="text-xl font-black text-white truncate max-w-[150px]">{value}</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</p>
        </div>
    </div>
);

const Badge = ({ label, emoji }) => (
    <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-white/10 transition-colors cursor-default">
        <span>{emoji}</span>
        <span>{label}</span>
    </div>
);

export default function Profile() {
    const { currentUser, userProfile, logout } = useAuth(); // using mongo profile
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Fetch My Posts
    const { data: myPosts } = useQuery({
        queryKey: ['my-posts', currentUser?.uid],
        queryFn: () => fetchUserPosts(currentUser?.uid)
    });

    // Fetch LeetCode Stats
    const { data: leetcodeStats } = useQuery({
        queryKey: ['leetcode-stats', userProfile?.leetcodeUsername],
        queryFn: async () => {
            if (!userProfile?.leetcodeUsername) return null;
            const res = await axios.get(`https://leetcode-stats-api.herokuapp.com/${userProfile.leetcodeUsername}`);
            return res.data;
        },
        enabled: !!userProfile?.leetcodeUsername
    });

    const handleUpdateProfile = async (newData) => {
        try {
            await axios.put('http://localhost:8080/api/auth/profile', {
                uid: currentUser.uid,
                ...newData
            });
            // Ideally re-fetch profile here or update context
            window.location.reload(); // Quick refresh to show changes
        } catch (e) {
            alert("Update Failed");
        }
    };

    if (!userProfile) return <div className="p-20 text-center text-gray-500">Loading Profile...</div>;

    return (
        <div className="pb-20">
            <EditProfileModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                user={userProfile}
                onSave={handleUpdateProfile}
            />

            {/* Banner */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-primary via-secondary to-blue-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="max-w-4xl mx-auto px-4 relative -mt-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-end gap-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-black p-1.5 ring-4 ring-transparent bg-gradient-to-tr from-primary to-secondary"
                        >
                            <img
                                src={currentUser?.photoURL}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover border-4 border-black"
                            />
                        </motion.div>
                        <div className="mb-2">
                            <h1 className="text-3xl md:text-4xl font-display font-black text-white flex items-center gap-2">
                                {userProfile.displayName || currentUser.displayName}
                                {userProfile.isVerified && <Award className="text-blue-500 fill-blue-500/20" size={24} />}
                            </h1>
                            <p className="text-gray-400 font-medium text-lg">
                                {userProfile.role} • {userProfile.collegeEmail || 'Unverified'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {!userProfile.isVerified && (
                            <Link to="/verify-edu" className="bg-primary text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                                <Award size={18} /> Verify EDU
                            </Link>
                        )}
                        <button
                            onClick={() => setIsEditOpen(true)}
                            className="bg-surface border border-white/10 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-white/5 transition-colors"
                        >
                            <Edit3 size={18} /> Edit
                        </button>
                        <button
                            onClick={logout}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2.5 rounded-xl font-bold hover:bg-red-500/20 transition-colors"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* Bio & Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {!userProfile.isVerified && (
                        <div className="md:col-span-3 bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-primary" size={24} />
                                <div>
                                    <p className="text-white font-bold text-sm">Action Required: Verify academic identity</p>
                                    <p className="text-gray-400 text-xs">Unlock exclusive forum threads and elite opportunities by verifying your .edu email.</p>
                                </div>
                            </div>
                            <Link to="/verify-edu" className="text-primary font-black text-xs uppercase tracking-widest hover:underline">
                                Start Now &rarr;
                            </Link>
                        </div>
                    )}
                    <div className="md:col-span-2 space-y-6">
                        <p className="text-gray-300 text-lg leading-relaxed">
                            {userProfile.bio}
                        </p>

                        <div className="flex flex-wrap gap-4 text-gray-500 text-sm font-medium">
                            <div className="flex items-center gap-1"><MapPin size={16} /> Campus</div>
                            <div className="flex items-center gap-1"><Calendar size={16} /> Joined 2026</div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {userProfile.skills?.map(skill => <Badge key={skill} label={skill} emoji="⚡" />)}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <StatCard
                            label="LeetCode"
                            value={userProfile.leetcodeUsername || 'N/A'}
                            icon={Code}
                            color="bg-orange-500"
                        />
                        {leetcodeStats?.ranking && (
                            <StatCard
                                label="Global Rank"
                                value={`#${leetcodeStats.ranking.toLocaleString()}`}
                                icon={Trophy}
                                color="bg-yellow-500"
                            />
                        )}
                        <StatCard
                            label="Reputation"
                            value={userProfile.reputation || 0}
                            icon={Terminal}
                            color="bg-purple-500"
                        />
                    </div>
                </div>

                {/* REAL USER POSTS */}
                <div className="border-t border-white/10 pt-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myPosts?.map(post => (
                            <div key={post._id} className="bg-surface border border-white/5 rounded-xl p-4 hover:border-white/20 transition-colors">
                                <p className="text-white line-clamp-3 mb-2">{post.content}</p>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    <span>{post.likes.length} 🔥</span>
                                </div>
                            </div>
                        ))}
                        {myPosts?.length === 0 && <p className="text-gray-500">No posts yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
