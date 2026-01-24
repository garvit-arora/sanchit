// Initial data for the application
export const currentUserProfile = {
  uid: 'user-default-123',
  username: 'gautam_dev',
  email: 'gautam@university.edu.in',
  displayName: 'Gautam Sanchit',
  photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gautam',
  eduVerified: true,
  isPremium: true,
  bio: 'Full Stack Developer | Building the future of campus networking | Open Source Contributor',
  skills: ['React', 'Node.js', 'Python', 'Web3', 'Stellar'],
  leetcodeRank: 4231,
  githubUsername: 'gautamdev',
  linkedinUrl: 'https://linkedin.com/in/gautam',
  college: 'IIT Delhi',
  graduationYear: 2025,
  reputation: 2450,
  issuesCreated: 42,
  issuesResolved: 38,
  totalEarned: 1250,
  createdAt: new Date('2024-01-01').toISOString(),
};

export const verifiedUsers = [
  {
    uid: 'user-1',
    displayName: 'Alice Johnson',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    email: 'alice@university.edu.in',
    college: 'MIT',
    reputation: 1250,
    isPremium: true,
  },
  {
    uid: 'user-2',
    displayName: 'Bob Smith',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    email: 'bob@university.edu.in',
    college: 'Stanford',
    reputation: 980,
    isPremium: false,
  },
  {
    uid: 'user-3',
    displayName: 'Carol Williams',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
    email: 'carol@university.edu.in',
    college: 'Harvard',
    reputation: 1580,
    isPremium: true,
  },
  {
    uid: 'user-4',
    displayName: 'David Brown',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    email: 'david@university.edu.in',
    college: 'Berkeley',
    reputation: 720,
    isPremium: false,
  },
];

export const feedPosts = [
  {
    _id: 'post-1',
    userId: 'user-1',
    user: verifiedUsers[0],
    content: 'Me trying to derive Maxwell\'s equations while the rest of the library is auditioning for a talent show. 😭 #EngineeringLife #PhysicsPain',
    image: 'https://images.unsplash.com/photo-1523240715181-310f9d745265?auto=format&fit=crop&q=80&w=1000', // Placeholder for meme
    likes: ['user-2', 'user-3', 'user-4'],
    hasUpvoted: false,
    comments: [
      {
        _id: 'comment-1',
        userId: 'user-2',
        user: verifiedUsers[1],
        content: 'Relatable! The 3rd floor is basically a concert hall now.',
        createdAt: new Date('2024-01-20T10:30:00').toISOString(),
      },
    ],
    createdAt: new Date('2024-01-20T09:00:00').toISOString(),
  },
  {
    _id: 'post-2',
    userId: 'user-3',
    user: verifiedUsers[2],
    content: '🚨 BREAKING: The canteen just announced UNLIMITED COFFEE for finals week! ₹199 for the whole week. We might actually survive this semester. ☕🔥',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1000', // Placeholder for news
    likes: ['user-1', 'user-4', 'user-default-123'],
    hasUpvoted: true,
    comments: [
      {
        _id: 'comment-3',
        userId: 'user-4',
        user: verifiedUsers[3],
        content: 'Is this real? Heading there NOW.',
        createdAt: new Date('2024-01-21T14:20:00').toISOString(),
      },
    ],
    createdAt: new Date('2024-01-21T13:00:00').toISOString(),
  },
  {
    _id: 'post-3',
    userId: 'user-default-123',
    user: currentUserProfile,
    content: 'Unpopular opinion: The best place to study on campus is actually the empty classroom in the Mechanical block after 6 PM. Change my mind. 🤫',
    likes: ['user-1', 'user-2'],
    hasUpvoted: false,
    comments: [],
    createdAt: new Date('2024-01-22T08:00:00').toISOString(),
  },
];


export const jobOpportunities = [
  {
    _id: 'opp-1',
    title: 'Frontend Developer Intern',
    company: 'TechCorp',
    location: 'Remote',
    type: 'Internship',
    description: 'Looking for a passionate frontend developer to join our team. Work on cutting-edge React applications.',
    requirements: ['React', 'JavaScript', 'CSS', 'Git'],
    stipend: '₹20,000/month',
    duration: '3 months',
    applyBy: new Date('2024-02-28').toISOString(),
    postedBy: verifiedUsers[0],
    createdAt: new Date('2024-01-15').toISOString(),
  },
  {
    _id: 'opp-2',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Bangalore',
    type: 'Full-time',
    description: 'Join our fast-growing startup as a full-stack developer. Build scalable web applications.',
    requirements: ['Node.js', 'React', 'MongoDB', 'AWS'],
    stipend: '₹8-12 LPA',
    duration: 'Full-time',
    applyBy: new Date('2024-02-15').toISOString(),
    postedBy: verifiedUsers[2],
    createdAt: new Date('2024-01-18').toISOString(),
  },
];

export const activeHackathons = [
  {
    _id: 'hack-1',
    name: 'HackMIT 2024',
    organizer: 'MIT',
    date: new Date('2024-03-15').toISOString(),
    location: 'Cambridge, MA',
    mode: 'Offline',
    prizePool: '$50,000',
    description: 'The premier hackathon at MIT. Build innovative solutions to real-world problems.',
    registrationLink: '#',
    tags: ['AI/ML', 'Web Dev', 'Hardware'],
  },
];

export const forumThreads = [
  {
    _id: 'thread-1',
    title: 'Best resources to learn React in 2024?',
    author: verifiedUsers[3].displayName,
    authorId: verifiedUsers[3].uid,
    content: 'I\'m starting my React journey. What are the best resources you\'d recommend?',
    tags: ['React', 'Learning', 'Resources'],
    upvotes: ['user-1', 'user-2'],
    downvotes: [],
    comments: [],
    createdAt: new Date('2024-01-19').toISOString(),
  },
];

export const reelsData = [
  {
    _id: 'reel-1',
    userId: 'user-1',
    user: verifiedUsers[0],
    videoUrl: 'https://example.com/reel1.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=1',
    caption: 'Quick tutorial on React Hooks! 🚀',
    likes: ['user-2', 'user-3'],
    hasLiked: false,
    createdAt: new Date('2024-01-22').toISOString(),
  },
];

export const statsLeaderboard = [
  {
    rank: 1,
    user: verifiedUsers[2],
    reputation: 1580,
    issuesResolved: 45,
    totalEarned: 1200,
  },
  {
    rank: 2,
    user: verifiedUsers[0],
    reputation: 1250,
    issuesResolved: 38,
    totalEarned: 950,
  },
  {
    rank: 3,
    user: verifiedUsers[1],
    reputation: 980,
    issuesResolved: 29,
    totalEarned: 720,
  },
  {
    rank: 4,
    user: currentUserProfile,
    reputation: 850,
    issuesResolved: 23,
    totalEarned: 450,
  },
];

export const initialConversations = [
  {
    _id: 'chat-ai-1',
    user: { uid: 'personal_ai', displayName: 'Personal Assistant' },
    lastMessage: 'Ready to help you build.',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
  },
];


