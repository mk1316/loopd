'use client';

import { useUser } from '@/contexts/UserContext';
import { LogOut, User } from 'lucide-react';

export function UserProfile() {
  const { user, signOut } = useUser();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">
            {user.user_metadata?.full_name || user.email}
          </span>
          <span className="text-xs text-slate-400">
            {user.email}
          </span>
        </div>
      </div>
      <button
        onClick={signOut}
        className="ml-auto p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
} 