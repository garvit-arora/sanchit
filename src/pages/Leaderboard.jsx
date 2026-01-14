import React, { useEffect, useRef } from 'react';
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

    // Mock Data reflecting "local" context
    const students = [
        { name: "Aditya Verma", solved: 450, dept: "CSE", isUser: false },
        { name: "Sarah Khan", solved: 423, dept: "IT", isUser: false },
        { name: "You", solved: 310, dept: "ECE", isUser: true },
        { name: "Vikram Singh", solved: 290, dept: "CSE", isUser: false },
        { name: "Priya P.", solved: 215, dept: "MECH", isUser: false },
    ];

    useEffect(() => {
        gsap.fromTo(listRef.current.children,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }
        );
    }, []);

    return (
        <div className="pt-4 pb-20">
            <header className="mb-8">
                <h1 className="text-4xl font-display font-black text-white">Rankings</h1>
                <p className="text-gray-400">See who's coding the most in your hostel.</p>

                <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                    {['Hostel H1', 'College', 'Department', 'Global'].map((filter, i) => (
                        <button key={i} className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${i === 0 ? 'bg-primary text-black' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}>
                            {filter}
                        </button>
                    ))}
                </div>
            </header>

            <div ref={listRef} className="space-y-2">
                {students.map((student, i) => (
                    <RankRow
                        key={i}
                        rank={i + 1}
                        name={student.name}
                        solved={student.solved}
                        department={student.dept}
                        isUser={student.isUser}
                    />
                ))}
            </div>
        </div>
    );
}
