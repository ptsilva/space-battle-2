import { Vector2 } from '../utils/Vector2';
import { Projectile } from './Projectile';

export enum EnemyType {
  SCOUT = 'scout',
  FIGHTER = 'fighter',
  HEAVY = 'heavy',
  BOMBER = 'bomber',
  INTERCEPTOR = 'interceptor',
  DESTROYER = 'destroyer'
}

export class Enemy {
  public position: Vector2;
  public velocity: Vector2;
  public width: number = 30;
  public height: number = 30;
  public hp: number = 25;
  public maxHp: number = 25;
  public damage: number = 15;
  public scoreValue: number = 50;
  public coinValue: number = 5;
  public type: EnemyType;

  private speed: number = 150;
  private lastShot = 0;
  private shootCooldown: number = 2000;
  private movementPattern: number;
  private patternTimer = 0;
  private specialTimer = 0;
  private burstCount = 0;

  // Difficulty scaling
  private static difficultyMultiplier = 1;

  constructor(x: number, y: number, wave: number, forceType?: EnemyType) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    
    // Select enemy type based on wave progression or force specific type
    if (forceType) {
      this.type = forceType;
    } else {
      this.type = this.selectEnemyType(wave);
    }

    this.initializeStats(wave);
    this.movementPattern = Math.floor(Math.random() * 4);
  }

  private selectEnemyType(wave: number): EnemyType {
    const rand = Math.random();
    
    // Early waves: mostly scouts and fighters
    if (wave <= 3) {
      return rand < 0.7 ? EnemyType.SCOUT : EnemyType.FIGHTER;
    }
    
    // Mid waves: introduce heavy and bomber
    if (wave <= 7) {
      if (rand < 0.4) return EnemyType.SCOUT;
      if (rand < 0.65) return EnemyType.FIGHTER;
      if (rand < 0.85) return EnemyType.HEAVY;
      return EnemyType.BOMBER;
    }
    
    // Late waves: all types including advanced enemies
    if (rand < 0.25) return EnemyType.SCOUT;
    if (rand < 0.45) return EnemyType.FIGHTER;
    if (rand < 0.65) return EnemyType.HEAVY;
    if (rand < 0.8) return EnemyType.BOMBER;
    if (rand < 0.95) return EnemyType.INTERCEPTOR;
    return EnemyType.DESTROYER;
  }

  private initializeStats(wave: number): void {
    const waveMultiplier = 1 + (wave - 1) * 0.1;
    
    switch (this.type) {
      case EnemyType.SCOUT:
        this.width = 30;
        this.height = 30;
        this.maxHp = Math.floor(25 * waveMultiplier * Enemy.difficultyMultiplier);
        this.speed = 150 + wave * 10;
        this.damage = Math.floor(15 * waveMultiplier);
        this.shootCooldown = 2000;
        this.scoreValue = 50;
        this.coinValue = 5;
        break;
        
      case EnemyType.FIGHTER:
        this.width = 40;
        this.height = 40;
        this.maxHp = Math.floor(50 * waveMultiplier * Enemy.difficultyMultiplier);
        this.speed = 100 + wave * 8;
        this.damage = Math.floor(25 * waveMultiplier);
        this.shootCooldown = 1500;
        this.scoreValue = 100;
        this.coinValue = 10;
        break;
        
      case EnemyType.HEAVY:
        this.width = 60;
        this.height = 50;
        this.maxHp = Math.floor(100 * waveMultiplier * Enemy.difficultyMultiplier);
        this.speed = 60 + wave * 5;
        this.damage = Math.floor(40 * waveMultiplier);
        this.shootCooldown = 1000;
        this.scoreValue = 200;
        this.coinValue = 20;
        break;

      case EnemyType.BOMBER:
        this.width = 50;
        this.height = 45;
        this.maxHp = Math.floor(75 * waveMultiplier * Enemy.difficultyMultiplier);
        this.speed = 80 + wave * 6;
        this.damage = Math.floor(35 * waveMultiplier);
        this.shootCooldown = 3000; // Slower but powerful shots
        this.scoreValue = 150;
        this.coinValue = 15;
        break;

      case EnemyType.INTERCEPTOR:
        this.width = 35;
        this.height = 35;
        this.maxHp = Math.floor(40 * waveMultiplier * Enemy.difficultyMultiplier);
        this.speed = 200 + wave * 15;
        this.damage = Math.floor(20 * waveMultiplier);
        this.shootCooldown = 800; // Fast shooting
        this.scoreValue = 120;
        this.coinValue = 12;
        break;

      case EnemyType.DESTROYER:
        this.width = 70;
        this.height = 60;
        this.maxHp = Math.floor(150 * waveMultiplier * Enemy.difficultyMultiplier);
        this.speed = 50 + wave * 4;
        this.damage = Math.floor(50 * waveMultiplier);
        this.shootCooldown = 1200;
        this.scoreValue = 300;
        this.coinValue = 30;
        break;
    }
    
    this.hp = this.maxHp;
  }

  public update(deltaTime: number, playerPosition: Vector2, canvas: HTMLCanvasElement): void {
    this.patternTimer += deltaTime;
    this.specialTimer += deltaTime;
    this.lastShot += deltaTime;

    // Movement patterns based on enemy type
    this.updateMovement(deltaTime, playerPosition, canvas);

    // Apply movement
    this.position.x += this.velocity.x * deltaTime / 1000;
    this.position.y += this.velocity.y * deltaTime / 1000;

    // Keep in bounds horizontally
    this.position.x = Math.max(0, Math.min(canvas.width - this.width, this.position.x));
  }

  private updateMovement(deltaTime: number, playerPosition: Vector2, canvas: HTMLCanvasElement): void {
    switch (this.type) {
      case EnemyType.SCOUT:
        this.updateScoutMovement();
        break;
      case EnemyType.FIGHTER:
        this.updateFighterMovement();
        break;
      case EnemyType.HEAVY:
        this.updateHeavyMovement();
        break;
      case EnemyType.BOMBER:
        this.updateBomberMovement(playerPosition);
        break;
      case EnemyType.INTERCEPTOR:
        this.updateInterceptorMovement(playerPosition);
        break;
      case EnemyType.DESTROYER:
        this.updateDestroyerMovement(playerPosition);
        break;
    }
  }

  private updateScoutMovement(): void {
    switch (this.movementPattern) {
      case 0: // Straight down
        this.velocity.y = this.speed;
        this.velocity.x = 0;
        break;
      case 1: // Sine wave
        this.velocity.y = this.speed * 0.7;
        this.velocity.x = Math.sin(this.patternTimer * 0.003) * this.speed * 0.5;
        break;
      case 2: // Zigzag
        this.velocity.y = this.speed * 0.8;
        this.velocity.x = Math.sin(this.patternTimer * 0.005) * this.speed * 0.3;
        break;
      case 3: // Spiral
        this.velocity.y = this.speed * 0.6;
        this.velocity.x = Math.cos(this.patternTimer * 0.004) * this.speed * 0.4;
        break;
    }
  }

  private updateFighterMovement(): void {
    // Aggressive pursuit with evasive maneuvers
    this.velocity.y = this.speed * 0.7;
    this.velocity.x = Math.sin(this.patternTimer * 0.006) * this.speed * 0.6;
  }

  private updateHeavyMovement(): void {
    // Slow but steady advance
    this.velocity.y = this.speed;
    this.velocity.x = Math.sin(this.patternTimer * 0.002) * this.speed * 0.2;
  }

  private updateBomberMovement(playerPosition: Vector2): void {
    // Tries to position above player
    const dx = playerPosition.x - this.position.x;
    this.velocity.y = this.speed * 0.5;
    this.velocity.x = Math.sign(dx) * this.speed * 0.3;
  }

  private updateInterceptorMovement(playerPosition: Vector2): void {
    // Fast, erratic movement with player tracking
    const dx = playerPosition.x - this.position.x;
    const dy = playerPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      this.velocity.x = (dx / distance) * this.speed * 0.4 + Math.sin(this.patternTimer * 0.008) * this.speed * 0.3;
      this.velocity.y = Math.max((dy / distance) * this.speed * 0.2, this.speed * 0.6);
    }
  }

  private updateDestroyerMovement(playerPosition: Vector2): void {
    // Slow but relentless pursuit
    const dx = playerPosition.x - this.position.x;
    this.velocity.y = this.speed * 0.8;
    this.velocity.x = Math.sign(dx) * this.speed * 0.2;
  }

  public shoot(): Projectile[] {
    if (this.lastShot >= this.shootCooldown) {
      this.lastShot = 0;
      return this.createProjectiles();
    }
    return [];
  }

  private createProjectiles(): Projectile[] {
    const projectiles: Projectile[] = [];
    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height;

    switch (this.type) {
      case EnemyType.SCOUT:
        projectiles.push(new Projectile(
          centerX - 2, centerY, 0, 400, this.damage, false, '#ff4444'
        ));
        break;

      case EnemyType.FIGHTER:
        // Dual shot
        projectiles.push(new Projectile(
          centerX - 8, centerY, 0, 450, this.damage, false, '#ff8800'
        ));
        projectiles.push(new Projectile(
          centerX + 4, centerY, 0, 450, this.damage, false, '#ff8800'
        ));
        break;

      case EnemyType.HEAVY:
        // Triple shot
        projectiles.push(new Projectile(
          centerX - 2, centerY, 0, 350, this.damage, false, '#ff0088'
        ));
        projectiles.push(new Projectile(
          centerX - 10, centerY, -50, 350, this.damage * 0.8, false, '#ff0088'
        ));
        projectiles.push(new Projectile(
          centerX + 6, centerY, 50, 350, this.damage * 0.8, false, '#ff0088'
        ));
        break;

      case EnemyType.BOMBER:
        // Large explosive projectile
        projectiles.push(new Projectile(
          centerX - 4, centerY, 0, 300, this.damage * 1.5, false, '#ffaa00', 8, 16
        ));
        break;

      case EnemyType.INTERCEPTOR:
        // Rapid burst fire
        if (this.burstCount < 3) {
          projectiles.push(new Projectile(
            centerX - 2, centerY, 0, 500, this.damage * 0.7, false, '#00ff88'
          ));
          this.burstCount++;
          this.lastShot = this.shootCooldown - 200; // Quick follow-up shots
        } else {
          this.burstCount = 0;
        }
        break;

      case EnemyType.DESTROYER:
        // Spread shot
        for (let i = -2; i <= 2; i++) {
          projectiles.push(new Projectile(
            centerX - 2, centerY, i * 80, 400, this.damage * 0.8, false, '#8800ff'
          ));
        }
        break;
    }

    return projectiles;
  }

  private getProjectileColor(): string {
    switch (this.type) {
      case EnemyType.SCOUT: return '#ff4444';
      case EnemyType.FIGHTER: return '#ff8800';
      case EnemyType.HEAVY: return '#ff0088';
      case EnemyType.BOMBER: return '#ffaa00';
      case EnemyType.INTERCEPTOR: return '#00ff88';
      case EnemyType.DESTROYER: return '#8800ff';
      default: return '#ff4444';
    }
  }

  public takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Draw enemy ship based on type
    switch (this.type) {
      case EnemyType.SCOUT:
        this.renderScout(ctx);
        break;
      case EnemyType.FIGHTER:
        this.renderFighter(ctx);
        break;
      case EnemyType.HEAVY:
        this.renderHeavy(ctx);
        break;
      case EnemyType.BOMBER:
        this.renderBomber(ctx);
        break;
      case EnemyType.INTERCEPTOR:
        this.renderInterceptor(ctx);
        break;
      case EnemyType.DESTROYER:
        this.renderDestroyer(ctx);
        break;
    }

    // Draw health bar
    this.renderHealthBar(ctx);

    ctx.restore();
  }

  private renderScout(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.moveTo(this.position.x + this.width / 2, this.position.y + this.height);
    ctx.lineTo(this.position.x, this.position.y);
    ctx.lineTo(this.position.x + this.width / 4, this.position.y + this.height * 0.3);
    ctx.lineTo(this.position.x + this.width * 0.75, this.position.y + this.height * 0.3);
    ctx.lineTo(this.position.x + this.width, this.position.y);
    ctx.closePath();
    ctx.fill();
  }

  private renderFighter(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    
    // Wings
    ctx.fillStyle = '#ffaa44';
    ctx.fillRect(this.position.x - 5, this.position.y + 10, 10, 20);
    ctx.fillRect(this.position.x + this.width - 5, this.position.y + 10, 10, 20);
  }

  private renderHeavy(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ff0088';
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    
    // Armor plating
    ctx.fillStyle = '#ff44aa';
    ctx.fillRect(this.position.x + 5, this.position.y + 5, this.width - 10, this.height - 10);
    
    // Weapons
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.position.x + 10, this.position.y + this.height - 5, 8, 10);
    ctx.fillRect(this.position.x + this.width - 18, this.position.y + this.height - 5, 8, 10);
  }

  private renderBomber(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ffaa00';
    // Main body
    ctx.fillRect(this.position.x + 10, this.position.y, this.width - 20, this.height);
    
    // Wings
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(this.position.x, this.position.y + 15, this.width, 15);
    
    // Bomb bay
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(this.position.x + 15, this.position.y + this.height - 8, this.width - 30, 8);
  }

  private renderInterceptor(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#00ff88';
    // Sleek triangular design
    ctx.beginPath();
    ctx.moveTo(this.position.x + this.width / 2, this.position.y);
    ctx.lineTo(this.position.x, this.position.y + this.height);
    ctx.lineTo(this.position.x + this.width / 3, this.position.y + this.height * 0.7);
    ctx.lineTo(this.position.x + this.width * 0.67, this.position.y + this.height * 0.7);
    ctx.lineTo(this.position.x + this.width, this.position.y + this.height);
    ctx.closePath();
    ctx.fill();
    
    // Engine trails
    ctx.fillStyle = '#44ffaa';
    ctx.fillRect(this.position.x + 8, this.position.y + this.height, 4, 8);
    ctx.fillRect(this.position.x + this.width - 12, this.position.y + this.height, 4, 8);
  }

  private renderDestroyer(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#8800ff';
    // Main hull
    ctx.fillRect(this.position.x + 5, this.position.y, this.width - 10, this.height);
    
    // Command tower
    ctx.fillStyle = '#aa44ff';
    ctx.fillRect(this.position.x + 20, this.position.y - 5, this.width - 40, 15);
    
    // Weapon turrets
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.position.x + 15, this.position.y + 20, 6, 0, Math.PI * 2);
    ctx.arc(this.position.x + this.width - 15, this.position.y + 20, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Side armor
    ctx.fillStyle = '#6600cc';
    ctx.fillRect(this.position.x, this.position.y + 10, 5, this.height - 20);
    ctx.fillRect(this.position.x + this.width - 5, this.position.y + 10, 5, this.height - 20);
  }

  private renderHealthBar(ctx: CanvasRenderingContext2D): void {
    if (this.hp < this.maxHp) {
      const barWidth = this.width;
      const barHeight = 4;
      const barY = this.position.y - 8;
      
      // Background
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(this.position.x, barY, barWidth, barHeight);
      
      // Health
      ctx.fillStyle = '#ff0000';
      const healthWidth = (this.hp / this.maxHp) * barWidth;
      ctx.fillRect(this.position.x, barY, healthWidth, barHeight);
    }
  }

  public static increaseDifficulty(): void {
    Enemy.difficultyMultiplier += 0.2;
  }

  public static resetDifficulty(): void {
    Enemy.difficultyMultiplier = 1;
  }
}
