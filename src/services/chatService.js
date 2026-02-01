import apiClient from './apiClient';

// Search Users for Chat
export const searchUsers = async (searchTerm) => {
    if (!searchTerm) return [];
    try {
        const { data } = await apiClient.get(`/users/search?q=${searchTerm}`);
        return data;
    } catch (e) {
        console.error("Search failed:", e);
        return [];
    }
};

// Fetch all conversations for a user
export const fetchConversations = async (userId) => {
    try {
        const { data } = await apiClient.get(`/chat/conversations/${userId}`);
        return data;
    } catch (e) {
        console.error("Fetch conversations failed:", e);
        return [];
    }
};

// Create or Get Chat Room
export const getChatRoomId = (myUid, otherUid) => {
    if (otherUid === 'gemini_group') return 'community_ai_group';
    if (otherUid === 'personal_ai') return `ai_personal_${myUid}`;
    if (otherUid === 'tutor_ai') return `ai_tutor_${myUid}`;
    const sortedIds = [myUid, otherUid].sort().join("_");
    return sortedIds;
};

// Send Message
export const sendMessage = async (roomId, text, user) => {
    try {
        const { data } = await apiClient.post('/chat', {
            roomId,
            text,
            senderId: user.uid,
            senderName: user.displayName,
            senderPhoto: user.photoURL,
            createdAt: new Date()
        });
        return data;
    } catch (e) {
        console.error("Send message failed:", e);
        throw e;
    }
};

// Get Messages
export const fetchMessages = async (roomId) => {
    try {
        const { data } = await apiClient.get(`/chat/${roomId}`);
        return data;
    } catch (e) {
        console.error("Fetch messages failed:", e);
        return [];
    }
};

// Clear Chat History
export const clearChatHistory = async (roomId) => {
    try {
        await apiClient.delete(`/chat/${roomId}`);
    } catch (e) {
        console.error("Clear chat failed:", e);
        throw e;
    }
};
