import './style.css';
import { Game } from './game/Game';

// Ensure DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  // Initialize and start the game
  const game = new Game(canvas);
  game.start();

  // Add version info for debugging deployment
  console.log('Space Battle Game v2.0 - Enemy Variety & Boss Battles Loaded');
  console.log('Build timestamp:', new Date().toISOString());
});
