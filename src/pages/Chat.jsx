import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { searchUsers, getChatRoomId, sendMessage, fetchMessages } from '../services/chatService';
import { Search, Send, User as UserIcon, MoreVertical, Phone, Video, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function Chat() {
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [activeChatUser, setActiveChatUser] = useState(null); // The user we are talking to
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isVanishMode, setIsVanishMode] = useState(false);
    
    // Ensure every message has a unique key. When optimistic updating, we use Date.now(), 
    // but the backend uses _id. We'll handle this in the render.
    const messagesEndRef = useRef(null);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
             if(searchTerm.length > 1) {
                 const results = await searchUsers(searchTerm);
                 // Filter out myself
                 setSearchResults(results.filter(u => u.uid !== currentUser.uid));
             } else {
                 setSearchResults([]);
             }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, currentUser.uid]);

    // Poll Messages (Real-time Simulation via Long Polling)
    useEffect(() => {
        let interval;
        const loadMessages = async () => {
             if (!activeChatUser) return;
             const roomId = getChatRoomId(currentUser.uid, activeChatUser.uid);
             const msgs = await fetchMessages(roomId);
             setMessages(msgs);
        };

        if (activeChatUser) {
            loadMessages();
            // Poll every 2 seconds for new messages
            interval = setInterval(loadMessages, 2000);
        }

        return () => clearInterval(interval);
    }, [activeChatUser, currentUser.uid]);

    const handleSend = async () => {
        if (!inputText.trim() || !activeChatUser) return;
        const roomId = getChatRoomId(currentUser.uid, activeChatUser.uid);
        
        // Optimistic UI Update
        const tempMsg = {
            id: Date.now(),
            text: inputText,
            senderId: currentUser.uid,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);
        setInputText('');

        await sendMessage(roomId, tempMsg.text, currentUser);
        // Background fetch will start syncing next poll
    };

    return (
        <div className="flex h-[calc(100vh-1rem)] w-full overflow-hidden bg-black md:rounded-2xl border border-white/5 relative">
            {/* Sidebar / User List */}
            <div className={`w-full md:w-80 border-r border-white/5 flex flex-col bg-background z-20 ${activeChatUser ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-white/5">
                    <h2 className="text-xl font-display font-black text-white mb-4">Messages</h2>
                    
                    {/* Gemini Group */}
                    <div 
                        onClick={() => setActiveChatUser({ uid: null, displayName: "Gemini AI Group", photoURL: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" })}
                        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-xl mb-4 cursor-pointer border border-white/10 hover:border-primary/50 transition-colors flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">✨</div>
                        <div>
                            <h4 className="font-bold text-white">Gemini Group</h4>
                            <p className="text-xs text-blue-300">Talk to AI together</p>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            placeholder="Find students..." 
                            className="w-full bg-surface border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-primary"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Search Results */}
                    {searchResults.length > 0 ? (
                        <div className="p-2">
                             <p className="text-xs font-bold text-gray-500 px-2 mb-2">SEARCH RESULTS</p>
                             {searchResults.map(user => (
                                 <div 
                                    key={user.uid}
                                    onClick={() => setActiveChatUser(user)}
                                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                                 >
                                     <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full bg-gray-800" />
                                     <div>
                                         <h4 className="text-white font-bold text-sm">{user.displayName}</h4>
                                         <p className="text-gray-500 text-xs">{user.role}</p>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                            <Search size={40} className="mb-4 opacity-20" />
                            <p>Search for a friend to start chatting</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {activeChatUser ? (
                <div className={`flex-1 flex flex-col ${isVanishMode ? 'bg-black' : 'bg-transparent'} transition-colors duration-500`}>
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setActiveChatUser(null)} className="md:hidden text-gray-400">
                                <ArrowLeft />
                            </button>
                            <img src={activeChatUser.photoURL} className="w-10 h-10 rounded-full border border-white/10" />
                            <div>
                                <h3 className="text-white font-bold">{activeChatUser.displayName}</h3>
                                <p className="text-xs text-green-500 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Online
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 text-gray-400">
                            <button onClick={() => setIsVanishMode(!isVanishMode)} className={`transition-colors ${isVanishMode ? 'text-purple-500' : 'hover:text-white'}`}>
                                <UserIcon size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map(msg => {
                            const isMe = msg.senderId === currentUser.uid;
                            return (
                                <motion.div 
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm font-medium ${
                                        isMe 
                                        ? 'bg-primary text-black rounded-tr-none' 
                                        : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/5 bg-black/20">
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 bg-surface border border-white/10 rounded-full px-6 py-3 text-white outline-none focus:border-primary transition-colors"
                                placeholder="Type a message..."
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                            />
                            <button 
                                onClick={handleSend}
                                className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center flex-col text-gray-500">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <MoreVertical size={32} />
                    </div>
                    <p className="text-xl font-bold text-white mb-2">Your Messages</p>
                    <p>Send a message to start a conversation.</p>
                </div>
            )}
        </div>
    );
}
