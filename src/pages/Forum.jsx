import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchForum, createForumPost, voteForumThread } from '../services/api';
import { MessageSquare, ArrowBigUp, ArrowBigDown, Hash, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ForumPost = ({ post, onVote, currentUser }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-white/5 rounded-2xl p-4 md:p-6 mb-4 hover:border-white/20 transition-all cursor-pointer flex gap-4"
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
            <h3 className="text-xl font-bold text-white mb-2 leading-tight">{post.title}</h3>
            <p className="text-gray-400 text-sm line-clamp-3 mb-4">{post.content}</p>
            
            <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                <span className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                    {post.author}
                </span>
                <span className="flex items-center gap-1 hover:bg-white/5 p-1 rounded-md transition-colors"><MessageSquare size={14} /> {post.comments?.length || 0} Comments</span>
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
);

const CreateThreadModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if(!title || !content) return;
        setIsLoading(true);
        try {
            await createForumPost(title, content, tags.split(',').map(t => t.trim()), currentUser);
            queryClient.invalidateQueries(['forum']);
            onClose();
        } catch (e) {
            alert("Failed to post thread");
        }
        setIsLoading(false);
    };

    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-surface border border-white/10 p-6 rounded-2xl w-full max-w-lg relative">
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
                    title: "Welcome to Localhost Forum! Read the rules before posting.",
                    content: "1. No toxicity. 2. No spam. 3. Be cool. This is a safe space for engineers to rant, discuss, and build.",
                    author: "Mod Team",
                    upvotes: [],
                    downvotes: [],
                    comments: [],
                    tags: ['pinned', 'rules']
                }} currentUser={{ uid: 'admin' }} onVote={() => {}} />

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
