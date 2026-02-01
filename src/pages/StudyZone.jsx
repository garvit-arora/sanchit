import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Terminal, Sparkles, BrainCircuit, Mic, Code } from 'lucide-react';

const StudyCard = ({ to, title, description, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <Link to={to} className="group relative block h-full">
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity rounded-3xl`} />
            <div className="bg-surface border border-white/10 p-8 rounded-3xl h-full hover:border-white/30 transition-all hover:-translate-y-2 relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br ${color} opacity-[0.03] rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-[0.08]`} />
                
                <div className="mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={32} className="text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                    {title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                    {description}
                </p>

                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-white/50 group-hover:text-white transition-colors">
                    <span>Enter Zone</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
            </div>
        </Link>
    </motion.div>
);

export default function StudyZone() {
    const cards = [
        {
            to: "/tutor",
            title: "AI Tutor",
            description: "Upload PDFs, get summaries, generate quizzes, and chat with your personal study companion.",
            icon: BookOpen,
            color: "from-blue-500 to-cyan-500"
        },
        {
            to: "/hackathons",
            title: "Hackathons",
            description: "Find upcoming hackathons, form teams, and build the next big thing. Compete and win.",
            icon: Terminal,
            color: "from-purple-500 to-pink-500"
        },
        {
            to: "/coding-ide",
            title: "Coding Interview IDE",
            description: "Practice coding interview questions with C++, Java, and JavaScript. Get AI suggestions and run test cases.",
            icon: Code,
            color: "from-green-500 to-teal-500"
        },
        {
            to: "/ai-interview",
            title: "AI Interview Coach",
            description: "Practice interviews with AI. Get real-time feedback using speech recognition and text-to-speech technology.",
            icon: Mic,
            color: "from-green-500 to-teal-500"
        },
        {
            to: "/resume-roaster",
            title: "Resume Roaster",
            description: "Get a brutally honest AI roast of your resume and quick fixes to level it up.",
            icon: Sparkles,
            color: "from-orange-500 to-red-500"
        },
        {
            to: "/flashcards",
            title: "Flashcard Generator",
            description: "Upload a PDF and generate study flashcards instantly.",
            icon: BrainCircuit,
            color: "from-blue-500 to-purple-500"
        }
    ];

    return (
        <div className="max-w-6xl mx-auto pt-20 pb-20 px-4 min-h-[80vh] flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
                {cards.map((card, index) => (
                    <StudyCard
                        key={card.title}
                        to={card.to}
                        title={card.title}
                        description={card.description}
                        icon={card.icon}
                        color={card.color}
                        delay={0.08 + index * 0.05}
                    />
                ))}
            </div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-16 text-center"
            >
                <div className="inline-block p-6 rounded-3xl bg-black/20 border border-white/5">
                    <div className="flex items-center justify-center gap-3 mb-2 text-gray-400">
                        <BrainCircuit size={20} />
                        <span className="font-bold text-sm uppercase tracking-widest">Pro Tip</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Use the AI Tutor to prepare for hackathon themes before you register!
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
