import * as THREE from 'three';

interface AuroraOptions {
  shaderResolution?: number;
  colorResolution?: number;
  breathingSpeed?: number;
  primaryHue?: number;
  hueVariance?: number;
  displacementSpeed?: number;
  displacementScale?: number;
}

const defaultOptions: Required<AuroraOptions> = {
  shaderResolution: 0.5,
  colorResolution: 0.1,
  breathingSpeed: 1.0,
  primaryHue: 0,
  hueVariance: 0.5,
  displacementSpeed: 1.0,
  displacementScale: 1.0,
};

export class AuroraBackground {
  container: HTMLElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  time: number;
  mesh: THREE.Mesh | null;
  material: THREE.ShaderMaterial | null;
  geometry: THREE.PlaneGeometry | null;
  animationId: number | null;
  options: Required<AuroraOptions>;

  constructor(container: HTMLElement, options: AuroraOptions = {}) {
    this.container = container;
    this.options = { ...defaultOptions, ...options };

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, premultipliedAlpha: false });
    this.renderer.setClearColor(0x000000, 1);
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.time = 0;
    this.mesh = null;
    this.material = null;
    this.geometry = null;
    this.animationId = null;

    this.init();
  }

  init() {
    this.createGeometry();
    this.createMaterial();
    this.createMesh();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
  }

  createMaterial() {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        gl_Position = vec4(position, 1.0);
        vUv = uv;
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec4 uColorParams;

      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      vec2 mod289(vec2 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      vec3 permute(vec3 x) {
        return mod289(((x * 34.0) + 1.0) * x);
      }
      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      vec4 permute(vec4 x) {
        return mod289(((x * 34.0) + 1.0) * x);
      }
      vec2 fade(vec2 t) {
        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
      }
      float cnoise(vec2 P) {
        vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
        vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
        Pi = mod289(Pi);
        vec4 ix = Pi.xzxz;
        vec4 iy = Pi.yyww;
        vec4 fx = Pf.xzxz;
        vec4 fy = Pf.yyww;
        vec4 i = permute(permute(ix) + iy);
        vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
        vec4 gy = abs(gx) - 0.5;
        vec4 tx = floor(gx + 0.5);
        gx = gx - tx;
        vec2 g00 = vec2(gx.x, gy.x);
        vec2 g10 = vec2(gx.y, gy.y);
        vec2 g01 = vec2(gx.z, gy.z);
        vec2 g11 = vec2(gx.w, gy.w);
        vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(
          dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)
        );
        g00 *= norm.x;
        g01 *= norm.y;
        g10 *= norm.z;
        g11 *= norm.w;
        float n00 = dot(g00, vec2(fx.x, fy.x));
        float n01 = dot(g01, vec2(fx.z, fy.z));
        float n10 = dot(g10, vec2(fx.y, fy.y));
        float n11 = dot(g11, vec2(fx.w, fy.w));
        vec2 fade_xy = fade(Pf.xy);
        vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
        float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
        return 2.3 * n_xy;
      }
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m * m;
        m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      float cubicPulse(float c, float w, float x) {
        x = abs(x - c);
        if (x > w) return 0.0;
        x /= w;
        return 1.0 - x * x * (3.0 - 2.0 * x);
      }

      void main() {
        vec2 pos = gl_FragCoord.xy / uResolution;
        float time = uTime;
        float colorSpeed = uColorParams.z;
        float colorScale = uColorParams.w;
        float hueCenter = uColorParams.x;
        float hueRange = uColorParams.y;

        vec3 baseColor = vec3(0.0, 0.0, 0.0);
        float intensity = 0.0;

        float p1 = cubicPulse(0.0, 0.65, snoise(vec2(pos.x * 2.5 + sin(time * 0.05) * 0.2, pos.y * 2.5 + cos(time * 0.075) * 0.2) + sin(time * 0.02 + pos.y * 2.0 + pos.x * 1.5) * 0.3)) * 0.5 + 0.5;
        float hue1 = cubicPulse(0.0, 0.6, cnoise(vec2(floor(p1 * 9.0) * 12.5 + sin(time * 0.2 + pos.y * 0.5) * 0.2, floor(time * colorSpeed * 20.0) * colorScale * 10.0))) * 0.5 + 0.5;

        vec3 color1 = vec3(0.02, 0.02, 0.04);
        vec3 color2 = vec3(0.04, 0.03, 0.05);
        vec3 color3 = vec3(0.01, 0.01, 0.02);
        baseColor = mix(color1, color2, hue1);
        baseColor = mix(baseColor, color3, p1 * p1);

        float i1 = snoise(vec2(pos.x * 1.5 + time * 0.03, pos.y * 1.5 - time * 0.025)) * 0.15 + 0.15;
        intensity += i1;
        float i2 = cubicPulse(0.5, 0.45, snoise(vec2(pos.x * 3.0 - time * 0.05, pos.y * 3.0 + time * 0.035)) * 0.5 + 0.5) * 0.5;
        intensity += i2;
        float i3 = (sin(time * 0.15 + pos.y * 8.0 + snoise(vec2(pos.x * 4.0, pos.y * 4.0 + time * 0.1)) * 4.0) * 0.5 + 0.5) * 0.075;
        intensity += i3;

        gl_FragColor = vec4(baseColor, intensity * 0.4);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
        uColorParams: {
          value: new THREE.Vector4(
            this.options.primaryHue,
            this.options.hueVariance,
            this.options.displacementSpeed,
            this.options.displacementScale
          ),
        },
      },
      vertexShader,
      fragmentShader,
    });
  }

  createMesh() {
    if (!this.geometry || !this.material) return;
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    if (this.material) {
      this.material.uniforms.uResolution.value.set(
        w * this.options.shaderResolution,
        h * this.options.shaderResolution
      );
    }
    if (w === 0 || h === 0) return;
    this.start();
  }

  start() {
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  animate() {
    this.time += 0.01 * this.options.breathingSpeed;
    if (this.material) {
      this.material.uniforms.uTime.value = this.time;
    }
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
