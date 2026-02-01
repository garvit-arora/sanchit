import React, { useEffect, useState } from 'react';
import { Flame, Trophy, Loader2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import apiClient from '../services/apiClient';

export default function MiniLeaderboard() {
    const [topStudents, setTopStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await apiClient.get('/leaderboard');
                // Take top 5
                const formatted = res.data.slice(0, 5).map((user, index) => ({
                    name: user.displayName || 'User',
                    solved: user.leetcodeStats?.solved || 0,
                    rank: index + 1
                }));
                setTopStudents(formatted);
            } catch (err) {
                console.error("Failed to fetch mini leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="mx-2 mb-4 p-4 bg-surface/50 rounded-2xl border border-white/5 backdrop-blur-sm flex justify-center">
                <Loader2 className="animate-spin text-gray-500" size={20} />
            </div>
        );
    }

    if (topStudents.length === 0) return null;

    return (
        <div className="mx-2 mb-4 p-4 bg-surface/50 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={12} className="text-yellow-500" /> Top Ranked
                </h3>
                <NavLink to="/leaderboard" className="text-[10px] text-primary hover:underline">View All</NavLink>
            </div>

            <div className="space-y-3">
                {topStudents.map((s, i) => (
                    <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-black w-3 ${i === 0 ? 'text-yellow-500' : 'text-gray-500'}`}>{s.rank}</span>
                            <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors truncate max-w-[120px]">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-mono text-gray-500">{s.solved}</span>
                            <Flame size={10} className="text-orange-500/50" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
