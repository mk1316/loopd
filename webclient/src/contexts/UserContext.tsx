'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { posthog } from '@/lib/posthog'

interface UserContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isSupabaseAvailable: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // If Supabase is not available, just set loading to false
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      // Identify user in PostHog if logged in
      if (session?.user) {
        posthog?.identify(session.user.id, { email: session.user.email });
      } else {
        posthog?.reset();
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        // Identify user in PostHog if logged in
        if (session?.user) {
          posthog?.identify(session.user.id, { email: session.user.email });
        } else {
          posthog?.reset();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    isSupabaseAvailable: !!supabase,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 