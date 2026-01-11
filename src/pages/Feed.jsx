import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFeed, likePost, addComment } from '../services/api'; // Updated imports
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Meh, MoreHorizontal, BadgeCheck, Loader2, MessageCircle, Send } from 'lucide-react';
import CreatePostModal from '../components/CreatePostModal';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post }) => {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');

    const likeMutation = useMutation({
        mutationFn: () => likePost(post._id || post.id, currentUser.uid),
        onSuccess: () => queryClient.invalidateQueries(['feed'])
    });

    const commentMutation = useMutation({
        mutationFn: () => addComment(post._id || post.id, commentText, currentUser.displayName),
        onSuccess: () => {
            queryClient.invalidateQueries(['feed']);
            setCommentText('');
        }
    });

    const hasLiked = post.likes?.includes(currentUser?.uid);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-white/5 rounded-3xl overflow-hidden mb-8"
        >
            {/* Header */}
            <div className="p-5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {post.authorPhoto ? (
                        <img src={post.authorPhoto} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center font-bold text-black text-lg">
                            {post.author?.[0]}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-lg">{post.author}</h3>
                            {post.isVerified && <BadgeCheck size={18} className="text-blue-500 fill-blue-500/20" />}
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Just now • Campus</p>
                    </div>
                </div>
                <button className="text-gray-500 hover:text-white"><MoreHorizontal /></button>
            </div>

            {/* Content */}
            <div className="px-5 pb-4">
                <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Image (if any) */}
            {post.image && (
                <div className="w-full max-h-[500px] bg-gray-900 relative">
                     <img src={post.image} alt="Post" className="w-full h-full object-contain" />
                </div>
            )}

            {/* Actions */}
            <div className="p-4 border-t border-white/5 bg-white/5 backdrop-blur-sm grid grid-cols-2 gap-4">
                <motion.button 
                    whileTap={{ scale: 0.9 }} 
                    onClick={() => likeMutation.mutate()}
                    className={`py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors ${hasLiked ? 'bg-orange-500/20 text-orange-500' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                    <Flame className={hasLiked ? "fill-current" : ""} /> {post.likes?.length || 0}
                </motion.button>
                <motion.button 
                    whileTap={{ scale: 0.9 }} 
                    onClick={() => setShowComments(!showComments)}
                    className="bg-white/5 hover:bg-white/10 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-colors"
                >
                    <MessageCircle /> {post.comments?.length || 0}
                </motion.button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-black/40">
                        <div className="p-4 space-y-4">
                            {post.comments?.map((c, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="font-bold text-gray-400 text-xs">{c.author}:</span>
                                    <span className="text-gray-300 text-sm">{c.text}</span>
                                </div>
                            ))}
                            <div className="flex gap-2 relative">
                                <input 
                                    className="w-full bg-white/5 rounded-xl px-4 py-2 text-white outline-none focus:ring-1 focus:ring-primary text-sm"
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && commentMutation.mutate()}
                                />
                                <button onClick={() => commentMutation.mutate()} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default function Feed() {
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const { data: posts, isLoading, error } = useQuery({
        queryKey: ['feed'],
        queryFn: fetchFeed,
        refetchInterval: 5000 // Poll every 5s for realtime-ish feel
    });

    if (isLoading) return (
        <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-gray-500 font-mono animate-pulse">Fetching the tea...</p>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto pt-4 relative pb-20">
            <h1 className="text-4xl font-display font-black text-white mb-8 flex items-center gap-3">
                Feed <span className="text-base font-sans font-medium text-gray-500 bg-surface px-3 py-1 rounded-full border border-white/10">Live</span>
            </h1>

            <div className="space-y-6">
                {posts?.map(post => (
                    <PostCard key={post._id || post.id} post={post} />
                ))}
                {posts?.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p>No posts yet. Be the first!</p>
                    </div>
                )}
            </div>

            <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsPostModalOpen(true)}
                className="fixed bottom-24 md:bottom-12 right-6 md:right-12 w-16 h-16 bg-primary text-black rounded-full shadow-[0_0_30px_rgba(234,179,8,0.4)] flex items-center justify-center z-40 border-4 border-black"
            >
                <Plus size={32} strokeWidth={3} />
            </motion.button>

            <AnimatePresence>
                {isPostModalOpen && <CreatePostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />}
            </AnimatePresence>
        </div>
    );
}
