import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface Match {
  id: string;
  match_date: string;
  player1_id: string;
  player2_id: string;
  round1_player1_score: number | null;
  round1_player2_score: number | null;
  round2_player1_score: number | null;
  round2_player2_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerStats {
  player_id: string;
  first_name: string;
  last_name: string;
  total_points: number;
  wins: number;
  draws: number;
  losses: number;
  matches_played: number;
}
