interface Particle {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
  opacity: number;
  phase: number;
  color: string;
}

interface ParticleFlowOptions {
  particleCount?: number;
  baseSpeed?: number;
  trailLength?: number;
  colors?: string[];
  particleSize?: number;
}

const defaultOptions: Required<ParticleFlowOptions> = {
  particleCount: 100,
  baseSpeed: 1,
  trailLength: 0.2,
  colors: ['#ef4444', '#f97316', '#7f1d1d'],
  particleSize: 1,
};

export class ParticleFlow {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  options: Required<ParticleFlowOptions>;
  width: number;
  height: number;
  particles: Particle[];
  animationId: number | null;

  constructor(canvas: HTMLCanvasElement, options: ParticleFlowOptions = {}) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.options = { ...defaultOptions, ...options };
    this.width = 0;
    this.height = 0;
    this.particles = [];
    this.animationId = null;
    this.init();
  }

  init() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    window.addEventListener('resize', () => this.resize());
    this.createParticles();
    this.animate();
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speedX: (Math.random() * 1.5 + 0.5) * this.options.baseSpeed,
        speedY: (Math.random() - 0.5) * 0.5,
        size: Math.random() * this.options.particleSize + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        phase: Math.random() * Math.PI * 2,
        color: this.options.colors[Math.floor(Math.random() * this.options.colors.length)],
      });
    }
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.createParticles();
  }

  draw() {
    this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.options.trailLength})`;
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (const p of this.particles) {
      const waveY = Math.sin(p.x * 0.01 + p.phase) * 2;
      p.x += p.speedX;
      p.y += p.speedY + waveY * 0.01;
      p.phase += 0.02;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fill();
      this.ctx.globalAlpha = 1;

      if (p.x > this.width) {
        p.x = 0;
        p.y = Math.random() * this.height;
      }
      if (p.y < 0 || p.y > this.height) {
        p.y = Math.max(0, Math.min(this.height, p.y));
      }
    }
  }

  animate() {
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
