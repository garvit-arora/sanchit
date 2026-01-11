import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Pause, Play, Plus, Upload } from 'lucide-react';
import { fetchReels, uploadReel } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

const VideoPlayer = ({ reel, isActive, currentUser }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

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

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div className="relative w-full h-[85vh] md:h-[600px] bg-black rounded-3xl overflow-hidden group">
            <video
                ref={videoRef}
                src={reel.url}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                playsInline
                onClick={togglePlay}
            />
            
            {/* Play/Pause Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <Play className="text-white fill-white opacity-50" size={64} />
                </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <img src={reel.userPhoto || "https://ui-avatars.com/api/?name=User"} className="w-8 h-8 rounded-full bg-white/20" />
                             <span className="font-bold text-white">{reel.userDisplayName}</span>
                        </div>
                        <p className="text-white/90 text-sm line-clamp-2">{reel.description}</p>
                    </div>
                </div>
            </div>

            {/* Sidebar Actions */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center">
                 <button className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-surface/50 backdrop-blur-md flex items-center justify-center">
                        <Heart className="text-white" size={20} />
                    </div>
                    <span className="text-xs font-bold text-white">{reel.likes?.length || 0}</span>
                 </button>
                 <button className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-surface/50 backdrop-blur-md flex items-center justify-center">
                        <MessageCircle className="text-white" size={20} />
                    </div>
                    <span className="text-xs font-bold text-white">0</span>
                 </button>
                 <button onClick={() => setIsMuted(!isMuted)}>
                     <div className="w-10 h-10 rounded-full bg-surface/50 backdrop-blur-md flex items-center justify-center">
                        {isMuted ? <VolumeX className="text-white" size={20} /> : <Volume2 className="text-white" size={20} />}
                     </div>
                 </button>
            </div>
        </div>
    );
};

export default function Reels() {
    const [activeIndex, setActiveIndex] = useState(0);
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    
    const { data: reels, isLoading } = useQuery({
        queryKey: ['reels'],
        queryFn: fetchReels
    });

    // Mock Upload Logic
    const handleUpload = async () => {
        const url = prompt("Enter Video URL (mp4):");
        if(url) {
            const desc = prompt("Enter Description:");
            try {
                await uploadReel(url, desc, currentUser);
                await queryClient.invalidateQueries(['reels']);
                alert("Reel launched! 🚀");
            } catch (err) {
                alert("Upload failed.");
            }
        }
    };

    const handleScroll = (e) => {
        const index = Math.round(e.target.scrollTop / e.target.clientHeight);
        if (index !== activeIndex && index < (reels?.length || 0)) {
            setActiveIndex(index);
        }
    };

    if (isLoading) return <div className="text-center p-20 text-white">Loading Reels...</div>;

    return (
        <div className="relative h-full w-full max-w-md mx-auto">
            {/* Upload Button */}
            <button 
                onClick={handleUpload}
                className="absolute top-4 right-4 z-50 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30 transition-colors"
            >
                <Plus size={24} />
            </button>

            <div className="h-[85vh] md:h-[600px] w-full overflow-y-scroll snap-y snap-mandatory rounded-3xl no-scrollbar" onScroll={handleScroll}>
                {reels?.length > 0 ? reels.map((reel, i) => (
                    <div key={reel._id} className="h-full w-full snap-start p-2">
                        <VideoPlayer reel={reel} isActive={i === activeIndex} currentUser={currentUser} />
                    </div>
                )) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        No Reels yet. Be the first to upload!
                    </div>
                )}
            </div>
        </div>
    );
}
