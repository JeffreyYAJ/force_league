/*
  # Chess League Management System

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `first_name` (text, required)
      - `last_name` (text, required)
      - `created_at` (timestamp)
    
    - `matches`
      - `id` (uuid, primary key)
      - `match_date` (date, required)
      - `player1_id` (uuid, foreign key to players)
      - `player2_id` (uuid, foreign key to players)
      - `round1_player1_score` (numeric, 0 or 0.5 or 1)
      - `round1_player2_score` (numeric, 0 or 0.5 or 1)
      - `round2_player1_score` (numeric, 0 or 0.5 or 1)
      - `round2_player2_score` (numeric, 0 or 0.5 or 1)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Public read access for viewing data
    - Admin operations require authentication (future enhancement)
    
  3. Notes
    - Match scores use standard chess scoring: 1 (win), 0.5 (draw), 0 (loss)
    - Each match has two rounds
    - Ranking is calculated dynamically from match results
*/

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_date date NOT NULL,
  player1_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player2_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  round1_player1_score numeric(2,1) CHECK (round1_player1_score IN (0, 0.5, 1)),
  round1_player2_score numeric(2,1) CHECK (round1_player2_score IN (0, 0.5, 1)),
  round2_player1_score numeric(2,1) CHECK (round2_player1_score IN (0, 0.5, 1)),
  round2_player2_score numeric(2,1) CHECK (round2_player2_score IN (0, 0.5, 1)),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_players CHECK (player1_id != player2_id),
  CONSTRAINT valid_round1_scores CHECK (
    (round1_player1_score IS NULL AND round1_player2_score IS NULL) OR
    (round1_player1_score + round1_player2_score = 1)
  ),
  CONSTRAINT valid_round2_scores CHECK (
    (round2_player1_score IS NULL AND round2_player2_score IS NULL) OR
    (round2_player1_score + round2_player2_score = 1)
  )
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for players"
  ON players FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public insert access for players"
  ON players FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public update access for players"
  ON players FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for players"
  ON players FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Public read access for matches"
  ON matches FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public insert access for matches"
  ON matches FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public update access for matches"
  ON matches FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for matches"
  ON matches FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_matches_players ON matches(player1_id, player2_id);