import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Pause, Play, Plus, Upload, Loader2, X, Send, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReels, uploadReel, likeReel, addReelComment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UploadReelModal from '../components/UploadReelModal';

const VideoPlayer = ({ reel, isActive, currentUser, globalMuted, setGlobalMuted }) => {
    const videoRef = useRef(null);
    const queryClient = useQueryClient();
    const [isPlaying, setIsPlaying] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [progress, setProgress] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

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

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(p);
        }
    };

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
        <div className="relative w-full h-[100dvh] bg-black flex items-center justify-center snap-start overflow-hidden border-b border-white/5">
            {/* Background Blur */}
            <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
                <img src={reel.url} className="w-full h-full object-cover blur-[100px] scale-150" alt="" />
            </div>

            <div className="relative w-full max-w-[450px] h-full bg-black shadow-2xl flex flex-col items-center justify-center">
                <video
                    ref={videoRef}
                    src={reel.url}
                    className="w-full h-full object-contain cursor-pointer"
                    loop
                    muted={globalMuted}
                    playsInline
                    onClick={togglePlay}
                    onTimeUpdate={handleTimeUpdate}
                />
                
                {/* Play/Pause Overlay */}
                <AnimatePresence>
                    {!isPlaying && (
                        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-30">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                                <Play className="text-white fill-white translate-x-1" size={48} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 z-[60] overflow-hidden">
                    <motion.div 
                        className="h-full bg-secondary shadow-[0_0_15px_#facc15]"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0 }}
                    />
                </div>

                {/* Vertical Sidebar - Shifted and more visible */}
                <div className="absolute right-4 bottom-32 flex flex-col gap-5 md:gap-7 items-center z-[70]">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); likeMutation.mutate(); }} className="flex flex-col items-center gap-1.5">
                        <div className={`w-14 h-14 rounded-2xl backdrop-blur-3xl border-2 flex items-center justify-center transition-all ${hasLiked ? 'bg-primary border-primary text-black shadow-[0_0_25px_rgba(234,179,8,0.6)]' : 'bg-white/10 border-white/10 text-white hover:border-white/40'}`}>
                            <Heart size={26} className={hasLiked ? 'fill-current' : ''} />
                        </div>
                        <span className="text-xs font-black text-white drop-shadow-lg tracking-tighter">{reel.likes?.length || 0}</span>
                    </motion.button>

                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setShowComments(true); }} className="flex flex-col items-center gap-1.5">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-3xl border-2 border-white/10 flex items-center justify-center text-white hover:border-white/40 transition-all">
                            <MessageCircle size={26} />
                        </div>
                        <span className="text-xs font-black text-white drop-shadow-lg tracking-tighter">{reel.comments?.length || 0}</span>
                    </motion.button>

                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); setGlobalMuted(!globalMuted); }}
                        className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-3xl border-2 border-white/10 flex items-center justify-center text-white transition-all shadow-xl"
                    >
                        {globalMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    </motion.button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); setPlaybackRate(playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1); }}
                        className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-3xl border-2 border-white/10 flex items-center justify-center text-[10px] font-black text-white transition-all shadow-xl"
                    >
                        {playbackRate === 1 ? '1X' : playbackRate === 1.5 ? '1.5X' : '2X'}
                    </button>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-16 p-6 pb-14 z-50 pointer-events-none">
                    <div className="max-w-full pointer-events-auto">
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-3 mb-4"
                        >
                            <img src={reel.userPhoto} className="w-11 h-11 rounded-2xl border-2 border-white/20 shadow-2xl object-cover" alt="" />
                            <div>
                                <h4 className="font-black text-white text-base md:text-lg tracking-tight leading-none">{reel.userDisplayName}</h4>
                                <span className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mt-1 block">ACTIVE SANCHIT Wave</span>
                            </div>
                        </motion.div>
                        <p className="text-white font-medium text-xs md:text-sm leading-relaxed drop-shadow-2xl line-clamp-2">
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
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute inset-0 bg-[#050505]/98 backdrop-blur-3xl z-[100] flex flex-col rounded-t-[2.5rem] mt-24 border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
                        >
                            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 mb-2 cursor-pointer" onClick={() => setShowComments(false)} />
                            <header className="px-8 py-4 flex justify-between items-center bg-white/[0.02]">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-white italic">Reactions</h3>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{reel.comments?.length || 0} Responses</p>
                                </div>
                                <button onClick={() => setShowComments(false)} className="bg-white/5 p-3 rounded-2xl text-gray-400 hover:text-white transition-colors border border-white/5"><X size={20} /></button>
                            </header>
                            
                            <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-6 no-scrollbar">
                                {reel.comments?.length > 0 ? reel.comments.map((c, i) => (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 shrink-0 flex items-center justify-center font-black text-primary text-xl uppercase border border-white/10">
                                            {c.author?.[0]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-black text-white text-xs md:text-sm">{c.author}</span>
                                                <span className="text-[10px] text-gray-600 font-bold">{new Date(c.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-medium">{c.text}</p>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-20 py-20">
                                        <MessageSquare size={64} className="mb-4" />
                                        <p className="font-black uppercase tracking-widest">No wave reflections yet</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-black border-t border-white/10 pb-12">
                                <div className="flex gap-4 max-w-lg mx-auto">
                                    <input 
                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-secondary transition-all font-medium text-sm"
                                        placeholder="Add to the pulse..."
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && commentMutation.mutate()}
                                    />
                                    <button onClick={() => commentMutation.mutate()} className="bg-secondary text-black w-14 h-14 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                                        <Send size={24} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default function Reels() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [globalMuted, setGlobalMuted] = useState(true);
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

    // Global click listener to handle browser auto-play restrictions
    useEffect(() => {
        const firstClick = () => {
            setGlobalMuted(false);
            window.removeEventListener('mousedown', firstClick);
        };
        window.addEventListener('mousedown', firstClick);
        return () => window.removeEventListener('mousedown', firstClick);
    }, []);

    return (
        <div className="fixed inset-0 bg-black overflow-hidden select-none">
            {/* Logo Overlay - Renamed to Sanchit */}
            <div className="absolute top-10 left-10 z-50 pointer-events-none hidden md:block">
                <h2 className="text-4xl font-display font-black text-white italic tracking-tighter drop-shadow-2xl">Sanchit<span className="text-secondary">.</span></h2>
            </div>

            {/* Launch Action */}
            <motion.button 
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUploadOpen(true)}
                className="fixed bottom-28 md:bottom-12 right-6 md:right-12 w-16 h-16 md:w-20 md:h-20 bg-primary text-black rounded-3xl shadow-[0_20px_40px_rgba(234,179,8,0.3)] flex items-center justify-center z-[80] border-4 border-black group"
            >
                <Plus size={36} strokeWidth={4} className="group-hover:rotate-90 transition-transform duration-500" />
            </motion.button>

            {/* Main Scrolling Container */}
            <div 
                onScroll={handleScroll}
                className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar overscroll-none"
            >
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 bg-black">
                        <motion.div 
                            animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} 
                            className="w-16 h-16 border-4 border-white/5 border-t-primary rounded-full shadow-[0_0_40px_rgba(234,179,8,0.2)]" 
                        />
                        <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Waves</p>
                    </div>
                ) : (
                    reels?.length > 0 ? reels.map((reel, i) => (
                        <VideoPlayer 
                            key={reel._id} 
                            reel={reel} 
                            isActive={i === activeIndex} 
                            currentUser={currentUser}
                            globalMuted={globalMuted}
                            setGlobalMuted={setGlobalMuted}
                        />
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#050505]">
                             <Upload size={80} className="text-white/5 mb-8" />
                             <h3 className="text-4xl font-black text-white mb-4 italic tracking-tighter">Zero Connection<span className="text-primary">.</span></h3>
                             <p className="text-gray-500 max-w-sm font-medium leading-relaxed">The campus is silent. Be the catalyst. Launch a Sanchit wave and broadcast your frequency to the tribe.</p>
                             <button onClick={() => setIsUploadOpen(true)} className="mt-8 bg-white text-black font-black px-10 py-4 rounded-2xl hover:bg-primary transition-all active:scale-95">BREACH THE SILENCE</button>
                        </div>
                    )
                )}
            </div>

            <AnimatePresence>
                {isUploadOpen && <UploadReelModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={handleUpload} />}
            </AnimatePresence>
        </div>
    );
}
