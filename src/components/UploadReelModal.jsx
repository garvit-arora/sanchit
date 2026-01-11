import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Film, Link as LinkIcon, AlertCircle, AlertTriangle } from 'lucide-react';

export default function UploadReelModal({ isOpen, onClose, onUpload }) {
    const [url, setUrl] = useState('');
    const [uploadMode, setUploadMode] = useState('file'); // Default to 'file' for better UX
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                setError("File too large. Maximum size is 50MB.");
                return;
            }
            
            // Check if it's a video
            if (!file.type.startsWith('video/')) {
                setError("Please select a video file.");
                return;
            }

            setError('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateUrl = (urlString) => {
        // Check if it's a YouTube link
        if (urlString.includes('youtube.com') || urlString.includes('youtu.be')) {
            setError('YouTube links are not supported. Please upload a video file or use a direct video link (.mp4, .webm)');
            return false;
        }

        // Check if it ends with a video extension
        const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
        const hasVideoExtension = videoExtensions.some(ext => urlString.toLowerCase().includes(ext));
        
        if (!hasVideoExtension) {
            setError('Please use a direct video link ending with .mp4, .webm, etc.');
            return false;
        }

        setError('');
        return true;
    };

    const handleUrlChange = (e) => {
        const newUrl = e.target.value;
        setUrl(newUrl);
        if (newUrl) {
            validateUrl(newUrl);
        } else {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!url) return;

        // Final validation for URL mode
        if (uploadMode === 'link' && !validateUrl(url)) {
            return;
        }
        
        setIsLoading(true);
        setError('');
        try {
            await onUpload(url, description);
            setUrl('');
            setDescription('');
            setError('');
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Upload failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <Film className="text-yellow-400" size={28} />
                        Upload Reel
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Important Notice */}
                <div className="mx-6 mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
                    <div className="flex gap-3">
                        <AlertTriangle className="text-yellow-400 flex-shrink-0" size={20} />
                        <div>
                            <p className="text-yellow-200 text-sm font-bold mb-1">Important:</p>
                            <ul className="text-yellow-100/80 text-xs space-y-1">
                                <li>• YouTube/Instagram links are NOT supported</li>
                                <li>• Upload video files directly (recommended)</li>
                                <li>• Or use direct video links (.mp4, .webm)</li>
                                <li>• Vertical videos (9:16) work best!</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Mode Toggle */}
                <div className="flex p-2 bg-black/30 m-6 rounded-2xl">
                    <button 
                        onClick={() => { setUploadMode('file'); setUrl(''); setError(''); }}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${uploadMode === 'file' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        📁 Upload File
                    </button>
                    <button 
                        onClick={() => { setUploadMode('link'); setUrl(''); setError(''); }}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${uploadMode === 'link' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        🔗 Video Link
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                    {/* Upload Area */}
                    {uploadMode === 'file' ? (
                        <div>
                            <label className="text-gray-300 text-sm font-bold mb-2 block">Select Video File</label>
                            <div className="relative border-2 border-dashed border-white/20 rounded-2xl p-10 hover:border-yellow-400/50 transition-colors text-center bg-white/5 cursor-pointer">
                                <input 
                                    type="file" 
                                    accept="video/mp4,video/webm,video/mov,video/avi"
                                    required
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Upload className="mx-auto text-gray-400 mb-3" size={40} />
                                <p className="text-white font-bold mb-1">Click to upload video</p>
                                <p className="text-gray-400 text-sm">MP4, WEBM, MOV (max 50MB)</p>
                                {url && <p className="text-yellow-400 text-sm mt-3 font-bold">✓ Video Selected</p>}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="text-gray-300 text-sm font-bold mb-2 block">Direct Video URL</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input 
                                    type="url" 
                                    required
                                    value={url}
                                    onChange={handleUrlChange}
                                    className="w-full bg-black/50 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-yellow-400 transition-all"
                                    placeholder="https://example.com/video.mp4"
                                />
                            </div>
                            <p className="text-gray-500 text-xs mt-2 ml-2">
                                Example: https://example.com/myvideo.mp4
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl"
                        >
                            <div className="flex gap-3">
                                <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                                <p className="text-red-200 text-sm font-medium">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Caption */}
                    <div>
                        <label className="text-gray-300 text-sm font-bold mb-2 block">Caption (Optional)</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 rounded-2xl p-4 text-white outline-none focus:border-yellow-400 transition-all min-h-[100px] resize-none"
                            placeholder="Write something cool..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={isLoading || !url || !!error}
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-yellow-500/50 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                >
                                    <Upload size={20} />
                                </motion.div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={20} />
                                Upload Reel
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
