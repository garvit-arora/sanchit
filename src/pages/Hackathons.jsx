import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, ArrowUpRight, Loader2, Trophy, Terminal, Cpu, ShieldCheck, Activity, Target, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchHackathons, applyForHackathon } from '../services/api';
import ApplyJobModal from '../components/ApplyJobModal'; // Reusing for now
import CreateJobModal from '../components/CreateJobModal'; // Reusing for now
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { notify } from '../utils/notify';
import { aiService } from '../services/aiService';

const HackathonCard = ({ hackathon, onApply, matchScore }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-surface p-6 rounded-3xl border border-white/5 hover:border-blue-500/50 transition-colors group relative overflow-hidden"
    >
        {matchScore !== undefined && (
            <div className="absolute top-4 left-4 z-20">
                <div className="bg-blue-500/10 backdrop-blur-md border border-blue-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Target size={12} className="text-blue-400" />
                    <span className="text-[10px] font-black text-blue-300 uppercase">{matchScore}% Stealth Match</span>
                </div>
            </div>
        )}
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
    const { currentUser, userProfile } = useAuth();
    const [selectedHackathon, setSelectedHackathon] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [matchData, setMatchData] = useState({});
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
            notify(e.response?.data?.error || "Failed to register", "error");
            throw e;
        }
    };

    const handleProceed = () => {
        const raw = selectedHackathon?.description || '';
        const match = raw.match(/https?:\/\/\S+/);
        const link = match ? match[0] : '';
        if (!link) {
            notify("Hackathon link not available.", "warning");
            return;
        }
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    const runStealthMatch = async () => {
        if (!userProfile?.resumeText) {
            notify("Please upload your resume in your profile to use Stealth Match.", "warning");
            return;
        }

        setIsMatching(true);
        setMatchData({});

        try {
            const scores = {};
            for (const hackathon of hackathons || []) {
                const prompt = `
You are an expert recruiter. Rate the match between this candidate and the hackathon on a scale of 0-100.
Return ONLY the number.

Candidate Resume:
${userProfile.resumeText.substring(0, 2000)}

Hackathon:
Title: ${hackathon.title}
Themes: ${hackathon.skills?.join(', ')}
Description: ${hackathon.description || hackathon.title}

Match Score (0-100):`;

                try {
                    const response = await aiService.chat([
                        { role: 'system', content: 'You are a precise matching engine. Output only the score number.' },
                        { role: 'user', content: prompt }
                    ]);
                    const score = parseInt(response.match(/\d+/)?.[0] || "0");
                    scores[hackathon._id] = score;
                } catch (err) {
                    console.error("Match error for hackathon", hackathon._id, err);
                    scores[hackathon._id] = 0;
                }
            }
            setMatchData(scores);
        } catch (error) {
            console.error("Stealth Match Failed:", error);
            notify("Stealth Match failed. Ensure AI model is loaded.", "error");
        } finally {
            setIsMatching(false);
        }
    };

    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="pt-4 pb-20">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-5xl font-display font-black text-white mb-4">Hackathons</h1>
                    <p className="text-gray-400 text-xl">Build. Break. Win.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={runStealthMatch}
                        disabled={isMatching}
                        className="flex-1 md:flex-none border border-white/10 bg-surface px-8 py-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-all relative overflow-hidden group active:scale-95"
                    >
                        {isMatching ? (
                            <div className="flex items-center gap-3">
                                <Activity size={18} className="text-blue-400 animate-spin" />
                                <span className="text-xs font-black text-blue-300 uppercase tracking-widest">NPU SCANNING...</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <Cpu size={18} className="text-blue-400" />
                                    <span className="text-sm font-black text-white uppercase tracking-tight">Stealth Match</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-50 font-black tracking-widest text-[8px] uppercase">
                                    <ShieldCheck size={10} className="text-green-500" /> On-Device Compute
                                </div>
                            </>
                        )}
                        {isMatching && <div className="absolute bottom-0 left-0 h-1 bg-blue-400 animate-[shimmer_2s_infinite] w-full" />}
                    </button>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex-1 md:flex-none bg-primary text-black font-bold px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-yellow-400 transition-all hover:scale-105"
                    >
                        <Plus size={20} /> Host Hackathon
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hackathons?.map(hackathon => (
                    <HackathonCard
                        key={hackathon._id}
                        hackathon={hackathon}
                        onApply={setSelectedHackathon}
                        matchScore={matchData[hackathon._id]}
                    />
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
                        onProceed={handleProceed}
                        proceedLabel="Open Hackathon Page"
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
