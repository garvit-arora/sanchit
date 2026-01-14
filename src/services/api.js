import apiClient, { API_URL } from './apiClient';
import { collection, query, orderBy, limit, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";

// --- POSTS (Feed) via MongoDB ---
export const fetchFeed = async () => {
    const res = await apiClient.get('/posts');
    return res.data;
};

export const createPost = async (content, image, video, song, user) => {
    const res = await apiClient.post('/posts', {
        content,
        image, // Base64 or URL
        video, // URL
        song, // { title, artist }
        author: user.displayName || 'Anonymous',
        authorId: user.uid,
        authorPhoto: user.photoURL
    });
    return res.data;
};

export const likePost = async (postId, userId) => {
    const res = await apiClient.put(`/posts/${postId}/like`, { userId });
    return res.data;
};

export const addComment = async (postId, text, author) => {
    const res = await apiClient.post(`/posts/${postId}/comment`, { text, author });
    return res.data;
};

export const deletePost = async (postId) => {
    const res = await apiClient.delete(`/posts/${postId}`);
    return res.data;
};

export const reportPost = async (postId, reporterId, reason) => {
    const res = await apiClient.post(`/posts/${postId}/report`, { reporterId, reason });
    return res.data;
};

export const fetchUserPosts = async (userId) => {
    try {
        const res = await apiClient.get(`/posts/user/${userId}`);
        return res.data;
    } catch (error) {
        return [];
    }
};

// --- USER & LEETCODE ---
export const fetchUserProfile = async (uid) => {
    // In a real app, you might fetch this from Mongo if you have extra data there
    // For now we rely on firebase auth context mostly, but if we stored leetcode ID in mongo:
    // return axios.get(...)
};

export const fetchLeetCodeStats = async (username) => {
    // Proxy through your backend to avoid CORS
    // return axios.get(`${API_URL}/leetcodeproxy/${username}`)
    // Mock for now until backend proxy is ready:
    return {
        ranking: Math.floor(Math.random() * 100000),
        totalSolved: Math.floor(Math.random() * 500),
        easy: 10, medium: 20, hard: 5
    };
};

// --- FORUM (MongoDB) ---
export const fetchForum = async () => {
    try {
        const res = await apiClient.get('/forum');
        return res.data;
    } catch (error) {
        console.error("Error fetching forum:", error);
        return [];
    }
};

export const createForumPost = async (title, content, tags, user) => {
    const res = await apiClient.post('/forum', {
        title,
        content,
        tags,
        author: user.displayName || 'Anonymous',
        authorId: user.uid
    });
    return res.data;
};

export const voteForumThread = async (threadId, userId, type) => {
    const res = await apiClient.put(`/forum/${threadId}/vote`, { userId, type });
    return res.data;
};

// --- JOBS & OPPORTUNITIES (MongoDB) ---
export const fetchJobs = async () => {
    try {
        const res = await apiClient.get('/jobs');
        return res.data;
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return [];
    }
};

export const applyForJob = async (jobId, applicationData) => {
    const res = await apiClient.post(`/jobs/${jobId}/apply`, applicationData);
    return res.data;
};

// --- REELS (MongoDB) ---
export const fetchReels = async () => {
    const res = await apiClient.get('/reels');
    if (!Array.isArray(res.data)) {
        throw new Error(res.data.error || "Failed to fetch reels");
    }
    return res.data;
};

export const likeReel = async (reelId, userId) => {
    const res = await apiClient.put(`/reels/${reelId}/like`, { userId });
    return res.data;
};

export const addReelComment = async (reelId, text, author, authorId) => {
    const res = await apiClient.post(`/reels/${reelId}/comment`, { text, author, authorId });
    return res.data;
};

export const uploadReel = async (url, description, user, song = null) => {
    const res = await apiClient.post('/reels', {
        url,
        description,
        userId: user.uid,
        userDisplayName: user.displayName,
        userPhoto: user.photoURL,
        song: song
    });
    return res.data;
};

// --- AUTH (EDU Verification) ---
export const requestEduVerification = async (uid, collegeEmail) => {
    const res = await apiClient.post('/auth/request-verification', { uid, collegeEmail });
    return res.data;
};

export const verifyOtp = async (uid, otp) => {
    const res = await apiClient.post('/auth/verify-otp', { uid, otp });
    return res.data;
};
