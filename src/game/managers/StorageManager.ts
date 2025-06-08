import { PlayerUpgrades, LeaderboardEntry } from '../types/GameTypes';

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

  public addScore(name: string, score: number, wave: number): void {
    try {
      const scores = this.getLeaderboard();
      scores.push({
        name: name.substring(0, 20), // Limit name length
        score,
        wave,
        date: new Date().toISOString()
      });

      // Sort by score (descending) and keep top 10
      scores.sort((a, b) => b.score - a.score);
      const topScores = scores.slice(0, 10);

      localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(topScores));
    } catch (error) {
      console.warn('Failed to save score:', error);
    }
  }

  public getLeaderboard(): LeaderboardEntry[] {
    try {
      const saved = localStorage.getItem(this.LEADERBOARD_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load leaderboard:', error);
    }

    return [];
  }

  public clearAllData(): void {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      localStorage.removeItem(this.LEADERBOARD_KEY);
    } catch (error) {
      console.warn('Failed to clear data:', error);
    }
  }
}
