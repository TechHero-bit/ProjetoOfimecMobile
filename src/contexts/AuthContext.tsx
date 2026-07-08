import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getCurrentUser, getSession, signInWithEmail, signOut, signUpWithEmail } from '@/src/services/auth.service';
import { supabase } from '@/src/services/supabase';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const currentSession = await getSession();
        const currentUser = await getCurrentUser();
        if (!isMounted) return;
        setSession(currentSession);
        setUser(currentUser);
      } catch (error) {
        console.warn('Auth initialization failed', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initializeAuth();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await signInWithEmail(email, password);
    if (error) throw error;
    setSession(data.session);
    setUser(data.user);
    setLoading(false);
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await signUpWithEmail(email, password);
    if (error) throw error;
    setSession(data.session);
    setUser(data.user);
    setLoading(false);
  };

  const signOutUser = async () => {
    setLoading(true);
    const { error } = await signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
    setLoading(false);
  };

  const value = useMemo(
    () => ({ user, session, loading, signIn, signUp, signOutUser }),
    [loading, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
