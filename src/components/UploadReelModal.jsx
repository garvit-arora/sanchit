import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Film, Check, Music, Search, ChevronRight } from 'lucide-react';

// Popular song library
const SONG_LIBRARY = [
    { id: 1, title: "Blinding Lights", artist: "The Weeknd", duration: "3:20" },
    { id: 2, title: "Shape of You", artist: "Ed Sheeran", duration: "3:53" },
    { id: 3, title: "Levitating", artist: "Dua Lipa", duration: "3:23" },
    { id: 4, title: "Peaches", artist: "Justin Bieber", duration: "3:18" },
    { id: 5, title: "Save Your Tears", artist: "The Weeknd", duration: "3:35" },
    { id: 6, title: "Good 4 U", artist: "Olivia Rodrigo", duration: "2:58" },
    { id: 7, title: "Stay", artist: "The Kid LAROI & Justin Bieber", duration: "2:21" },
    { id: 8, title: "Heat Waves", artist: "Glass Animals", duration: "3:58" },
    { id: 9, title: "As It Was", artist: "Harry Styles", duration: "2:47" },
    { id: 10, title: "Anti-Hero", artist: "Taylor Swift", duration: "3:20" },
    { id: 11, title: "Flowers", artist: "Miley Cyrus", duration: "3:20" },
    { id: 12, title: "Calm Down", artist: "Rema & Selena Gomez", duration: "3:59" },
    { id: 13, title: "Unholy", artist: "Sam Smith & Kim Petras", duration: "2:36" },
    { id: 14, title: "Cruel Summer", artist: "Taylor Swift", duration: "2:58" },
    { id: 15, title: "Vampire", artist: "Olivia Rodrigo", duration: "3:39" },
    { id: 16, title: "Sunflower", artist: "Post Malone & Swae Lee", duration: "2:38" },
    { id: 17, title: "Dance Monkey", artist: "Tones and I", duration: "3:29" },
    { id: 18, title: "Watermelon Sugar", artist: "Harry Styles", duration: "2:54" },
    { id: 19, title: "Circles", artist: "Post Malone", duration: "3:35" },
    { id: 20, title: "Don't Start Now", artist: "Dua Lipa", duration: "3:03" },
    { id: 21, title: "Señorita", artist: "Shawn Mendes & Camila Cabello", duration: "3:10" },
    { id: 22, title: "Bad Guy", artist: "Billie Eilish", duration: "3:14" },
    { id: 23, title: "Memories", artist: "Maroon 5", duration: "3:09" },
    { id: 24, title: "Believer", artist: "Imagine Dragons", duration: "3:24" },
    { id: 25, title: "Perfect", artist: "Ed Sheeran", duration: "4:23" },
    { id: 26, title: "Someone You Loved", artist: "Lewis Capaldi", duration: "3:02" },
    { id: 27, title: "Shallow", artist: "Lady Gaga & Bradley Cooper", duration: "3:35" },
    { id: 28, title: "Happier", artist: "Marshmello & Bastille", duration: "3:34" },
    { id: 29, title: "Without Me", artist: "Halsey", duration: "3:21" },
    { id: 30, title: "7 Rings", artist: "Ariana Grande", duration: "2:58" },
];

export default function UploadReelModal({ isOpen, onClose, onUpload }) {
    const [step, setStep] = useState(1); // 1: Video, 2: Caption, 3: Song
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [description, setDescription] = useState('');
    const [selectedSong, setSelectedSong] = useState(null);
    const [songSearch, setSongSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                setError("File too large. Maximum size is 50MB.");
                return;
            }
            
            if (!file.type.startsWith('video/')) {
                setError("Please select a video file.");
                return;
            }

            setError('');
            setVideoFile(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setVideoPreview(reader.result);
                setStep(2); // Move to caption step
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCaptionNext = () => {
        setStep(3); // Move to song selection
    };

    const handleSkipSong = async () => {
        await handleFinalSubmit(null);
    };

    const handleSelectSong = async (song) => {
        setSelectedSong(song);
        await handleFinalSubmit(song);
    };

    const handleFinalSubmit = async (song) => {
        if (!videoPreview) return;
        
        setIsLoading(true);
        setError('');
        try {
            await onUpload(videoPreview, description, song);
            // Reset
            setStep(1);
            setVideoFile(null);
            setVideoPreview(null);
            setDescription('');
            setSelectedSong(null);
            setSongSearch('');
            setError('');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Upload failed. Please try again.');
            setIsLoading(false);
        }
    };

    const filteredSongs = SONG_LIBRARY.filter(song =>
        song.title.toLowerCase().includes(songSearch.toLowerCase()) ||
        song.artist.toLowerCase().includes(songSearch.toLowerCase())
    );

    const handleClose = () => {
        setStep(1);
        setVideoFile(null);
        setVideoPreview(null);
        setDescription('');
        setSelectedSong(null);
        setSongSearch('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-black flex items-center gap-3">
                        <Film className="text-black" size={28} />
                        {step === 1 && "Upload Video"}
                        {step === 2 && "Add Caption"}
                        {step === 3 && "Choose Song"}
                    </h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {step > 1 ? <Check size={16} /> : '1'}
                    </div>
                    <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-black' : 'bg-gray-300'}`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {step > 2 ? <Check size={16} /> : '2'}
                    </div>
                    <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-black' : 'bg-gray-300'}`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}>
                        3
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 1: Upload Video */}
                    {step === 1 && (
                        <div>
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-black transition-colors cursor-pointer relative">
                                <input 
                                    type="file" 
                                    accept="video/mp4,video/webm,video/mov,video/avi"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                                <p className="text-lg font-bold mb-2">Click to upload video</p>
                                <p className="text-gray-500 text-sm">MP4, WEBM, MOV (max 50MB)</p>
                                <p className="text-gray-400 text-xs mt-2">Vertical videos (9:16) work best!</p>
                            </div>
                            {error && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Add Caption */}
                    {step === 2 && (
                        <div className="space-y-4">
                            {videoPreview && (
                                <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden">
                                    <video src={videoPreview} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                        <Check size={12} className="inline mr-1" />
                                        Video uploaded
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-bold mb-2 block">Caption</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border-2 border-gray-300 rounded-2xl p-4 outline-none focus:border-black transition-all min-h-[120px] resize-none"
                                    placeholder="Write something cool..."
                                    autoFocus
                                />
                            </div>
                            <button 
                                onClick={handleCaptionNext}
                                className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                Next <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* Step 3: Choose Song */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input 
                                    type="text"
                                    value={songSearch}
                                    onChange={(e) => setSongSearch(e.target.value)}
                                    placeholder="Search songs..."
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-2xl outline-none focus:border-black transition-all"
                                />
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-2">
                                {filteredSongs.map(song => (
                                    <button
                                        key={song.id}
                                        onClick={() => handleSelectSong(song)}
                                        disabled={isLoading}
                                        className="w-full p-3 border border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all text-left flex items-center gap-3 disabled:opacity-50"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Music size={20} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">{song.title}</p>
                                            <p className="text-xs text-gray-500">{song.artist} • {song.duration}</p>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-400" />
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={handleSkipSong}
                                disabled={isLoading}
                                className="w-full border-2 border-gray-300 text-black font-bold py-4 rounded-2xl hover:bg-gray-100 transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Uploading...' : 'Skip (No Song)'}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
