import { UpgradeType, PlayerUpgrades, LeaderboardEntry } from '../types/GameTypes';

export class UIManager {
  private elements: { [key: string]: HTMLElement | null } = {};
  private callbacks: { [key: string]: Function } = {};

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    // Get all UI elements with null checks
    this.elements.hud = document.getElementById('hud');
    this.elements.menuOverlay = document.getElementById('menu-overlay');
    this.elements.shopOverlay = document.getElementById('shop-overlay');
    this.elements.leaderboardOverlay = document.getElementById('leaderboard-overlay');
    this.elements.controlsOverlay = document.getElementById('controls-overlay');
    this.elements.gameOverOverlay = document.getElementById('game-over-overlay');
    this.elements.pauseOverlay = document.getElementById('pause-overlay');
    
    // HUD elements
    this.elements.hpFill = document.getElementById('hp-fill');
    this.elements.hpText = document.getElementById('hp-text');
    this.elements.shieldFill = document.getElementById('shield-fill');
    this.elements.shieldText = document.getElementById('shield-text');
    this.elements.scoreText = document.getElementById('score-text');
    this.elements.waveText = document.getElementById('wave-text');
    this.elements.coinsText = document.getElementById('coins-text');
    
    // Shop elements
    this.elements.coinsTextShop = document.getElementById('coins-text-shop');
    this.elements.weaponCost = document.getElementById('weapon-cost');
    this.elements.weaponLevel = document.getElementById('weapon-level');
    this.elements.shieldCost = document.getElementById('shield-cost');
    this.elements.shieldLevel = document.getElementById('shield-level');
    this.elements.hpCost = document.getElementById('hp-cost');
    this.elements.hpLevel = document.getElementById('hp-level');
    this.elements.speedCost = document.getElementById('speed-cost');
    this.elements.speedLevel = document.getElementById('speed-level');
    
    // Game over elements
    this.elements.finalScore = document.getElementById('final-score');
    this.elements.finalWave = document.getElementById('final-wave');
    this.elements.finalCoins = document.getElementById('final-coins');
    this.elements.playerName = document.getElementById('player-name');
    
    // Leaderboard
    this.elements.leaderboardList = document.getElementById('leaderboard-list');

    // Log missing elements for debugging
    Object.keys(this.elements).forEach(key => {
      if (!this.elements[key]) {
        console.warn(`UI element not found: ${key}`);
      }
    });
  }

  private setupEventListeners(): void {
    // Main menu buttons
    document.getElementById('start-btn')?.addEventListener('click', () => {
      this.callbacks.startGame?.();
    });
    
    document.getElementById('shop-btn')?.addEventListener('click', () => {
      this.callbacks.pauseAndShowShop?.();
    });
    
    document.getElementById('leaderboard-btn')?.addEventListener('click', () => {
      this.callbacks.showLeaderboard?.();
    });
    
    document.getElementById('controls-btn')?.addEventListener('click', () => {
      this.callbacks.showControls?.();
    });

    // Shop buttons
    document.getElementById('shop-close-btn')?.addEventListener('click', () => {
      this.callbacks.resumeFromShop?.();
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
      this.callbacks.resumeFromLeaderboard?.();
    });

    // Controls buttons
    document.getElementById('controls-close-btn')?.addEventListener('click', () => {
      this.callbacks.resumeFromControls?.();
    });

    // Game over buttons
    document.getElementById('submit-score-btn')?.addEventListener('click', () => {
      const nameInput = this.elements.playerName as HTMLInputElement;
      const name = nameInput?.value?.trim() || 'Anonymous';
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
      this.callbacks.pauseAndShowShop?.();
    });

    document.getElementById('mobile-pause-btn')?.addEventListener('click', () => {
      this.callbacks.pauseGame?.();
    });

    // Enter key for name input
    this.elements.playerName?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const nameInput = this.elements.playerName as HTMLInputElement;
        const name = nameInput?.value?.trim() || 'Anonymous';
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

  public onPauseAndShowShop(callback: Function): void {
    this.callbacks.pauseAndShowShop = callback;
  }

  public onResumeFromShop(callback: Function): void {
    this.callbacks.resumeFromShop = callback;
  }

  public onResumeFromLeaderboard(callback: Function): void {
    this.callbacks.resumeFromLeaderboard = callback;
  }

  public onResumeFromControls(callback: Function): void {
    this.callbacks.resumeFromControls = callback;
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

  // UI update methods with null checks
  public updateHP(current: number, max: number): void {
    const hpFill = this.elements.hpFill;
    const hpText = this.elements.hpText;
    if (hpFill && hpText) {
      const percentage = (current / max) * 100;
      (hpFill as HTMLElement).style.width = `${percentage}%`;
      hpText.textContent = `${Math.ceil(current)}/${max}`;
    }
  }

  public updateShield(current: number, max: number): void {
    const shieldFill = this.elements.shieldFill;
    const shieldText = this.elements.shieldText;
    if (shieldFill && shieldText) {
      const percentage = (current / max) * 100;
      (shieldFill as HTMLElement).style.width = `${percentage}%`;
      shieldText.textContent = `${Math.ceil(current)}/${max}`;
    }
  }

  public updateScore(score: number): void {
    const scoreText = this.elements.scoreText;
    if (scoreText) {
      scoreText.textContent = score.toLocaleString();
    }
  }

  public updateWave(wave: number): void {
    const waveText = this.elements.waveText;
    if (waveText) {
      waveText.textContent = `${wave}`;
    }
  }

  public updateCoins(coins: number): void {
    const coinsText = this.elements.coinsText;
    if (coinsText) {
      coinsText.textContent = coins.toLocaleString();
    }
    
    // Also update shop coins display
    const coinsTextShop = this.elements.coinsTextShop;
    if (coinsTextShop) {
      coinsTextShop.textContent = coins.toLocaleString();
    }
  }

  public updateUpgradeDisplay(upgrades: PlayerUpgrades): void {
    // Update levels with null checks
    const weaponLevel = this.elements.weaponLevel;
    if (weaponLevel) {
      weaponLevel.textContent = upgrades.weapon.toString();
    }
    
    const shieldLevel = this.elements.shieldLevel;
    if (shieldLevel) {
      shieldLevel.textContent = upgrades.shield.toString();
    }
    
    const hpLevel = this.elements.hpLevel;
    if (hpLevel) {
      hpLevel.textContent = upgrades.hp.toString();
    }
    
    const speedLevel = this.elements.speedLevel;
    if (speedLevel) {
      speedLevel.textContent = upgrades.speed.toString();
    }

    // Update costs with null checks
    const baseCosts = { weapon: 100, shield: 150, hp: 200, speed: 120 };
    
    Object.keys(baseCosts).forEach(type => {
      const cost = Math.floor(baseCosts[type as UpgradeType] * Math.pow(1.5, upgrades[type as UpgradeType] - 1));
      const costElement = this.elements[`${type}Cost`];
      if (costElement) {
        costElement.textContent = cost.toString();
      }
    });

    // Update button states based on available coins
    this.updateUpgradeButtonStates(upgrades);
  }

  private updateUpgradeButtonStates(upgrades: PlayerUpgrades): void {
    const coinsText = this.elements.coinsText?.textContent || '0';
    const currentCoins = parseInt(coinsText.replace(/,/g, ''));
    const baseCosts = { weapon: 100, shield: 150, hp: 200, speed: 120 };

    document.querySelectorAll('.shop-buy-btn').forEach(btn => {
      const upgradeType = btn.getAttribute('data-upgrade') as UpgradeType;
      if (upgradeType) {
        const cost = Math.floor(baseCosts[upgradeType] * Math.pow(1.5, upgrades[upgradeType] - 1));
        const button = btn as HTMLButtonElement;
        
        if (currentCoins >= cost) {
          button.disabled = false;
          button.style.opacity = '1';
        } else {
          button.disabled = true;
          button.style.opacity = '0.5';
        }
      }
    });
  }

  // Screen management
  public showMainMenu(): void {
    this.hideAllOverlays();
    const menuOverlay = this.elements.menuOverlay;
    if (menuOverlay) {
      menuOverlay.classList.remove('hidden');
    }
  }

  public showGame(): void {
    this.hideAllOverlays();
  }

  public showShop(): void {
    this.hideAllOverlays();
    const shopOverlay = this.elements.shopOverlay;
    if (shopOverlay) {
      shopOverlay.classList.remove('hidden');
      // Scroll to top when opening shop
      const menuContent = shopOverlay.querySelector('.menu-content');
      if (menuContent) {
        menuContent.scrollTop = 0;
      }
    }
  }

  public async showLeaderboard(scoresPromise?: Promise<LeaderboardEntry[]>): Promise<void> {
    this.hideAllOverlays();
    const leaderboardOverlay = this.elements.leaderboardOverlay;
    if (leaderboardOverlay) {
      leaderboardOverlay.classList.remove('hidden');
      // Scroll to top when opening leaderboard
      const menuContent = leaderboardOverlay.querySelector('.menu-content');
      if (menuContent) {
        menuContent.scrollTop = 0;
      }
    }

    // Show loading state
    this.showLeaderboardLoading();

    try {
      // Wait for scores if a promise was provided
      const scores = scoresPromise ? await scoresPromise : [];
      this.populateLeaderboard(scores);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      this.showLeaderboardError();
    }
  }

  public showControls(): void {
    this.hideAllOverlays();
    const controlsOverlay = this.elements.controlsOverlay;
    if (controlsOverlay) {
      controlsOverlay.classList.remove('hidden');
      // Scroll to top when opening controls
      const menuContent = controlsOverlay.querySelector('.menu-content');
      if (menuContent) {
        menuContent.scrollTop = 0;
      }
    }
  }

  public showGameOver(score: number, wave: number, coins: number): void {
    this.hideAllOverlays();
    const gameOverOverlay = this.elements.gameOverOverlay;
    if (gameOverOverlay) {
      gameOverOverlay.classList.remove('hidden');
      // Scroll to top when opening game over
      const menuContent = gameOverOverlay.querySelector('.menu-content');
      if (menuContent) {
        menuContent.scrollTop = 0;
      }
    }
    
    const finalScore = this.elements.finalScore;
    if (finalScore) {
      finalScore.textContent = score.toLocaleString();
    }
    
    const finalWave = this.elements.finalWave;
    if (finalWave) {
      finalWave.textContent = wave.toString();
    }
    
    const finalCoins = this.elements.finalCoins;
    if (finalCoins) {
      finalCoins.textContent = coins.toLocaleString();
    }
    
    const playerName = this.elements.playerName;
    if (playerName) {
      const nameInput = playerName as HTMLInputElement;
      nameInput.value = '';
      nameInput.focus();
    }
  }

  public showPause(): void {
    this.hideAllOverlays();
    const pauseOverlay = this.elements.pauseOverlay;
    if (pauseOverlay) {
      pauseOverlay.classList.remove('hidden');
    }
  }

  private hideAllOverlays(): void {
    document.querySelectorAll('.menu-overlay').forEach(overlay => {
      overlay.classList.add('hidden');
    });
  }

  private showLeaderboardLoading(): void {
    const leaderboardList = this.elements.leaderboardList;
    if (!leaderboardList) return;
    
    leaderboardList.innerHTML = '<p style="text-align: center; color: #666;">Loading leaderboard...</p>';
  }

  private showLeaderboardError(): void {
    const leaderboardList = this.elements.leaderboardList;
    if (!leaderboardList) return;
    
    leaderboardList.innerHTML = '<p style="text-align: center; color: #ff6666;">Failed to load leaderboard. Please try again.</p>';
  }

  private populateLeaderboard(scores: LeaderboardEntry[]): void {
    const leaderboardList = this.elements.leaderboardList;
    if (!leaderboardList) return;
    
    // Ensure scores is an array
    if (!Array.isArray(scores)) {
      console.error('populateLeaderboard received non-array data:', scores);
      this.showLeaderboardError();
      return;
    }
    
    leaderboardList.innerHTML = '';
    
    if (scores.length === 0) {
      leaderboardList.innerHTML = '<p style="text-align: center; color: #666;">No scores yet!</p>';
      return;
    }

    scores.forEach((entry, index) => {
      const entryElement = document.createElement('div');
      entryElement.className = `leaderboard-entry ${index < 3 ? 'top-3' : ''}`;
      
      entryElement.innerHTML = `
        <span class="leaderboard-rank">#${index + 1}</span>
        <span class="leaderboard-name">${entry.name}</span>
        <span class="leaderboard-score">${entry.score.toLocaleString()}</span>
        <span class="leaderboard-wave">Wave ${entry.wave}</span>
      `;
      
      leaderboardList.appendChild(entryElement);
    });
  }
}
