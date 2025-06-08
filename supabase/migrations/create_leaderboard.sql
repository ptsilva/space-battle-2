/*
  # Create leaderboard table for Space Battle 2

  1. New Tables
    - `leaderboard`
      - `id` (uuid, primary key)
      - `player_name` (text, player's name)
      - `score` (integer, final score)
      - `wave` (integer, wave reached)
      - `created_at` (timestamp, when score was submitted)

  2. Security
    - Enable RLS on `leaderboard` table
    - Add policy for anyone to read leaderboard data
    - Add policy for anyone to insert new scores
    - No update/delete policies to prevent score manipulation

  3. Indexes
    - Index on score for fast leaderboard queries
    - Index on created_at for recent scores
*/

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  wave integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read leaderboard (public leaderboard)
CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert new scores
CREATE POLICY "Anyone can insert scores"
  ON leaderboard
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at DESC);
