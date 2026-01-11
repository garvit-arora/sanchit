import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { BadgeCheck, Pin, MoreHorizontal } from 'lucide-react';
import gsap from 'gsap';
import Navbar from '../components/Navbar';

const FeedCard = ({ type, author, content, verified, time }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, scrollTrigger: cardRef.current }
    );
  }, []);

  return (
    <div ref={cardRef} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {author[0]}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h4 className="font-bold text-gray-900">{author}</h4>
              {verified && <BadgeCheck size={16} className="text-blue-500 fill-blue-50" />}
            </div>
            <p className="text-xs text-gray-500">{type} • {time}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20}/></button>
      </div>
      
      <p className="text-gray-700 leading-relaxed mb-4">{content}</p>
      
      {type === 'Notice' && (
        <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-3 border border-blue-100">
           <Pin size={18} className="text-blue-600 mt-1 shrink-0" />
           <p className="text-sm text-blue-800 font-medium">Official College Update via Admin Console</p>
        </div>
      )}
      
      <div className="flex gap-4 mt-4 border-t pt-3">
        <button className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Like</button>
        <button className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Comment</button>
        <button className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Share</button>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { userProfile, login } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pt-20">
        <Navbar />
        
        <div className="container mx-auto max-w-2xl p-4 md:p-0 pt-4">
            <header className="flex justify-between items-end mb-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Feed</h1>
                    <p className="text-gray-500 font-medium">What's happening on campus</p>
                </div>
                {!userProfile && (
                    <button onClick={login} className="bg-black text-white px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
                        Login
                    </button>
                )}
            </header>

            <div className="space-y-2">
                <FeedCard 
                    type="Notice"
                    author="Dean of Academics"
                    verified={true}
                    time="2 hrs ago"
                    content="⚠️ Urgent: End Semester Exam schedule has been revised due to the upcoming hackathon. access the ERP for the new timetable."
                />
                <FeedCard 
                    type="Student Club"
                    author="Coding Club"
                    verified={true}
                    time="5 hrs ago"
                    content="🚀 HackOct is back! Teams of 4. First prize: ₹50,000. Registrations open tonight at 8 PM. Who's in?"
                />
                <FeedCard 
                    type="Student"
                    author="Rohan Sharma"
                    verified={false}
                    time="10 mins ago"
                    content="Anyone up for a LeetCode mock interview session tonight? Focusing on Graphs and DP."
                />
            </div>
        </div>
    </div>
  );
}
