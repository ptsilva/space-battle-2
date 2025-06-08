import { Vector2 } from '../utils/Vector2';
import { Projectile } from './Projectile';
import { PowerUp, PowerUpType } from './PowerUp';
import { InputManager } from '../managers/InputManager';
import { UpgradeType, PlayerUpgrades } from '../types/GameTypes';

export class Player {
  public position: Vector2;
  public velocity: Vector2;
  public width = 40;
  public height = 40;
  
  // Stats
  public hp: number = 100;
  public maxHp: number = 100;
  public shield: number = 100;
  public maxShield: number = 100;
  public speed: number = 300;
  public damage: number = 25;
  public fireRate: number = 300;
  public ramDamage = 50;

  // Upgrades
  private upgrades: PlayerUpgrades = {
    weapon: 1,
    shield: 1,
    hp: 1,
    speed: 1
  };

  // Shooting
  private lastShot = 0;
  private shootCooldown: number = 300;

  // Shield regeneration
  private lastDamageTime = 0;
  private shieldRegenDelay = 3000; // 3 seconds
  private shieldRegenRate = 20; // per second

  // Power-up effects
  private powerUpEffects: Map<PowerUpType, number> = new Map();

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    
    this.initializeStats();
  }

  private initializeStats(): void {
    this.maxHp = 100 + (this.upgrades.hp - 1) * 25;
    this.hp = this.maxHp;
    this.maxShield = 100 + (this.upgrades.shield - 1) * 30;
    this.shield = this.maxShield;
    this.speed = 300 + (this.upgrades.speed - 1) * 50;
    this.damage = 25 + (this.upgrades.weapon - 1) * 10;
    this.fireRate = 300 - (this.upgrades.weapon - 1) * 30; // Lower is faster
    this.shootCooldown = this.fireRate;
  }

  public update(deltaTime: number, input: InputManager, canvas: HTMLCanvasElement): void {
    // Handle movement
    this.velocity.x = 0;
    this.velocity.y = 0;

    if (input.isMovingLeft()) this.velocity.x -= 1;
    if (input.isMovingRight()) this.velocity.x += 1;
    if (input.isMovingUp()) this.velocity.y -= 1;
    if (input.isMovingDown()) this.velocity.y += 1;

    // Handle touch input
    const touchInput = input.getTouchInput();
    if (touchInput) {
      const targetX = touchInput.x - this.width / 2;
      const targetY = touchInput.y - this.height / 2;
      
      const dx = targetX - this.position.x;
      const dy = targetY - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 5) {
        this.velocity.x = dx / distance;
        this.velocity.y = dy / distance;
      }
    }

    // Normalize diagonal movement
    if (this.velocity.x !== 0 && this.velocity.y !== 0) {
      this.velocity.x *= 0.707;
      this.velocity.y *= 0.707;
    }

    // Apply speed
    const currentSpeed = this.getCurrentSpeed();
    this.position.x += this.velocity.x * currentSpeed * deltaTime / 1000;
    this.position.y += this.velocity.y * currentSpeed * deltaTime / 1000;

    // Keep player in bounds
    this.position.x = Math.max(0, Math.min(canvas.width - this.width, this.position.x));
    this.position.y = Math.max(0, Math.min(canvas.height - this.height, this.position.y));

    // Update shooting cooldown
    this.lastShot += deltaTime;

    // Shield regeneration
    if (Date.now() - this.lastDamageTime > this.shieldRegenDelay && this.shield < this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate * deltaTime / 1000);
    }

    // Update power-up effects
    this.updatePowerUpEffects(deltaTime);
  }

  private getCurrentSpeed(): number {
    let speed = this.speed;
    if (this.powerUpEffects.has(PowerUpType.SPEED)) {
      speed *= 1.5;
    }
    return speed;
  }

  private updatePowerUpEffects(deltaTime: number): void {
    for (const [type, timeLeft] of this.powerUpEffects.entries()) {
      const newTime = timeLeft - deltaTime;
      if (newTime <= 0) {
        this.powerUpEffects.delete(type);
      } else {
        this.powerUpEffects.set(type, newTime);
      }
    }
  }

  public shoot(): Projectile | null {
    if (this.lastShot >= this.shootCooldown) {
      this.lastShot = 0;
      
      const damage = this.getCurrentDamage();
      const projectile = new Projectile(
        this.position.x + this.width / 2 - 2,
        this.position.y,
        0, -800, // velocity
        damage,
        true, // isPlayerProjectile
        '#00ffff'
      );
      
      return projectile;
    }
    return null;
  }

  private getCurrentDamage(): number {
    let damage = this.damage;
    if (this.powerUpEffects.has(PowerUpType.WEAPON)) {
      damage *= 2;
    }
    return damage;
  }

  public takeDamage(amount: number): void {
    this.lastDamageTime = Date.now();
    
    if (this.shield > 0) {
      const shieldDamage = Math.min(this.shield, amount);
      this.shield -= shieldDamage;
      amount -= shieldDamage;
    }
    
    if (amount > 0) {
      this.hp = Math.max(0, this.hp - amount);
    }
  }

  public applyPowerUp(powerUp: PowerUp): void {
    switch (powerUp.type) {
      case PowerUpType.HEALTH:
        this.hp = Math.min(this.maxHp, this.hp + 30);
        break;
      case PowerUpType.SHIELD:
        this.shield = Math.min(this.maxShield, this.shield + 50);
        break;
      case PowerUpType.WEAPON:
        this.powerUpEffects.set(PowerUpType.WEAPON, 10000); // 10 seconds
        break;
      case PowerUpType.SPEED:
        this.powerUpEffects.set(PowerUpType.SPEED, 8000); // 8 seconds
        break;
    }
  }

  public upgrade(type: UpgradeType): void {
    this.upgrades[type]++;
    this.initializeStats();
  }

  public getUpgradeCost(type: UpgradeType): number {
    const baseCosts = {
      weapon: 100,
      shield: 150,
      hp: 200,
      speed: 120
    };
    
    return Math.floor(baseCosts[type] * Math.pow(1.5, this.upgrades[type] - 1));
  }

  public getUpgrades(): PlayerUpgrades {
    return { ...this.upgrades };
  }

  public applyUpgrades(upgrades: PlayerUpgrades): void {
    this.upgrades = { ...upgrades };
    this.initializeStats();
  }

  public reset(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.hp = this.maxHp;
    this.shield = this.maxShield;
    this.lastShot = 0;
    this.lastDamageTime = 0;
    this.powerUpEffects.clear();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Draw shield effect
    if (this.shield > 0) {
      ctx.strokeStyle = `rgba(68, 68, 255, ${this.shield / this.maxShield * 0.5})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        this.position.x + this.width / 2,
        this.position.y + this.height / 2,
        this.width / 2 + 5,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Draw power-up effects
    if (this.powerUpEffects.has(PowerUpType.WEAPON)) {
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 10;
    }
    if (this.powerUpEffects.has(PowerUpType.SPEED)) {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.position.x - 2, this.position.y - 2, this.width + 4, this.height + 4);
    }

    // Draw player ship
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(this.position.x + this.width / 2, this.position.y);
    ctx.lineTo(this.position.x, this.position.y + this.height);
    ctx.lineTo(this.position.x + this.width / 4, this.position.y + this.height * 0.8);
    ctx.lineTo(this.position.x + this.width * 0.75, this.position.y + this.height * 0.8);
    ctx.lineTo(this.position.x + this.width, this.position.y + this.height);
    ctx.closePath();
    ctx.fill();

    // Draw engine glow
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.ellipse(
      this.position.x + this.width / 2,
      this.position.y + this.height + 5,
      8, 12, 0, 0, Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }
}
