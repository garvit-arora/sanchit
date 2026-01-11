import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, CheckCircle } from 'lucide-react';

export default function ApplyJobModal({ isOpen, onClose, job, onApply }) {
    const [formData, setFormData] = useState({
        resumeLink: '',
        coverLetter: ''
    });
    const [status, setStatus] = useState('idle');

    const handleSubmit = async () => {
        setStatus('sending');
        await onApply(formData);
        setStatus('success');
        setTimeout(() => {
            onClose();
            setStatus('idle');
            setFormData({ resumeLink: '', coverLetter: '' });
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface border border-white/10 p-6 rounded-2xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
                
                {status === 'success' ? (
                    <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-white">Applied!</h2>
                        <p className="text-gray-400">Good luck 🤞</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-black text-white mb-1">Apply for {job?.title}</h2>
                        <p className="text-gray-400 text-sm mb-6">at {job?.company}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-400">Resume Link (Drive/Dropbox)</label>
                                <input 
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-primary mt-1"
                                    placeholder="https://"
                                    value={formData.resumeLink}
                                    onChange={e => setFormData({...formData, resumeLink: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-400">Why you?</label>
                                <textarea 
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary mt-1 resize-none h-32"
                                    placeholder="I'm the 10x dev you need..."
                                    value={formData.coverLetter}
                                    onChange={e => setFormData({...formData, coverLetter: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleSubmit} 
                            disabled={!formData.resumeLink || status === 'sending'}
                            className="w-full mt-8 bg-white text-black font-black py-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            {status === 'sending' ? 'Sending...' : 'Submit Application'}
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
}
