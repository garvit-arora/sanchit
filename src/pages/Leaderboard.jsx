import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, RefreshCw } from 'lucide-react';
import gsap from 'gsap';
import apiClient from '../services/apiClient';
import { notify } from '../utils/notify';

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
    const [refreshing, setRefreshing] = useState(false);
    const { currentUser } = useAuth();

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const query = filter === 'Global' ? '' : `?filter=${filter}`;
            const res = await apiClient.get(`/leaderboard${query}`);
            setStudents(res.data);
        } catch (err) {
            console.error("Failed to fetch leaderboard", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [filter]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await apiClient.post('/leaderboard/refresh');
            await fetchLeaderboard();
        } catch (error) {
            console.error("Failed to refresh leaderboard:", error);
            notify("Failed to refresh data. Please try again.", "error");
        } finally {
            setRefreshing(false);
        }
    };

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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-display font-black text-white">Rankings</h1>
                        <p className="text-gray-400">See who's coding the most.</p>
                    </div>
                    <button 
                        onClick={handleRefresh} 
                        disabled={refreshing}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
                        title="Refresh LeetCode Stats"
                    >
                        <RefreshCw size={20} className={refreshing ? "animate-spin text-primary" : "text-gray-400"} />
                    </button>
                </div>

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
