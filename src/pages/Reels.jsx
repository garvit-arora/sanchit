import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Volume2, VolumeX, Play, Plus, Upload, Loader2, X, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReels, uploadReel, likeReel, addReelComment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UploadReelModal from '../components/UploadReelModal';

const VideoPlayer = ({ reel, isActive, currentUser }) => {
    const videoRef = useRef(null);
    const queryClient = useQueryClient();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [progress, setProgress] = useState(0);
    const [videoError, setVideoError] = useState(false);

    // Handle video playback when active
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

    const toggleMute = (e) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
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

    // Convert YouTube Shorts URL to embed if needed
    const getVideoUrl = (url) => {
        if (!url) return '';
        
        // Check if it's a YouTube Shorts URL
        if (url.includes('youtube.com/shorts/') || url.includes('youtu.be/')) {
            const videoId = url.includes('shorts/') 
                ? url.split('shorts/')[1].split('?')[0]
                : url.split('youtu.be/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
        }
        
        return url;
    };

    const videoUrl = getVideoUrl(reel.url);
    const isYouTube = videoUrl.includes('youtube.com/embed');

    return (
        <div className="relative w-full h-[100dvh] bg-black snap-start snap-always overflow-hidden">
            {/* Video Container */}
            <div className="absolute inset-0 flex items-center justify-center">
                {isYouTube ? (
                    <iframe
                        src={videoUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : videoError ? (
                    <div className="flex flex-col items-center justify-center gap-4 text-white">
                        <X size={64} className="text-red-500" />
                        <p className="text-lg font-bold">Video failed to load</p>
                        <p className="text-sm text-gray-400">URL: {reel.url}</p>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        src={reel.url}
                        className="w-full h-full object-contain"
                        loop
                        muted={isMuted}
                        playsInline
                        webkit-playsinline="true"
                        onTimeUpdate={handleTimeUpdate}
                        onError={handleVideoError}
                        onClick={togglePlay}
                        crossOrigin="anonymous"
                    />
                )}
            </div>

            {/* Play/Pause Overlay */}
            {!isYouTube && !isPlaying && !videoError && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                >
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <Play className="text-white fill-white ml-1" size={40} />
                    </div>
                </motion.div>
            )}

            {/* Progress Bar */}
            {!isYouTube && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-50">
                    <div 
                        className="h-full bg-white transition-all duration-100"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-40">
                {/* Like Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); likeMutation.mutate(); }}
                    className="flex flex-col items-center gap-1"
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        hasLiked ? 'bg-red-500' : 'bg-white/20 backdrop-blur-md'
                    }`}>
                        <Heart size={24} className={`${hasLiked ? 'fill-white text-white' : 'text-white'}`} />
                    </div>
                    <span className="text-white text-xs font-bold">{reel.likes?.length || 0}</span>
                </button>

                {/* Comment Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
                    className="flex flex-col items-center gap-1"
                >
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <MessageCircle size={24} className="text-white" />
                    </div>
                    <span className="text-white text-xs font-bold">{reel.comments?.length || 0}</span>
                </button>

                {/* Mute Button */}
                {!isYouTube && (
                    <button 
                        onClick={toggleMute}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                    >
                        {isMuted ? <VolumeX size={24} className="text-white" /> : <Volume2 size={24} className="text-white" />}
                    </button>
                )}
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-20 p-4 pb-6 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="flex items-center gap-3 mb-2">
                    <img 
                        src={reel.userPhoto || `https://ui-avatars.com/api/?name=${reel.userDisplayName}`} 
                        className="w-10 h-10 rounded-full border-2 border-white" 
                        alt={reel.userDisplayName}
                    />
                    <div>
                        <h4 className="text-white font-bold text-sm">{reel.userDisplayName}</h4>
                        <p className="text-gray-300 text-xs">{new Date(reel.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                {reel.description && (
                    <p className="text-white text-sm line-clamp-2">{reel.description}</p>
                )}
            </div>

            {/* Comments Drawer - Instagram Style */}
            <AnimatePresence>
                {showComments && (
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="absolute inset-0 bg-white z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold">Comments</h3>
                            <button onClick={() => setShowComments(false)} className="p-2">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {reel.comments && reel.comments.length > 0 ? (
                                reel.comments.map((comment, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {comment.author?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm">
                                                <span className="font-bold mr-2">{comment.author}</span>
                                                {comment.text}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <MessageCircle size={48} className="mb-2" />
                                    <p className="text-sm">No comments yet</p>
                                    <p className="text-xs">Be the first to comment!</p>
                                </div>
                            )}
                        </div>

                        {/* Comment Input */}
                        <form onSubmit={handleCommentSubmit} className="p-4 border-t border-gray-200 flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full outline-none focus:border-black"
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || commentMutation.isPending}
                                className="px-6 py-2 bg-black text-white rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {commentMutation.isPending ? 'Posting...' : 'Post'}
                            </button>
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
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const containerRef = useRef(null);
    
    const { data: reels, isLoading, error } = useQuery({
        queryKey: ['reels'],
        queryFn: fetchReels,
        refetchInterval: 10000 // Refetch every 10 seconds
    });

    const handleUpload = async (url, desc) => {
        try {
            await uploadReel(url, desc, currentUser);
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
                <div className="flex flex-col items-center gap-4 text-white">
                    <X size={64} className="text-red-500" />
                    <p className="font-bold">Failed to load reels</p>
                    <button 
                        onClick={() => queryClient.invalidateQueries(['reels'])}
                        className="px-6 py-2 bg-white text-black rounded-full font-bold"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-50 bg-gradient-to-b from-black/80 to-transparent">
                <h1 className="text-white text-2xl font-bold">Sanchit Reels</h1>
            </div>

            {/* Upload Button */}
            <button
                onClick={() => setIsUploadOpen(true)}
                className="fixed top-4 right-4 z-50 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
                <Plus size={24} className="text-black" />
            </button>

            {/* Reels Container */}
            <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {reels && reels.length > 0 ? (
                    reels.map((reel, index) => (
                        <VideoPlayer
                            key={reel._id}
                            reel={reel}
                            isActive={index === activeIndex}
                            currentUser={currentUser}
                        />
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white p-8 text-center">
                        <Upload size={64} className="mb-4 opacity-50" />
                        <h2 className="text-2xl font-bold mb-2">No Reels Yet</h2>
                        <p className="text-gray-400 mb-6">Be the first to upload a reel!</p>
                        <button
                            onClick={() => setIsUploadOpen(true)}
                            className="px-8 py-3 bg-white text-black rounded-full font-bold"
                        >
                            Upload Reel
                        </button>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadOpen && (
                    <UploadReelModal
                        isOpen={isUploadOpen}
                        onClose={() => setIsUploadOpen(false)}
                        onUpload={handleUpload}
                    />
                )}
            </AnimatePresence>

            <style jsx>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
