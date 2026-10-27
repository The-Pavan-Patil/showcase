import type * as Three from "three";

/**
 * WebGL rendering for the Selected Work dust scene. Each card is drawn twice
 * from the same raster: as a solid quad and as a cloud of particles, one per
 * few pixels. Both shaders share one dissolve front, a noisy line that sweeps
 * in from the card's outer edge. A pixel is solid until the front reaches it;
 * from then on it is a particle drifting away, so the card is made of its own
 * dust rather than covered by it. Scrolling back reverses every particle home.
 */

export type DustCardState = {
  /** Card centre in canvas coordinates (top-left origin, CSS px). */
  x: number;
  y: number;
  scale: number;
  /** 0 = solid, 1 = all dust. */
  dissolve: number;
  /** -1 when the card is left of centre (dust leaves from its left edge). */
  side: number;
};

export type DustMotion = {
  /** How far particles travel outwards, and how widely they fan out. */
  drift: number;
  spread: number;
  /** Radius of the little curl each particle makes on its way. */
  swirl: number;
};

/** How long a particle lives, as a share of the dissolve front's travel. */
const DUST_LIFE = 0.42;
/** 0 = the front is a straight line, 1 = pure noise. */
const RAGGED = 0.3;

const DISSOLVE_CHUNK = /* glsl */ `
  uniform float uDissolve;
  uniform float uSide;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // When the front reaches this point of the card: 0 at the outer edge.
  float releaseAt(vec2 uv) {
    float fromOuter = uSide < 0.0 ? uv.x : 1.0 - uv.x;
    vec2 q = uv * vec2(9.0, 13.0);
    float n = 0.5 * noise(q) + 0.3 * noise(q * 2.7) + 0.2 * noise(q * 7.3);
    return mix(fromOuter, n, ${RAGGED.toFixed(2)});
  }

  // Age of the dust at \`uv\`: below 0 still solid, 0-1 airborne, above 1 gone.
  float dustAge(vec2 uv) {
    float front = uDissolve * (1.0 + ${DUST_LIFE.toFixed(2)});
    return (front - releaseAt(uv)) / ${DUST_LIFE.toFixed(2)};
  }
`;

const CARD_VERTEX = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CARD_FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  ${DISSOLVE_CHUNK}

  void main() {
    float age = dustAge(vUv);
    // Pixels hand over to their particle just as it sets off.
    float solid = 1.0 - smoothstep(-0.05, 0.02, age);
    vec4 color = texture2D(uMap, vUv);
    // A faint darkening right at the front, like a burning edge.
    float burn = smoothstep(-0.18, -0.02, age) * solid;
    color.rgb *= 1.0 - 0.18 * burn;
    gl_FragColor = color * solid;
  }
`;

const DUST_VERTEX = /* glsl */ `
  uniform vec2 uCenter;
  uniform vec2 uSize;
  uniform float uScale;
  uniform float uDrift;
  uniform float uSpread;
  uniform float uSwirl;
  uniform float uPointSize;
  uniform float uRatio;

  attribute vec2 aUv;
  attribute vec3 aColor;
  attribute vec4 aSeed;

  varying vec3 vColor;
  varying float vAlpha;
  ${DISSOLVE_CHUNK}

  void main() {
    float age = dustAge(aUv);
    vAlpha = age > 0.0 && age < 1.0
      ? smoothstep(0.0, 0.05, age) * (1.0 - smoothstep(0.45, 1.0, age))
      : 0.0;
    if (vAlpha <= 0.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }

    vec2 p = uCenter + (aUv - 0.5) * uSize * uScale;
    float t = clamp(age, 0.0, 1.0);
    float travel = 1.0 - (1.0 - t) * (1.0 - t);
    float reach = mix(0.3, 1.0, aSeed.y);
    float fan = (aSeed.z - 0.5) * 2.0;
    p += vec2(uSide * uDrift * reach * travel, fan * abs(fan) * uSpread * reach * travel);
    float angle = aSeed.w * 6.2831 + t * 4.0;
    p += vec2(cos(angle), sin(angle)) * uSwirl * t;

    vColor = aColor;
    gl_PointSize = uPointSize * mix(0.7, 1.25, aSeed.x) * mix(1.0, 0.75, t) * uScale * uRatio;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
  }
`;

const DUST_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(vColor * vAlpha, vAlpha);
  }
`;

/** The card's scrim, kept in step with `.dust-card-shade` in globals.css. */
const SHADE_STOPS: Array<[number, string]> = [
  [0, "rgb(0 0 0 / 34%)"],
  [0.32, "rgb(0 0 0 / 0%)"],
  [0.7, "rgb(0 0 0 / 0%)"],
  [1, "rgb(0 0 0 / 30%)"],
];

/**
 * The card's background, kept in step with `.dust-card` in globals.css: a
 * glow ellipse top-right and a shadow ellipse bottom-left over the base.
 */
function drawCardBackground(
  context: CanvasRenderingContext2D,
  style: CSSStyleDeclaration,
  width: number,
  height: number,
) {
  const color = (name: string) => style.getPropertyValue(name).trim();
  context.fillStyle = color("--card-base");
  context.fillRect(0, 0, width, height);

  const ellipse = (
    hex: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    reach: number,
  ) => {
    context.save();
    context.translate(cx * width, cy * height);
    context.scale(rx * width, ry * height);
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);
    // Fade to the same colour at zero alpha, as CSS does, not to black.
    gradient.addColorStop(0, hex);
    gradient.addColorStop(reach, `${hex}00`);
    context.fillStyle = gradient;
    context.fillRect(-cx / rx - 1, -cy / ry - 1, 1 / rx + 2, 1 / ry + 2);
    context.restore();
  };
  ellipse(color("--card-glow"), 0.85, 0.1, 0.9, 0.6, 0.62);
  ellipse(color("--card-deep"), 0.1, 0.95, 1.1, 0.7, 0.7);
}

function parsePercent(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  if (value === "left" || value === "top") return 0;
  if (value === "right" || value === "bottom") return 1;
  if (value === "center") return 0.5;
  const percent = Number.parseFloat(value);
  return Number.isFinite(percent) && value.endsWith("%")
    ? percent / 100
    : fallback;
}

/** Draws `image` with object-fit: cover into the box at (left, top). */
function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  left: number,
  top: number,
  width: number,
  height: number,
) {
  const [posX, posY] = getComputedStyle(image).objectPosition.split(" ");
  const scale = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight,
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const x = left + (width - drawWidth) * parsePercent(posX, 0.5);
  const y = top + (height - drawHeight) * parsePercent(posY, 0.5);
  context.drawImage(image, x, y, drawWidth, drawHeight);
}

/** Offset of `element` inside `card`, ignoring transforms on the card. */
function offsetWithin(element: HTMLElement, card: HTMLElement) {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = element;
  while (node && node !== card) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { left, top };
}

/** Draws a text element with the same font and wrapping width it has in the DOM. */
function drawText(
  context: CanvasRenderingContext2D,
  element: HTMLElement,
  card: HTMLElement,
) {
  const style = getComputedStyle(element);
  const { left, top } = offsetWithin(element, card);
  const fontSize = Number.parseFloat(style.fontSize);
  const lineHeight = Number.parseFloat(style.lineHeight) || fontSize * 1.2;
  const maxWidth = element.offsetWidth;

  context.font = style.font;
  context.fillStyle = style.color;
  context.textBaseline = "middle";
  if ("letterSpacing" in context) context.letterSpacing = style.letterSpacing;

  const words = (element.textContent ?? "").trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > maxWidth + 1) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);

  lines.forEach((text, index) => {
    context.fillText(text, left, top + lineHeight * (index + 0.5));
  });
}

/** Small seeded PRNG (mulberry32), so a card always scatters the same way. */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rasterises a card at device resolution (untransformed CSS size). */
function rasterizeCard(card: HTMLElement, ratio: number) {
  const width = Math.max(1, Math.round(card.offsetWidth));
  const height = Math.max(1, Math.round(card.offsetHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.scale(ratio, ratio);

  const style = getComputedStyle(card);
  const radius = Number.parseFloat(style.borderTopLeftRadius) || 0;
  context.beginPath();
  context.roundRect(0, 0, width, height, radius);
  context.clip();
  drawCardBackground(context, style, width, height);

  const shade = context.createLinearGradient(0, 0, 0, height);
  for (const [offset, color] of SHADE_STOPS) shade.addColorStop(offset, color);
  context.fillStyle = shade;
  context.fillRect(0, 0, width, height);

  // The screenshot's framed window, with the same drop shadow and hairline.
  const frame = card.querySelector<HTMLElement>(".dust-card-media");
  const image = frame?.querySelector("img");
  if (frame && image?.complete && image.naturalWidth > 0) {
    const { left, top } = offsetWithin(frame, card);
    const frameWidth = frame.offsetWidth;
    const frameHeight = frame.offsetHeight;
    const frameRadius =
      Number.parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0;

    context.save();
    context.shadowColor = "rgb(0 0 0 / 32%)";
    context.shadowBlur = 40;
    context.shadowOffsetY = 18;
    context.beginPath();
    context.roundRect(left, top, frameWidth, frameHeight, frameRadius);
    context.fillStyle = "#000";
    context.fill();
    context.restore();

    context.save();
    context.beginPath();
    context.roundRect(left, top, frameWidth, frameHeight, frameRadius);
    context.clip();
    drawCover(context, image, left, top, frameWidth, frameHeight);
    context.restore();

    context.beginPath();
    context.roundRect(
      left + 0.5,
      top + 0.5,
      frameWidth - 1,
      frameHeight - 1,
      frameRadius,
    );
    context.strokeStyle = "rgb(255 255 255 / 14%)";
    context.lineWidth = 1;
    context.stroke();
  }

  card
    .querySelectorAll<HTMLElement>("[data-dust-text]")
    .forEach((element) => drawText(context, element, card));

  return { canvas, width, height };
}

/** One particle every `step` CSS px, carrying that pixel's colour. */
function sampleParticles(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  step: number,
  seed: number,
) {
  const ratio = canvas.width / width;
  const { data } = canvas
    .getContext("2d")!
    .getImageData(0, 0, canvas.width, canvas.height);
  const random = createRandom(seed);
  const uvs: number[] = [];
  const colors: number[] = [];
  const seeds: number[] = [];

  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      const index =
        (Math.floor(y * ratio) * canvas.width + Math.floor(x * ratio)) * 4;
      if (data[index + 3] < 128) continue;
      uvs.push(x / width, 1 - y / height);
      colors.push(
        data[index] / 255,
        data[index + 1] / 255,
        data[index + 2] / 255,
      );
      seeds.push(random(), random(), random(), random());
    }
  }

  return {
    uvs: new Float32Array(uvs),
    colors: new Float32Array(colors),
    seeds: new Float32Array(seeds),
  };
}

type CardLayer = {
  mesh: Three.Mesh<Three.PlaneGeometry, Three.ShaderMaterial>;
  dust: Three.Points<Three.BufferGeometry, Three.ShaderMaterial>;
  texture: Three.CanvasTexture;
  width: number;
  height: number;
};

export class DustField {
  private readonly three: typeof Three;
  private readonly renderer: Three.WebGLRenderer;
  private readonly scene: Three.Scene;
  private readonly camera: Three.OrthographicCamera;
  private layers: CardLayer[] = [];
  private height = 1;

  private constructor(three: typeof Three, canvas: HTMLCanvasElement) {
    this.three = three;
    this.renderer = new three.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new three.Scene();
    this.camera = new three.OrthographicCamera(0, 1, 1, 0, -1, 1);
  }

  /** Loads three.js on demand; resolves to null when WebGL is unavailable. */
  static async create(canvas: HTMLCanvasElement) {
    try {
      const three = await import("three");
      return new DustField(three, canvas);
    } catch {
      return null;
    }
  }

  private get ratio() {
    return Math.min(window.devicePixelRatio || 1, 2);
  }

  setSize(width: number, height: number) {
    this.height = height;
    this.renderer.setPixelRatio(this.ratio);
    this.renderer.setSize(width, height, false);
    Object.assign(this.camera, {
      left: 0,
      right: width,
      top: height,
      bottom: 0,
    });
    this.camera.updateProjectionMatrix();
  }

  /** (Re)builds every card from the DOM; call after resizes and image loads. */
  setCards(cards: HTMLElement[], step: number) {
    this.clearCards();
    const three = this.three;
    const ratio = this.ratio;

    this.layers = cards.map((card, index) => {
      const { canvas, width, height } = rasterizeCard(card, ratio);
      const texture = new three.CanvasTexture(canvas);
      texture.premultiplyAlpha = true;
      texture.minFilter = three.LinearMipmapLinearFilter;
      texture.anisotropy = 4;

      // Both materials share these by reference, so one write moves both.
      const shared = {
        uDissolve: { value: 0 },
        uSide: { value: 1 },
      };

      const mesh = new three.Mesh(
        new three.PlaneGeometry(1, 1),
        new three.ShaderMaterial({
          vertexShader: CARD_VERTEX,
          fragmentShader: CARD_FRAGMENT,
          transparent: true,
          premultipliedAlpha: true,
          depthTest: false,
          depthWrite: false,
          uniforms: { ...shared, uMap: { value: texture } },
        }),
      );

      const sample = sampleParticles(canvas, width, height, step, index + 1);
      const geometry = new three.BufferGeometry();
      // `position` is unused by the shader but sizes the draw call.
      geometry.setAttribute(
        "position",
        new three.BufferAttribute(
          new Float32Array((sample.uvs.length / 2) * 3),
          3,
        ),
      );
      geometry.setAttribute("aUv", new three.BufferAttribute(sample.uvs, 2));
      geometry.setAttribute(
        "aColor",
        new three.BufferAttribute(sample.colors, 3),
      );
      geometry.setAttribute(
        "aSeed",
        new three.BufferAttribute(sample.seeds, 4),
      );
      const dust = new three.Points(
        geometry,
        new three.ShaderMaterial({
          vertexShader: DUST_VERTEX,
          fragmentShader: DUST_FRAGMENT,
          transparent: true,
          premultipliedAlpha: true,
          depthTest: false,
          depthWrite: false,
          uniforms: {
            ...shared,
            uCenter: { value: new three.Vector2() },
            uSize: { value: new three.Vector2(width, height) },
            uScale: { value: 1 },
            uDrift: { value: 0 },
            uSpread: { value: 0 },
            uSwirl: { value: 0 },
            uPointSize: { value: step * 1.1 },
            uRatio: { value: ratio },
          },
        }),
      );
      mesh.frustumCulled = false;
      dust.frustumCulled = false;
      this.scene.add(mesh, dust);
      return { mesh, dust, texture, width, height };
    });
  }

  update(states: DustCardState[], motion: DustMotion) {
    this.layers.forEach((layer, index) => {
      const state = states[index];
      if (!state) return;
      const visible = state.dissolve < 1;
      layer.mesh.visible = visible;
      layer.dust.visible = visible;
      if (!visible) return;

      const y = this.height - state.y;
      layer.mesh.position.set(state.x, y, 0);
      layer.mesh.scale.set(
        layer.width * state.scale,
        layer.height * state.scale,
        1,
      );

      const uniforms = layer.dust.material.uniforms;
      uniforms.uDissolve.value = state.dissolve;
      uniforms.uSide.value = state.side;
      uniforms.uCenter.value.set(state.x, y);
      uniforms.uScale.value = state.scale;
      uniforms.uDrift.value = motion.drift;
      uniforms.uSpread.value = motion.spread;
      uniforms.uSwirl.value = motion.swirl;
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  private clearCards() {
    for (const layer of this.layers) {
      this.scene.remove(layer.mesh, layer.dust);
      layer.mesh.geometry.dispose();
      layer.mesh.material.dispose();
      layer.dust.geometry.dispose();
      layer.dust.material.dispose();
      layer.texture.dispose();
    }
    this.layers = [];
  }

  dispose() {
    this.clearCards();
    this.renderer.dispose();
  }
}
