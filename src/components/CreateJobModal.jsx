import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Briefcase, MapPin, DollarSign } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

export default function CreateJobModal({
    isOpen,
    onClose,
    onCreated,
    title = "Post a Gig",
    apiPath = "/jobs",
    labels = {
        title: "Job Title",
        company: "Company",
        location: "Location",
        stipend: "Stipend",
        skills: "Skills (comma separated)",
        description: "Description"
    },
    placeholders = {
        title: "Software Intern",
        company: "Google",
        location: "Remote",
        stipend: "50k/mo",
        description: "Describe the role..."
    }
}) {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        stipend: '',
        skills: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const { currentUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiClient.post(apiPath, {
                ...formData,
                postedBy: currentUser.uid,
                ownerName: currentUser.displayName,
                ownerPhoto: currentUser.photoURL,
                skills: formData.skills.split(',').map(s => s.trim())
            });
            onCreated();
            onClose();
        } catch (err) {
            console.error("Creation error:", err);
            alert(err.response?.data?.error || "Failed to create");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg bg-surface border border-white/10 rounded-3xl p-8 relative shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Briefcase className="text-primary" /> {title}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">{labels.title}</label>
                            <input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary mt-1"
                                placeholder={placeholders.title}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">{labels.company}</label>
                            <input
                                required
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary mt-1"
                                placeholder={placeholders.company}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">{labels.location}</label>
                            <input
                                required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary mt-1"
                                placeholder={placeholders.location}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">{labels.stipend}</label>
                            <input
                                value={formData.stipend}
                                onChange={e => setFormData({ ...formData, stipend: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary mt-1"
                                placeholder={placeholders.stipend}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">{labels.skills}</label>
                        <input
                            value={formData.skills}
                            onChange={e => setFormData({ ...formData, skills: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary mt-1"
                            placeholder="React, Node, MongoDB"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">{labels.description}</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary mt-1 h-24 resize-none"
                            placeholder={placeholders.description}
                        />
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full bg-primary text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors disabled:opacity-50 mt-4"
                    >
                        {isLoading ? 'Posting...' : <><Send size={18} /> Publish {title.includes('Hackathon') ? 'Hackathon' : 'Job'}</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
