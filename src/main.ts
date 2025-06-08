import './style.css';
import { Game } from './game/Game';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const game = new Game(canvas);
  
  // Start the game loop
  game.start();
});
