import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Clock, Eye } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addComment, likePost, bookmarkPost } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post }) {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [showMenu, setShowMenu] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [commentText, setCommentText] = useState('');

    if (!post) {
        return null;
    }

    const likeMutation = useMutation({
        mutationFn: ({ postId, userId }) => likePost(postId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries(['feed']);
        }
    });

    const bookmarkMutation = useMutation({
        mutationFn: ({ postId, userId }) => bookmarkPost(postId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries(['feed']);
        }
    });

    const handleLike = (event) => {
        event?.stopPropagation();
        likeMutation.mutate({ postId: post._id, userId: currentUser?.uid });
    };

    const handleBookmark = (event) => {
        event?.stopPropagation();
        bookmarkMutation.mutate({ postId: post._id, userId: currentUser?.uid });
    };

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;
        try {
            await addComment(post._id, commentText.trim(), currentUser?.displayName || 'Anonymous');
            setCommentText('');
            queryClient.invalidateQueries(['feed']);
        } catch (error) {
            setCommentText('');
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const postDate = new Date(timestamp);
        const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const renderContent = () => {
        if (typeof post.content === 'string') {
            return post.content;
        }
        if (post.content && typeof post.content === 'object') {
            if (post.content.text) return post.content.text;
            return JSON.stringify(post.content);
        }
        return String(post.content || '');
    };

    const authorName = typeof post.author === 'string' ? post.author : post.author?.name || 'Anonymous';
    const authorInitial = authorName?.charAt(0)?.toUpperCase() || 'U';
    const authorPhoto = post.authorPhoto || post.author?.photoURL || '';

    return (
        <div className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 group cursor-pointer" onClick={() => setShowDetail(true)}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-sm overflow-hidden">
                        {authorPhoto ? (
                            <img src={authorPhoto} alt={authorName} className="w-full h-full object-cover" />
                        ) : (
                            authorInitial
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-sm">
                            {authorName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock size={12} />
                            {formatTimeAgo(post.createdAt)}
                            <span>•</span>
                            <Eye size={12} />
                            {post.views || 0}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={(event) => {
                            event.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <MoreHorizontal size={16} className="text-gray-400" />
                    </button>

                    {showMenu && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg py-1 z-10 min-w-[120px]"
                        >
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors">
                                Report
                            </button>
                            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors">
                                Share
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="mb-4">
                {post.title && (
                    <h2 className="text-lg font-semibold text-white mb-2">{post.title}</h2>
                )}
                <p className="text-gray-300 leading-relaxed">
                    {renderContent()}
                </p>

                {post.image && (
                    <div className="mt-4 rounded-xl overflow-hidden">
                        <img
                            src={post.image}
                            alt="Post image"
                            className="w-full h-64 object-cover"
                        />
                    </div>
                )}
            </div>

            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                            Array.isArray(post.likes) && currentUser?.uid && post.likes.includes(currentUser.uid)
                                ? 'bg-red-500/10 text-red-400'
                                : 'hover:bg-white/5 text-gray-400'
                        }`}
                    >
                        <Heart
                            size={16}
                            className={Array.isArray(post.likes) && currentUser?.uid && post.likes.includes(currentUser.uid) ? 'fill-current' : ''}
                        />
                        <span className="text-sm font-medium">{Array.isArray(post.likes) ? post.likes.length : 0}</span>
                    </button>

                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 transition-all" onClick={(event) => event.stopPropagation()}>
                        <MessageCircle size={16} />
                        <span className="text-sm font-medium">{Array.isArray(post.comments) ? post.comments.length : 0}</span>
                    </button>

                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 transition-all" onClick={(event) => event.stopPropagation()}>
                        <Share2 size={16} />
                        <span className="text-sm font-medium">Share</span>
                    </button>
                </div>

                <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        Array.isArray(post.bookmarks) && currentUser?.uid && post.bookmarks.includes(currentUser.uid)
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'hover:bg-white/5 text-gray-400'
                    }`}
                >
                    <Bookmark
                        size={16}
                        className={Array.isArray(post.bookmarks) && currentUser?.uid && post.bookmarks.includes(currentUser.uid) ? 'fill-current' : ''}
                    />
                    <span className="text-sm font-medium">Save</span>
                </button>
            </div>
            {showDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDetail(false)}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="relative z-10 w-full max-w-5xl bg-surface border border-white/10 rounded-3xl overflow-hidden"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] min-h-[70vh]">
                            <div className="p-6 border-r border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-sm overflow-hidden">
                                        {authorPhoto ? (
                                            <img src={authorPhoto} alt={authorName} className="w-full h-full object-cover" />
                                        ) : (
                                            authorInitial
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-sm">{authorName}</div>
                                        <div className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</div>
                                    </div>
                                </div>
                                <div className="text-gray-300 whitespace-pre-wrap mb-4">{renderContent()}</div>
                                {post.image && (
                                    <div className="rounded-2xl overflow-hidden">
                                        <img src={post.image} alt="Post media" className="w-full h-[360px] object-cover" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex flex-col">
                                <div className="text-white font-bold mb-4">Comments</div>
                                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                                    {Array.isArray(post.comments) && post.comments.length > 0 ? (
                                        post.comments.map((comment, index) => (
                                            <div key={`${comment.createdAt}-${index}`} className="bg-black/30 border border-white/10 rounded-2xl p-4">
                                                <div className="text-xs text-gray-500 mb-2">{comment.author}</div>
                                                <div className="text-sm text-gray-300">{comment.text}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-500">No comments yet.</div>
                                    )}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <input
                                        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition-colors"
                                        placeholder="Write a comment..."
                                        value={commentText}
                                        onChange={(event) => setCommentText(event.target.value)}
                                        onKeyDown={(event) => event.key === 'Enter' && handleCommentSubmit()}
                                    />
                                    <button
                                        onClick={handleCommentSubmit}
                                        className="px-4 py-3 bg-primary text-black rounded-xl font-bold"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
