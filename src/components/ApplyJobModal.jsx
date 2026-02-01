import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ApplyJobModal({ isOpen, onClose, job, onApply, onProceed, proceedLabel = "Proceed to Apply" }) {
    const [formData, setFormData] = useState({
        resumeLink: '',
        coverLetter: ''
    });
    const [status, setStatus] = useState('idle'); // idle, details, sending, success
    const [view, setView] = useState('details'); // details, form

    const handleSubmit = async () => {
        try {
            setStatus('sending');
            await onApply(formData);
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setView('details');
                setFormData({ resumeLink: '', coverLetter: '' });
            }, 2000);
        } catch (err) {
            setStatus('idle');
            // Error is handled/alerted by the parent handleApply
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface border border-white/10 p-8 rounded-3xl w-full max-w-lg relative shadow-2xl">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>

                {status === 'success' ? (
                    <div className="text-center py-12">
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-black text-white mb-2">Application Sent!</h2>
                        <p className="text-gray-400 text-lg">The pulse has been transmitted. Good luck.</p>
                    </div>
                ) : view === 'details' ? (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/10">
                                💼
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white leading-tight">{job?.title}</h2>
                                <p className="text-primary font-bold uppercase tracking-widest text-sm">{job?.company}</p>
                            </div>
                        </div>

                        <div className="space-y-6 mb-8">
                            <div>
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Description</h4>
                                <p className="text-gray-300 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5">{job?.description || 'No description provided.'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-center">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.22em] mb-1">Stipend</h4>
                                    <p className="text-white font-bold">{job?.stipend || 'Unpaid'}</p>
                                </div>
                                <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-center">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.22em] mb-1">Location</h4>
                                    <p className="text-white font-bold">{job?.location}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Requirements</h4>
                                <div className="flex flex-wrap gap-2">
                                    {job?.skills?.map(s => (
                                        <span key={s} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black border border-primary/20">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (onProceed) {
                                    onProceed();
                                    onClose();
                                    return;
                                }
                                setView('form');
                            }}
                            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                        >
                            {proceedLabel}
                        </button>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={() => setView('details')} className="text-gray-500 hover:text-white transition-colors">
                                <ArrowLeft size={24} />
                            </button>
                            <h2 className="text-2xl font-black text-white">Apply for {job?.title}</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Resume Link (Google Drive/Dropbox)</label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                    placeholder="https://"
                                    value={formData.resumeLink}
                                    onChange={e => setFormData({ ...formData, resumeLink: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Tell us why you're a fit</label>
                                <textarea
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none h-40"
                                    placeholder="I'm the 10x dev you need..."
                                    value={formData.coverLetter}
                                    onChange={e => setFormData({ ...formData, coverLetter: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!formData.resumeLink || status === 'sending'}
                            className="w-full mt-8 bg-primary text-black font-black py-4 rounded-2xl hover:bg-yellow-400 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl"
                        >
                            {status === 'sending' ? 'Transmitting...' : 'Submit Final Application'}
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
}
