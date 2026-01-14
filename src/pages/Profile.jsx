import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Link as LinkIcon, Calendar, Edit3, Award, Code, Terminal, LogOut, ShieldCheck, Trophy, MessageSquare, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import EditProfileModal from '../components/EditProfileModal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { fetchUserPosts, fetchUserReels, fetchUserThreads, deleteForumThread } from '../services/api';
import UserAvatar from '../components/UserAvatar';
import { Play } from 'lucide-react';

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
    const { currentUser, userProfile, logout, refreshProfile } = useAuth();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    const [selectedPost, setSelectedPost] = useState(null);

    // Fetch My Posts
    const { data: myPosts } = useQuery({
        queryKey: ['my-posts', currentUser?.uid],
        queryFn: () => fetchUserPosts(currentUser?.uid),
        enabled: !!currentUser?.uid
    });

    // Fetch My Reels
    const { data: myReels } = useQuery({
        queryKey: ['my-reels', currentUser?.uid],
        queryFn: () => fetchUserReels(currentUser?.uid),
        enabled: !!currentUser?.uid
    });

    // Fetch My Threads
    const { data: myThreads } = useQuery({
        queryKey: ['my-threads', currentUser?.uid],
        queryFn: () => fetchUserThreads(currentUser?.uid),
        enabled: !!currentUser?.uid
    });

    // Fetch LeetCode Stats
    const { data: leetcodeStats } = useQuery({
        queryKey: ['leetcode-stats', userProfile?.leetcodeUsername],
        queryFn: async () => {
            if (!userProfile?.leetcodeUsername) return null;
            // Using a more reliable open-source API proxy
            const res = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${userProfile.leetcodeUsername}`);
            return res.data;
        },
        enabled: !!userProfile?.leetcodeUsername,
        retry: 1
    });

    const handleUpdateProfile = async (newData) => {
        try {
            if (!currentUser) {
                alert("Please login first");
                return;
            }
            const token = await currentUser.getIdToken();
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.put(`${API_BASE}/auth/profile`, {
                uid: currentUser.uid,
                ...newData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh profile in context
            if (refreshProfile) {
                await refreshProfile();
            }
            window.location.reload(); // Quick refresh to show changes
        } catch (e) {
            console.error("Profile update error:", e);
            alert(e.response?.data?.error || "Update Failed");
        }
    };

    const handleDeleteThread = async (threadId) => {
        if (window.confirm("Are you sure you want to delete this thread?")) {
            try {
                await deleteForumThread(threadId);
                window.location.reload();
            } catch (err) {
                alert("Failed to delete thread");
            }
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
                        <UserAvatar
                            src={currentUser?.photoURL}
                            name={userProfile.displayName || currentUser.displayName}
                            size="xl"
                            className="border-4 border-black ring-4 ring-primary/20 shadow-2xl"
                        />
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
                            <div className="flex items-center gap-1"><MapPin size={16} /> {userProfile.campus || 'Grid Campus'}</div>
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

                {/* Tabs */}
                <div className="flex gap-8 border-b border-white/10 mb-8">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'posts' ? 'text-primary' : 'text-gray-500'}`}
                    >
                        Activity
                        {activeTab === 'posts' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('reels')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'reels' ? 'text-primary' : 'text-gray-500'}`}
                    >
                        Reels
                        {activeTab === 'reels' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('threads')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'threads' ? 'text-primary' : 'text-gray-500'}`}
                    >
                        Threads
                        {activeTab === 'threads' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    </button>
                </div>

                {activeTab === 'posts' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myPosts?.map(post => (
                            <div
                                key={post._id}
                                onClick={() => setSelectedPost(post)}
                                className="bg-surface border border-white/5 rounded-xl p-4 hover:border-primary/50 hover:bg-white/[0.02] transition-all group cursor-pointer"
                            >
                                <p className="text-white line-clamp-3 mb-4 font-medium">{post.content}</p>
                                <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    <span className="bg-white/5 px-2 py-1 rounded-md group-hover:bg-primary/20 group-hover:text-primary transition-colors">{post.likes?.length || 0} 🔥</span>
                                </div>
                            </div>
                        ))}
                        {myPosts?.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                                <p className="text-gray-500 font-bold">No posts found on this frequency.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reels' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {myReels?.map(reel => (
                            <Link to="/reels" key={reel._id} className="aspect-[9/16] relative rounded-2xl overflow-hidden group bg-surface border border-white/5">
                                <video
                                    src={reel.url}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white font-bold text-xs">
                                    <Play size={12} fill="currentColor" />
                                    {reel.likes?.length || 0}
                                </div>
                            </Link>
                        ))}
                        {myReels?.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                                <p className="text-gray-500 font-bold">No reels uploaded yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'threads' && (
                    <div className="space-y-4">
                        {myThreads?.map(thread => (
                            <div key={thread._id} className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{thread.title}</h3>
                                        <div className="flex gap-2">
                                            {thread.tags?.map(tag => (
                                                <span key={tag} className="text-[10px] font-black uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-gray-500">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDeleteThread(thread._id)}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-400 line-clamp-2 mb-4 text-sm">{thread.content}</p>
                                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <span>{thread.upvotes?.length || 0} Upvotes</span>
                                    <span>{thread.comments?.length || 0} Comments</span>
                                    <Link to="/forum" className="text-primary hover:underline">View in Forum &rarr;</Link>
                                </div>
                            </div>
                        ))}
                        {myThreads?.length === 0 && (
                            <div className="py-20 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                                <p className="text-gray-500 font-bold italic">No active frequency in the forum yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Post Detail Modal */}
                <AnimatePresence>
                    {selectedPost && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-surface border border-white/10 rounded-3xl w-full max-w-2xl relative overflow-hidden shadow-2xl"
                            >
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="absolute top-6 right-6 z-10 text-gray-400 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-md transition-all"
                                >
                                    <X size={20} />
                                </button>

                                {selectedPost.image && (
                                    <div className="w-full h-80 bg-gray-900 border-b border-white/5">
                                        <img src={selectedPost.image} alt="Post" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <UserAvatar src={currentUser.photoURL} name={userProfile.displayName} size="md" />
                                        <div>
                                            <h3 className="text-white font-black text-lg">{userProfile.displayName}</h3>
                                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{new Date(selectedPost.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-200 text-xl leading-relaxed mb-8">{selectedPost.content}</p>

                                    <div className="flex items-center gap-6 border-t border-white/5 pt-6">
                                        <div className="flex items-center gap-2 text-primary font-black">
                                            <span className="text-2xl">🔥</span>
                                            {selectedPost.likes?.length || 0} Likes
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 font-black">
                                            <MessageSquare size={20} />
                                            {selectedPost.comments?.length || 0} Comments
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
