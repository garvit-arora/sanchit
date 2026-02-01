import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Volume2, VolumeX, Play, Plus, Upload, Loader2, X, Send, Share2, Music, Smile, ArrowLeft, MoreVertical } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReels, uploadReel, likeReel, addReelComment, updateReel } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import UploadReelModal from '../components/UploadReelModal';
import UserAvatar from '../components/UserAvatar';
import { notify } from '../utils/notify';

const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '🤩', '😭', '😱', '🔥', '❤️', '👍', '👏', '🙌', '💯', '✨', '🎉'];

const EmojiPicker = ({ onSelect }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <button type="button" onClick={() => setShow(!show)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Smile size={20} className="text-gray-500" />
            </button>
            {show && (
                <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 grid grid-cols-8 gap-2 z-50">
                    {EMOJIS.map((emoji, idx) => (
                        <button key={idx} type="button" onClick={() => { onSelect(emoji); setShow(false); }} className="text-2xl hover:scale-125 transition-transform">
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const VideoPlayer = ({ reel, isActive, shouldRenderVideo, currentUser, globalMuted, showComments, setShowComments, commentText, setCommentText }) => {
    const videoRef = useRef(null);
    const queryClient = useQueryClient();
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editDescription, setEditDescription] = useState(reel?.description || '');
    const isLiked = reel.likes?.includes(currentUser?.uid);

    // Add missing state variables for editing
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editDescription.trim()) return;
        
        try {
            await updateReel(reel._id, editDescription);
            setIsEditing(false);
            queryClient.invalidateQueries(['reels']);
        } catch (error) {
            console.error('Failed to update reel:', error);
        }
    };

    // 1. Force Mute Sync immediately
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = globalMuted;
        }
    }, [globalMuted]);

    // 2. ROBUST AUTOPLAY LOGIC
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !shouldRenderVideo) return;

        let playPromise;

        const handlePlayback = async () => {
            try {
                // Ensure state matches global preference
                video.muted = globalMuted;

                if (isActive) {
                    // Only play if paused to avoid promise stacking
                    if (video.paused) {
                        playPromise = video.play();
                        if (playPromise !== undefined) {
                            await playPromise;
                            setIsPlaying(true);
                        }
                    }
                } else {
                    video.pause();
                    setIsPlaying(false);
                }
            } catch (error) {
                console.error("Video playback error:", error);
                // Handle specific errors gracefully
                if (error.name === 'NotAllowedError') {
                    // Autoplay was prevented, user interaction needed
                    console.warn("Autoplay prevented - user interaction required");
                    setIsPlaying(false);
                } else if (error.name === 'NotSupportedError') {
                    console.warn("Video format not supported");
                    setIsPlaying(false);
                } else {
                    // Generic fallback
                    setIsPlaying(false);
                }
            }
        };

        handlePlayback();

        return () => {
            if (playPromise !== undefined) {
                playPromise.catch(() => {}); // Suppress unhandled promise rejection
            }
        };
    }, [isActive, globalMuted, shouldRenderVideo]);

    // 3. PROGRESS TRACKING
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            if (video.duration) {
                setProgress((video.currentTime / video.duration) * 100);
            }
        };

        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('loadedmetadata', () => setIsReady(true));
        video.addEventListener('ended', () => {
            setIsPlaying(false);
            video.currentTime = 0; // Reset for loop
        });

        return () => {
            video.removeEventListener('timeupdate', updateProgress);
            video.removeEventListener('loadedmetadata', () => setIsReady(true));
            video.removeEventListener('ended', () => setIsPlaying(false));
        };
    }, []);

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
            setIsPlaying(false);
        } else {
            video.play().then(() => {
                setIsPlaying(true);
            }).catch(error => {
                console.error("Play failed:", error);
            });
        }
    };

    const handleLike = async () => {
        if (!currentUser) {
            notify('Please login to like reels', 'warning');
            return;
        }

        try {
            await likeReel(reel._id, currentUser.uid);
            queryClient.invalidateQueries(['reels']);
        } catch (error) {
            console.error('Failed to like reel:', error);
        }
    };

    const handleComment = () => {
        setShowComments(true);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out this reel',
                    text: reel.description,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            notify('Link copied to clipboard!', 'success');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !currentUser) return;

        try {
            await addReelComment(reel._id, commentText, currentUser.displayName || 'User', currentUser.uid);
            setCommentText('');
            queryClient.invalidateQueries(['reels']);
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    return (
        <div className="relative h-full w-full bg-black rounded-2xl overflow-hidden group">
            {/* Video Element */}
            <video
                ref={videoRef}
                src={reel.url}
                className="w-full h-full object-cover"
                loop
                playsInline
                preload="metadata"
                onClick={togglePlayPause}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Play/Pause Button */}
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
            )}

            <AnimatePresence>
                {(!isPlaying && isReady) && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={togglePlayPause}
                        className="absolute inset-0 flex items-center justify-center pointer-events-auto"
                    >
                        <div className="w-20 h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all">
                            <Play className="w-10 h-10 text-white ml-1" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 z-50">
                <div className="h-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-30 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-3 mb-2 z-50 relative pointer-events-auto">
                    <Link to={`/user/${reel.userId}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <UserAvatar src={reel.userPhoto} name={reel.userDisplayName} size="sm" className="border-2 border-white" />
                        <h4 className="text-white font-bold text-base">@{reel.userDisplayName}</h4>
                    </Link>
                </div>
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="mb-2 z-50 relative pointer-events-auto" onClick={e => e.stopPropagation()}>
                        <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-white"
                            autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                            <button type="submit" className="text-xs bg-primary text-black px-2 py-1 rounded font-bold">Save</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="text-xs bg-white/20 text-white px-2 py-1 rounded">Cancel</button>
                        </div>
                    </form>
                ) : (
                    reel.description && <p className="text-white text-sm line-clamp-2">{reel.description}</p>
                )}
                {reel.song && (
                    <div className="flex items-center gap-2 mt-2">
                        <Music size={14} className="text-white" />
                        <p className="text-white text-xs">{reel.song.title} - {reel.song.artist}</p>
                    </div>
                )}
            </div>
            
            {/* 3-Dot Menu */}
            {(currentUser?.uid === reel.userId || currentUser?.email === 'garvit.university@gmail.com') && (
                <div className="absolute top-4 right-4 z-50">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                    >
                        <MoreVertical size={20} />
                    </button>
                </div>
            )}

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col gap-4 z-40">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLike}
                    className="flex flex-col items-center gap-1"
                >
                    <Heart
                        size={28}
                        className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white hover:text-red-400'}`}
                    />
                    <span className="text-white text-xs font-bold">{reel.likes?.length || 0}</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleComment}
                    className="flex flex-col items-center gap-1"
                >
                    <MessageCircle size={28} className="text-white hover:text-blue-400 transition-colors" />
                    <span className="text-white text-xs font-bold">{reel.comments?.length || 0}</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="flex flex-col items-center gap-1"
                >
                    <Share2 size={28} className="text-white hover:text-green-400 transition-colors" />
                    <span className="text-white text-xs font-bold">Share</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setGlobalMuted(!globalMuted)}
                    className="flex flex-col items-center gap-1"
                >
                    {globalMuted ? (
                        <VolumeX size={28} className="text-white hover:text-purple-400 transition-colors" />
                    ) : (
                        <Volume2 size={28} className="text-white hover:text-purple-400 transition-colors" />
                    )}
                    <span className="text-white text-xs font-bold">{globalMuted ? 'Unmute' : 'Mute'}</span>
                </motion.button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg rounded-t-3xl p-4 z-50 max-h-[60vh] overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold text-lg">Comments</h3>
                            <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                            {reel.comments?.map((comment) => (
                                <div key={comment._id || comment.createdAt} className="flex gap-3">
                                    <UserAvatar name={comment.author} size="xs" />
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-semibold">{comment.author}</p>
                                        <p className="text-gray-300 text-sm">{comment.text}</p>
                                        <p className="text-gray-500 text-xs mt-1">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleCommentSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button type="submit" disabled={!commentText.trim()} className="bg-primary text-black rounded-full p-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <Send size={16} />
                            </button>
                            <EmojiPicker onSelect={(emoji) => setCommentText(prev => prev + emoji)} />
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
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: reels, isLoading, error } = useQuery({
        queryKey: ['reels'],
        queryFn: fetchReels,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    });

    const uploadMutation = useMutation({
        mutationFn: ({ url, description, song }) => uploadReel(url, description, currentUser, song),
        onSuccess: () => {
            queryClient.invalidateQueries(['reels']);
            setIsUploadOpen(false);
        },
        onError: (error) => {
            console.error('Upload failed:', error);
            notify('Failed to upload reel. Please try again.', 'error');
        },
    });

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                setShowComments(false);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handleScroll = (e) => {
        const scrollTop = e.currentTarget.scrollTop;
        const containerHeight = e.currentTarget.clientHeight;
        const newIndex = Math.round(scrollTop / containerHeight);
        
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < (reels?.length || 0)) {
            setActiveIndex(newIndex);
        }
    };

    const handleUpload = async (url, description, song) => {
        if (!currentUser) {
            notify('Please login to upload reels', 'warning');
            return;
        }
        try {
            await uploadMutation.mutateAsync({ url, description, song });
        } catch (error) {
            console.error('Upload error:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <div className="text-center">
                    <p className="text-xl mb-4">Failed to load reels</p>
                    <button 
                        onClick={() => queryClient.invalidateQueries(['reels'])}
                        className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!reels || reels.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <div className="text-center">
                    <p className="text-xl mb-4">No reels available</p>
                    <p className="text-gray-400 mb-6">Be the first to create one!</p>
                    <button 
                        onClick={() => setIsUploadOpen(true)}
                        className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <Plus size={20} />
                        Create Reel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black relative">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)}
                        className="text-white hover:text-gray-300 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-white font-bold text-xl">Reels</h1>
                    <button 
                        onClick={() => setIsUploadOpen(true)}
                        className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <Upload size={16} />
                        Upload
                    </button>
                </div>
            </div>

            {/* Reels Container */}
            <div 
                className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide"
                onScroll={handleScroll}
            >
                {reels.map((reel, index) => (
                    <div key={reel._id} className="h-screen snap-start flex items-center justify-center">
                        <VideoPlayer 
                            reel={reel} 
                            isActive={index === activeIndex}
                            shouldRenderVideo={Math.abs(index - activeIndex) <= 1} // Only render current and adjacent videos
                            currentUser={currentUser}
                            globalMuted={globalMuted}
                            showComments={showComments}
                            setShowComments={setShowComments}
                            commentText={commentText}
                            setCommentText={setCommentText}
                        />
                    </div>
                ))}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadOpen && (
                    <UploadReelModal 
                        isOpen={isUploadOpen} 
                        onClose={() => setIsUploadOpen(false)}
                        onUpload={handleUpload}
                        isUploading={uploadMutation.isPending}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
