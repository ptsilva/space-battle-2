import { Vector2 } from '../utils/Vector2';
import { Projectile } from './Projectile';

export enum EnemyType {
  SCOUT = 'scout',
  FIGHTER = 'fighter',
  HEAVY = 'heavy'
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

  // Difficulty scaling
  private static difficultyMultiplier = 1;

  constructor(x: number, y: number, wave: number) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    
    // Randomly select enemy type
    const rand = Math.random();
    if (rand < 0.6) {
      this.type = EnemyType.SCOUT;
    } else if (rand < 0.85) {
      this.type = EnemyType.FIGHTER;
    } else {
      this.type = EnemyType.HEAVY;
    }

    this.initializeStats(wave);
    this.movementPattern = Math.floor(Math.random() * 3);
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
    }
    
    this.hp = this.maxHp;
  }

  public update(deltaTime: number, playerPosition: Vector2, canvas: HTMLCanvasElement): void {
    this.patternTimer += deltaTime;
    this.lastShot += deltaTime;

    // Movement patterns
    switch (this.movementPattern) {
      case 0: // Straight down
        this.velocity.y = this.speed;
        this.velocity.x = 0;
        break;
        
      case 1: // Sine wave
        this.velocity.y = this.speed * 0.7;
        this.velocity.x = Math.sin(this.patternTimer * 0.003) * this.speed * 0.5;
        break;
        
      case 2: // Aggressive pursuit
        const dx = playerPosition.x - this.position.x;
        const dy = playerPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          this.velocity.x = (dx / distance) * this.speed * 0.3;
          this.velocity.y = Math.max((dy / distance) * this.speed * 0.3, this.speed * 0.5);
        }
        break;
    }

    // Apply movement
    this.position.x += this.velocity.x * deltaTime / 1000;
    this.position.y += this.velocity.y * deltaTime / 1000;

    // Keep in bounds horizontally
    this.position.x = Math.max(0, Math.min(canvas.width - this.width, this.position.x));
  }

  public shoot(): Projectile | null {
    if (this.lastShot >= this.shootCooldown) {
      this.lastShot = 0;
      
      const projectile = new Projectile(
        this.position.x + this.width / 2 - 2,
        this.position.y + this.height,
        0, 400, // velocity
        this.damage,
        false, // isPlayerProjectile
        this.getProjectileColor()
      );
      
      return projectile;
    }
    return null;
  }

  private getProjectileColor(): string {
    switch (this.type) {
      case EnemyType.SCOUT: return '#ff4444';
      case EnemyType.FIGHTER: return '#ff8800';
      case EnemyType.HEAVY: return '#ff0088';
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
