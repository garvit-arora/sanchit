import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Image, Send, Smile, Music2, PlayCircle } from 'lucide-react';
import { createPost } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export default function CreatePostModal({ isOpen, onClose }) {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [song, setSong] = useState({ title: '', artist: '' });
    const [showMedia, setShowMedia] = useState(null); // 'image', 'video', 'song'
    const [isLoading, setIsLoading] = useState(false);
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();

    const handlePost = async () => {
        if(!content) return;
        setIsLoading(true);
        try {
            await createPost(content, imageUrl, videoUrl, (song.title || song.artist) ? song : null, currentUser);
            await queryClient.invalidateQueries(['feed']);
            setContent('');
            setImageUrl('');
            setVideoUrl('');
            setSong({ title: '', artist: '' });
            onClose();
        } catch (error) {
            console.error("Post creation failed:", error);
            alert("Failed to post.");
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-lg bg-surface border border-white/10 rounded-3xl p-6 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-display font-bold text-white">Share a Drop</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex gap-4 mb-4">
                    <img src={currentUser?.photoURL} className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary shrink-0 object-cover" />
                    <textarea 
                        autoFocus
                        placeholder="What's the frequency, Kenneth? 📻"
                        className="w-full bg-transparent text-lg text-white placeholder-gray-500 outline-none resize-none min-h-[120px]"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                {/* Media Inputs */}
                <div className="space-y-3 mb-6">
                    {showMedia === 'image' && (
                        <motion.input 
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary"
                            placeholder="Paste Image URL..."
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                        />
                    )}
                    {showMedia === 'video' && (
                        <motion.input 
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary"
                            placeholder="Paste Video URL (MP4)..."
                            value={videoUrl}
                            onChange={e => setVideoUrl(e.target.value)}
                        />
                    )}
                    {showMedia === 'song' && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                             <input 
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary"
                                placeholder="Song Name"
                                value={song.title}
                                onChange={e => setSong({...song, title: e.target.value})}
                            />
                             <input 
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary"
                                placeholder="Artist"
                                value={song.artist}
                                onChange={e => setSong({...song, artist: e.target.value})}
                            />
                        </motion.div>
                    )}
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                    <div className="flex gap-2 text-gray-400">
                        <button 
                            onClick={() => setShowMedia(showMedia === 'image' ? null : 'image')}
                            className={`p-3 rounded-xl transition-all ${showMedia === 'image' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'hover:bg-white/5 hover:text-white'}`}
                        >
                            <Image size={20} />
                        </button>
                        <button 
                            onClick={() => setShowMedia(showMedia === 'video' ? null : 'video')}
                            className={`p-3 rounded-xl transition-all ${showMedia === 'video' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'hover:bg-white/5 hover:text-white'}`}
                        >
                            <PlayCircle size={20} />
                        </button>
                        <button 
                            onClick={() => setShowMedia(showMedia === 'song' ? null : 'song')}
                            className={`p-3 rounded-xl transition-all ${showMedia === 'song' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'hover:bg-white/5 hover:text-white'}`}
                        >
                            <Music2 size={20} />
                        </button>
                    </div>

                    <button 
                        onClick={handlePost}
                        disabled={!content || isLoading}
                        className="bg-white text-black font-black px-8 py-3 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-xl"
                    >
                        {isLoading ? 'Dropping...' : 'Drop 🔥'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
