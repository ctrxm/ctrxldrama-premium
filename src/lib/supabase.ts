import { createClient } from '@supabase/supabase-js';

// Real Supabase credentials (anon key is safe to expose publicly)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ymcjoloqemofuhiomdgk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltY2pvbG9xZW1vZnVoaW9tZGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MzAxMjQsImV4cCI6MjA4NTQwNjEyNH0.WmkqB1Ro9iVBB8w1NTr7Oy8a0CXqtMH-Zb1CS38wSGc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      statistics: {
        Row: {
          id: string;
          total_views: number;
          total_users: number;
          active_users: number;
          total_dramas: number;
          created_at: string;
          updated_at: string;
        };
      };
      ads: {
        Row: {
          id: string;
          title: string;
          image_url: string;
          link_url: string;
          position: 'banner' | 'sidebar' | 'popup';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          image_url: string;
          link_url: string;
          position: 'banner' | 'sidebar' | 'popup';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          image_url?: string;
          link_url?: string;
          position?: 'banner' | 'sidebar' | 'popup';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      maintenance: {
        Row: {
          id: string;
          is_active: boolean;
          message: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
