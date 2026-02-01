import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { notify } from '../utils/notify';

// Initialize PDF Worker
// In Vite, we can usually import the worker URL. If this fails, we might need a different approach.
// For now, assuming standard Vite setup.
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function EditProfileModal({ isOpen, onClose, user, onSave }) {
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        username: user?.username || '',
        bio: user?.bio || '',
        skills: user?.skills?.join(', ') || '',
        leetcodeUsername: user?.integrations?.leetcode || user?.leetcodeUsername || '',
        campus: user?.campus || '',
        resumeText: user?.resumeText || ''
    });
    const [isParsing, setIsParsing] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            notify('Please upload a PDF file.', 'warning');
            return;
        }

        setIsParsing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            setFormData(prev => ({ ...prev, resumeText: fullText }));
            notify('Resume parsed successfully! You can now use Stealth Match.', 'success');
        } catch (error) {
            console.error('PDF Parse Error:', error);
            notify('Failed to parse PDF. Please try again.', 'error');
        } finally {
            setIsParsing(false);
        }
    };

    const handleSubmit = () => {
        onSave({
            ...formData,
            skills: formData.skills.split(',').map(s => s.trim())
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface border border-white/10 p-6 rounded-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
                <h2 className="text-2xl font-black text-white mb-6">Edit Profile</h2>

                <div className="space-y-4">
                    {/* Resume Upload Section */}
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <label className="text-sm font-bold text-gray-400 mb-2 block">Resume (for Stealth Match)</label>
                        <div className="flex items-center gap-4">
                            <label className="flex-1 cursor-pointer bg-black/30 border border-white/10 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group">
                                {isParsing ? (
                                    <Loader2 className="animate-spin text-primary" />
                                ) : (
                                    <>
                                        <Upload className="text-gray-500 group-hover:text-primary transition-colors" size={20} />
                                        <span className="text-xs font-bold text-gray-500 group-hover:text-white">Upload PDF</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isParsing} />
                            </label>
                            {formData.resumeText && (
                                <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                                    <FileText className="text-green-500" size={20} />
                                    <span className="text-xs font-bold text-green-500">Resume Parsed</span>
                                </div>
                            )}
                        </div>
                        {formData.resumeText && (
                            <p className="text-[10px] text-gray-600 mt-2 truncate">
                                {formData.resumeText.substring(0, 100)}...
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-400">Display Name</label>
                        <input
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-primary mt-1"
                            value={formData.displayName}
                            onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400">Unique Handle (@)</label>
                        <input
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-primary mt-1"
                            value={formData.username || ''}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            placeholder="username"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400">Bio</label>
                        <textarea
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary mt-1 resize-none h-24"
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400">LeetCode Username</label>
                        <input
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary mt-1"
                            value={formData.leetcodeUsername || ''}
                            onChange={e => setFormData({ ...formData, leetcodeUsername: e.target.value })}
                            placeholder="e.g. gautam_123"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400">Campus</label>
                        <input
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-primary mt-1"
                            value={formData.campus || ''}
                            onChange={e => setFormData({ ...formData, campus: e.target.value })}
                            placeholder="e.g. BPIT"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400">Skills (comma separated)</label>
                        <input
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary mt-1"
                            value={formData.skills}
                            onChange={e => setFormData({ ...formData, skills: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-400 hover:text-white">Cancel</button>
                    <button onClick={handleSubmit} className="flex-1 bg-white text-black font-black py-3 rounded-xl hover:scale-105 transition-transform">Save Changes</button>
                </div>
            </motion.div>
        </div>
    );
}
