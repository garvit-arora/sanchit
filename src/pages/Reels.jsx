import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Pause, Play, Plus, Upload, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchReels, uploadReel, likeReel, addReelComment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UploadReelModal from '../components/UploadReelModal';
import { useMutation } from '@tanstack/react-query';

const VideoPlayer = ({ reel, isActive, currentUser }) => {
    const videoRef = useRef(null);
    const queryClient = useQueryClient();
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        if (isActive && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
            setIsPlaying(true);
        } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

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

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const hasLiked = reel.likes?.includes(currentUser?.uid);

    return (
        <div className="relative w-full h-[75vh] md:h-[800px] bg-black rounded-[40px] overflow-hidden group shadow-2xl border border-white/5 snap-center">
            <video
                ref={videoRef}
                src={reel.url}
                className="w-full h-full object-cover cursor-pointer"
                loop
                muted={isMuted}
                playsInline
                onClick={togglePlay}
            />
            
            {/* Play/Pause Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                        <Play className="text-white fill-white translate-x-1" size={32} />
                    </div>
                </div>
            )}

            {/* Gradient Overlays */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

            {/* Content Sidebar (Right) */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-20">
                 <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => likeMutation.mutate()}
                    className="flex flex-col items-center gap-1.5"
                >
                    <div className={`w-14 h-14 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all ${hasLiked ? 'bg-red-500 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-white/10 border-white/20 text-white hover:bg-red-500/20'}`}>
                        <Heart size={26} className={hasLiked ? 'fill-current' : ''} />
                    </div>
                    <span className="text-xs font-black text-white drop-shadow-md">{reel.likes?.length || 0}</span>
                 </motion.button>

                 <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowComments(true)}
                    className="flex flex-col items-center gap-1.5"
                >
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-secondary/20 hover:text-secondary transition-all">
                        <MessageCircle size={26} />
                    </div>
                    <span className="text-xs font-black text-white drop-shadow-md">{reel.comments?.length || 0}</span>
                 </motion.button>

                 <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all"
                >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                 </motion.button>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10 pointer-events-none">
                <div className="max-w-[80%] pointer-events-auto">
                    <div className="flex items-center gap-3 mb-4">
                         <img src={reel.userPhoto || `https://ui-avatars.com/api/?name=${reel.userDisplayName}`} className="w-12 h-12 rounded-2xl border-2 border-white/20 shadow-lg" alt="" />
                         <div>
                            <span className="font-black text-white text-lg tracking-tight block">{reel.userDisplayName}</span>
                            <span className="text-secondary text-xs font-bold uppercase tracking-widest">PULSE ORIGIN</span>
                         </div>
                    </div>
                    <p className="text-white font-medium text-sm leading-relaxed drop-shadow-md">
                        {reel.description}
                    </p>
                </div>
            </div>

            {/* Comments Drawer */}
            <AnimatePresence>
                {showComments && (
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="absolute inset-0 bg-black/90 z-50 flex flex-col pt-12"
                    >
                        <button onClick={() => setShowComments(false)} className="absolute top-4 right-6 text-gray-500 hover:text-white"><X size={32} /></button>
                        <div className="px-6 mb-6">
                            <h3 className="text-2xl font-black text-white italic">Comments</h3>
                            <p className="text-gray-500 text-sm">{reel.comments?.length || 0} reactions to this pulse</p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-24">
                            {reel.comments?.map((c, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary shrink-0 flex items-center justify-center font-bold text-black uppercase">
                                        {c.author?.[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white text-sm">{c.author}</span>
                                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">CITIZEN</span>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-black border-t border-white/10">
                            <div className="flex gap-3">
                                <input 
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white outline-none focus:border-secondary transition-all"
                                    placeholder="Add to the pulse..."
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && commentMutation.mutate()}
                                />
                                <button onClick={() => commentMutation.mutate()} className="bg-secondary text-black p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all">
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

export default function Reels() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    
    const { data: reels, isLoading } = useQuery({
        queryKey: ['reels'],
        queryFn: fetchReels
    });

    const handleUpload = async (url, desc) => {
        try {
            await uploadReel(url, desc, currentUser);
            queryClient.invalidateQueries(['reels']);
            return true;
        } catch (err) {
            alert("Upload failed.");
            throw err;
        }
    };

    const handleScroll = (e) => {
        const clientHeight = e.target.clientHeight;
        const index = Math.round(e.target.scrollTop / clientHeight);
        if (index !== activeIndex && index >= 0 && index < (reels?.length || 0)) {
            setActiveIndex(index);
        }
    };

    if (isLoading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-secondary" size={48} />
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Fetching Pulse...</p>
        </div>
    );

    return (
        <div className="relative h-[85vh] md:h-auto w-full max-w-[450px] mx-auto pt-4">
            {/* Header Area */}
            <div className="absolute top-8 left-8 z-30 flex items-center gap-4">
                <h2 className="text-4xl font-display font-black text-white italic tracking-tighter drop-shadow-lg">Pulse<span className="text-secondary">.</span></h2>
            </div>

            {/* Launch Button */}
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUploadOpen(true)}
                className="absolute top-8 right-8 z-50 bg-secondary text-black font-black px-6 py-2.5 rounded-2xl flex items-center gap-2 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-secondary/50 transition-all border-2 border-white/10 hover:border-white/30"
            >
                <Plus size={20} strokeWidth={3} /> LAUNCH
            </motion.button>

            <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar rounded-[40px]" onScroll={handleScroll}>
                {reels?.length > 0 ? reels.map((reel, i) => (
                    <div key={reel._id} className="h-full w-full snap-start p-2 pb-4">
                        <VideoPlayer reel={reel} isActive={i === activeIndex} currentUser={currentUser} />
                    </div>
                )) : (
                    <div className="h-[70vh] flex flex-col items-center justify-center text-gray-500 text-center p-10 bg-surface/30 rounded-[40px] border border-white/5">
                        <Upload size={64} className="mb-6 opacity-20" />
                        <h3 className="text-2xl font-black text-white mb-2">The Silence is Deafening</h3>
                        <p className="max-w-xs font-medium">Be the first to break the void. Launch a reel to start the pulse.</p>
                    </div>
                )}
            </div>

            <UploadReelModal 
                isOpen={isUploadOpen} 
                onClose={() => setIsUploadOpen(false)} 
                onUpload={handleUpload}
            />
        </div>
    );
}
