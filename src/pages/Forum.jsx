import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchForum, createForumPost, voteForumThread, addForumComment, replyForumComment, deleteForumThread, reportForumThread, deleteForumComment } from '../services/api';
import { MessageSquare, ArrowBigUp, ArrowBigDown, Hash, Plus, X, Send, Reply, Trash2, ShieldAlert, Repeat } from 'lucide-react';
import { notify } from '../utils/notify';

const Comment = ({ comment, threadId, currentUser, queryClient }) => {
    const navigate = useNavigate();
    const [showReplyForm, setShowReplyForm] = useState(false);

    const handleMessage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate('/chat', { state: { activeChatUser: { uid: comment.authorId, displayName: comment.author } } });
    };

    const [replyText, setReplyText] = useState('');

    const replyMutation = useMutation({
        mutationFn: () => replyForumComment(threadId, comment._id, replyText, currentUser.displayName, currentUser.uid),
        onSuccess: () => {
            queryClient.invalidateQueries(['forum']);
            setReplyText('');
            setShowReplyForm(false);
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <Link to={`/user/${comment.authorId}`} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400 border border-white/10 shrink-0 hover:border-primary transition-colors">
                    {comment.author?.[0]}
                </Link>
                <div className="flex-1 bg-white/[0.02] p-4 rounded-2xl border border-white/5 relative group">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                            <Link to={`/user/${comment.authorId}`} className="text-xs font-black text-white hover:underline">{comment.author}</Link>
                            {currentUser?.uid !== comment.authorId && (
                                <button onClick={handleMessage} className="text-primary hover:scale-110 transition-transform">
                                    <MessageSquare size={12} />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-[10px] text-gray-600 font-bold">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            {currentUser?.uid === comment.authorId ? (
                                <button onClick={() => {
                                    if (window.confirm("Delete comment?")) deleteForumComment(threadId, comment._id).then(() => queryClient.invalidateQueries(['forum']))
                                }} className="text-gray-600 hover:text-red-500"><Trash2 size={12} /></button>
                            ) : (
                                <button onClick={() => notify("Reported.", "info")} className="text-gray-600 hover:text-yellow-500"><ShieldAlert size={12} /></button>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{comment.text}</p>

                    <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 hover:text-primary uppercase tracking-widest transition-colors"
                    >
                        <Reply size={12} /> Reply
                    </button>
                </div>
            </div>

            {/* Reply Form */}
            {showReplyForm && (
                <div className="ml-11 flex gap-2 items-center">
                    <input
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-primary transition-colors"
                        placeholder={`Reply to ${comment.author}...`}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        autoFocus
                    />
                    <button
                        onClick={() => replyMutation.mutate()}
                        disabled={!replyText.trim() || replyMutation.isPending}
                        className="p-2 bg-primary text-black rounded-lg hover:bg-yellow-400 disabled:opacity-50 transition-all"
                    >
                        <Send size={14} />
                    </button>
                </div>
            )}

            {/* Replies List */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-11 space-y-4 border-l-2 border-white/5 pl-4">
                    {comment.replies.map((reply, rid) => (
                        <div key={rid} className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-400 border border-white/10 shrink-0">
                                {reply.author?.[0]}
                            </div>
                            <div className="flex-1 bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-white">{reply.author}</span>
                                    <span className="text-[9px] text-gray-600 font-bold">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">{reply.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

};

const ForumPost = ({ post, onVote, currentUser }) => {
    const navigate = useNavigate();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const queryClient = useQueryClient();

    const handleMessage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate('/chat', { state: { activeChatUser: { uid: post.authorId, displayName: post.author } } });
    };


    const commentMutation = useMutation({
        mutationFn: () => addForumComment(post._id, commentText, currentUser.displayName, currentUser.uid),
        onSuccess: () => {
            queryClient.invalidateQueries(['forum']);
            setCommentText('');
        }
    });

    const handleDelete = async () => {
        if (window.confirm("Delete this thread?")) {
            await deleteForumThread(post._id);
            queryClient.invalidateQueries(['forum']);
        }
    };

    const handleReport = async () => {
        const reason = window.prompt("Why are you reporting this thread?");
        if (reason) {
            await reportForumThread(post._id, currentUser.uid, reason); // Ensure API exists
            notify("Reported to moderators.", "info");
        }
    };

    const handleRepost = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser?.uid || !post?._id) return;
        try {
            const existingTags = Array.isArray(post.tags) ? post.tags : [];
            const tags = Array.from(new Set([...existingTags, 'repost']));
            const title = `Repost: ${post.title}`;
            const content = `${post.content}\n\nReposted from ${post.author}`;
            await createForumPost(title, content, tags, currentUser);
            queryClient.invalidateQueries(['forum']);
        } catch (error) {
            notify("Failed to repost thread", "error");
        }
    };

    return (
        <div className="mb-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowComments(!showComments)}
                className={`bg-surface border border-white/10 rounded-2xl p-4 md:p-6 hover:border-primary/50 hover:bg-white/[0.02] shadow-xl transition-all cursor-pointer flex gap-4 ${showComments ? 'rounded-b-none border-b-0 border-primary/50' : ''}`}
            >
                {/* Voting - Connected to Backend */}
                <div className="flex flex-col items-center gap-1 bg-black/20 p-2 rounded-xl h-fit">
                    <button
                        onClick={(e) => { e.stopPropagation(); onVote(post._id, 'up'); }}
                        className="text-gray-500 hover:text-orange-500 transition-colors"
                    >
                        <ArrowBigUp size={28} className={post.upvotes?.includes(currentUser?.uid) ? "fill-orange-500 text-orange-500" : ""} />
                    </button>
                    <span className="font-bold text-white text-sm">{post.upvotes?.length || 0}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onVote(post._id, 'down'); }}
                        className="text-gray-500 hover:text-blue-500 transition-colors"
                    >
                        <ArrowBigDown size={28} className={post.downvotes?.includes(currentUser?.uid) ? "fill-blue-500 text-blue-500" : ""} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{post.title}</h3>

                        {/* Actions Logic */}
                        <div onClick={e => e.stopPropagation()}>
                            {currentUser?.uid === post.authorId ? (
                                <button onClick={handleDelete} className="text-gray-500 hover:text-red-500 p-1">
                                    <X size={16} />
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button onClick={handleRepost} className="text-gray-500 hover:text-primary p-1">
                                        <Repeat size={16} />
                                    </button>
                                    <button onClick={handleReport} className="text-gray-500 hover:text-yellow-500 p-1">
                                        <ShieldAlert size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">{post.content}</p>

                    <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                        <span className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                            <Link to={`/user/${post.authorId}`} className="hover:underline">{post.author}</Link>
                            {currentUser?.uid !== post.authorId && (
                                <button onClick={handleMessage} className="text-primary hover:scale-110 transition-transform">
                                    <MessageSquare size={12} />
                                </button>
                            )}
                        </span>
                        <span className="flex items-center gap-1 hover:bg-white/5 p-1 rounded-md transition-colors font-black tracking-widest uppercase text-[10px]">
                            <MessageSquare size={14} /> {post.comments?.length || 0} Threads
                        </span>
                        <div className="flex gap-2">
                            {post.tags?.map(tag => (
                                <span key={tag} className="flex items-center gap-0.5 text-primary">
                                    <Hash size={12} />{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-surface/50 border-x border-b border-white/5 rounded-b-2xl overflow-hidden"
                    >
                        <div className="p-4 md:p-6">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Discussion Threads</h4>
                            <div className="space-y-6">
                                {post.comments?.map((comment) => (
                                    <Comment
                                        key={comment._id}
                                        comment={comment}
                                        threadId={post._id}
                                        currentUser={currentUser}
                                        queryClient={queryClient}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-2 items-center mt-8 pt-6 border-t border-white/5">
                                <input
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition-colors font-medium"
                                    placeholder="Start a sub-thread..."
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && commentMutation.mutate()}
                                />
                                <button
                                    onClick={() => commentMutation.mutate()}
                                    disabled={!commentText.trim() || commentMutation.isPending}
                                    className="p-3 bg-primary text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CreateThreadModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !content || !currentUser?.uid) return;
        setIsLoading(true);
        try {
            const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
            await createForumPost(title, content, tagList, currentUser);
            queryClient.invalidateQueries(['forum']);
            onClose();
        } catch (e) {
            notify("Failed to post thread", "error");
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface border border-white/10 p-6 rounded-2xl w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
                <h2 className="text-2xl font-black text-white mb-6">Start Discussion</h2>

                <input
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-bold text-lg mb-4 outline-none focus:border-primary"
                    placeholder="Title (e.g., Best place to cry on campus?)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />

                <textarea
                    className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-4 outline-none focus:border-primary resize-none"
                    placeholder="Elaborate..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />

                <input
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-gray-300 text-sm mb-6 outline-none focus:border-primary"
                    placeholder="Tags (comma separated: cse, rant, help)"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                />

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-white text-black font-black py-3 rounded-xl hover:scale-[1.02] transition-transform"
                >
                    {isLoading ? 'Posting...' : 'Create Thread'}
                </button>
            </motion.div>
        </div>
    );
};

export default function Forum() {
    const [isModalOpen, setModalOpen] = useState(false);
    const { data: posts, isLoading } = useQuery({
        queryKey: ['forum'],
        queryFn: fetchForum
    });

    const queryClient = useQueryClient();
    const { currentUser } = useAuth();

    const handleVote = async (threadId, type) => {
        if (!currentUser?.uid) return;
        try {
            await voteForumThread(threadId, currentUser.uid, type);
            queryClient.invalidateQueries(['forum']);
        } catch (e) {
            console.error("Vote failed");
        }
    };

    return (
        <div className="max-w-3xl mx-auto pt-4 relative pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-display font-black text-white">Forum</h1>
                    <p className="text-gray-400">The front page of your campus.</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="bg-primary text-black font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-yellow-400 transition-colors">
                    <Plus size={20} /> New Thread
                </button>
            </div>

            <div className="space-y-4">
                {/* Fake Pinned Post */}
                <ForumPost post={{
                    title: "Welcome to Sanchit Forum! Read the rules before posting.",
                    content: "1. No toxicity. 2. No spam. 3. Be cool. This is a safe space for engineers to rant, discuss, and build.",
                    author: "Mod Team",
                    upvotes: [],
                    downvotes: [],
                    comments: [],
                    tags: ['pinned', 'rules']
                }} currentUser={{ uid: 'admin' }} onVote={() => { }} />

                {isLoading ? <p className="text-gray-500 animate-pulse">Loading threads...</p> :
                    posts?.map(post => <ForumPost key={post._id} post={post} onVote={handleVote} currentUser={currentUser} />)
                }
            </div>

            <AnimatePresence>
                {isModalOpen && <CreateThreadModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />}
            </AnimatePresence>
        </div>
    );
}
