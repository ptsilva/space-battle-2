export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
  SHOP = 'shop',
  LEADERBOARD = 'leaderboard',
  CONTROLS = 'controls'
}

export interface GameStats {
  score: number;
  wave: number;
  coins: number;
  enemiesKilled: number;
  gameTime: number;
}

export interface PlayerUpgrades {
  weapon: number;
  shield: number;
  hp: number;
  speed: number;
}

export enum UpgradeType {
  WEAPON = 'weapon',
  SHIELD = 'shield',
  HP = 'hp',
  SPEED = 'speed'
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  wave: number;
  date?: string;
}

export enum PowerUpType {
  HEALTH = 'health',
  SHIELD = 'shield',
  WEAPON = 'weapon',
  SPEED = 'speed',
  MULTI_SHOT = 'multi_shot',
  RAPID_FIRE = 'rapid_fire'
}
