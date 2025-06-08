import { Vector2 } from '../utils/Vector2';
import { Projectile } from './Projectile';

export enum BossType {
  DREADNOUGHT = 'dreadnought',
  MOTHERSHIP = 'mothership',
  FORTRESS = 'fortress'
}

export class Boss {
  public position: Vector2;
  public velocity: Vector2;
  public width: number;
  public height: number;
  public hp: number;
  public maxHp: number;
  public damage: number;
  public scoreValue: number;
  public coinValue: number;
  public type: BossType;
  public isDefeated: boolean = false;

  private speed: number;
  private lastShot = 0;
  private shootCooldown: number;
  private movementPattern: number = 0;
  private patternTimer = 0;
  private specialTimer = 0;
  private phase: number = 1;
  private maxPhases: number = 3;
  private specialAttackTimer = 0;
  private specialAttackCooldown = 8000; // 8 seconds

  constructor(x: number, y: number, wave: number, type?: BossType) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    
    // Select boss type based on wave
    if (type) {
      this.type = type;
    } else {
      this.type = this.selectBossType(wave);
    }

    this.initializeStats(wave);
  }

  private selectBossType(wave: number): BossType {
    if (wave <= 5) return BossType.DREADNOUGHT;
    if (wave <= 10) return BossType.MOTHERSHIP;
    return BossType.FORTRESS;
  }

  private initializeStats(wave: number): void {
    const waveMultiplier = 1 + (wave - 1) * 0.15;
    
    switch (this.type) {
      case BossType.DREADNOUGHT:
        this.width = 120;
        this.height = 80;
        this.maxHp = Math.floor(500 * waveMultiplier);
        this.speed = 80;
        this.damage = Math.floor(60 * waveMultiplier);
        this.shootCooldown = 1500;
        this.scoreValue = 2000;
        this.coinValue = 200;
        break;
        
      case BossType.MOTHERSHIP:
        this.width = 160;
        this.height = 100;
        this.maxHp = Math.floor(800 * waveMultiplier);
        this.speed = 60;
        this.damage = Math.floor(80 * waveMultiplier);
        this.shootCooldown = 1200;
        this.scoreValue = 3500;
        this.coinValue = 350;
        break;
        
      case BossType.FORTRESS:
        this.width = 200;
        this.height = 120;
        this.maxHp = Math.floor(1200 * waveMultiplier);
        this.speed = 40;
        this.damage = Math.floor(100 * waveMultiplier);
        this.shootCooldown = 1000;
        this.scoreValue = 5000;
        this.coinValue = 500;
        break;
    }
    
    this.hp = this.maxHp;
  }

  public update(deltaTime: number, playerPosition: Vector2, canvas: HTMLCanvasElement): void {
    this.patternTimer += deltaTime;
    this.specialTimer += deltaTime;
    this.lastShot += deltaTime;
    this.specialAttackTimer += deltaTime;

    // Update phase based on health
    const healthPercent = this.hp / this.maxHp;
    if (healthPercent > 0.66) {
      this.phase = 1;
    } else if (healthPercent > 0.33) {
      this.phase = 2;
    } else {
      this.phase = 3;
    }

    // Movement patterns
    this.updateMovement(deltaTime, playerPosition, canvas);

    // Apply movement
    this.position.x += this.velocity.x * deltaTime / 1000;
    this.position.y += this.velocity.y * deltaTime / 1000;

    // Keep boss in bounds
    this.position.x = Math.max(0, Math.min(canvas.width - this.width, this.position.x));
    this.position.y = Math.max(-this.height * 0.3, Math.min(canvas.height * 0.4, this.position.y));
  }

  private updateMovement(deltaTime: number, playerPosition: Vector2, canvas: HTMLCanvasElement): void {
    const centerX = canvas.width / 2 - this.width / 2;
    
    switch (this.type) {
      case BossType.DREADNOUGHT:
        // Side-to-side movement
        this.velocity.x = Math.sin(this.patternTimer * 0.001) * this.speed;
        this.velocity.y = Math.sin(this.patternTimer * 0.0005) * this.speed * 0.3;
        break;
        
      case BossType.MOTHERSHIP:
        // Circular movement
        const radius = 100;
        const angle = this.patternTimer * 0.0008;
        this.velocity.x = Math.cos(angle) * this.speed * 0.8;
        this.velocity.y = Math.sin(angle) * this.speed * 0.4;
        break;
        
      case BossType.FORTRESS:
        // Slow, menacing advance and retreat
        if (this.phase === 3) {
          // Aggressive phase - move toward player
          const dx = playerPosition.x - (this.position.x + this.width / 2);
          this.velocity.x = Math.sign(dx) * this.speed * 0.5;
          this.velocity.y = Math.sin(this.patternTimer * 0.0003) * this.speed * 0.2;
        } else {
          // Normal movement
          this.velocity.x = Math.sin(this.patternTimer * 0.0006) * this.speed * 0.7;
          this.velocity.y = 0;
        }
        break;
    }
  }

  public shoot(): Projectile[] {
    const projectiles: Projectile[] = [];
    
    // Regular shooting
    if (this.lastShot >= this.shootCooldown) {
      this.lastShot = 0;
      projectiles.push(...this.createRegularProjectiles());
    }
    
    // Special attacks
    if (this.specialAttackTimer >= this.specialAttackCooldown) {
      this.specialAttackTimer = 0;
      projectiles.push(...this.createSpecialAttack());
    }
    
    return projectiles;
  }

  private createRegularProjectiles(): Projectile[] {
    const projectiles: Projectile[] = [];
    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height;

    switch (this.type) {
      case BossType.DREADNOUGHT:
        // Quad cannon
        for (let i = 0; i < 4; i++) {
          const offsetX = (i - 1.5) * 20;
          projectiles.push(new Projectile(
            centerX + offsetX - 3, centerY, 0, 350, this.damage, false, '#ff0000', 6, 12
          ));
        }
        break;

      case BossType.MOTHERSHIP:
        // Spread pattern
        for (let i = -3; i <= 3; i++) {
          projectiles.push(new Projectile(
            centerX - 3, centerY, i * 60, 400, this.damage * 0.8, false, '#ff4400', 5, 10
          ));
        }
        break;

      case BossType.FORTRESS:
        // Heavy barrage
        const shots = this.phase === 3 ? 8 : 6;
        for (let i = 0; i < shots; i++) {
          const angle = (i / shots) * Math.PI * 2;
          const vx = Math.sin(angle) * 200;
          const vy = Math.cos(angle) * 300 + 200;
          projectiles.push(new Projectile(
            centerX - 4, centerY, vx, vy, this.damage, false, '#8800ff', 8, 16
          ));
        }
        break;
    }

    return projectiles;
  }

  private createSpecialAttack(): Projectile[] {
    const projectiles: Projectile[] = [];
    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height;

    switch (this.type) {
      case BossType.DREADNOUGHT:
        // Laser beam simulation (rapid fire line)
        for (let i = 0; i < 10; i++) {
          projectiles.push(new Projectile(
            centerX - 2, centerY + i * 5, 0, 600, this.damage * 1.5, false, '#ffff00', 4, 20
          ));
        }
        break;

      case BossType.MOTHERSHIP:
        // Homing missiles (simulated with player-directed shots)
        for (let i = 0; i < 5; i++) {
          const offsetX = (i - 2) * 30;
          projectiles.push(new Projectile(
            centerX + offsetX - 3, centerY, 0, 250, this.damage * 1.2, false, '#ff8800', 6, 14
          ));
        }
        break;

      case BossType.FORTRESS:
        // Orbital bombardment
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 150;
          const vx = Math.sin(angle) * 300;
          const vy = Math.cos(angle) * 200 + 250;
          projectiles.push(new Projectile(
            centerX - 5, centerY, vx, vy, this.damage * 1.3, false, '#ff00ff', 10, 20
          ));
        }
        break;
    }

    return projectiles;
  }

  public takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      this.isDefeated = true;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Add boss glow effect
    ctx.shadowColor = this.getBossColor();
    ctx.shadowBlur = 15;

    // Draw boss based on type
    switch (this.type) {
      case BossType.DREADNOUGHT:
        this.renderDreadnought(ctx);
        break;
      case BossType.MOTHERSHIP:
        this.renderMothership(ctx);
        break;
      case BossType.FORTRESS:
        this.renderFortress(ctx);
        break;
    }

    // Draw health bar
    this.renderHealthBar(ctx);

    // Draw phase indicator
    this.renderPhaseIndicator(ctx);

    ctx.restore();
  }

  private renderDreadnought(ctx: CanvasRenderingContext2D): void {
    // Main hull
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.position.x + 20, this.position.y + 10, this.width - 40, this.height - 20);
    
    // Command bridge
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(this.position.x + 40, this.position.y, this.width - 80, 20);
    
    // Weapon turrets
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      const x = this.position.x + 30 + i * 20;
      ctx.beginPath();
      ctx.arc(x, this.position.y + this.height - 10, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Engine glow
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(this.position.x + 10, this.position.y + this.height, this.width - 20, 8);
  }

  private renderMothership(ctx: CanvasRenderingContext2D): void {
    // Main disc
    ctx.fillStyle = '#ff4400';
    ctx.beginPath();
    ctx.ellipse(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
      this.width / 2, this.height / 2, 0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Inner ring
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.ellipse(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
      this.width / 3, this.height / 3, 0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Central core
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.ellipse(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
      this.width / 6, this.height / 6, 0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Weapon ports
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = this.position.x + this.width / 2 + Math.cos(angle) * this.width / 3;
      const y = this.position.y + this.height / 2 + Math.sin(angle) * this.height / 3;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderFortress(ctx: CanvasRenderingContext2D): void {
    // Main structure
    ctx.fillStyle = '#8800ff';
    ctx.fillRect(this.position.x, this.position.y + 20, this.width, this.height - 40);
    
    // Upper section
    ctx.fillStyle = '#aa44ff';
    ctx.fillRect(this.position.x + 20, this.position.y, this.width - 40, 40);
    
    // Lower section
    ctx.fillRect(this.position.x + 20, this.position.y + this.height - 20, this.width - 40, 20);
    
    // Side towers
    ctx.fillStyle = '#6600cc';
    ctx.fillRect(this.position.x, this.position.y, 20, this.height);
    ctx.fillRect(this.position.x + this.width - 20, this.position.y, 20, this.height);
    
    // Weapon arrays
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 6; i++) {
      const x = this.position.x + 30 + i * 28;
      ctx.fillRect(x, this.position.y + this.height - 15, 8, 15);
    }
    
    // Central cannon
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(
      this.position.x + this.width / 2 - 10,
      this.position.y + this.height - 25,
      20, 25
    );
  }

  private getBossColor(): string {
    switch (this.type) {
      case BossType.DREADNOUGHT: return '#ff0000';
      case BossType.MOTHERSHIP: return '#ff4400';
      case BossType.FORTRESS: return '#8800ff';
      default: return '#ff0000';
    }
  }

  private renderHealthBar(ctx: CanvasRenderingContext2D): void {
    const barWidth = this.width;
    const barHeight = 8;
    const barY = this.position.y - 20;
    
    // Background
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(this.position.x, barY, barWidth, barHeight);
    
    // Health
    ctx.fillStyle = '#ff0000';
    const healthWidth = (this.hp / this.maxHp) * barWidth;
    ctx.fillRect(this.position.x, barY, healthWidth, barHeight);
    
    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.position.x, barY, barWidth, barHeight);
  }

  private renderPhaseIndicator(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(
      `PHASE ${this.phase}`,
      this.position.x + this.width / 2,
      this.position.y - 30
    );
  }
}
