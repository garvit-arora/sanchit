import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Volume2, VolumeX, Play, Plus, Upload, Loader2, X, Send, Share2, Music } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReels, uploadReel, likeReel, addReelComment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UploadReelModal from '../components/UploadReelModal';

const VideoPlayer = ({ reel, isActive, currentUser, globalMuted, setGlobalMuted }) => {
    const videoRef = useRef(null);
    const queryClient = useQueryClient();
    const [isPlaying, setIsPlaying] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [progress, setProgress] = useState(0);
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isActive) {
            video.currentTime = 0;
            const playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                        setVideoError(false);
                    })
                    .catch(error => {
                        console.log("Autoplay prevented:", error);
                        setIsPlaying(false);
                    });
            }
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = globalMuted;
        }
    }, [globalMuted]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(isNaN(p) ? 0 : p);
        }
    };

    const handleVideoError = (e) => {
        console.error("Video error:", e);
        setVideoError(true);
    };

    const togglePlay = (e) => {
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().then(() => setIsPlaying(true)).catch(console.error);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const likeMutation = useMutation({
        mutationFn: () => likeReel(reel._id, currentUser.uid),
        onSuccess: () => queryClient.invalidateQueries(['reels'])
    });

    const commentMutation = useMutation({
        mutationFn: async () => {
            if (!commentText.trim()) return;
            await addReelComment(reel._id, commentText, currentUser.displayName, currentUser.uid);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['reels']);
            setCommentText('');
        }
    });

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim()) {
            commentMutation.mutate();
        }
    };

    const hasLiked = reel.likes?.includes(currentUser?.uid);

    return (
        <div className="relative w-full h-[100dvh] bg-black snap-start snap-always overflow-hidden">
            {/* Desktop Layout - Side by Side */}
            <div className="hidden md:flex h-full items-center justify-center gap-8 px-8">
                {/* Video Container */}
                <div className="relative w-full max-w-[450px] h-[90vh] bg-black rounded-3xl overflow-hidden shadow-2xl">
                    {videoError ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-white px-8">
                            <X size={64} className="text-red-500" />
                            <p className="text-lg font-bold text-center">Video failed to load</p>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                src={reel.url}
                                className="w-full h-full object-cover"
                                loop
                                muted={globalMuted}
                                playsInline
                                webkit-playsinline="true"
                                onTimeUpdate={handleTimeUpdate}
                                onError={handleVideoError}
                                onClick={togglePlay}
                                crossOrigin="anonymous"
                            />

                            <AnimatePresence>
                                {!isPlaying && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.8 }} 
                                        animate={{ opacity: 1, scale: 1 }} 
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                                    >
                                        <div className="w-20 h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl">
                                            <Play className="text-white fill-white ml-1" size={40} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 z-50">
                                <div className="h-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-6 z-30 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center gap-3 mb-2">
                                    <img src={reel.userPhoto || `https://ui-avatars.com/api/?name=${reel.userDisplayName}`} className="w-10 h-10 rounded-full border-2 border-white" alt="" />
                                    <h4 className="text-white font-bold text-base">@{reel.userDisplayName}</h4>
                                </div>
                                {reel.description && <p className="text-white text-sm line-clamp-2">{reel.description}</p>}
                                {reel.song && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Music size={14} className="text-white" />
                                        <p className="text-white text-xs">{reel.song.title} - {reel.song.artist}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar - Always Visible on Desktop */}
                <div className="flex flex-col gap-6 items-center">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => likeMutation.mutate()} className="flex flex-col items-center gap-2">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${hasLiked ? 'bg-red-500' : 'bg-white/20 backdrop-blur-md'}`}>
                            <Heart size={28} className={`${hasLiked ? 'fill-white text-white' : 'text-white'}`} />
                        </div>
                        <span className="text-white text-sm font-bold">{reel.likes?.length || 0}</span>
                    </motion.button>

                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowComments(true)} className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                            <MessageCircle size={28} className="text-white" />
                        </div>
                        <span className="text-white text-sm font-bold">{reel.comments?.length || 0}</span>
                    </motion.button>

                    <motion.button whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                            <Share2 size={26} className="text-white" />
                        </div>
                    </motion.button>

                    <motion.div animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" }} className="w-14 h-14 rounded-full border-2 border-white overflow-hidden shadow-lg">
                        <img src={reel.userPhoto || `https://ui-avatars.com/api/?name=${reel.userDisplayName}`} className="w-full h-full object-cover" alt="" />
                    </motion.div>
                </div>
            </div>

            {/* Mobile Layout - Stacked */}
            <div className="md:hidden flex flex-col h-full">
                {/* Video */}
                <div className="relative flex-1 bg-black">
                    {videoError ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-white px-8">
                            <X size={64} className="text-red-500" />
                            <p className="text-lg font-bold text-center">Video failed to load</p>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                src={reel.url}
                                className="w-full h-full object-cover"
                                loop
                                muted={globalMuted}
                                playsInline
                                webkit-playsinline="true"
                                onTimeUpdate={handleTimeUpdate}
                                onError={handleVideoError}
                                onClick={togglePlay}
                                crossOrigin="anonymous"
                            />

                            <AnimatePresence>
                                {!isPlaying && (
                                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                        <div className="w-20 h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl">
                                            <Play className="text-white fill-white ml-1" size={40} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 z-50">
                                <div className="h-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 z-30 bg-gradient-to-t from-black/90 to-transparent">
                                <div className="flex items-center gap-2 mb-2">
                                    <img src={reel.userPhoto || `https://ui-avatars.com/api/?name=${reel.userDisplayName}`} className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                                    <h4 className="text-white font-bold text-sm">@{reel.userDisplayName}</h4>
                                </div>
                                {reel.description && <p className="text-white text-xs line-clamp-2 mb-1">{reel.description}</p>}
                                {reel.song && (
                                    <div className="flex items-center gap-2">
                                        <Music size={12} className="text-white" />
                                        <p className="text-white text-xs">{reel.song.title} - {reel.song.artist}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar Below Video on Mobile */}
                <div className="bg-black border-t border-white/10 p-4 pb-24">
                    <div className="flex justify-around items-center max-w-md mx-auto">
                        <button onClick={() => likeMutation.mutate()} className="flex flex-col items-center gap-1">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasLiked ? 'bg-red-500' : 'bg-white/20'}`}>
                                <Heart size={24} className={`${hasLiked ? 'fill-white text-white' : 'text-white'}`} />
                            </div>
                            <span className="text-white text-xs font-bold">{reel.likes?.length || 0}</span>
                        </button>

                        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <MessageCircle size={24} className="text-white" />
                            </div>
                            <span className="text-white text-xs font-bold">{reel.comments?.length || 0}</span>
                        </button>

                        <button className="flex flex-col items-center gap-1">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <Share2 size={22} className="text-white" />
                            </div>
                            <span className="text-white text-xs font-bold">Share</span>
                        </button>

                        <motion.div animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" }} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                            <img src={reel.userPhoto || `https://ui-avatars.com/api/?name=${reel.userDisplayName}`} className="w-full h-full object-cover" alt="" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Comments Drawer */}
            <AnimatePresence>
                {showComments && (
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-0 bg-white z-[100] flex flex-col"
                    >
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                            <h3 className="text-base font-bold">Comments</h3>
                            <button onClick={() => setShowComments(false)} className="p-1">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-3 pb-24">
                            {reel.comments && reel.comments.length > 0 ? (
                                <div className="space-y-4">
                                    {reel.comments.map((comment, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {comment.author?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm leading-relaxed">
                                                    <span className="font-semibold mr-2">{comment.author}</span>
                                                    {comment.text}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1.5">
                                                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                                    <MessageCircle size={48} className="mb-3 opacity-30" />
                                    <p className="text-sm font-semibold">No comments yet</p>
                                    <p className="text-xs mt-1">Be the first to comment!</p>
                                </div>
                            )}
                        </div>

                        {/* Comment Input - Fixed at Bottom, Above Mobile Nav */}
                        <form onSubmit={handleCommentSubmit} className="fixed bottom-0 left-0 right-0 p-4 pb-24 md:pb-4 border-t border-gray-200 bg-white z-10">
                            <div className="flex items-center gap-2 max-w-2xl mx-auto">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 px-3 py-2 text-sm outline-none border border-gray-300 rounded-full"
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim() || commentMutation.isPending}
                                    className="text-blue-500 font-semibold text-sm disabled:opacity-40 px-4 py-2"
                                >
                                    {commentMutation.isPending ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function Reels() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [globalMuted, setGlobalMuted] = useState(true);
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const containerRef = useRef(null);
    
    const { data: reels, isLoading, error } = useQuery({
        queryKey: ['reels'],
        queryFn: fetchReels,
        refetchInterval: 10000
    });

    const handleUpload = async (url, desc, song) => {
        try {
            await uploadReel(url, desc, currentUser, song);
            queryClient.invalidateQueries(['reels']);
            setIsUploadOpen(false);
            return true;
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed: " + err.message);
            throw err;
        }
    };

    const handleScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        const clientHeight = e.target.clientHeight;
        const newIndex = Math.round(scrollTop / clientHeight);
        
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < (reels?.length || 0)) {
            setActiveIndex(newIndex);
        }
    };

    useEffect(() => {
        const handleFirstInteraction = () => {
            setGlobalMuted(false);
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
        };

        window.addEventListener('click', handleFirstInteraction);
        window.addEventListener('touchstart', handleFirstInteraction);

        return () => {
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-white" size={48} />
                    <p className="text-white font-bold">Loading Reels...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-white px-8">
                    <X size={64} className="text-red-500" />
                    <p className="font-bold text-center">Failed to load reels</p>
                    <button onClick={() => queryClient.invalidateQueries(['reels'])} className="px-6 py-2 bg-white text-black rounded-full font-bold">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black">
            <button onClick={() => setGlobalMuted(!globalMuted)} className="fixed top-4 right-4 z-50 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
                {globalMuted ? <VolumeX size={24} className="text-white" /> : <Volume2 size={24} className="text-white" />}
            </button>

            <button onClick={() => setIsUploadOpen(true)} className="fixed top-4 left-4 z-50 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Plus size={24} className="text-black" />
            </button>

            <div ref={containerRef} onScroll={handleScroll} className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {reels && reels.length > 0 ? (
                    reels.map((reel, index) => (
                        <VideoPlayer key={reel._id} reel={reel} isActive={index === activeIndex} currentUser={currentUser} globalMuted={globalMuted} setGlobalMuted={setGlobalMuted} />
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white p-8 text-center">
                        <Upload size={64} className="mb-4 opacity-50" />
                        <h2 className="text-2xl font-bold mb-2">No Reels Yet</h2>
                        <p className="text-gray-400 mb-6">Be the first to upload a reel!</p>
                        <button onClick={() => setIsUploadOpen(true)} className="px-8 py-3 bg-white text-black rounded-full font-bold">
                            Upload Reel
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isUploadOpen && <UploadReelModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={handleUpload} />}
            </AnimatePresence>

            <style jsx>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
