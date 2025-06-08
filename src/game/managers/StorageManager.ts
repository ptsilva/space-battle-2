import { PlayerUpgrades, LeaderboardEntry, DatabaseLeaderboardEntry } from '../types/GameTypes';
import { supabase } from '../../lib/supabase';

interface SaveData {
  coins: number;
  upgrades: PlayerUpgrades;
}

export class StorageManager {
  private readonly SAVE_KEY = 'spaceBattleSave';
  private readonly LEADERBOARD_KEY = 'spaceBattleLeaderboard';

  public saveGameData(data: SaveData): void {
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save game data:', error);
    }
  }

  public loadGameData(): SaveData {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load game data:', error);
    }

    // Return default data
    return {
      coins: 0,
      upgrades: {
        weapon: 1,
        shield: 1,
        hp: 1,
        speed: 1
      }
    };
  }

  public async addScore(name: string, score: number, wave: number): Promise<boolean> {
    try {
      // Add to Supabase database
      const { error } = await supabase
        .from('leaderboard')
        .insert({
          player_name: name.substring(0, 20), // Limit name length
          score,
          wave
        });

      if (error) {
        console.error('Failed to save score to database:', error);
        // Fallback to local storage
        this.addScoreLocal(name, score, wave);
        return false;
      }

      // Also save locally as backup
      this.addScoreLocal(name, score, wave);
      return true;
    } catch (error) {
      console.error('Failed to save score:', error);
      // Fallback to local storage
      this.addScoreLocal(name, score, wave);
      return false;
    }
  }

  private addScoreLocal(name: string, score: number, wave: number): void {
    try {
      const scores = this.getLeaderboardLocal();
      scores.push({
        name: name.substring(0, 20),
        score,
        wave,
        date: new Date().toISOString()
      });

      // Sort by score (descending) and keep top 10
      scores.sort((a, b) => b.score - a.score);
      const topScores = scores.slice(0, 10);

      localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(topScores));
    } catch (error) {
      console.warn('Failed to save score locally:', error);
    }
  }

  public async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      // Try to get from Supabase first
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Failed to fetch leaderboard from database:', error);
        // Fallback to local storage
        return this.getLeaderboardLocal();
      }

      if (data) {
        // Convert database format to game format
        return data.map((entry: DatabaseLeaderboardEntry): LeaderboardEntry => ({
          id: entry.id,
          name: entry.player_name,
          score: entry.score,
          wave: entry.wave,
          date: entry.created_at
        }));
      }

      return this.getLeaderboardLocal();
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Fallback to local storage
      return this.getLeaderboardLocal();
    }
  }

  private getLeaderboardLocal(): LeaderboardEntry[] {
    try {
      const saved = localStorage.getItem(this.LEADERBOARD_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load local leaderboard:', error);
    }

    return [];
  }

  public async getRecentScores(limit: number = 5): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch recent scores:', error);
        return [];
      }

      if (data) {
        return data.map((entry: DatabaseLeaderboardEntry): LeaderboardEntry => ({
          id: entry.id,
          name: entry.player_name,
          score: entry.score,
          wave: entry.wave,
          date: entry.created_at
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch recent scores:', error);
      return [];
    }
  }

  public async getPlayerRank(score: number): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('leaderboard')
        .select('*', { count: 'exact', head: true })
        .gt('score', score);

      if (error) {
        console.error('Failed to get player rank:', error);
        return -1;
      }

      return (count || 0) + 1;
    } catch (error) {
      console.error('Failed to get player rank:', error);
      return -1;
    }
  }

  public clearAllData(): void {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      localStorage.removeItem(this.LEADERBOARD_KEY);
    } catch (error) {
      console.warn('Failed to clear data:', error);
    }
  }

  // Test database connection
  public async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('leaderboard')
        .select('count', { count: 'exact', head: true });

      return !error;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}
