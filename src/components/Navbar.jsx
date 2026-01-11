import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Briefcase, Home, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Trophy, label: 'Rankings', path: '/leaderboard' },
    { icon: Briefcase, label: 'Jobs', path: '/opportunities' },
  ];

  return (
    <nav className="fixed bottom-0 md:top-0 md:bottom-auto w-full bg-white/80 backdrop-blur-md border-t md:border-b md:border-t-0 border-gray-200 z-50">
      <div className="container mx-auto max-w-2xl flex justify-around items-center p-3">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link key={path} to={path} className="flex flex-col items-center gap-1 group">
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300",
              location.pathname === path ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"
            )}>
              <Icon size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 group-hover:text-primary transition-colors">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
