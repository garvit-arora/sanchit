import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    ShieldCheck,
    WifiOff,
    Cpu,
    Terminal,
    MessageSquare,
    Sparkles,
    BookOpen,
    Send,
    Activity,
    Lock,
    Upload,
    FileText,
    History,
    CheckCircle2,
    Search
} from 'lucide-react';

const ProcessingNode = ({ active }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
        <Cpu size={14} className={`${active ? 'animate-pulse text-green-400' : 'text-green-800'}`} />
        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">
            {active ? 'Edge Node Active' : 'Neural Core Idle'}
        </span>
    </div>
);

export default function Tutor() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Neural core initialized. I am your Edge-AI Tutor. I can now index your local files (PDFs, PPTs) for instant offline Q&A. Try dropping a lecture slide below.",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [offlineMode, setOfflineMode] = useState(false);
    const [activeView, setActiveView] = useState('chat'); // 'chat' or 'vault'
    const [vaultFiles, setVaultFiles] = useState([
        { id: 1, name: 'Data_Structures_Lecture_1.pdf', size: '2.4 MB', indexed: true },
        { id: 2, name: 'Algorithm_Complexity_CheatSheet.pdf', size: '1.2 MB', indexed: true }
    ]);
    const [isIndexing, setIsIndexing] = useState(false);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsProcessing(true);

        // Simulate Neural Engine Processing (Local RAG)
        setTimeout(() => {
            const hasVaultSource = vaultFiles.length > 0;
            const responses = hasVaultSource ? [
                `According to page 4 of "${vaultFiles[0].name}", a B-Tree is preferred here over a binary tree for multi-level indexing. Processed locally via NPU.`,
                `I've cross-referenced your notes in "${vaultFiles[1].name}". The worst-case complexity of this algorithm is O(n log n). This analysis happened entirely in the secure enclave.`,
                "Exam pattern detected in your local materials. Dijkstra's is a priority. Computing offline gradients..."
            ] : [
                "Based on the local dataset for Data Structures, the optimized approach here is using a Segment Tree for range queries. This computation happened entirely on your NPU.",
                "I've analyzed your backlog strategy. Focus on Module 3 & 4 first. This analysis never left your device's secure enclave.",
                "Exam pattern detected. 60% probability of a Dijkstra's Algorithm question this year. Processing complete on the edge."
            ];

            const aiMsg = {
                id: Date.now() + 1,
                text: responses[Math.floor(Math.random() * responses.length)],
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsProcessing(false);
        }, 1500);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsIndexing(true);
        // Simulate Local Vector Embedding Generation via RunAnywhere SDK
        setTimeout(() => {
            const newFile = {
                id: Date.now(),
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                indexed: true
            };
            setVaultFiles(prev => [newFile, ...prev]);
            setIsIndexing(false);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: `Successfully indexed "${file.name}" into local storage. You can now ask specific questions about its content offline.`,
                sender: 'ai',
                timestamp: new Date()
            }]);
        }, 3000);
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col pt-4">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-surface border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <WifiOff size={20} />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-sm uppercase">Resilience</h4>
                        <p className="text-[10px] text-gray-500 font-bold">100% Offline Capable</p>
                    </div>
                </div>
                <div className="bg-surface border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <Lock size={20} />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-sm uppercase">Privacy</h4>
                        <p className="text-[10px] text-gray-500 font-bold">On-Device NPU only</p>
                    </div>
                </div>
                <div className="bg-surface border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-sm uppercase">Zero Cloud</h4>
                        <p className="text-[10px] text-gray-500 font-bold">60% Cost Efficiency</p>
                    </div>
                </div>
            </div>

            {/* Main Tutor Area */}
            <div className="flex-1 bg-surface/50 border border-white/10 rounded-[32px] flex flex-col overflow-hidden backdrop-blur-xl relative">
                {/* Status Bar */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                            <span className="text-xs font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                <Terminal size={14} className="text-primary" /> RunAnywhere v4.0.2
                            </span>
                        </div>
                        <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setActiveView('chat')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'chat' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                <MessageSquare size={12} className="inline mr-2" /> Tutor
                            </button>
                            <button
                                onClick={() => setActiveView('vault')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'vault' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                <History size={12} className="inline mr-2" /> Vault
                                {vaultFiles.length > 0 && <span className="ml-2 bg-black/20 px-1.5 rounded-md text-[8px]">{vaultFiles.length}</span>}
                            </button>
                        </div>
                    </div>
                    <ProcessingNode active={isProcessing || isIndexing} />
                </div>

                {/* Content View */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                    <AnimatePresence mode="wait">
                        {activeView === 'chat' ? (
                            <motion.div
                                key="chat-view"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user'
                                            ? 'bg-primary text-black font-bold shadow-lg shadow-primary/10'
                                            : 'bg-white/5 border border-white/10 text-gray-200'
                                            }`}>
                                            <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                                            <div className={`mt-2 flex items-center gap-2 ${msg.sender === 'user' ? 'text-black/40' : 'text-gray-600'}`}>
                                                <span className="text-[9px] font-black uppercase tracking-widest">
                                                    {msg.sender === 'ai' ? 'Verified Local Computation' : 'Student Frequency'}
                                                </span>
                                                {msg.sender === 'ai' && <ShieldCheck size={12} />}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {isProcessing && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                                            <Activity size={16} className="text-primary animate-spin" />
                                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Querying Local Embeddings...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="vault-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2">Lecture Vault<span className="text-primary">.</span></h3>
                                    <p className="text-gray-400 text-sm">Your private knowledge base. 100% on-device embeddings.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {vaultFiles.map(file => (
                                        <div key={file.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-sm truncate max-w-[200px] md:max-w-md">{file.name}</h4>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{file.size} • Local Vector Index</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-green-500">
                                                <CheckCircle2 size={16} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Indexed</span>
                                            </div>
                                        </div>
                                    ))}

                                    {isIndexing && (
                                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl animate-pulse">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-500">
                                                    <Activity size={20} className="animate-spin" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="h-4 w-48 bg-gray-800 rounded mb-2" />
                                                    <div className="h-2 w-24 bg-gray-800 rounded" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="mt-4 border-2 border-dashed border-white/10 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all text-gray-500 hover:text-primary active:scale-95 group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload size={32} />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-black uppercase tracking-widest text-xs">Drop Academic Files</p>
                                            <p className="text-[10px] mt-1 opacity-50 font-medium">PDF, PPT, or MD • No Cloud Storage used</p>
                                        </div>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept=".pdf,.ppt,.pptx,.md"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input */}
                <div className="p-6 border-t border-white/10 bg-black/40">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                className="w-full bg-white/5 border border-white/15 rounded-2xl px-6 py-4 text-white outline-none focus:border-primary transition-all font-medium"
                                placeholder={activeView === 'chat' ? "Solve a doubt or query your vault..." : "Search your private index..."}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (activeView === 'chat' ? handleSend() : setActiveView('chat'))}
                                disabled={isProcessing}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-gray-500">
                                <Search size={18} />
                            </div>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={isProcessing || isIndexing || !inputText.trim()}
                            className="w-14 h-14 bg-primary text-black rounded-2xl flex items-center justify-center hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all disabled:opacity-50 active:scale-90 shadow-lg shadow-primary/10"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

