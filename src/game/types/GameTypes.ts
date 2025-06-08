export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'gameOver'
}

export interface GameStats {
  score: number;
  wave: number;
  coins: number;
  enemiesKilled: number;
  gameTime: number;
}

export type UpgradeType = 'weapon' | 'shield' | 'hp' | 'speed';

export interface PlayerUpgrades {
  weapon: number;
  shield: number;
  hp: number;
  speed: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  wave: number;
  date: string;
}
