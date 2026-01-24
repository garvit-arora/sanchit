import { verifiedUsers, initialConversations } from '../initialData';

// Helper to simulate network latency
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Search Users for Chat
export const searchUsers = async (searchTerm) => {
    await delay();
    if (!searchTerm) return [];
    return verifiedUsers.filter(u =>
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// Fetch all conversations for a user
export const fetchConversations = async (userId) => {
    await delay();
    return initialConversations;
};

// Create or Get Chat Room
export const getChatRoomId = (myUid, otherUid) => {
    if (otherUid === 'gemini_group') return 'community_ai_group';
    if (otherUid === 'personal_ai') return `ai_personal_${myUid}`;
    const sortedIds = [myUid, otherUid].sort().join("_");
    return sortedIds;
};

// Send Message
export const sendMessage = async (roomId, text, user) => {
    await delay(100);
    return {
        _id: `msg-${Date.now()}`,
        text,
        senderId: user.uid,
        senderName: user.displayName,
        senderPhoto: user.photoURL,
        createdAt: new Date().toISOString()
    };
};

// Get Messages
export const fetchMessages = async (roomId) => {
    await delay();
    // Return empty history for new vibes in prototype
    if (roomId.includes('ai')) {
        return [
            {
                _id: 'm1',
                text: "Session initiated. How can I assist with your build today?",
                senderId: 'gemini_bot',
                senderName: 'Council',
                createdAt: new Date(Date.now() - 3600000).toISOString()
            }
        ];
    }
    return [];
};
