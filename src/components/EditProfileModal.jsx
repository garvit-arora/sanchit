import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function EditProfileModal({ isOpen, onClose, user, onSave }) {
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        username: user?.username || '',
        bio: user?.bio || '',
        skills: user?.skills?.join(', ') || '',
        leetcodeUsername: user?.leetcodeUsername || '',
        campus: user?.campus || ''
    });

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
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface border border-white/10 p-6 rounded-2xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
                <h2 className="text-2xl font-black text-white mb-6">Edit Profile</h2>

                <div className="space-y-4">
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
