import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Boss } from './entities/Boss';
import { Projectile } from './entities/Projectile';
import { PowerUp } from './entities/PowerUp';
import { ParticleSystem } from './effects/ParticleSystem';
import { InputManager } from './managers/InputManager';
import { UIManager } from './managers/UIManager';
import { StorageManager } from './managers/StorageManager';
import { SoundManager } from './managers/SoundManager';
import { GameState, GameStats, UpgradeType } from './types/GameTypes';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState = GameState.MENU;
  private previousGameState: GameState = GameState.MENU;
  private lastTime = 0;

  // Game entities
  private player: Player;
  private enemies: Enemy[] = [];
  private boss: Boss | null = null;
  private projectiles: Projectile[] = [];
  private powerUps: PowerUp[] = [];
  private particles: ParticleSystem;

  // Managers
  private inputManager: InputManager;
  private uiManager: UIManager;
  private storageManager: StorageManager;
  private soundManager: SoundManager;

  // Game stats
  private stats: GameStats = {
    score: 0,
    wave: 1,
    coins: 0,
    enemiesKilled: 0,
    gameTime: 0
  };

  // Wave management
  private waveTimer = 0;
  private waveDelay = 3000; // 3 seconds between waves
  private enemiesInWave = 5;
  private enemiesSpawned = 0;
  private waveComplete = false;
  private isBossWave = false;

  // Power-up spawn
  private powerUpTimer = 0;
  private powerUpSpawnRate = 15000; // 15 seconds

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Initialize managers
    this.inputManager = new InputManager(canvas);
    this.uiManager = new UIManager();
    this.storageManager = new StorageManager();
    this.soundManager = new SoundManager();

    // Initialize game objects
    this.player = new Player(canvas.width / 2, canvas.height - 100);
    this.particles = new ParticleSystem();

    // Load saved data
    this.loadGameData();

    // Setup event listeners
    this.setupEventListeners();
  }

  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    if (this.player) {
      // Keep player in bounds after resize
      this.player.position.x = Math.min(this.player.position.x, this.canvas.width - this.player.width);
      this.player.position.y = Math.min(this.player.position.y, this.canvas.height - this.player.height);
    }
  }

  private setupEventListeners(): void {
    // Menu navigation
    this.uiManager.onStartGame(() => this.startNewGame());
    this.uiManager.onPauseAndShowShop(() => this.pauseAndShowShop());
    this.uiManager.onShowShop(() => this.showShop());
    this.uiManager.onResumeFromShop(() => this.resumeFromShop());
    this.uiManager.onShowLeaderboard(() => this.showLeaderboard());
    this.uiManager.onResumeFromLeaderboard(() => this.resumeFromLeaderboard());
    this.uiManager.onShowControls(() => this.showControls());
    this.uiManager.onResumeFromControls(() => this.resumeFromControls());
    this.uiManager.onPauseGame(() => this.pauseGame());
    this.uiManager.onResumeGame(() => this.resumeGame());
    this.uiManager.onRestartGame(() => this.startNewGame());
    this.uiManager.onMainMenu(() => this.showMainMenu());
    this.uiManager.onSubmitScore((name: string) => this.submitScore(name));

    // Shop
    this.uiManager.onPurchaseUpgrade((type: UpgradeType) => this.purchaseUpgrade(type));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        if (this.gameState === GameState.PLAYING) {
          this.pauseGame();
        } else if (this.gameState === GameState.PAUSED) {
          this.resumeGame();
        } else if (this.gameState === GameState.SHOP && this.previousGameState === GameState.PLAYING) {
          this.resumeFromShop();
        } else if (this.gameState === GameState.LEADERBOARD && this.previousGameState === GameState.PLAYING) {
          this.resumeFromLeaderboard();
        } else if (this.gameState === GameState.CONTROLS && this.previousGameState === GameState.PLAYING) {
          this.resumeFromControls();
        }
      } else if (e.code === 'KeyP' && this.gameState === GameState.PLAYING) {
        this.pauseGame();
      }
    });
  }

  private loadGameData(): void {
    const savedData = this.storageManager.loadGameData();
    this.stats.coins = savedData.coins;
    this.player.applyUpgrades(savedData.upgrades);
    this.uiManager.updateUpgradeDisplay(savedData.upgrades);
    this.uiManager.updateCoins(this.stats.coins);
  }

  private saveGameData(): void {
    this.storageManager.saveGameData({
      coins: this.stats.coins,
      upgrades: this.player.getUpgrades()
    });
  }

  public start(): void {
    this.gameLoop(0);
  }

  private gameLoop(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  private update(deltaTime: number): void {
    if (this.gameState !== GameState.PLAYING) return;

    this.stats.gameTime += deltaTime;

    // Update input
    this.inputManager.update();

    // Update player
    this.player.update(deltaTime, this.inputManager, this.canvas);

    // Handle player shooting
    if (this.inputManager.isShooting() || this.inputManager.isMobile()) {
      const projectile = this.player.shoot();
      if (projectile) {
        this.projectiles.push(projectile);
        this.soundManager.playShoot();
      }
    }

    // Update projectiles
    this.updateProjectiles(deltaTime);

    // Update enemies
    this.updateEnemies(deltaTime);

    // Update boss
    this.updateBoss(deltaTime);

    // Update power-ups
    this.updatePowerUps(deltaTime);

    // Update particles
    this.particles.update(deltaTime);

    // Check collisions
    this.checkCollisions();

    // Wave management
    this.updateWaveLogic(deltaTime);

    // Spawn power-ups
    this.updatePowerUpSpawning(deltaTime);

    // Update UI
    this.updateUI();

    // Check game over
    if (this.player.hp <= 0) {
      this.gameOver();
    }
  }

  private updateProjectiles(deltaTime: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(deltaTime);

      // Remove projectiles that are off-screen
      if (projectile.position.y < -50 || 
          projectile.position.y > this.canvas.height + 50 ||
          projectile.position.x < -50 || 
          projectile.position.x > this.canvas.width + 50) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateEnemies(deltaTime: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(deltaTime, this.player.position, this.canvas);

      // Enemy shooting
      const enemyProjectiles = enemy.shoot();
      if (enemyProjectiles.length > 0) {
        this.projectiles.push(...enemyProjectiles);
      }

      // Remove enemies that are off-screen (only if moving away)
      if (enemy.position.y > this.canvas.height + 100) {
        this.enemies.splice(i, 1);
      }
    }
  }

  private updateBoss(deltaTime: number): void {
    if (!this.boss) return;

    this.boss.update(deltaTime, this.player.position, this.canvas);

    // Boss shooting
    const bossProjectiles = this.boss.shoot();
    if (bossProjectiles.length > 0) {
      this.projectiles.push(...bossProjectiles);
    }

    // Check if boss is defeated
    if (this.boss.isDefeated) {
      this.stats.enemiesKilled++;
      this.stats.score += this.boss.scoreValue;
      this.stats.coins += this.boss.coinValue;

      // Create massive explosion
      this.particles.createExplosion(
        this.boss.position.x + this.boss.width / 2,
        this.boss.position.y + this.boss.height / 2,
        '#ffaa00', 30
      );
      this.soundManager.playExplosion();

      // Spawn multiple power-ups
      for (let i = 0; i < 3; i++) {
        this.spawnPowerUp(
          this.boss.position.x + Math.random() * this.boss.width,
          this.boss.position.y + Math.random() * this.boss.height
        );
      }

      this.boss = null;
      this.isBossWave = false;
      this.waveComplete = true;
      this.waveTimer = 0;
    }
  }

  private updatePowerUps(deltaTime: number): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.update(deltaTime);

      // Remove power-ups that are off-screen or expired
      if (powerUp.position.y > this.canvas.height + 50 || powerUp.isExpired()) {
        this.powerUps.splice(i, 1);
      }
    }
  }

  private checkCollisions(): void {
    // Player projectiles vs enemies
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      if (!projectile.isPlayerProjectile) continue;

      // Check enemy collisions
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (this.checkCollision(projectile, enemy)) {
          enemy.takeDamage(projectile.damage);
          this.projectiles.splice(i, 1);

          this.particles.createExplosion(enemy.position.x, enemy.position.y, '#ff4444', 5);

          if (enemy.hp <= 0) {
            this.enemies.splice(j, 1);
            this.stats.enemiesKilled++;
            this.stats.score += enemy.scoreValue;
            this.stats.coins += enemy.coinValue;

            this.particles.createExplosion(enemy.position.x, enemy.position.y, '#ffaa00', 15);
            this.soundManager.playExplosion();

            if (Math.random() < 0.15) {
              this.spawnPowerUp(enemy.position.x, enemy.position.y);
            }
          }
          break;
        }
      }

      // Check boss collision
      if (this.boss && this.checkCollision(projectile, this.boss)) {
        this.boss.takeDamage(projectile.damage);
        this.projectiles.splice(i, 1);

        this.particles.createExplosion(
          projectile.position.x, projectile.position.y, '#ff4444', 8
        );
      }
    }

    // Enemy projectiles vs player
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      if (projectile.isPlayerProjectile) continue;

      if (this.checkCollision(projectile, this.player)) {
        this.player.takeDamage(projectile.damage);
        this.projectiles.splice(i, 1);

        this.particles.createExplosion(this.player.position.x, this.player.position.y, '#4444ff', 8);
      }
    }

    // Enemies vs player
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (this.checkCollision(enemy, this.player)) {
        this.player.takeDamage(enemy.damage);
        enemy.takeDamage(this.player.ramDamage);

        this.particles.createExplosion(
          (enemy.position.x + this.player.position.x) / 2,
          (enemy.position.y + this.player.position.y) / 2,
          '#ffffff', 10
        );

        if (enemy.hp <= 0) {
          this.enemies.splice(i, 1);
          this.stats.enemiesKilled++;
          this.stats.score += enemy.scoreValue;
          this.stats.coins += enemy.coinValue;
          this.soundManager.playExplosion();
        }
      }
    }

    // Boss vs player
    if (this.boss && this.checkCollision(this.boss, this.player)) {
      this.player.takeDamage(this.boss.damage);
      
      this.particles.createExplosion(
        this.player.position.x, this.player.position.y, '#ffffff', 15
      );
    }

    // Player vs power-ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      if (this.checkCollision(powerUp, this.player)) {
        this.player.applyPowerUp(powerUp);
        this.powerUps.splice(i, 1);

        this.particles.createExplosion(powerUp.position.x, powerUp.position.y, powerUp.color, 8);
        this.soundManager.playPowerUp();
      }
    }
  }

  private checkCollision(obj1: any, obj2: any): boolean {
    return obj1.position.x < obj2.position.x + obj2.width &&
           obj1.position.x + obj1.width > obj2.position.x &&
           obj1.position.y < obj2.position.y + obj2.height &&
           obj1.position.y + obj1.height > obj2.position.y;
  }

  private updateWaveLogic(deltaTime: number): void {
    // Check if wave is complete
    const waveEntitiesCleared = this.enemies.length === 0 && 
                               (!this.isBossWave || !this.boss) && 
                               this.enemiesSpawned >= this.enemiesInWave;

    if (waveEntitiesCleared) {
      if (!this.waveComplete) {
        this.waveComplete = true;
        this.waveTimer = 0;
        
        // Wave completion bonus
        this.stats.score += this.stats.wave * 100;
        this.stats.coins += this.stats.wave * 10;
      }

      this.waveTimer += deltaTime;
      if (this.waveTimer >= this.waveDelay) {
        this.startNextWave();
      }
    } else if (!this.isBossWave && this.enemiesSpawned < this.enemiesInWave) {
      // Spawn regular enemies gradually
      if (this.enemies.length < 3) {
        this.spawnEnemy();
        this.enemiesSpawned++;
      }
    }
  }

  private startNextWave(): void {
    this.stats.wave++;
    this.waveComplete = false;
    this.waveTimer = 0;

    // Check if this should be a boss wave
    this.isBossWave = this.stats.wave % 5 === 0;

    if (this.isBossWave) {
      this.spawnBoss();
      this.enemiesInWave = 0;
      this.enemiesSpawned = 0;
    } else {
      this.enemiesInWave = Math.min(5 + Math.floor(this.stats.wave / 2), 15);
      this.enemiesSpawned = 0;
    }

    // Increase difficulty every 5 waves
    if (this.stats.wave % 5 === 0) {
      Enemy.increaseDifficulty();
    }
  }

  private spawnEnemy(): void {
    const x = Math.random() * (this.canvas.width - 60);
    const y = -60;
    const enemy = new Enemy(x, y, this.stats.wave);
    this.enemies.push(enemy);
  }

  private spawnBoss(): void {
    const x = this.canvas.width / 2 - 100; // Center the boss
    const y = -120;
    this.boss = new Boss(x, y, this.stats.wave);
  }

  private updatePowerUpSpawning(deltaTime: number): void {
    this.powerUpTimer += deltaTime;
    if (this.powerUpTimer >= this.powerUpSpawnRate) {
      this.powerUpTimer = 0;
      const x = Math.random() * (this.canvas.width - 40);
      const y = -40;
      this.spawnPowerUp(x, y);
    }
  }

  private spawnPowerUp(x: number, y: number): void {
    const powerUp = new PowerUp(x, y);
    this.powerUps.push(powerUp);
  }

  private updateUI(): void {
    this.uiManager.updateHP(this.player.hp, this.player.maxHp);
    this.uiManager.updateShield(this.player.shield, this.player.maxShield);
    this.uiManager.updateScore(this.stats.score);
    this.uiManager.updateWave(this.stats.wave);
    this.uiManager.updateCoins(this.stats.coins);
  }

  private render(): void {
    // Clear canvas with gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#000428');
    gradient.addColorStop(1, '#004e92');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw stars
    this.drawStars();

    if (this.gameState === GameState.PLAYING || this.gameState === GameState.PAUSED) {
      // Draw game entities
      this.player.render(this.ctx);
      
      this.enemies.forEach(enemy => enemy.render(this.ctx));
      if (this.boss) {
        this.boss.render(this.ctx);
      }
      this.projectiles.forEach(projectile => projectile.render(this.ctx));
      this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
      
      // Draw particles
      this.particles.render(this.ctx);

      // Draw wave transition text
      if (this.waveComplete && this.waveTimer < 2000) {
        this.drawWaveTransition();
      }

      // Draw boss warning
      if (this.isBossWave && this.boss && this.waveTimer < 3000) {
        this.drawBossWarning();
      }
    }
  }

  private drawStars(): void {
    this.ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 137.5) % this.canvas.width;
      const y = (i * 73.3) % this.canvas.height;
      const size = Math.sin(i + this.stats.gameTime * 0.001) * 0.5 + 1;
      this.ctx.globalAlpha = Math.sin(i + this.stats.gameTime * 0.002) * 0.3 + 0.7;
      this.ctx.fillRect(x, y, size, size);
    }
    this.ctx.globalAlpha = 1;
  }

  private drawWaveTransition(): void {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = 'bold 48px Orbitron';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const text = this.isBossWave ? `BOSS WAVE ${this.stats.wave}!` : `WAVE ${this.stats.wave} COMPLETE!`;
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2 - 30);
    
    this.ctx.font = 'bold 24px Orbitron';
    this.ctx.fillStyle = '#00ffff';
    const nextText = `Next wave in ${Math.ceil((this.waveDelay - this.waveTimer) / 1000)}...`;
    this.ctx.fillText(nextText, this.canvas.width / 2, this.canvas.height / 2 + 30);
    
    this.ctx.restore();
  }

  private drawBossWarning(): void {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = 'bold 64px Orbitron';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const alpha = Math.sin(this.stats.gameTime * 0.01) * 0.5 + 0.5;
    this.ctx.globalAlpha = alpha;
    
    this.ctx.fillText('WARNING', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.font = 'bold 32px Orbitron';
    this.ctx.fillStyle = '#ffff00';
    this.ctx.fillText('BOSS APPROACHING', this.canvas.width / 2, this.canvas.height / 2 + 20);
    
    this.ctx.restore();
  }

  // Game state methods
  private startNewGame(): void {
    this.gameState = GameState.PLAYING;
    this.previousGameState = GameState.MENU;
    this.stats = {
      score: 0,
      wave: 1,
      coins: this.stats.coins,
      enemiesKilled: 0,
      gameTime: 0
    };

    this.player.reset(this.canvas.width / 2, this.canvas.height - 100);
    this.enemies = [];
    this.boss = null;
    this.projectiles = [];
    this.powerUps = [];
    this.particles = new ParticleSystem();

    this.enemiesInWave = 5;
    this.enemiesSpawned = 0;
    this.waveComplete = false;
    this.isBossWave = false;
    this.waveTimer = 0;
    this.powerUpTimer = 0;

    Enemy.resetDifficulty();
    this.uiManager.showGame();
  }

  private pauseGame(): void {
    if (this.gameState === GameState.PLAYING) {
      this.previousGameState = this.gameState;
      this.gameState = GameState.PAUSED;
      this.uiManager.showPause();
    }
  }

  private resumeGame(): void {
    if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
      this.uiManager.showGame();
    }
  }

  private pauseAndShowShop(): void {
    if (this.gameState === GameState.PLAYING) {
      this.previousGameState = this.gameState;
      this.gameState = GameState.SHOP;
      this.uiManager.showShop();
    } else if (this.gameState === GameState.MENU) {
      this.showShop();
    }
  }

  private showShop(): void {
    this.uiManager.showShop();
  }

  private resumeFromShop(): void {
    if (this.previousGameState === GameState.PLAYING) {
      this.gameState = GameState.PLAYING;
      this.uiManager.showGame();
    } else {
      this.showMainMenu();
    }
  }

  private async showLeaderboard(): Promise<void> {
    if (this.gameState === GameState.PLAYING) {
      this.previousGameState = this.gameState;
      this.gameState = GameState.LEADERBOARD;
    }
    
    // Get scores asynchronously and pass the promise to UI
    const scoresPromise = this.storageManager.getLeaderboard();
    await this.uiManager.showLeaderboard(scoresPromise);
  }

  private resumeFromLeaderboard(): void {
    if (this.previousGameState === GameState.PLAYING) {
      this.gameState = GameState.PLAYING;
      this.uiManager.showGame();
    } else {
      this.showMainMenu();
    }
  }

  private showControls(): void {
    if (this.gameState === GameState.PLAYING) {
      this.previousGameState = this.gameState;
      this.gameState = GameState.CONTROLS;
    }
    this.uiManager.showControls();
  }

  private resumeFromControls(): void {
    if (this.previousGameState === GameState.PLAYING) {
      this.gameState = GameState.PLAYING;
      this.uiManager.showGame();
    } else {
      this.showMainMenu();
    }
  }

  private gameOver(): void {
    this.gameState = GameState.GAME_OVER;
    this.previousGameState = GameState.GAME_OVER;
    this.saveGameData();
    this.uiManager.showGameOver(this.stats.score, this.stats.wave - 1, this.stats.coins);
  }

  private showMainMenu(): void {
    this.gameState = GameState.MENU;
    this.previousGameState = GameState.MENU;
    this.uiManager.showMainMenu();
  }

  private async submitScore(playerName: string): Promise<void> {
    try {
      await this.storageManager.addScore(playerName, this.stats.score, this.stats.wave - 1);
      await this.showLeaderboard();
    } catch (error) {
      console.error('Failed to submit score:', error);
      // Still show leaderboard even if submission failed
      await this.showLeaderboard();
    }
  }

  private purchaseUpgrade(type: UpgradeType): boolean {
    console.log(`Attempting to purchase upgrade: ${type}`);
    console.log(`Current coins: ${this.stats.coins}`);
    
    const cost = this.player.getUpgradeCost(type);
    console.log(`Upgrade cost: ${cost}`);
    
    if (this.stats.coins >= cost) {
      console.log('Purchase approved - deducting coins and applying upgrade');
      this.stats.coins -= cost;
      this.player.upgrade(type);
      this.saveGameData();
      this.uiManager.updateCoins(this.stats.coins);
      this.uiManager.updateUpgradeDisplay(this.player.getUpgrades());
      console.log(`Purchase successful. Remaining coins: ${this.stats.coins}`);
      return true;
    } else {
      console.log('Purchase denied - insufficient coins');
      return false;
    }
  }
}
