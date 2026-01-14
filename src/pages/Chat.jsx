import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { searchUsers, getChatRoomId, sendMessage, fetchMessages, fetchConversations } from '../services/chatService';
import { Search, Send, User as UserIcon, MoreVertical, Phone, Video, ArrowLeft, MessageSquare, Sparkles } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import { io } from 'socket.io-client';
import { useLocation, Link } from 'react-router-dom';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function Chat() {
    const { currentUser } = useAuth();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [conversations, setConversations] = useState([]);
    const socketRef = useRef();

    // Persist Active Chat User
    const [activeChatUser, setActiveChatUser] = useState(() => {
        // First priority: user from navigation state (clicking "Message" on profile)
        if (location.state?.activeChatUser) {
            return location.state.activeChatUser;
        }
        const saved = localStorage.getItem('last_active_chat_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isVanishMode, setIsVanishMode] = useState(false);
    const messagesEndRef = useRef(null);

    // Initialize Socket
    useEffect(() => {
        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('connect', () => {
            console.log('Connected to socket server');
        });

        socketRef.current.on('receive_message', (message) => {
            // Only add if it belongs to current active room
            const currentRoomId = getChatRoomId(currentUser.uid, activeChatUser?.uid);
            if (message.roomId === currentRoomId && message.senderId !== currentUser.uid) {
                setMessages(prev => [...prev, message]);
            }
            // Update conversation list locally
            loadConversations();
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [activeChatUser?.uid]);

    // Join room when active user changes
    useEffect(() => {
        if (activeChatUser && socketRef.current) {
            const roomId = getChatRoomId(currentUser.uid, activeChatUser.uid);
            socketRef.current.emit('join_room', roomId);

            // Fetch history
            const loadHistory = async () => {
                const msgs = await fetchMessages(roomId);
                setMessages(msgs);
            };
            loadHistory();
        }
    }, [activeChatUser?.uid, currentUser.uid]);

    // Persist choice
    useEffect(() => {
        if (activeChatUser) {
            localStorage.setItem('last_active_chat_user', JSON.stringify(activeChatUser));
        }
    }, [activeChatUser]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            let data = await fetchConversations(currentUser.uid);

            // If we have an active chat user, ensure they are in the list
            if (activeChatUser && activeChatUser.uid !== 'gemini_group') {
                const exists = data.some(c => c.user.uid === activeChatUser.uid);
                if (!exists) {
                    data = [{
                        user: activeChatUser,
                        lastMessage: 'New conversation',
                        lastMessageTime: new Date()
                    }, ...data];
                }
            }

            setConversations(data);
        } catch (e) {
            console.error("Failed to load conversations", e);
        }
    };

    // Initial load
    useEffect(() => {
        loadConversations();
    }, [currentUser.uid, activeChatUser?.uid]);

    // Handle Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.length > 1) {
                const results = await searchUsers(searchTerm);
                setSearchResults(results.filter(u => u.uid !== currentUser.uid));
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, currentUser.uid]);

    const isOnline = (lastSeen) => {
        if (!lastSeen) return false;
        const diff = Date.now() - new Date(lastSeen).getTime();
        return diff < 5 * 60 * 1000;
    };

    const StatusDot = ({ online }) => (
        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${online ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}>
            {online && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />}
        </div>
    );

    const handleSend = async () => {
        if (!inputText.trim() || !activeChatUser) return;
        const roomId = getChatRoomId(currentUser.uid, activeChatUser.uid);

        const currentText = inputText;
        setInputText('');

        const messageData = {
            id: Date.now().toString(), // Temp ID for list
            roomId,
            text: currentText,
            senderId: currentUser.uid,
            senderName: currentUser.displayName,
            senderPhoto: currentUser.photoURL,
            createdAt: new Date()
        };

        // Optimistic UI Update
        setMessages(prev => [...prev, messageData]);

        // Emit via socket - the server will persist this to Mongo
        socketRef.current.emit('send_message', messageData);
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)] w-full overflow-hidden bg-black md:rounded-3xl border border-white/5 relative shadow-2xl">
            {/* Sidebar / User List */}
            <aside className={`w-full md:w-96 border-r border-white/10 flex flex-col bg-background/50 backdrop-blur-xl z-20 ${activeChatUser ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-display font-black text-white italic tracking-tighter">Vibe<span className="text-primary">.</span></h2>
                        <div className="p-2 bg-white/5 rounded-xl text-gray-400"><MessageSquare size={20} /></div>
                    </div>

                    {/* Gemini AI Group - Pin */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveChatUser({ uid: 'gemini_group', displayName: "Gemini AI Council", photoURL: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" })}
                        className={`group p-4 rounded-2xl cursor-pointer border transition-all flex items-center gap-4 ${activeChatUser?.uid === 'gemini_group' ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 hover:border-primary/50 text-white'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg ${activeChatUser?.uid === 'gemini_group' ? 'bg-black/20' : 'bg-primary/20 animate-pulse'}`}>✨</div>
                        <div>
                            <h4 className="font-black tracking-tight">AI Council</h4>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${activeChatUser?.uid === 'gemini_group' ? 'text-black/60' : 'text-primary'}`}>Group Insight</p>
                        </div>
                        <Sparkles className="ml-auto opacity-20 group-hover:opacity-100 transition-opacity" size={20} />
                    </motion.div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            placeholder="Find your tribe..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-primary focus:bg-white/10 transition-all font-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-0">
                    {/* Search Results */}
                    <AnimatePresence>
                        {searchTerm.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-3 space-y-1 mb-6">
                                <p className="text-[10px] font-black text-gray-500 px-4 mb-2 tracking-[0.2em] uppercase">Search Hits</p>
                                {searchResults.map(user => (
                                    <div
                                        key={user.uid}
                                        onClick={() => { setActiveChatUser(user); setSearchTerm(''); }}
                                        className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-white/5 group"
                                    >
                                        <div className="relative">
                                            <UserAvatar src={user.photoURL} name={user.displayName} size="md" className="border-2 border-white/10" />
                                            <StatusDot online={isOnline(user.lastSeen)} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold group-hover:text-primary transition-colors">{user.displayName}</h4>
                                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{user.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Conversations List */}
                    <div className="px-3 space-y-1">
                        <p className="text-[10px] font-black text-gray-500 px-4 mb-2 tracking-[0.2em] uppercase">Recent Vibe</p>
                        {conversations.length > 0 ? conversations.map(conv => (
                            <div
                                key={conv.user.uid}
                                onClick={() => setActiveChatUser(conv.user)}
                                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border group ${activeChatUser?.uid === conv.user.uid ? 'bg-white/10 border-white/20' : 'border-transparent hover:bg-white/5 hover:border-white/5'}`}
                            >
                                <div className="relative">
                                    <UserAvatar src={conv.user.photoURL} name={conv.user.displayName} size="md" className="border-2 border-white/10" />
                                    <StatusDot online={isOnline(conv.user.lastSeen)} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className="text-white font-bold truncate group-hover:text-primary transition-colors">{conv.user.displayName}</h4>
                                        <span className="text-[10px] text-gray-600 font-bold">{new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-gray-500 text-xs truncate font-medium">{conv.lastMessage}</p>
                                </div>
                            </div>
                        )) : !searchTerm && (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-600 px-8 text-center">
                                <Search size={32} className="mb-4 opacity-10" />
                                <p className="text-sm font-bold uppercase tracking-widest">No existing waves</p>
                                <p className="text-xs font-medium mt-2">Start a new conversation by searching for a student above.</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Chat Area */}
            <main className={`flex-1 flex flex-col relative transition-all duration-500 ${isVanishMode ? 'bg-black' : 'bg-black/20'} ${!activeChatUser ? 'hidden md:flex' : 'flex'}`}>
                {activeChatUser ? (
                    <>
                        {/* Header */}
                        <header className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-xl sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setActiveChatUser(null)} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
                                    <ArrowLeft size={24} />
                                </button>
                                <div className="relative">
                                    {activeChatUser.uid !== 'gemini_group' ? (
                                        <Link to={`/user/${activeChatUser.uid}`}>
                                            <UserAvatar src={activeChatUser.photoURL} name={activeChatUser.displayName} size="md" className="border-2 border-white/10 shadow-lg hover:border-primary transition-colors" />
                                        </Link>
                                    ) : (
                                        <UserAvatar src={activeChatUser.photoURL} name={activeChatUser.displayName} size="md" className="border-2 border-white/10 shadow-lg" />
                                    )}
                                    {activeChatUser.uid !== 'gemini_group' && (
                                        <StatusDot online={isOnline(activeChatUser.lastSeen)} />
                                    )}
                                </div>
                                <div>
                                    {activeChatUser.uid !== 'gemini_group' ? (
                                        <Link to={`/user/${activeChatUser.uid}`} className="hover:text-primary transition-colors">
                                            <h3 className="text-white font-black tracking-tight text-lg">{activeChatUser.displayName}</h3>
                                        </Link>
                                    ) : (
                                        <h3 className="text-white font-black tracking-tight text-lg">{activeChatUser.displayName}</h3>
                                    )}
                                    {activeChatUser.uid === 'gemini_group' ? (
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest animate-pulse">Council for Digital Sentience</p>
                                    ) : (
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isOnline(activeChatUser.lastSeen) ? 'text-green-500' : 'text-red-500'}`}>
                                            {isOnline(activeChatUser.lastSeen) ? 'Engaged (Online)' : 'Departed (Offline)'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsVanishMode(!isVanishMode)} className={`p-3 rounded-2xl transition-all ${isVanishMode ? 'bg-primary text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                                    <UserIcon size={20} />
                                </button>
                                <button className="p-3 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all hidden md:block">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar">
                            {messages.length > 0 ? messages.map((msg, i) => {
                                const isMe = msg.senderId === currentUser.uid;
                                const isAI = msg.senderId === 'gemini_bot';
                                return (
                                    <motion.div
                                        key={msg.id || i}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`group relative max-w-[85%] md:max-w-[70%] px-5 md:px-6 py-3.5 md:py-4 rounded-[2rem] text-sm md:text-base font-medium shadow-xl transition-all ${isMe
                                            ? 'bg-primary text-black rounded-tr-none'
                                            : isAI
                                                ? 'bg-gradient-to-br from-blue-900/60 to-purple-900/60 text-white rounded-tl-none border border-white/20 backdrop-blur-md'
                                                : 'bg-white/5 text-white rounded-tl-none border border-white/10 backdrop-blur-sm'
                                            }`}>
                                            {msg.text}
                                            <span className={`absolute -bottom-5 text-[10px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'right-0' : 'left-0'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                )
                            }) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                                    <div className="p-6 bg-white/5 rounded-full border border-white/10 animate-pulse"><MessageSquare size={32} /></div>
                                    <p className="text-sm font-bold uppercase tracking-widest">No frequencies yet</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Typing / Input Area */}
                        <div className="p-6 md:p-8 bg-black/60 backdrop-blur-2xl border-t border-white/10">
                            <div className="flex gap-4 max-w-5xl mx-auto">
                                <div className="flex-1 relative group">
                                    <input
                                        className="w-full bg-white/5 border border-white/15 rounded-3xl px-6 md:px-8 py-4 md:py-5 text-white outline-none focus:border-primary focus:bg-white/10 transition-all shadow-2xl placeholder:text-gray-600 font-medium md:text-lg"
                                        placeholder="Broadcast a frequency..."
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex gap-2">
                                        {/* Emoji / Attachment icons could go here */}
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    className="w-14 h-14 md:w-16 md:h-16 bg-primary rounded-3xl flex items-center justify-center text-black hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all flex-shrink-0 active:rotate-12"
                                >
                                    <Send size={24} />
                                </motion.button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8 select-none">
                        <div className="relative">
                            <div className="w-32 h-32 md:w-48 md:h-48 bg-white/5 rounded-[3rem] rotate-12 absolute inset-0 blur-3xl opacity-20" />
                            <div className="w-32 h-32 md:w-48 md:h-48 bg-primary rounded-[3rem] -rotate-12 animate-pulse flex items-center justify-center shadow-2xl relative">
                                <MessageSquare size={64} className="text-black md:w-24 md:h-24" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl md:text-5xl font-display font-black text-white italic tracking-tighter">Your Frequency Lounge<span className="text-primary">.</span></h2>
                            <p className="text-gray-600 font-medium max-w-md mx-auto">Reconnect with your tribe, collaborate on insights, or consult the AI Council for digital wisdom.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

