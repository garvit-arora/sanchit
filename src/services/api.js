import axios from 'axios';
import { collection, query, orderBy, limit, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- POSTS (Feed) via MongoDB ---
export const fetchFeed = async () => {
    const res = await axios.get(`${API_URL}/posts`);
    return res.data;
};

export const createPost = async (content, image, video, song, user) => {
    const res = await axios.post(`${API_URL}/posts`, {
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
    const res = await axios.put(`${API_URL}/posts/${postId}/like`, { userId });
    return res.data;
};

export const addComment = async (postId, text, author) => {
    const res = await axios.post(`${API_URL}/posts/${postId}/comment`, { text, author });
    return res.data;
};

export const deletePost = async (postId) => {
    const res = await axios.delete(`${API_URL}/posts/${postId}`);
    return res.data;
};

export const reportPost = async (postId, reporterId, reason) => {
    const res = await axios.post(`${API_URL}/posts/${postId}/report`, { reporterId, reason });
    return res.data;
};

export const fetchUserPosts = async (userId) => {
    try {
        const res = await axios.get(`${API_URL}/posts/user/${userId}`);
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
        const res = await axios.get(`${API_URL}/forum`);
        return res.data;
    } catch (error) {
        console.error("Error fetching forum:", error);
        return [];
    }
};

export const createForumPost = async (title, content, tags, user) => {
    const res = await axios.post(`${API_URL}/forum`, {
        title,
        content,
        tags,
        author: user.displayName || 'Anonymous',
        authorId: user.uid
    });
    return res.data;
};

export const voteForumThread = async (threadId, userId, type) => {
    const res = await axios.put(`${API_URL}/forum/${threadId}/vote`, { userId, type });
    return res.data;
};

// --- JOBS & OPPORTUNITIES (MongoDB) ---
export const fetchJobs = async () => {
    try {
        const res = await axios.get(`${API_URL}/jobs`);
        return res.data;
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return [];
    }
};

export const applyForJob = async (jobId, applicationData) => {
    const res = await axios.post(`${API_URL}/jobs/${jobId}/apply`, applicationData);
    return res.data;
};

// --- REELS (MongoDB) ---
export const fetchReels = async () => {
    try {
        const res = await axios.get(`${API_URL}/reels`);
        return res.data;
    } catch (error) {
        return [];
    }
};

export const likeReel = async (reelId, userId) => {
    const res = await axios.put(`${API_URL}/reels/${reelId}/like`, { userId });
    return res.data;
};

export const addReelComment = async (reelId, text, author, authorId) => {
    const res = await axios.post(`${API_URL}/reels/${reelId}/comment`, { text, author, authorId });
    return res.data;
};

export const uploadReel = async (url, description, user, song = null) => {
    const res = await axios.post(`${API_URL}/reels`, {
        url,
        description,
        userId: user.uid,
        userDisplayName: user.displayName,
        userPhoto: user.photoURL,
        song: song
    });
    return res.data;
};
