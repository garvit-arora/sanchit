import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame } from 'lucide-react';
import gsap from 'gsap';

const RankRow = ({ rank, name, solved, department, isUser }) => {
    return (
        <div className={`flex items-center p-4 rounded-2xl mb-2 border ${isUser ? 'bg-surface text-white border-primary/50' : 'bg-white/5 border-white/10 text-gray-300'}`}>
            <span className={`font-black text-lg w-8 ${rank <= 3 ? 'text-yellow-500' : 'text-gray-500'}`}>#{rank}</span>
            <div className="flex-1">
                <h4 className="font-bold">{name}</h4>
                <p className="text-xs text-gray-500">{department} • Hostel H1</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-primary">{solved}</span>
                <Flame size={18} className={rank <= 3 ? "text-orange-500 fill-orange-500" : "text-gray-600"} />
            </div>
        </div>
    );
};

export default function Leaderboard() {
    const listRef = useRef(null);
    const [filter, setFilter] = useState('Global');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const query = filter === 'Global' ? '' : `?filter=${filter}`;
                const res = await fetch(`${API_BASE}/leaderboard${query}`);
                const data = await res.json();
                setStudents(data);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [filter]);

    useEffect(() => {
        if (!loading && listRef.current) {
            gsap.fromTo(listRef.current.children,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }
            );
        }
    }, [students, loading]);

    return (
        <div className="pt-4 pb-20">
            <header className="mb-8">
                <h1 className="text-4xl font-display font-black text-white">Rankings</h1>
                <p className="text-gray-400">See who's coding the most.</p>

                <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                    {['Global', 'CSE', 'IT', 'ECE'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-black' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            <div ref={listRef} className="space-y-2">
                {loading ? (
                    <p className="text-gray-500 text-center py-10">Loading rankings...</p>
                ) : (
                    students.length > 0 ? students.map((student, i) => (
                        <RankRow
                            key={i}
                            rank={i + 1}
                            name={student.displayName || student.username || 'Anonymous'}
                            solved={student.leetcodeStats?.solved || 0}
                            department={student.department || 'General'}
                            isUser={currentUser?.uid === student.uid} // This might need uid in projection
                        />
                    )) : (
                        <p className="text-gray-500 text-center py-10">No rankings found for this category.</p>
                    )
                )}
            </div>
        </div>
    );
}
