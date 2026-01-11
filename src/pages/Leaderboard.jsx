import React, { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { Flame, Medal } from 'lucide-react';
import gsap from 'gsap';

const RankRow = ({ rank, name, solved, department, isUser }) => {
    return (
        <div className={`flex items-center p-4 rounded-2xl mb-2 border ${isUser ? 'bg-black text-white border-black' : 'bg-white border-gray-100'}`}>
            <span className={`font-black text-lg w-8 ${rank <= 3 ? 'text-yellow-500' : 'text-gray-400'}`}>#{rank}</span>
            <div className="flex-1">
                <h4 className="font-bold">{name}</h4>
                <p className={`text-xs ${isUser ? 'text-gray-400' : 'text-gray-500'}`}>{department}</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-mono font-bold">{solved}</span>
                <Flame size={18} className={rank <= 3 ? "text-orange-500 fill-orange-500" : "text-gray-300"} />
            </div>
        </div>
    );
};

export default function Leaderboard() {
    const listRef = useRef(null);

    // Mock Data (Replace with API fetch)
    const students = [
        { name: "Aditya Verma", solved: 450, dept: "CSE", isUser: false },
        { name: "Sarah Khan", solved: 423, dept: "IT", isUser: false },
        { name: "My Profile", solved: 310, dept: "ECE", isUser: true },
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
        <div className="min-h-screen bg-gray-50 pb-24 md:pt-20">
            <Navbar />
            <div className="container mx-auto max-w-2xl p-4 pt-4">
                <header className="mb-6">
                    <h1 className="text-3xl font-black text-gray-900">Top Coders</h1>
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {['Global', 'Hostel H1', 'Calculus Batch', 'CSE Dept'].map((filter, i) => (
                            <button key={i} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap ${i === 0 ? 'bg-black text-white' : 'bg-white text-gray-600 border'}`}>
                                {filter}
                            </button>
                        ))}
                    </div>
                </header>

                <div ref={listRef}>
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
        </div>
    );
}
