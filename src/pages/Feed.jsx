import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, X, Plus, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFeed, likePost, bookmarkPost, fetchUserProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreatePostModal from '../components/CreatePostModal';
import PostCard from '../components/PostCard';
import { NavLink } from 'react-router-dom';

export default function Feed() {
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [editingPost, setEditingPost] = useState(null); // Added missing state variable
    const [storyProfiles, setStoryProfiles] = useState([]);
    const [selectedStory, setSelectedStory] = useState(null);
    const { currentUser, userProfile } = useAuth();
    const { data: posts, isLoading, error } = useQuery({
        queryKey: ['feed'],
        queryFn: fetchFeed,
        refetchInterval: 5000 // Poll every 5s for realtime-ish feel
    });

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const loadStories = async () => {
            const storyMap = new Map();
            if (userProfile?.storyImage) {
                storyMap.set(userProfile.uid || currentUser?.uid || 'me', {
                    ...userProfile,
                    uid: userProfile.uid || currentUser?.uid || 'me'
                });
            }

            if (!posts || posts.length === 0) {
                setStoryProfiles(Array.from(storyMap.values()));
                return;
            }
            const ids = Array.from(new Set(posts.map(post => post.authorId || post.userId || post.author?.uid || post.user?.uid).filter(Boolean)));
            if (ids.length > 0) {
                const profiles = await Promise.all(ids.map(async (id) => {
                    try {
                        const profile = await fetchUserProfile(id);
                        return profile;
                    } catch (e) {
                        return null;
                    }
                }));
                profiles.forEach(profile => {
                    if (!profile?.storyImage) return;
                    if (storyMap.has(profile.uid)) return;
                    storyMap.set(profile.uid, profile);
                });
            }
            setStoryProfiles(Array.from(storyMap.values()));
        };
        loadStories();
    }, [posts, userProfile, currentUser]);

    if (isLoading) return (
        <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-gray-500 font-mono animate-pulse uppercase tracking-[0.2em] text-xs font-bold">Initializing Feed Pulse...</p>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto pt-4 relative pb-20 scroll-smooth">
            <div className="flex flex-col gap-6 mb-8">
                {storyProfiles.length > 0 && (
                    <div className="flex items-center gap-5 overflow-x-auto pb-2">
                        {storyProfiles.map(profile => {
                            const isMe = currentUser?.uid && profile.uid === currentUser.uid;
                            return (
                                <button key={profile.uid} onClick={() => setSelectedStory(profile)} className="flex flex-col items-center gap-2">
                                    <div className="p-[2px] rounded-full bg-gradient-to-r from-primary via-secondary to-blue-500">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-black bg-black">
                                            <img src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName || 'User'}&background=0D8ABC&color=fff`} alt={profile.displayName || "Story"} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 max-w-[72px] truncate">{isMe ? 'Your Story' : (profile.displayName || "User")}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
                <div className="flex items-center justify-between gap-3">
                    <div />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsPostModalOpen(true)}
                        className="px-5 py-3 bg-primary text-black rounded-2xl font-black flex items-center gap-2 shadow-[0_20px_40px_rgba(234,179,8,0.3)] border-2 border-black"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Create Post
                    </motion.button>
                    <NavLink to="/profile" className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary shadow-[0_0_10px_rgba(234,179,8,0.4)]">
                        <img
                            src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName || 'User'}&background=0D8ABC&color=fff`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </NavLink>
                </div>
            </div>

            <div className="space-y-16">
                {posts?.map((post, i) => {
                    console.log(`Rendering post ${i}:`, post);
                    return (
                        <motion.div
                            key={post._id || post.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <PostCard post={post} />
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-24 right-6 w-12 h-12 bg-primary/80 backdrop-blur-sm text-black rounded-full flex items-center justify-center shadow-lg hover:bg-primary transition-all z-30"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isPostModalOpen && (
                    <CreatePostModal 
                        isOpen={isPostModalOpen} 
                        onClose={() => {
                            setIsPostModalOpen(false);
                            setEditingPost(null);
                        }}
                        editPost={editingPost}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedStory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-2xl"
                        >
                            <button
                                onClick={() => setSelectedStory(null)}
                                className="absolute -top-4 -right-4 z-10 bg-black/60 border border-white/10 text-white p-2 rounded-full"
                            >
                                <X size={18} />
                            </button>
                            <div className="bg-black border border-white/10 rounded-3xl overflow-hidden">
                                <img src={selectedStory.storyImage} alt="Story" className="w-full h-[70vh] object-contain bg-black" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
