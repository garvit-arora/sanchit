import React from 'react';
import { Flame, Trophy } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function MiniLeaderboard() {
    // Mock Data
    const topStudents = [
        { name: "Aditya V.", solved: 450, rank: 1 },
        { name: "Sarah K.", solved: 423, rank: 2 },
        { name: "You", solved: 310, rank: 3 },
    ];

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
                            <span className={`text-sm font-bold ${s.name === 'You' ? 'text-white' : 'text-gray-400 group-hover:text-white transition-colors'}`}>{s.name}</span>
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
