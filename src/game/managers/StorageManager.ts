import { supabase } from '../../lib/supabase';
import { PlayerUpgrades, LeaderboardEntry } from '../types/GameTypes';

export interface SaveData {
  coins: number;
  upgrades: PlayerUpgrades;
}

export class StorageManager {
  private readonly SAVE_KEY = 'spaceBattle2_save';

  public saveGameData(data: SaveData): void {
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save game data:', error);
    }
  }

  public loadGameData(): SaveData {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load game data:', error);
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

  public async addScore(playerName: string, score: number, wave: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('leaderboard')
        .insert({
          player_name: playerName,
          score: score,
          wave: wave
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to add score to leaderboard:', error);
      throw error;
    }
  }

  public async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('player_name, score, wave, created_at')
        .order('score', { ascending: false })
        .order('wave', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      return (data || []).map(entry => ({
        name: entry.player_name,
        score: entry.score,
        wave: entry.wave,
        date: entry.created_at
      }));
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      throw error;
    }
  }
}
