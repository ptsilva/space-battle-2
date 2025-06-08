import { UpgradeType, PlayerUpgrades, LeaderboardEntry } from '../types/GameTypes';

export class UIManager {
  private elements: { [key: string]: HTMLElement } = {};
  private callbacks: { [key: string]: Function } = {};

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    // Get all UI elements
    this.elements.hud = document.getElementById('hud')!;
    this.elements.menuOverlay = document.getElementById('menu-overlay')!;
    this.elements.shopOverlay = document.getElementById('shop-overlay')!;
    this.elements.leaderboardOverlay = document.getElementById('leaderboard-overlay')!;
    this.elements.controlsOverlay = document.getElementById('controls-overlay')!;
    this.elements.gameOverOverlay = document.getElementById('game-over-overlay')!;
    this.elements.pauseOverlay = document.getElementById('pause-overlay')!;
    
    // HUD elements
    this.elements.hpFill = document.getElementById('hp-fill')!;
    this.elements.hpText = document.getElementById('hp-text')!;
    this.elements.shieldFill = document.getElementById('shield-fill')!;
    this.elements.shieldText = document.getElementById('shield-text')!;
    this.elements.scoreText = document.getElementById('score-text')!;
    this.elements.waveText = document.getElementById('wave-text')!;
    this.elements.coinsText = document.getElementById('coins-text')!;
    
    // Shop elements
    this.elements.weaponCost = document.getElementById('weapon-cost')!;
    this.elements.weaponLevel = document.getElementById('weapon-level')!;
    this.elements.shieldCost = document.getElementById('shield-cost')!;
    this.elements.shieldLevel = document.getElementById('shield-level')!;
    this.elements.hpCost = document.getElementById('hp-cost')!;
    this.elements.hpLevel = document.getElementById('hp-level')!;
    this.elements.speedCost = document.getElementById('speed-cost')!;
    this.elements.speedLevel = document.getElementById('speed-level')!;
    
    // Game over elements
    this.elements.finalScore = document.getElementById('final-score')!;
    this.elements.finalWave = document.getElementById('final-wave')!;
    this.elements.finalCoins = document.getElementById('final-coins')!;
    this.elements.playerName = document.getElementById('player-name')!;
    
    // Leaderboard
    this.elements.leaderboardList = document.getElementById('leaderboard-list')!;
  }

  private setupEventListeners(): void {
    // Main menu buttons
    document.getElementById('start-btn')?.addEventListener('click', () => {
      this.callbacks.startGame?.();
    });
    
    document.getElementById('shop-btn')?.addEventListener('click', () => {
      this.callbacks.showShop?.();
    });
    
    document.getElementById('leaderboard-btn')?.addEventListener('click', () => {
      this.callbacks.showLeaderboard?.();
    });
    
    document.getElementById('controls-btn')?.addEventListener('click', () => {
      this.callbacks.showControls?.();
    });

    // Shop buttons
    document.getElementById('shop-close-btn')?.addEventListener('click', () => {
      this.showMainMenu();
    });

    document.querySelectorAll('.shop-buy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const upgradeType = target.getAttribute('data-upgrade') as UpgradeType;
        this.callbacks.purchaseUpgrade?.(upgradeType);
      });
    });

    // Leaderboard buttons
    document.getElementById('leaderboard-close-btn')?.addEventListener('click', () => {
      this.showMainMenu();
    });

    // Controls buttons
    document.getElementById('controls-close-btn')?.addEventListener('click', () => {
      this.showMainMenu();
    });

    // Game over buttons
    document.getElementById('submit-score-btn')?.addEventListener('click', () => {
      const nameInput = this.elements.playerName as HTMLInputElement;
      const name = nameInput.value.trim() || 'Anonymous';
      this.callbacks.submitScore?.(name);
    });

    document.getElementById('restart-btn')?.addEventListener('click', () => {
      this.callbacks.restartGame?.();
    });

    document.getElementById('main-menu-btn')?.addEventListener('click', () => {
      this.callbacks.mainMenu?.();
    });

    // Pause buttons
    document.getElementById('resume-btn')?.addEventListener('click', () => {
      this.callbacks.resumeGame?.();
    });

    document.getElementById('pause-shop-btn')?.addEventListener('click', () => {
      this.callbacks.showShop?.();
    });

    document.getElementById('pause-menu-btn')?.addEventListener('click', () => {
      this.callbacks.mainMenu?.();
    });

    // Mobile controls
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      this.callbacks.showShop?.();
    });

    document.getElementById('mobile-pause-btn')?.addEventListener('click', () => {
      this.callbacks.pauseGame?.();
    });

    // Enter key for name input
    this.elements.playerName?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const nameInput = this.elements.playerName as HTMLInputElement;
        const name = nameInput.value.trim() || 'Anonymous';
        this.callbacks.submitScore?.(name);
      }
    });
  }

  // Callback setters
  public onStartGame(callback: Function): void {
    this.callbacks.startGame = callback;
  }

  public onShowShop(callback: Function): void {
    this.callbacks.showShop = callback;
  }

  public onShowLeaderboard(callback: Function): void {
    this.callbacks.showLeaderboard = callback;
  }

  public onShowControls(callback: Function): void {
    this.callbacks.showControls = callback;
  }

  public onPauseGame(callback: Function): void {
    this.callbacks.pauseGame = callback;
  }

  public onResumeGame(callback: Function): void {
    this.callbacks.resumeGame = callback;
  }

  public onRestartGame(callback: Function): void {
    this.callbacks.restartGame = callback;
  }

  public onMainMenu(callback: Function): void {
    this.callbacks.mainMenu = callback;
  }

  public onSubmitScore(callback: Function): void {
    this.callbacks.submitScore = callback;
  }

  public onPurchaseUpgrade(callback: Function): void {
    this.callbacks.purchaseUpgrade = callback;
  }

  // UI update methods
  public updateHP(current: number, max: number): void {
    const percentage = (current / max) * 100;
    this.elements.hpFill.style.width = `${percentage}%`;
    this.elements.hpText.textContent = `${Math.ceil(current)}/${max}`;
  }

  public updateShield(current: number, max: number): void {
    const percentage = (current / max) * 100;
    this.elements.shieldFill.style.width = `${percentage}%`;
    this.elements.shieldText.textContent = `${Math.ceil(current)}/${max}`;
  }

  public updateScore(score: number): void {
    this.elements.scoreText.textContent = score.toLocaleString();
  }

  public updateWave(wave: number): void {
    this.elements.waveText.textContent = `Wave ${wave}`;
  }

  public updateCoins(coins: number): void {
    this.elements.coinsText.textContent = coins.toLocaleString();
  }

  public updateUpgradeDisplay(upgrades: PlayerUpgrades): void {
    // Update levels
    this.elements.weaponLevel.textContent = upgrades.weapon.toString();
    this.elements.shieldLevel.textContent = upgrades.shield.toString();
    this.elements.hpLevel.textContent = upgrades.hp.toString();
    this.elements.speedLevel.textContent = upgrades.speed.toString();

    // Update costs
    const baseCosts = { weapon: 100, shield: 150, hp: 200, speed: 120 };
    
    Object.keys(baseCosts).forEach(type => {
      const cost = Math.floor(baseCosts[type as UpgradeType] * Math.pow(1.5, upgrades[type as UpgradeType] - 1));
      const costElement = this.elements[`${type}Cost`];
      if (costElement) {
        costElement.textContent = cost.toString();
      }
    });
  }

  // Screen management
  public showMainMenu(): void {
    this.hideAllOverlays();
    this.elements.menuOverlay.classList.remove('hidden');
  }

  public showGame(): void {
    this.hideAllOverlays();
  }

  public showShop(): void {
    this.hideAllOverlays();
    this.elements.shopOverlay.classList.remove('hidden');
  }

  public showLeaderboard(scores: LeaderboardEntry[]): void {
    this.hideAllOverlays();
    this.elements.leaderboardOverlay.classList.remove('hidden');
    this.populateLeaderboard(scores);
  }

  public showControls(): void {
    this.hideAllOverlays();
    this.elements.controlsOverlay.classList.remove('hidden');
  }

  public showGameOver(score: number, wave: number, coins: number): void {
    this.hideAllOverlays();
    this.elements.gameOverOverlay.classList.remove('hidden');
    this.elements.finalScore.textContent = score.toLocaleString();
    this.elements.finalWave.textContent = wave.toString();
    this.elements.finalCoins.textContent = coins.toLocaleString();
    const nameInput = this.elements.playerName as HTMLInputElement;
    nameInput.value = '';
    nameInput.focus();
  }

  public showPause(): void {
    this.hideAllOverlays();
    this.elements.pauseOverlay.classList.remove('hidden');
  }

  private hideAllOverlays(): void {
    document.querySelectorAll('.menu-overlay').forEach(overlay => {
      overlay.classList.add('hidden');
    });
  }

  private populateLeaderboard(scores: LeaderboardEntry[]): void {
    this.elements.leaderboardList.innerHTML = '';
    
    if (scores.length === 0) {
      this.elements.leaderboardList.innerHTML = '<p style="text-align: center; color: #666;">No scores yet!</p>';
      return;
    }

    scores.forEach((entry, index) => {
      const entryElement = document.createElement('div');
      entryElement.className = `leaderboard-entry ${index < 3 ? 'top-3' : ''}`;
      
      entryElement.innerHTML = `
        <span class="leaderboard-rank">#${index + 1}</span>
        <span class="leaderboard-name">${entry.name}</span>
        <span class="leaderboard-score">${entry.score.toLocaleString()}</span>
      `;
      
      this.elements.leaderboardList.appendChild(entryElement);
    });
  }
}
