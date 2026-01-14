import apiClient from './apiClient';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Search Users for Chat
export const searchUsers = async (searchTerm) => {
    try {
        const res = await apiClient.get(`/users/search?q=${searchTerm}`);
        return res.data;
    } catch (e) {
        return [];
    }
};

// Fetch all conversations for a user
export const fetchConversations = async (userId) => {
    try {
        const res = await apiClient.get(`/chat/conversations/${userId}`);
        return res.data;
    } catch (e) {
        return [];
    }
};

// Create or Get Chat Room
export const getChatRoomId = (myUid, otherUid) => {
    if (!otherUid || otherUid === 'gemini_group') return 'community_ai_group'; // Force AI group ID
    const sortedIds = [myUid, otherUid].sort().join("_");
    return sortedIds;
};

// Send Message (Mongo)
export const sendMessage = async (roomId, text, user) => {
    const res = await apiClient.post('/chat', {
        roomId,
        text,
        senderId: user.uid,
        senderName: user.displayName,
        senderPhoto: user.photoURL
    });
    return res.data;
};

// Get Messages (Mongo)
export const fetchMessages = async (roomId) => {
    const res = await apiClient.get(`/chat/${roomId}`);
    return res.data;
};
