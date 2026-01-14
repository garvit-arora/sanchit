import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, MapPin, DollarSign, ArrowUpRight, Loader2, Calendar, Trophy, Users, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchHackathons, applyForHackathon } from '../services/api';
import ApplyJobModal from '../components/ApplyJobModal'; // Reusing for now
import CreateJobModal from '../components/CreateJobModal'; // Reusing for now
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

const HackathonCard = ({ hackathon, onApply }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-surface p-6 rounded-3xl border border-white/5 hover:border-blue-500/50 transition-colors group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="text-secondary" />
        </div>

        <div className="mb-6">
            <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-blue-500 mb-4">
                <Terminal size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{hackathon.title}</h3>
            <p className="text-gray-400 font-medium">{hackathon.company}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
            {hackathon.skills?.map(tag => (
                <span key={tag} className="text-xs font-bold px-3 py-1 bg-white/5 text-gray-300 rounded-md">
                    {tag}
                </span>
            ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-white/5 pt-4">
            <div className="flex items-center gap-1">
                <MapPin size={14} /> {hackathon.location || 'Remote'}
            </div>
            <div className="flex items-center gap-1">
                <Trophy size={14} /> {hackathon.stipend || 'Prizes'}
            </div>
        </div>

        <button
            onClick={() => onApply(hackathon)}
            className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
            View Details
        </button>
    </motion.div>
);

export default function Hackathons() {
    const { currentUser } = useAuth();
    const [selectedHackathon, setSelectedHackathon] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: hackathons, isLoading } = useQuery({
        queryKey: ['hackathons'],
        queryFn: fetchHackathons
    });

    const handleApply = async (formData) => {
        try {
            await applyForHackathon(selectedHackathon._id, {
                userId: currentUser.uid,
                userName: currentUser.displayName,
                userEmail: currentUser.email,
                ...formData
            });
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.error || "Failed to register");
            throw e;
        }
    };

    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="pt-4 pb-20">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-black text-white mb-4">Hackathons</h1>
                    <p className="text-gray-400 text-xl">Build. Break. Win.</p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary text-black font-bold px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-yellow-400 transition-all hover:scale-105"
                >
                    <Plus size={20} /> Host Hackathon
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hackathons?.map(hackathon => (
                    <HackathonCard key={hackathon._id} hackathon={hackathon} onApply={setSelectedHackathon} />
                ))}
            </div>

            {hackathons?.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <p>No hackathons upcoming right now. Start building locally!</p>
                </div>
            )}

            <AnimatePresence>
                {selectedHackathon && (
                    <ApplyJobModal
                        isOpen={!!selectedHackathon}
                        onClose={() => setSelectedHackathon(null)}
                        job={selectedHackathon} // Reuse job modal props for now
                        onApply={handleApply}
                        title="Hackathon Details"
                        actionLabel="Register Now"
                    />
                )}
                {isCreateModalOpen && (
                    <CreateJobModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onCreated={() => queryClient.invalidateQueries(['hackathons'])}
                        title="Host a Hackathon"
                        apiPath="/hackathons"
                        labels={{
                            title: "Hackathon Name",
                            company: "Organization",
                            location: "Venue/Status",
                            stipend: "Prize Pool",
                            skills: "Themes/Tags (comma separated)",
                            description: "Platform Link (Devfolio, Unstop, etc.)"
                        }}
                        placeholders={{
                            title: "TechSprint 2026",
                            company: "Google Developers Group",
                            location: "Remote / BPIT Campus",
                            stipend: "₹1,00,000 + Swags",
                            description: "Paste link to Devfolio, Unstop, or Devpost..."
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
