import { Vector2 } from '../utils/Vector2';

export class Projectile {
  public position: Vector2;
  public velocity: Vector2;
  public width: number = 4;
  public height: number = 12;
  public damage: number;
  public isPlayerProjectile: boolean;
  public color: string;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    isPlayerProjectile: boolean,
    color: string,
    width: number = 4,
    height: number = 12
  ) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(vx, vy);
    this.damage = damage;
    this.isPlayerProjectile = isPlayerProjectile;
    this.color = color;
    this.width = width;
    this.height = height;
  }

  public update(deltaTime: number): void {
    this.position.x += this.velocity.x * deltaTime / 1000;
    this.position.y += this.velocity.y * deltaTime / 1000;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Add glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    
    ctx.fillStyle = this.color;
    
    if (this.isPlayerProjectile) {
      // Player projectiles are more stylized
      ctx.beginPath();
      ctx.ellipse(
        this.position.x + this.width / 2,
        this.position.y + this.height / 2,
        this.width / 2,
        this.height / 2,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    } else {
      // Enemy projectiles vary by size
      if (this.width > 6) {
        // Large projectiles (boss/bomber)
        ctx.beginPath();
        ctx.ellipse(
          this.position.x + this.width / 2,
          this.position.y + this.height / 2,
          this.width / 2,
          this.height / 2,
          0, 0, Math.PI * 2
        );
        ctx.fill();
      } else {
        // Regular enemy projectiles
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
      }
    }
    
    ctx.restore();
  }
}
