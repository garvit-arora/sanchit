import apiClient from './apiClient';

// --- POSTS (Feed) ---
export const fetchFeed = async () => {
    const response = await apiClient.get('/posts');
    console.log('fetchFeed response:', response.data);
    return response.data;
};

export const createPost = async (content, image, video, song, user) => {
    const response = await apiClient.post('/posts', {
        content,
        image,
        video,
        song,
        author: user.displayName || 'Anonymous',
        authorId: user.uid,
        authorPhoto: user.photoURL
    });
    return response.data;
};

export const updatePost = async (postId, content, image, video, song) => {
    const response = await apiClient.put(`/posts/${postId}`, {
        content,
        image,
        video,
        song
    });
    return response.data;
};

export const uploadPostMedia = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/posts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const likePost = async (postId, userId) => {
    const response = await apiClient.put(`/posts/${postId}/like`, { userId });
    return response.data;
};

export const bookmarkPost = async (postId, userId) => {
    const response = await apiClient.put(`/posts/${postId}/bookmark`, { userId });
    return response.data;
};

export const addComment = async (postId, text, author) => {
    const response = await apiClient.post(`/posts/${postId}/comment`, { text, author });
    return response.data;
};

export const deletePost = async (postId) => {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
};

export const reportPost = async (postId, reporterId, reason) => {
    const response = await apiClient.post(`/posts/${postId}/report`, { reporterId, reason });
    return response.data;
};

export const fetchUserPosts = async (userId) => {
    const response = await apiClient.get(`/posts/user/${userId}`);
    return response.data;
};

// --- USER & LEETCODE ---
export const fetchUserProfile = async (uid) => {
    const response = await apiClient.get(`/users/${uid}`);
    return response.data;
};

export const fetchLeetCodeStats = async (username) => {
    // Assuming backend syncs this, or we fetch from user profile
    // If there's a specific endpoint for stats:
    // const response = await apiClient.get(`/users/leetcode/${username}`);
    // For now returning null or relying on user profile data
    return null; 
};

// --- FORUM ---
export const fetchForum = async () => {
    const response = await apiClient.get('/forum');
    return response.data;
};

export const createForumPost = async (title, content, tags, user) => {
    const response = await apiClient.post('/forum', {
        title,
        content,
        tags,
        author: user.displayName || 'Anonymous',
        authorId: user.uid
    });
    return response.data;
};

export const voteForumThread = async (threadId, userId, type) => {
    const response = await apiClient.put(`/forum/${threadId}/vote`, { userId, type });
    return response.data;
};

export const addForumComment = async (threadId, text, author, authorId) => {
    const response = await apiClient.post(`/forum/${threadId}/comment`, { text, author, authorId });
    return response.data;
};

export const replyForumComment = async (threadId, commentId, text, author, authorId) => {
    const response = await apiClient.post(`/forum/${threadId}/comment/${commentId}/reply`, { text, author, authorId });
    return response.data;
};

export const fetchUserThreads = async (userId) => {
    const response = await apiClient.get(`/forum/user/${userId}`);
    return response.data;
};

export const deleteForumThread = async (threadId) => {
    const response = await apiClient.delete(`/forum/${threadId}`);
    return response.data;
};

export const updateForumThread = async (threadId, data) => {
    const response = await apiClient.put(`/forum/${threadId}`, data);
    return response.data;
};

export const deleteForumComment = async (threadId, commentId) => {
    const response = await apiClient.delete(`/forum/${threadId}/comment/${commentId}`);
    return response.data;
};

export const reportForumThread = async (threadId, reporterId, reason) => {
    const response = await apiClient.post(`/forum/${threadId}/report`, { reporterId, reason });
    return response.data;
};

// --- JOBS & OPPORTUNITIES ---
export const fetchJobs = async () => {
    const response = await apiClient.get('/jobs');
    return response.data;
};

export const fetchGigs = async () => {
    const response = await apiClient.get('/gigs');
    return response.data;
};

export const applyForJob = async (jobId, applicationData) => {
    const response = await apiClient.post(`/jobs/${jobId}/apply`, applicationData);
    return response.data;
};

export const deleteJob = async (jobId) => {
    const response = await apiClient.delete(`/jobs/${jobId}`);
    return response.data;
};

// --- HACKATHONS ---
export const fetchHackathons = async () => {
    const response = await apiClient.get('/hackathons');
    return response.data;
};

export const applyForHackathon = async (hackathonId, applicationData) => {
    const response = await apiClient.post(`/hackathons/${hackathonId}/apply`, applicationData);
    return response.data;
};

// --- REELS ---
export const fetchReels = async () => {
    const response = await apiClient.get('/reels');
    return response.data;
};

export const fetchUserReels = async (userId) => {
    const response = await apiClient.get(`/reels/user/${userId}`);
    return response.data;
};

export const likeReel = async (reelId, userId) => {
    const response = await apiClient.put(`/reels/${reelId}/like`, { userId });
    return response.data;
};

export const addReelComment = async (reelId, text, author, authorId) => {
    const response = await apiClient.post(`/reels/${reelId}/comment`, { text, author, authorId });
    return response.data;
};

export const uploadReel = async (url, description, user, song = null) => {
    const response = await apiClient.post('/reels', {
        url,
        description,
        userId: user.uid,
        userDisplayName: user.displayName,
        userPhoto: user.photoURL,
        song
    });
    return response.data;
};

export const deleteReel = async (reelId) => {
    const response = await apiClient.delete(`/reels/${reelId}`);
    return response.data;
};

export const updateReel = async (reelId, description) => {
    const response = await apiClient.put(`/reels/${reelId}`, { description });
    return response.data;
};

// --- AUTH (EDU Verification) ---
export const requestEduVerification = async (uid, collegeEmail) => {
    const response = await apiClient.post('/auth/verify-edu', { uid, collegeEmail });
    return response.data;
};

export const verifyOtp = async (uid, otp) => {
    const response = await apiClient.post('/auth/verify-otp', { uid, otp });
    return response.data;
};
