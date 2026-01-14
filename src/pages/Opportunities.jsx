import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, MapPin, DollarSign, ArrowUpRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchJobs, applyForJob } from '../services/api';
import ApplyJobModal from '../components/ApplyJobModal';
import CreateJobModal from '../components/CreateJobModal';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

const JobCard = ({ job, onApply }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-surface p-6 rounded-3xl border border-white/5 hover:border-secondary/50 transition-colors group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="text-secondary" />
        </div>

        <div className="mb-6">
            <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">
                💼
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
            <p className="text-gray-400 font-medium">{job.company}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
            {job.skills?.map(tag => (
                <span key={tag} className="text-xs font-bold px-3 py-1 bg-white/5 text-gray-300 rounded-md">
                    {tag}
                </span>
            ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-white/5 pt-4">
            <div className="flex items-center gap-1">
                <MapPin size={14} /> {job.location}
            </div>
            <div className="flex items-center gap-1">
                <DollarSign size={14} /> {job.stipend || 'Unpaid'}
            </div>
        </div>

        <button
            onClick={() => onApply(job)}
            className="w-full mt-4 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
        >
            Apply Now
        </button>
    </motion.div>
);

export default function Opportunities() {
    const { currentUser } = useAuth();
    const [selectedJob, setSelectedJob] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: jobs, isLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: fetchJobs
    });

    const handleApply = async (formData) => {
        try {
            await applyForJob(selectedJob._id, {
                userId: currentUser.uid,
                userName: currentUser.displayName,
                userEmail: currentUser.email,
                ...formData
            });
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.error || "Failed to apply");
            throw e;
        }
    };

    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="pt-4 pb-20">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-black text-white mb-4">Gigs</h1>
                    <p className="text-gray-400 text-xl">Get paid. Buy skins. Repeat.</p>
                </div>

                {/* Available for everyone for testing, ideally restrict to Alumni/Admin */}
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary text-black font-bold px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-yellow-400 transition-all hover:scale-105"
                >
                    <Plus size={20} /> Post Job
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs?.map(job => (
                    <JobCard key={job._id} job={job} onApply={setSelectedJob} />
                ))}
            </div>

            {jobs?.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <p>No gigs available right now. Check back later!</p>
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
