import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, MapPin, DollarSign, ArrowUpRight, Loader2, Trash2, Plus, MessageSquare, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchJobs, fetchGigs, applyForJob, deleteJob } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreateJobModal from '../components/CreateJobModal';
import ApplyJobModal from '../components/ApplyJobModal';

const JobCard = ({ job, onApply, isOwner, onDelete, onMessage }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-surface p-6 rounded-3xl border border-white/5 hover:border-secondary/50 transition-colors group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
            {!isOwner && (
                <button
                    onClick={(e) => { e.stopPropagation(); onMessage(); }}
                    className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                >
                    <MessageSquare size={16} />
                </button>
            )}
            {isOwner && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(job._id); }}
                    className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            )}
            <ArrowUpRight className="text-secondary" />
        </div>

        <div className="mb-6">
            <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                💼
            </div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
            <p className="text-gray-400 font-medium">{job.company || job.ownerName || 'Independent'}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
            {job.skills?.length > 0 ? job.skills.map(tag => (
                <span key={tag} className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-white/5 text-gray-300 rounded-md border border-white/5 hover:border-primary/20 transition-colors">
                    {tag}
                </span>
            )) : <span className="text-[10px] text-gray-500">No specific skills required</span>}
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 border-t border-white/5 pt-4">
            <div className="flex items-center gap-1">
                <MapPin size={14} className="text-primary" /> {job.location || 'Remote'}
            </div>
            <div className="flex items-center gap-1">
                <DollarSign size={14} className="text-green-500" /> {job.stipend || job.pricing || 'Competitive'}
            </div>
        </div>

        <button
            onClick={() => onApply(job)}
            className="w-full mt-4 bg-white text-black font-black py-4 rounded-xl hover:bg-primary transition-all active:scale-95 shadow-lg group-hover:shadow-primary/20"
        >
            View Details
        </button>
    </motion.div>
);

export default function Opportunities() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [selectedJob, setSelectedJob] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: jobs, isLoading: jobsLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: fetchJobs
    });

    const { data: gigs, isLoading: gigsLoading } = useQuery({
        queryKey: ['gigs'],
        queryFn: fetchGigs
    });

    const allOpportunities = [...(jobs || []), ...(gigs || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const handleApply = async (formData) => {
        try {
            await applyForJob(selectedJob._id, {
                userId: currentUser.uid,
                userName: currentUser.displayName,
                userEmail: currentUser.email,
                ...formData
            });
            alert("Applied successfully!");
            setSelectedJob(null);
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.error || "Failed to apply");
            throw e;
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (window.confirm("Are you sure you want to delete this posting?")) {
            try {
                await deleteJob(jobId);
                queryClient.invalidateQueries(['jobs']);
                queryClient.invalidateQueries(['gigs']);
            } catch (e) {
                alert("Failed to delete");
            }
        }
    };

    const handleMessage = (ownerId, ownerName, ownerPhoto) => {
        navigate('/chat', {
            state: {
                activeChatUser: {
                    uid: ownerId,
                    displayName: ownerName,
                    photoURL: ownerPhoto
                }
            }
        });
    };

    if (jobsLoading || gigsLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="pt-4 pb-20">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-black text-white mb-4 italic tracking-tighter">Gigs<span className="text-primary">.</span></h1>
                    <p className="text-gray-400 text-xl font-medium">Get paid. Build clout. Repeat.</p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary text-black font-black px-8 py-4 rounded-2xl flex items-center gap-2 hover:bg-yellow-400 transition-all hover:scale-105 shadow-xl shadow-primary/20"
                >
                    <Plus size={24} /> Post Gig
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allOpportunities.map(opp => (
                    <JobCard
                        key={opp._id}
                        job={opp}
                        onApply={setSelectedJob}
                        isOwner={currentUser?.uid === (opp.postedBy || opp.ownerId)}
                        onDelete={handleDeleteJob}
                        onMessage={() => handleMessage(opp.postedBy || opp.ownerId, opp.ownerName, opp.ownerPhoto)}
                    />
                ))}
            </div>

            {allOpportunities.length === 0 && (
                <div className="text-center py-32 bg-surface/50 rounded-[3rem] border border-white/5">
                    <Briefcase size={48} className="mx-auto text-gray-700 mb-6 opacity-20" />
                    <p className="text-gray-500 font-black uppercase tracking-widest">The market is quiet</p>
                    <p className="text-gray-600 text-sm mt-2">Come back later or post a gig yourself!</p>
                </div>
            )}

            <AnimatePresence>
                {selectedJob && (
                    <ApplyJobModal
                        isOpen={!!selectedJob}
                        onClose={() => setSelectedJob(null)}
                        job={selectedJob}
                        onApply={handleApply}
                    />
                )}
                {isCreateModalOpen && (
                    <CreateJobModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onCreated={() => queryClient.invalidateQueries(['jobs'])}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
