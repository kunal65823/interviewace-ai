import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import api from '@/lib/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

 const fetchProfile = async () => {
  try {
    const { data } = await api.get('/auth/me');
    setProfile(data.data.profile);
  } catch (err) {
    // If profile not found, use Google OAuth data as fallback
    const { data: sessionData } = await supabase.auth.getSession();
    const googleUser = sessionData?.session?.user;
    
    if (googleUser) {
      setProfile({
        full_name: googleUser.user_metadata?.full_name || 
                  googleUser.user_metadata?.name || 
                  googleUser.email?.split('@')[0] || 
                  'User',
        avatar_url: googleUser.user_metadata?.avatar_url || 
                    googleUser.user_metadata?.picture || null,
        role: 'candidate'
      });
    }
  }
};

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);

      if (data.session) {
        await fetchProfile();
      }
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile();
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
