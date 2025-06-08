/*
  # Add wave column to leaderboard display

  1. Changes
    - The wave column already exists in the leaderboard table
    - This migration ensures the wave column is properly indexed
    - Add a composite index for better leaderboard queries

  2. Indexes
    - Composite index on (score DESC, wave DESC) for better leaderboard sorting
    - Players with same score will be ranked by wave reached
*/

-- Create composite index for leaderboard ranking
CREATE INDEX IF NOT EXISTS idx_leaderboard_score_wave ON leaderboard(score DESC, wave DESC);

-- Add comment to clarify wave usage
COMMENT ON COLUMN leaderboard.wave IS 'Highest wave reached by player (used for tie-breaking in leaderboard)';
