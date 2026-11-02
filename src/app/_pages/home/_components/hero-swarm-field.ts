import type * as Three from "three";

import { particleFade, type SwarmSimulation } from "./hero-swarm-sim";

/**
 * WebGL rendering for the hero's cursor swarm: one point sprite per particle,
 * a crisp core inside a soft halo. On a dark page they blend additively, so
 * dense clusters around the cursor burn brighter than the strays; on a light
 * page they stack normally, since light added to light washes out. The CPU simulation moves them; this
 * only uploads positions and draws.
 */

const VERTEX = /* glsl */ `
  uniform float uRatio;
  uniform float uSize;
  uniform vec3 uWarm;
  uniform vec3 uCool;

  attribute vec3 aParticle; // x, y (CSS px), brightness
  attribute vec2 aLook;     // size, tint

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vAlpha = aParticle.z;
    // A size-0 point still rasterises as one pixel on some GPUs: move it off.
    if (vAlpha <= 0.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }
    // Blended as squares so the colours in between stay luminous.
    vColor = sqrt(mix(uWarm * uWarm, uCool * uCool, aLook.y * aLook.y));
    gl_PointSize = uSize * mix(0.55, 1.6, aLook.x) * uRatio;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(aParticle.xy, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord * 2.0 - 1.0);
    float core = 1.0 - smoothstep(0.24, 0.36, d);
    float halo = exp(-d * d * 7.0) * 0.4 * (1.0 - smoothstep(0.8, 1.0, d));
    float alpha = (core + halo) * vAlpha;
    gl_FragColor = vec4(vColor * alpha, alpha);
  }
`;

/** Sprite size (core plus halo) in CSS px, before the per-particle spread. */
const POINT_SIZE = 11;

export type SwarmLook = { warm: string; cool: string; additive: boolean };

export class SwarmField {
  private readonly three: typeof Three;
  private readonly renderer: Three.WebGLRenderer;
  private readonly scene: Three.Scene;
  private readonly camera: Three.OrthographicCamera;
  private readonly material: Three.ShaderMaterial;
  private points: Three.Points<Three.BufferGeometry, Three.ShaderMaterial> | null =
    null;
  private particles = new Float32Array(0);

  private constructor(
    three: typeof Three,
    canvas: HTMLCanvasElement,
    context: WebGL2RenderingContext,
  ) {
    this.three = three;
    this.renderer = new three.WebGLRenderer({ canvas, context });
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new three.Scene();
    this.camera = new three.OrthographicCamera(0, 1, 0, 1, -1, 1);
    this.material = new three.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      premultipliedAlpha: true,
      blending: three.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uRatio: { value: 1 },
        uSize: { value: POINT_SIZE },
        uWarm: { value: new three.Vector3(1, 0.7, 0.4) },
        uCool: { value: new three.Vector3(0.7, 0.37, 1) },
      },
    });
  }

  /**
   * Loads three.js on demand. Resolves to null without a GPU-backed WebGL 2
   * context: drawn in software, a full-screen swarm every frame would stall
   * the page, so the hero shows its copy without the swarm instead.
   */
  static async create(canvas: HTMLCanvasElement) {
    try {
      const context = canvas.getContext("webgl2", {
        alpha: true,
        antialias: false,
        depth: false,
        premultipliedAlpha: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: true,
      });
      if (!context) return null;
      const three = await import("three");
      return new SwarmField(three, canvas, context);
    } catch {
      return null;
    }
  }

  private get ratio() {
    return Math.min(window.devicePixelRatio || 1, 2);
  }

  /** Sizes the canvas to the hero; y runs down, as in the DOM. */
  setSize(width: number, height: number) {
    this.renderer.setPixelRatio(this.ratio);
    this.renderer.setSize(width, height, false);
    Object.assign(this.camera, { left: 0, right: width, top: 0, bottom: height });
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uRatio.value = this.ratio;
  }

  /** Reads a CSS colour as sRGB components for the shader. */
  private setColor(name: "uWarm" | "uCool", value: string) {
    if (!value) return;
    const rgb = new this.three.Color(value).getRGB(
      { r: 0, g: 0, b: 0 },
      this.three.SRGBColorSpace,
    );
    this.material.uniforms[name].value.set(rgb.r, rgb.g, rgb.b);
  }

  /** Applies the theme's colours and blending. */
  setLook(look: SwarmLook) {
    this.setColor("uWarm", look.warm);
    this.setColor("uCool", look.cool);
    const blending = look.additive
      ? this.three.AdditiveBlending
      : this.three.NormalBlending;
    if (this.material.blending !== blending) {
      this.material.blending = blending;
      this.material.needsUpdate = true;
    }
  }

  /** (Re)builds the buffers for `simulation`'s particles. */
  setSwarm(simulation: SwarmSimulation, look: SwarmLook) {
    this.clearSwarm();
    const three = this.three;
    this.setLook(look);

    const { count } = simulation;
    this.particles = new Float32Array(count * 3);
    const looks = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      looks[i * 2] = simulation.size[i];
      looks[i * 2 + 1] = simulation.tint[i];
    }

    const geometry = new three.BufferGeometry();
    // `position` is unused by the shader but sizes the draw call.
    geometry.setAttribute(
      "position",
      new three.BufferAttribute(new Float32Array(count * 3), 3),
    );
    const particles = new three.BufferAttribute(this.particles, 3);
    particles.setUsage(three.DynamicDrawUsage);
    geometry.setAttribute("aParticle", particles);
    geometry.setAttribute("aLook", new three.BufferAttribute(looks, 2));

    this.points = new three.Points(geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);
  }

  update(simulation: SwarmSimulation) {
    const points = this.points;
    if (!points) return;
    const { x, y, age, life } = simulation;
    const particles = this.particles;
    for (let i = 0; i < simulation.count; i++) {
      particles[i * 3] = x[i];
      particles[i * 3 + 1] = y[i];
      particles[i * 3 + 2] = particleFade(age[i], life[i]);
    }
    points.geometry.getAttribute("aParticle").needsUpdate = true;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  private clearSwarm() {
    if (!this.points) return;
    this.scene.remove(this.points);
    this.points.geometry.dispose();
    this.points = null;
  }

  dispose() {
    this.clearSwarm();
    this.material.dispose();
    this.renderer.dispose();
  }
}
