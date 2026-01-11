import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Film, Link as LinkIcon, AlertCircle } from 'lucide-react';

export default function UploadReelModal({ isOpen, onClose, onUpload }) {
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!url) return;
        
        setIsLoading(true);
        try {
            await onUpload(url, description);
            setUrl('');
            setDescription('');
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-surface border border-white/10 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-2xl font-display font-black text-white flex items-center gap-3 italic">
                        <Film className="text-secondary" /> Launch Reel
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="text-gray-400 text-sm font-bold ml-2 mb-2 block">Video URL (Direct link to .mp4)</label>
                        <div className="relative group">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-secondary transition-colors" size={20} />
                            <input 
                                type="url" 
                                required
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-secondary transition-all"
                                placeholder="https://example.com/video.mp4"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 ml-2 flex items-center gap-1">
                            <AlertCircle size={10} /> Tip: Use a direct link from Imgur, Firebase, or S3.
                        </p>
                    </div>

                    <div>
                        <label className="text-gray-400 text-sm font-bold ml-2 mb-2 block">Caption</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-secondary transition-all min-h-[120px] resize-none"
                            placeholder="What's the vibe?"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || !url}
                        className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-secondary hover:text-white transition-all transform active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                                <Upload size={20} />
                            </motion.div>
                        ) : (
                            <>
                                <Upload size={20} /> Launch to Pulse
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
