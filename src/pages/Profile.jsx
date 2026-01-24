import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Link as LinkIcon, Calendar, Edit3, Award, Code, Terminal, LogOut, ShieldCheck, Trophy, MessageSquare, X, Heart, Pause, Play, Zap } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import EditProfileModal from '../components/EditProfileModal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserPosts, fetchUserReels, fetchUserThreads, deleteForumThread, fetchUserProfile, likeReel, addReelComment } from '../services/api';
import UserAvatar from '../components/UserAvatar';

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

// --- THREAD MODAL ---
const ThreadModal = ({ thread, onClose, currentUser }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-surface border border-white/10 rounded-3xl w-full max-w-2xl relative overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-md"
                >
                    <X size={20} />
                </button>

                <div className="p-8 overflow-y-auto">
                    <div className="flex items-center gap-4 mb-6">
                        {/* User Avatar linking to profile */}
                        <Link to={`/user/${thread.authorId}`} className="flex items-center gap-3 group">
                            <UserAvatar name={thread.author} size="md" />
                            <div>
                                <h3 className="text-white font-black text-lg group-hover:underline">{thread.author}</h3>
                                <div className="flex gap-2">
                                    {thread.tags?.map(tag => (
                                        <span key={tag} className="text-[10px] font-black uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-gray-500">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    </div>

                    <h2 className="text-2xl font-black text-white mb-4">{thread.title}</h2>
                    <p className="text-gray-300 text-lg leading-relaxed mb-8 whitespace-pre-wrap">{thread.content}</p>

                    <div className="flex items-center gap-6 border-t border-white/5 pt-6">
                        <div className="flex items-center gap-2 text-primary font-black">
                            <span>▲</span>
                            {thread.upvotes?.length || 0} Upvotes
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 font-black">
                            <MessageSquare size={20} />
                            {thread.comments?.length || 0} Comments
                        </div>
                        <Link to="/forum" className="ml-auto text-sm text-primary hover:underline">
                            Open in Forum
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- MODALS ---

const ReelModal = ({ reel, onClose, currentUser }) => {
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState('');

    const likeMutation = useMutation({
        mutationFn: () => likeReel(reel._id, currentUser.uid),
        onSuccess: () => queryClient.invalidateQueries(['reels'])
    });

    const commentMutation = useMutation({
        mutationFn: () => addReelComment(reel._id, commentText, currentUser.displayName, currentUser.uid),
        onSuccess: () => {
            queryClient.invalidateQueries(['reels']);
            setCommentText('');
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-black border border-white/10 rounded-3xl w-full max-w-6xl h-[85vh] flex overflow-hidden shadow-2xl relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 text-white bg-black/50 p-2 rounded-full hover:bg-white/20 backdrop-blur-md"
                >
                    <X size={20} />
                </button>

                {/* Left: Video */}
                <div className="flex-1 bg-black relative flex items-center justify-center">
                    <video
                        src={reel.url}
                        className="w-full h-full object-contain"
                        loop
                        autoPlay
                        controls
                    />
                </div>

                {/* Right: Details (Hidden on mobile) */}
                <div className="w-[350px] bg-surface border-l border-white/10 flex-col hidden md:flex">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center gap-3">
                        <UserAvatar src={reel.userPhoto} name={reel.userDisplayName} size="sm" />
                        <div>
                            <h4 className="font-bold text-white text-sm hover:underline cursor-pointer"><Link to={`/user/${reel.userId}`}>{reel.userDisplayName}</Link></h4>
                            <p className="text-gray-500 text-xs truncate w-40">{reel.description}</p>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {(!reel.comments || reel.comments.length === 0) && (
                            <div className="text-gray-500 text-center text-sm py-10 flex flex-col items-center">
                                <MessageSquare size={24} className="mb-2 opacity-50" />
                                No comments yet.
                            </div>
                        )}
                        {reel.comments?.map((c, i) => (
                            <div key={i} className="flex gap-3 text-sm group">
                                <div className="shrink-0 mt-1">
                                    <UserAvatar name={c.author} size="xs" />
                                </div>
                                <div>
                                    <span className="font-bold text-white mr-2 hover:underline cursor-pointer">{c.author}</span>
                                    <span className="text-gray-300">{c.text}</span>
                                    <p className="text-[10px] text-gray-600 mt-1">Just now</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="p-4 border-t border-white/10 bg-black/20">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-4">
                                <button onClick={() => likeMutation.mutate()} className="hover:scale-110 transition-transform">
                                    <Heart size={24} className={reel.likes?.includes(currentUser?.uid) ? "fill-red-500 text-red-500" : "text-white"} />
                                </button>
                                <button className="hover:scale-110 transition-transform">
                                    <MessageSquare size={24} className="text-white" />
                                </button>
                            </div>
                            <span className="text-white font-bold text-sm">{reel.likes?.length || 0} likes</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-white/5 rounded-full px-4 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-primary placeholder-gray-500"
                                onKeyDown={e => e.key === 'Enter' && commentText.trim() && commentMutation.mutate()}
                            />
                            <button
                                onClick={() => commentMutation.mutate()}
                                disabled={!commentText.trim()}
                                className="text-primary font-bold text-sm disabled:opacity-50 hover:text-primary/80"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};



export default function Profile() {
    const { uid } = useParams();
    const navigate = useNavigate();
    const { currentUser, userProfile: myProfile, logout, refreshProfile } = useAuth();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedReel, setSelectedReel] = useState(null);
    const [selectedThread, setSelectedThread] = useState(null);

    // Determine target user ID (URL param or current user)
    const targetUid = uid || currentUser?.uid;
    const isOwner = targetUid === currentUser?.uid;

    // Fetch Profile Data (if not owner)
    const { data: fetchProfileData } = useQuery({
        queryKey: ['user-profile', targetUid],
        queryFn: async () => {
            if (isOwner) return myProfile;
            // In a real app, you would have an API to get user by ID. 
            // We'll mock finding them via the posts/leaderboard API indirectly or add a specific route.
            // For this MVP, let's assume `fetchUserPosts` returns author details we can use as fallback, 
            // but ideally we need `GET /api/users/:id`
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            try {
                // HACK: Using a quick fetch to leaderboard or similar if specific user endpoint missing. 
                // Better: Add `fetchUserPublicProfile` to api.js
                const res = await axios.get(`${API_BASE}/users/${targetUid}`); // Assuming this exists or we need to create it
                return res.data;
            } catch (e) {
                return { displayName: 'User', role: 'Student', photoURL: null, bio: 'Student at Grid.' }; // Fallback
            }
        },
        enabled: !!targetUid && !isOwner
    });

    const profile = isOwner ? myProfile : (fetchProfileData || { displayName: 'Loading...', role: 'Student' });

    // Fetch Posts
    const { data: posts } = useQuery({
        queryKey: ['posts', targetUid],
        queryFn: () => fetchUserPosts(targetUid),
        enabled: !!targetUid
    });

    // Fetch Reels
    const { data: reels } = useQuery({
        queryKey: ['reels', targetUid],
        queryFn: () => fetchUserReels(targetUid),
        enabled: !!targetUid
    });

    // Fetch Threads
    const { data: threads } = useQuery({
        queryKey: ['threads', targetUid],
        queryFn: () => fetchUserThreads(targetUid),
        enabled: !!targetUid
    });

    // Fetch LeetCode Stats
    const { data: leetcodeStats } = useQuery({
        queryKey: ['leetcode-stats', profile?.leetcodeUsername],
        queryFn: async () => {
            if (!profile?.leetcodeUsername) return null;
            const res = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${profile.leetcodeUsername}`);
            return res.data;
        },
        enabled: !!profile?.leetcodeUsername,
        retry: 1
    });

    const handleUpdateProfile = async (newData) => {
        try {
            if (!currentUser) return;
            const token = await currentUser.getIdToken();
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.put(`${API_BASE}/auth/profile`, {
                uid: currentUser.uid,
                ...newData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (refreshProfile) await refreshProfile();
            window.location.reload();
        } catch (e) {
            alert(e.response?.data?.error || "Update Failed");
        }
    };

    const handleDeleteThread = async (threadId) => {
        if (window.confirm("Delete this thread?")) {
            try {
                await deleteForumThread(threadId);
                window.location.reload();
            } catch (err) { alert("Failed"); }
        }
    };

    if (!profile) return <div className="p-20 text-center text-gray-500">Loading Profile...</div>;

    return (
        <div className="pb-20">
            {isOwner && (
                <EditProfileModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    user={profile}
                    onSave={handleUpdateProfile}
                />
            )}

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
                            src={profile.photoURL}
                            name={profile.displayName}
                            size="xl"
                            className="border-4 border-black ring-4 ring-primary/20 shadow-2xl"
                        />
                        <div className="mb-2">
                            <h1 className="text-3xl md:text-4xl font-display font-black text-white flex items-center gap-2">
                                {profile.displayName}
                                {profile.isVerified && <Award className="text-blue-500 fill-blue-500/20" size={24} />}
                            </h1>
                            <p className="text-gray-400 font-medium text-lg">
                                {profile.role} • {profile.collegeEmail || 'Unverified'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {isOwner && !profile.isVerified && (
                            <Link to="/verify-edu" className="bg-primary text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                                <Award size={18} /> Verify EDU
                            </Link>
                        )}
                        {isOwner ? (
                            <>
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
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    if (profile.isAlumni && !myProfile?.isPremium) {
                                        window.dispatchEvent(new CustomEvent('open-premium'));
                                        return;
                                    }
                                    navigate('/chat', { state: { activeChatUser: profile } });
                                }}
                                className="bg-primary text-black px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                            >
                                <MessageSquare size={18} />
                                {profile.isAlumni ? "DM Alumni" : "Message"}
                                {profile.isAlumni && !myProfile?.isPremium && <Zap size={14} className="ml-1 fill-black" />}
                            </button>
                        )}


                    </div>
                </div>

                {/* Bio & Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* ... Bio content remains same, just using `profile` object ... */}
                    <div className="md:col-span-2 space-y-6">
                        <p className="text-gray-300 text-lg leading-relaxed">
                            {profile.bio || "No bio yet."}
                        </p>

                        <div className="flex flex-wrap gap-4 text-gray-500 text-sm font-medium">
                            <div className="flex items-center gap-1"><MapPin size={16} /> {profile.campus || 'Grid Campus'}</div>
                            <div className="flex items-center gap-1"><Calendar size={16} /> Joined 2026</div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {profile.skills?.map(skill => <Badge key={skill} label={skill} emoji="⚡" />)}
                        </div>

                        {!profile.isVerified && isOwner && (
                            <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-between gap-6">
                                <div>
                                    <h4 className="text-white font-black text-lg">Verify your EDU Frequencies</h4>
                                    <p className="text-gray-400 text-sm">Secure your node on the grid to unlock posting and verified badges.</p>
                                </div>
                                <Link to="/verify-edu" className="bg-primary text-black px-8 py-3 rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-primary/20 whitespace-nowrap">
                                    VERIFY NOW
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <StatCard
                            label="LeetCode"
                            value={profile.leetcodeUsername || 'N/A'}
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
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-white/10 mb-8">
                    {['posts', 'reels', 'threads'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-primary' : 'text-gray-500'}`}
                        >
                            {tab}
                            {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                    ))}
                </div>

                {/* Content Sections */}
                {activeTab === 'posts' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {posts?.map(post => (
                            <div
                                key={post._id}
                                onClick={() => setSelectedPost(post)} // Keep existing post modal or update if needed
                                className="bg-surface border border-white/5 rounded-xl p-4 hover:border-primary/50 hover:bg-white/[0.02] transition-all group cursor-pointer"
                            >
                                <p className="text-white line-clamp-3 mb-4 font-medium">{post.content}</p>
                                <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    <span className="bg-white/5 px-2 py-1 rounded-md group-hover:bg-primary/20 group-hover:text-primary transition-colors">{post.likes?.length || 0} 🔥</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'reels' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {reels?.map(reel => (
                            <div
                                key={reel._id}
                                onClick={() => setSelectedReel(reel)}
                                className="aspect-[9/16] relative rounded-2xl overflow-hidden group bg-surface border border-white/5 cursor-pointer"
                            >
                                <video
                                    src={reel.url}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white font-bold text-xs">
                                    <Play size={12} fill="currentColor" />
                                    {reel.likes?.length || 0}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Threads Tab Implementation */}
                {activeTab === 'threads' && (
                    <div className="space-y-4">
                        {threads?.map(thread => (
                            <div key={thread._id} className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="cursor-pointer" onClick={() => setSelectedThread(thread)}>
                                        <h3 className="text-xl font-bold text-white mb-2 hover:text-primary transition-colors">{thread.title}</h3>
                                        <div className="flex gap-2">
                                            {thread.tags?.map(tag => (
                                                <span key={tag} className="text-[10px] font-black uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-gray-500">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteThread(thread._id); }} className="text-red-500 opacity-0 group-hover:opacity-100 z-10 relative">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-400 line-clamp-2 mb-4 text-sm cursor-pointer" onClick={() => setSelectedThread(thread)}>{thread.content}</p>
                                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <span>{thread.upvotes?.length || 0} Upvotes</span>
                                    <span>{thread.comments?.length || 0} Comments</span>
                                    <Link to="/forum" className="text-primary hover:underline z-10 relative">View in Forum &rarr;</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modals */}
                <AnimatePresence>
                    {selectedReel && <ReelModal reel={selectedReel} onClose={() => setSelectedReel(null)} currentUser={currentUser} />}
                    {selectedThread && <ThreadModal thread={selectedThread} onClose={() => setSelectedThread(null)} currentUser={currentUser} />}

                    {/* Reuse Post Modal Logic */}
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
                                        <UserAvatar src={profile.photoURL} name={profile.displayName} size="md" />
                                        <div>
                                            <h3 className="text-white font-black text-lg">{profile.displayName}</h3>
                                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{new Date(selectedPost.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-200 text-xl leading-relaxed mb-8">{selectedPost.content}</p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
