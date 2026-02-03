import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
