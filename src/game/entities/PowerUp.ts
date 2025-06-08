import { Vector2 } from '../utils/Vector2';

export enum PowerUpType {
  HEALTH = 'health',
  SHIELD = 'shield',
  WEAPON = 'weapon',
  SPEED = 'speed'
}

export class PowerUp {
  public position: Vector2;
  public velocity: Vector2;
  public width = 30;
  public height = 30;
  public type: PowerUpType;
  public color: string;
  
  private lifeTime = 15000; // 15 seconds
  private age = 0;
  private pulseTimer = 0;

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 50); // Slow downward movement
    
    // Randomly select power-up type
    const types = Object.values(PowerUpType);
    this.type = types[Math.floor(Math.random() * types.length)];
    
    this.color = this.getColor();
  }

  private getColor(): string {
    switch (this.type) {
      case PowerUpType.HEALTH: return '#00ff00';
      case PowerUpType.SHIELD: return '#0088ff';
      case PowerUpType.WEAPON: return '#ff4400';
      case PowerUpType.SPEED: return '#ffff00';
      default: return '#ffffff';
    }
  }

  public update(deltaTime: number): void {
    this.age += deltaTime;
    this.pulseTimer += deltaTime;
    
    this.position.x += this.velocity.x * deltaTime / 1000;
    this.position.y += this.velocity.y * deltaTime / 1000;
  }

  public isExpired(): boolean {
    return this.age >= this.lifeTime;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Pulsing effect
    const pulse = Math.sin(this.pulseTimer * 0.005) * 0.3 + 0.7;
    const alpha = this.age > this.lifeTime - 3000 ? 
      Math.sin(this.age * 0.01) * 0.5 + 0.5 : 1; // Blink when expiring
    
    ctx.globalAlpha = alpha;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10 * pulse;
    
    // Draw power-up icon
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height / 2;
    const size = this.width / 2 * pulse;
    
    switch (this.type) {
      case PowerUpType.HEALTH:
        // Cross shape
        ctx.fillRect(centerX - size * 0.6, centerY - size * 0.2, size * 1.2, size * 0.4);
        ctx.fillRect(centerX - size * 0.2, centerY - size * 0.6, size * 0.4, size * 1.2);
        break;
        
      case PowerUpType.SHIELD:
        // Shield shape
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
        
      case PowerUpType.WEAPON:
        // Arrow/bullet shape
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size);
        ctx.lineTo(centerX - size * 0.5, centerY + size);
        ctx.lineTo(centerX + size * 0.5, centerY + size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
        
      case PowerUpType.SPEED:
        // Lightning bolt
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.3, centerY - size);
        ctx.lineTo(centerX + size * 0.3, centerY - size * 0.2);
        ctx.lineTo(centerX - size * 0.1, centerY - size * 0.2);
        ctx.lineTo(centerX + size * 0.3, centerY + size);
        ctx.lineTo(centerX - size * 0.3, centerY + size * 0.2);
        ctx.lineTo(centerX + size * 0.1, centerY + size * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  }
}
