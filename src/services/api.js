import { feedPosts, currentUserProfile, verifiedUsers, forumThreads, jobOpportunities, activeHackathons, reelsData, statsLeaderboard } from '../initialData';

// Helper to simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// --- POSTS (Feed) ---
export const fetchFeed = async () => {
    await delay();
    return feedPosts;
};

export const createPost = async (content, image, video, song, user) => {
    await delay();
    const newPost = {
        _id: `post-${Date.now()}`,
        content,
        image,
        video,
        song,
        author: user.displayName || 'Anonymous',
        authorId: user.uid,
        authorPhoto: user.photoURL,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
    };
    feedPosts.unshift(newPost);
    return newPost;
};

export const likePost = async (postId, userId) => {
    await delay(100);
    const post = feedPosts.find(p => (p._id || p.id) === postId);
    if (post) {
        if (!post.likes) post.likes = [];
        const index = post.likes.indexOf(userId);
        if (index > -1) post.likes.splice(index, 1);
        else post.likes.push(userId);
    }
    return post;
};

export const addComment = async (postId, text, author) => {
    await delay(100);
    const post = feedPosts.find(p => (p._id || p.id) === postId);
    if (post) {
        if (!post.comments) post.comments = [];
        post.comments.push({ author, text, createdAt: new Date().toISOString() });
    }
    return post;
};

export const deletePost = async (postId) => {
    await delay(200);
    const index = feedPosts.findIndex(p => (p._id || p.id) === postId);
    if (index > -1) feedPosts.splice(index, 1);
    return { success: true };
};

export const reportPost = async (postId, reporterId, reason) => {
    await delay(200);
    return { success: true };
};

export const fetchUserPosts = async (userId) => {
    await delay();
    return feedPosts.filter(p => p.authorId === userId);
};

// --- USER & LEETCODE ---
export const fetchUserProfile = async (uid) => {
    await delay();
    if (uid === currentUserProfile.uid) return currentUserProfile;
    return verifiedUsers.find(u => u.uid === uid) || currentUserProfile;
};

export const fetchLeetCodeStats = async (username) => {
    await delay();
    return {
        ranking: 12543,
        totalSolved: 450,
        easy: 200, medium: 180, hard: 70
    };
};

// --- FORUM ---
export const fetchForum = async () => {
    await delay();
    return forumThreads;
};

export const createForumPost = async (title, content, tags, user) => {
    await delay();
    const newThread = {
        _id: `thread-${Date.now()}`,
        title,
        content,
        tags,
        author: user,
        upvotes: [],
        downvotes: [],
        comments: [],
        createdAt: new Date().toISOString()
    };
    forumThreads.unshift(newThread);
    return newThread;
};

export const voteForumThread = async (threadId, userId, type) => {
    await delay(100);
    const thread = forumThreads.find(t => t._id === threadId);
    if (thread) {
        if (type === 'up') {
            if (!thread.upvotes.includes(userId)) thread.upvotes.push(userId);
        } else {
            if (!thread.downvotes.includes(userId)) thread.downvotes.push(userId);
        }
    }
    return thread;
};

export const addForumComment = async (threadId, text, author, authorId) => {
    await delay(100);
    return { success: true };
};

export const replyForumComment = async (threadId, commentId, text, author, authorId) => {
    await delay(100);
    return { success: true };
};

export const fetchUserThreads = async (userId) => {
    await delay();
    return forumThreads.filter(t => t.author?.uid === userId);
};

export const deleteForumThread = async (threadId) => {
    await delay(200);
    return { success: true };
};

export const updateForumThread = async (threadId, data) => {
    await delay(200);
    return { success: true };
};

export const deleteForumComment = async (threadId, commentId) => {
    await delay(200);
    return { success: true };
};

export const reportForumThread = async (threadId, reporterId, reason) => {
    await delay(200);
    return { success: true };
};

// --- JOBS & OPPORTUNITIES ---
export const fetchJobs = async () => {
    await delay();
    return jobOpportunities;
};

export const fetchGigs = async () => {
    await delay();
    return jobOpportunities.filter(o => o.type === 'Gig');
};

export const applyForJob = async (jobId, applicationData) => {
    await delay(500);
    return { success: true };
};

export const deleteJob = async (jobId) => {
    await delay(200);
    return { success: true };
};

// --- HACKATHONS ---
export const fetchHackathons = async () => {
    await delay();
    return activeHackathons;
};

export const applyForHackathon = async (hackathonId, applicationData) => {
    await delay(500);
    return { success: true };
};

// --- REELS ---
export const fetchReels = async () => {
    await delay();
    return reelsData;
};

export const fetchUserReels = async (userId) => {
    await delay();
    return reelsData.filter(r => r.userId === userId);
};

export const likeReel = async (reelId, userId) => {
    await delay(100);
    return { success: true };
};

export const addReelComment = async (reelId, text, author, authorId) => {
    await delay(100);
    return { success: true };
};

export const uploadReel = async (url, description, user, song = null) => {
    await delay(1000);
    const newReel = {
        _id: `reel-${Date.now()}`,
        url,
        description,
        userId: user.uid,
        userDisplayName: user.displayName,
        userPhoto: user.photoURL,
        song: song,
        likes: [],
        createdAt: new Date().toISOString()
    };
    reelsData.unshift(newReel);
    return newReel;
};

// --- AUTH (EDU Verification) ---
export const requestEduVerification = async (uid, collegeEmail) => {
    await delay(1000);
    return { success: true, message: "Verification link sent to your email." };
};

export const verifyOtp = async (uid, otp) => {
    await delay(1000);
    if (otp === "123456") {
        return { success: true, user: { ...currentUserProfile, eduVerified: true } };
    }
    return { success: false, message: "Invalid code. Please check your email." };
};
