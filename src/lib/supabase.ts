import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      leaderboard: {
        Row: {
          id: string;
          player_name: string;
          score: number;
          wave: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_name: string;
          score: number;
          wave: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          player_name?: string;
          score?: number;
          wave?: number;
          created_at?: string;
        };
      };
    };
  };
};
