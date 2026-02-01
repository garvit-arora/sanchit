import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import apiClient, { mlClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';
import AIDataConsentBanner from '../components/AIDataConsentBanner';
import { notify } from '../utils/notify';
import {
    Send,
    Upload,
    FileText,
    BookOpen,
    Trash2,
    RefreshCw,
    Paperclip,
    Bot,
    User,
    ChevronLeft,
    ChevronRight,
    User as UserIcon
} from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function Tutor() {
    const { currentUser, userProfile } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [vaultFiles, setVaultFiles] = useState([]);
    const [isIndexing, setIsIndexing] = useState(false);
    const [consentChoice, setConsentChoice] = useState(() => localStorage.getItem('ai_data_consent_tutor'));
    const [showConsent, setShowConsent] = useState(consentChoice === null);
    // Sidebar always open on desktop, togglable on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleConsentDecision = (value) => {
        setConsentChoice(value);
        setShowConsent(false);
        mlClient.post('/consent', {
            userId: currentUser?.uid || 'anonymous',
            feature: 'ai_tutor',
            consent: value === 'opt_in'
        }).catch(() => {});
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Ensure sidebar is open on desktop resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load Vault Files
    useEffect(() => {
        const loadFiles = async () => {
            const userId = currentUser?.uid || 'anonymous';
            try {
                const files = await storageService.getFiles(userId);
                if (files && files.length > 0) {
                    setVaultFiles(files);
                }
            } catch (e) {
                console.error("Failed to load vault files:", e);
            }
        };
        loadFiles();
    }, [currentUser?.uid]);

    // Load Chat History
    useEffect(() => {
        const fetchHistory = async () => {
            if (!currentUser?.uid) return;
            try {
                const roomId = `ai_tutor_${currentUser.uid}`;
                const { data } = await apiClient.get(`/chat/${roomId}`);
                
                if (data && data.length > 0) {
                    const formatted = data.map(m => ({
                        id: m._id,
                        text: m.text,
                        sender: m.senderId === currentUser.uid ? 'user' : 'ai',
                        timestamp: new Date(m.createdAt)
                    }));
                    setMessages(formatted);
                } else {
                    // Default welcome message if no history
                    setMessages([{
                        id: 'welcome',
                        text: "# Hello! \nI'm your AI Study Buddy. I'm here to help you understand your lecture notes and documents.\n\n**To get started:**\n1. Upload your PDF notes on the left.\n2. Ask me to summarize, explain, or quiz you on the content!",
                        sender: 'ai',
                        timestamp: new Date()
                    }]);
                }
            } catch (e) {
                console.error("Failed to load chat history:", e);
                 // Fallback to welcome message
                 setMessages([{
                    id: 'welcome',
                    text: "# Hello! \nI'm your AI Study Buddy. I'm here to help you understand your lecture notes and documents.\n\n**To get started:**\n1. Upload your PDF notes on the left.\n2. Ask me to summarize, explain, or quiz you on the content!",
                    sender: 'ai',
                    timestamp: new Date()
                }]);
            }
        };
        fetchHistory();
    }, [currentUser?.uid]);

    const extractText = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + "\n";
        }
        return fullText;
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            notify("Only PDF files are supported for now.", "warning");
            return;
        }

        setIsIndexing(true);
        try {
            // 1. Extract Text
            const text = await extractText(file);
            
            // 2. Save to Storage (Local + Backend Sync)
            const userId = currentUser?.uid || 'anonymous';
            const savedFile = await storageService.saveFile(file, userId, { content: text });

            // 3. Update State
            setVaultFiles(prev => [...prev, { ...savedFile, content: text }]);
            
            // 4. Add system message about file
            const fileMsg = {
                id: Date.now(),
                text: `✅ **Added to Library:** ${file.name}\nI've read it! You can now ask questions about this document.`,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, fileMsg]);
            
            // Persist file upload message (optional, but good for history)
            // We'll skip persisting this for now to keep chat clean, or we can persist it as AI message
        } catch (error) {
            console.error("Upload failed:", error);
            notify("Failed to process file. Please try again.", "error");
        } finally {
            setIsIndexing(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;
        if (consentChoice === null) {
            setShowConsent(true);
            return;
        }

        const text = inputText;
        const userMsg = {
            id: Date.now(),
            text: text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsProcessing(true);

        const roomId = `ai_tutor_${currentUser?.uid}`;

        // Persist User Message
        try {
            await apiClient.post('/chat', {
                roomId,
                text: text,
                senderId: currentUser?.uid,
                senderName: currentUser?.displayName || 'User',
                senderPhoto: currentUser?.photoURL,
                createdAt: new Date()
            });
        } catch (e) {
            console.error("Failed to save user message:", e);
        }
        if (consentChoice === 'opt_in') {
            mlClient.post('/ingest', {
                userId: currentUser?.uid || 'anonymous',
                feature: 'ai_tutor',
                role: 'user',
                content: text,
                consent: true
            }).catch(() => {});
        }

        try {
            await aiService.init();
            
            // Build Context
            const context = vaultFiles.map(f => `[Document: ${f.name}]\n${f.content || f.extractedText || ''}`).join('\n\n');
            const systemPrompt = `You are a friendly, encouraging, and patient AI Tutor. Your goal is to help students learn.
            
            Tone: Warm, conversational, and educational. Avoid overly technical jargon unless necessary (then explain it).
            Formatting: Use Markdown (bold, bullet points, code blocks) to make answers easy to read.
            
            Instructions:
            - Answer the user's question based on the provided Context documents.
            - If the answer isn't in the documents, say so politely, but try to provide general help if possible.
            - Keep answers concise but complete.
            
            Context:\n${context}`;

            const responseText = await aiService.chat([
                { role: 'system', content: systemPrompt },
                ...messages.filter(m => m.sender !== 'system').map(m => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.text
                })),
                { role: 'user', content: text }
            ]);

            const aiMsg = {
                id: Date.now() + 1,
                text: responseText,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);

            // Persist AI Message
            try {
                await apiClient.post('/chat', {
                    roomId,
                    text: responseText,
                    senderId: 'tutor_ai',
                    senderName: 'AI Tutor',
                    senderPhoto: null, // AI doesn't have a photo URL
                    createdAt: new Date()
                });
            } catch (e) {
                console.error("Failed to save AI message:", e);
            }
            if (consentChoice === 'opt_in') {
                mlClient.post('/ingest', {
                    userId: currentUser?.uid || 'anonymous',
                    feature: 'ai_tutor',
                    role: 'assistant',
                    content: responseText,
                    consent: true
                }).catch(() => {});
            }

        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: "⚠️ **Oops!** I ran into a hiccup. Could you try asking that again?",
                sender: 'ai',
                timestamp: new Date()
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const clearChat = () => {
        if (window.confirm("Start a new study session? This will clear the current chat view (history is saved).")) {
            setMessages([{
                id: Date.now(),
                text: "New session started! What should we study now?",
                sender: 'ai',
                timestamp: new Date()
            }]);
            // Optionally clear history from backend if desired, but user asked to save it.
            // So we just clear the view or maybe we shouldn't clear it at all if it's persistent?
            // "save old chats in AI in personal assitancet" implies persistence.
            // So "Clear Chat" might just be "Refresh" or "New Topic" separator.
            // For now, let's keep it as clearing the view locally.
        }
    };

    return (
        <div className="flex h-[calc(100vh-0px)] bg-background text-text font-sans overflow-hidden relative">
            {/* Backdrop for mobile sidebar */}
            <AnimatePresence>
                {isSidebarOpen && window.innerWidth < 768 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute inset-0 bg-black/80 z-20 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar - Study Materials */}
            <motion.div 
                initial={false}
                animate={{ 
                    width: isSidebarOpen ? 320 : 0, 
                    opacity: isSidebarOpen ? 1 : 0,
                    x: (window.innerWidth < 768 && !isSidebarOpen) ? -320 : 0
                }}
                className={`bg-surface border-r border-white/5 flex flex-col shrink-0 overflow-hidden h-full absolute md:relative z-30 shadow-2xl md:shadow-none`}
            >
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <h2 className="font-display font-bold text-lg flex items-center gap-2">
                        <BookOpen size={20} className="text-primary" />
                        Library
                    </h2>
                    <span className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400">{vaultFiles.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 w-[320px]">
                    {/* Upload Button */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isIndexing}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-primary/50 text-gray-400 hover:text-white rounded-xl transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                        <div className="p-3 bg-black/20 rounded-full group-hover:bg-primary/20 transition-colors">
                            {isIndexing ? <RefreshCw className="animate-spin text-primary" size={20} /> : <Upload size={20} className="group-hover:text-primary" />}
                        </div>
                        <span className="text-sm font-medium">{isIndexing ? 'Reading file...' : 'Upload PDF Notes'}</span>
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf" 
                        onChange={handleFileUpload} 
                    />

                    {/* File List */}
                    <div className="space-y-2 mt-4">
                        {vaultFiles.length > 0 && <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Documents</h3>}
                        {vaultFiles.map((file, i) => (
                            <div key={i} className="group p-3 bg-black/20 border border-white/5 hover:border-white/10 rounded-lg hover:bg-white/5 transition-all cursor-pointer flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/10 rounded flex items-center justify-center shrink-0 text-red-400">
                                    <FileText size={20} />
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <p className="text-sm font-medium truncate text-gray-200 group-hover:text-white">{file.name}</p>
                                    <p className="text-[10px] text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Profile Link at Bottom */}
                <div className="p-4 border-t border-white/5 mt-auto w-[320px]">
                     <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
                            <img 
                                src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName}&background=random`} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{currentUser?.displayName || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">View Profile</p>
                        </div>
                        <UserIcon size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
                     </Link>
                </div>
            </motion.div>

            {/* Toggle Sidebar Button (Mobile Only) */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`md:hidden absolute top-20 left-4 z-40 bg-surface border border-white/10 p-2 rounded-lg shadow-lg text-gray-400 hover:text-white transition-all`}
            >
                {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative bg-background w-full">
                {/* Header */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-surface/50 backdrop-blur-md">
                    <div className="flex items-center gap-3 pl-12 md:pl-0">
                        <div>
                            <h1 className="font-display font-bold text-xl flex items-center gap-2">
                                AI Tutor <span className="text-xs font-normal bg-primary/20 text-primary px-2 py-0.5 rounded-full">Beta</span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-white/10 hover:border-primary/50 transition-colors">
                            <img 
                                src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName}&background=0D8ABC&color=fff`} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        </Link>
                        <button 
                            onClick={clearChat}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Clear Chat"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                    {messages.map((msg) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id} 
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                                    msg.sender === 'user' ? 'bg-primary text-black' : 'bg-surface border border-white/10 text-primary'
                                }`}>
                                    {msg.sender === 'user' ? <UserIcon size={16} strokeWidth={2.5} /> : <Bot size={16} strokeWidth={2.5} />}
                                </div>

                                {/* Bubble */}
                                <div className={`p-4 md:p-5 rounded-2xl shadow-sm ${
                                    msg.sender === 'user' 
                                        ? 'bg-primary text-black rounded-tr-none' 
                                        : 'bg-surface border border-white/10 text-gray-100 rounded-tl-none'
                                }`}>
                                    <div className={`prose prose-sm max-w-none ${
                                        msg.sender === 'user' ? 'prose-headings:text-black prose-p:text-black/90 prose-strong:text-black prose-code:text-black prose-code:bg-black/10' : 'prose-invert prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white prose-code:text-primary prose-code:bg-primary/10'
                                    }`}>
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                    <div className={`text-[10px] mt-2 font-medium opacity-60 ${
                                        msg.sender === 'user' ? 'text-black' : 'text-gray-500'
                                    }`}>
                                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    
                    {isProcessing && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="flex gap-4 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-surface border border-white/10 text-primary flex items-center justify-center shrink-0 shadow-lg">
                                    <Bot size={16} strokeWidth={2.5} />
                                </div>
                                <div className="bg-surface border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-background/80 backdrop-blur-lg border-t border-white/5 z-10">
                    <div className="max-w-4xl mx-auto relative">
                        {showConsent && (
                            <div className="mb-4">
                                <AIDataConsentBanner
                                    consentKey="ai_data_consent_tutor"
                                    feature="AI Tutor"
                                    onDecision={handleConsentDecision}
                                />
                            </div>
                        )}
                        <div className="flex items-end gap-2 bg-surface border border-white/10 rounded-2xl p-2 shadow-lg focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 text-gray-400 hover:text-primary hover:bg-white/5 rounded-xl transition-all shrink-0"
                                title="Upload File"
                            >
                                <Paperclip size={20} />
                            </button>
                            
                            <TextareaAutosize
                                minRows={1}
                                maxRows={5}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask a question about your notes..."
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-base py-3 px-2 resize-none font-sans"
                            />
                            
                            <button 
                                onClick={handleSend}
                                disabled={isProcessing || !inputText.trim()}
                                className="p-3 bg-primary hover:bg-yellow-400 text-black rounded-xl transition-all disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-500 shrink-0 shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                            >
                                <Send size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-600 mt-3">
                            AI Tutor can make mistakes. Please verify important information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
