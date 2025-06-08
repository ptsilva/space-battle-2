import { Vector2 } from '../utils/Vector2';

interface Particle {
  position: Vector2;
  velocity: Vector2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  public createExplosion(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 100 + Math.random() * 200;
      
      const particle: Particle = {
        position: new Vector2(x, y),
        velocity: new Vector2(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        ),
        life: 1000 + Math.random() * 1000,
        maxLife: 1000 + Math.random() * 1000,
        color: color,
        size: 2 + Math.random() * 4
      };
      
      this.particles.push(particle);
    }
  }

  public update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      particle.position.x += particle.velocity.x * deltaTime / 1000;
      particle.position.y += particle.velocity.y * deltaTime / 1000;
      particle.life -= deltaTime;
      
      // Apply gravity and friction
      particle.velocity.y += 50 * deltaTime / 1000;
      particle.velocity.x *= 0.99;
      particle.velocity.y *= 0.99;
      
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    for (const particle of this.particles) {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      
      ctx.beginPath();
      ctx.arc(
        particle.position.x,
        particle.position.y,
        particle.size * alpha,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    ctx.restore();
  }
}
