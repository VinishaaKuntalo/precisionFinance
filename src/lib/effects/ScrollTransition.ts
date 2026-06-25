import * as THREE from 'three';

interface ScrollTransitionOptions {
  images: string[];
  labels: { title: string; description: string }[];
}

export class ScrollTransition {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  textures: THREE.Texture[];
  materials: THREE.ShaderMaterial[];
  meshes: THREE.Mesh[];
  currentIndex: number;
  progress: number;
  isTransitioning: boolean;
  options: ScrollTransitionOptions;
  overlay: HTMLDivElement | null;
  titleEl: HTMLHeadingElement | null;
  descEl: HTMLParagraphElement | null;
  scrollHandler: () => void;

  constructor(container: HTMLElement, options: ScrollTransitionOptions) {
    this.container = container;
    this.options = options;
    this.currentIndex = 0;
    this.progress = 0;
    this.isTransitioning = false;
    this.textures = [];
    this.materials = [];
    this.meshes = [];
    this.overlay = null;
    this.titleEl = null;
    this.descEl = null;

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    container.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);

    this.scrollHandler = () => this.onScroll();
    this.init();
  }

  async init() {
    const loader = new THREE.TextureLoader();
    const loadPromises = this.options.images.map(
      (src) =>
        new Promise<THREE.Texture>((resolve) => {
          loader.load(src, (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            resolve(texture);
          });
        })
    );

    this.textures = await Promise.all(loadPromises);
    this.createMeshes();
    this.createOverlay();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.container.addEventListener('wheel', this.scrollHandler, { passive: true });
    this.animate();
  }

  createMeshes() {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float uProgress;
      uniform float uDirection;
      uniform float uOpacity;

      void main() {
        vec2 uv = vUv;
        float wave = sin(uv.y * 8.0 + uProgress * 6.283) * 0.05 * uDirection;
        uv.x += wave * (1.0 - abs(uProgress - 0.5) * 2.0);
        vec4 color = texture2D(uTexture, uv);
        color.a *= uOpacity;
        gl_FragColor = color;
      }
    `;

    const geometry = new THREE.PlaneGeometry(1, 1);

    this.textures.forEach((texture, i) => {
      const material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTexture: { value: texture },
          uProgress: { value: i === 0 ? 1 : 0 },
          uDirection: { value: 0 },
          uOpacity: { value: i === 0 ? 1 : 0 },
        },
        vertexShader,
        fragmentShader,
      });
      this.materials.push(material);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, -i * 0.01);
      this.scene.add(mesh);
      this.meshes.push(mesh);
    });
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.style.position = 'absolute';
    this.overlay.style.top = '50%';
    this.overlay.style.left = '50%';
    this.overlay.style.transform = 'translate(-50%, -50%)';
    this.overlay.style.textAlign = 'center';
    this.overlay.style.zIndex = '10';
    this.overlay.style.pointerEvents = 'none';
    this.overlay.style.maxWidth = '600px';

    this.titleEl = document.createElement('h2');
    this.titleEl.className = 'text-5xl md:text-6xl font-bold tracking-tighter text-white mb-4';
    this.titleEl.style.textShadow = '0 2px 20px rgba(0,0,0,0.8)';
    this.titleEl.textContent = this.options.labels[0].title;

    this.descEl = document.createElement('p');
    this.descEl.className = 'text-lg md:text-xl text-zinc-400 max-w-md mx-auto';
    this.descEl.style.textShadow = '0 1px 10px rgba(0,0,0,0.8)';
    this.descEl.textContent = this.options.labels[0].description;

    this.overlay.appendChild(this.titleEl);
    this.overlay.appendChild(this.descEl);
    this.container.appendChild(this.overlay);
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const imgAspect = 16 / 9;
    const containerAspect = w / h;
    let scaleX = 1;
    let scaleY = 1;

    if (containerAspect > imgAspect) {
      scaleY = 1;
      scaleX = containerAspect / imgAspect;
    } else {
      scaleX = 1;
      scaleY = imgAspect / containerAspect;
    }

    this.meshes.forEach((mesh) => {
      mesh.scale.set(scaleX, scaleY, 1);
    });
  }

  onScroll() {
    if (this.isTransitioning) return;
    const rect = this.container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (rect.top < viewportHeight * 0.5 && rect.bottom > viewportHeight * 0.5) {
      const scrollProgress = (viewportHeight * 0.5 - rect.top) / rect.height;
      const newIndex = Math.min(
        Math.floor(scrollProgress * this.options.images.length),
        this.options.images.length - 1
      );

      if (newIndex !== this.currentIndex) {
        this.transitionTo(newIndex);
      }
    }
  }

  transitionTo(index: number) {
    if (this.isTransitioning || index === this.currentIndex) return;
    this.isTransitioning = true;

    const direction = index > this.currentIndex ? 1 : -1;
    const currentMat = this.materials[this.currentIndex];
    const nextMat = this.materials[index];

    nextMat.uniforms.uDirection.value = direction;
    currentMat.uniforms.uDirection.value = -direction;

    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      currentMat.uniforms.uOpacity.value = 1 - eased;
      nextMat.uniforms.uOpacity.value = eased;
      nextMat.uniforms.uProgress.value = eased;
      currentMat.uniforms.uProgress.value = 1 - eased;

      if (this.titleEl && this.descEl) {
        const fadeT = Math.min(t * 2, 1);
        this.titleEl.style.opacity = String(fadeT);
        this.descEl.style.opacity = String(fadeT);
        if (t > 0.5) {
          this.titleEl.textContent = this.options.labels[index].title;
          this.descEl.textContent = this.options.labels[index].description;
        }
      }

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        this.currentIndex = index;
        this.isTransitioning = false;
      }
    };

    requestAnimationFrame(animate);
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  destroy() {
    this.container.removeEventListener('wheel', this.scrollHandler);
    this.renderer.dispose();
    this.textures.forEach((t) => t.dispose());
    this.materials.forEach((m) => m.dispose());
  }
}
