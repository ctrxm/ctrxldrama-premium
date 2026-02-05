"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  userRole: 'user' | 'admin' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] Initial session check:', session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthContext] Auth state changed:', _event, session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    console.log('[AuthContext] Fetching role for user:', userId);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Error fetching user role:', error);
        console.error('[AuthContext] Error details:', JSON.stringify(error, null, 2));
        
        // If error is related to RLS or not found, try to insert the user
        if (error.code === 'PGRST116' || error.message.includes('no rows')) {
          console.log('[AuthContext] User not found in users table, creating...');
          const { error: insertError } = await supabase
            .from('users')
            .insert([{ id: userId, role: 'user' }]);
          
          if (insertError) {
            console.error('[AuthContext] Error creating user:', insertError);
          } else {
            console.log('[AuthContext] User created successfully');
          }
        }
        
        setUserRole('user');
      } else {
        console.log('[AuthContext] Role fetched successfully:', data?.role);
        setUserRole(data?.role || 'user');
      }
    } catch (error) {
      console.error('[AuthContext] Exception fetching user role:', error);
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        // Handle specific Supabase errors
        if (error.message.includes('Database error saving new user')) {
          throw new Error('Registration temporarily unavailable. Please try again later.');
        }
        throw new Error(error.message || 'Failed to sign up');
      }

      if (!data.user) {
        throw new Error('No user data returned from signup');
      }

      // Try to create user record manually if trigger didn't work
      try {
        const { error: insertError } = await supabase
          .from('users')
          .upsert([{ 
            id: data.user.id, 
            email: data.user.email || email,
            role: 'user' 
          }], { 
            onConflict: 'id',
            ignoreDuplicates: true 
          });
        
        if (insertError) {
          console.warn('Could not create user record:', insertError);
          // Don't throw - user is still created in auth
        }
      } catch (e) {
        console.warn('Error creating user record:', e);
        // Don't throw - user is still created in auth
      }

      console.log('Signup successful:', data.user.email);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: userRole === 'admin',
  };

  console.log('[AuthContext] Current state:', {
    user: user?.email,
    userRole,
    loading,
    isAdmin: userRole === 'admin',
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
