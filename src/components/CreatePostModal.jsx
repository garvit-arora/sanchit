import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Image, Send, Smile } from 'lucide-react';
import { createPost } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export default function CreatePostModal({ isOpen, onClose }) {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();

    const handlePost = async () => {
        if(!content) return;
        setIsLoading(true);
        console.log("Creating post...");
        try {
            // Passing null for image for now, can be expanded later
            await createPost(content, null, currentUser);
            console.log("Post created successfully!");
            
            // Invalidate Feed query to refetch new post
            await queryClient.invalidateQueries(['feed']);
            setContent('');
            onClose();
            // alert("Dropped that 🔥 post!"); // Optional
        } catch (error) {
            console.error("Post creation failed:", error);
            alert("Failed to post. Check console.");
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
                    <h2 className="text-xl font-display font-bold text-white">Create Post</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary shrink-0" />
                    <textarea 
                        autoFocus
                        placeholder="What's cooking, good looking? 🍳"
                        className="w-full bg-transparent text-lg text-white placeholder-gray-500 outline-none resize-none min-h-[120px]"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                {/* Attachments Preview Area would go here */}

                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                    <div className="flex gap-2 text-primary">
                        <button className="p-2 hover:bg-primary/10 rounded-xl transition-colors"><Image size={20} /></button>
                        <button className="p-2 hover:bg-primary/10 rounded-xl transition-colors"><Smile size={20} /></button>
                    </div>

                    <button 
                        onClick={handlePost}
                        disabled={!content || isLoading}
                        className="bg-white text-black font-bold px-6 py-2 rounded-xl flex items-center gap-2 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                    >
                        {isLoading ? 'Posting...' : <><Send size={18} /> Post</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
