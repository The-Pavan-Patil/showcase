/**
 * The hero's text as a solid for the cursor swarm. The heading's glyphs (and
 * the description's line boxes) are drawn into a coarse mask at the exact
 * positions the browser laid them out, letter counters are filled so nothing
 * can hide inside an "O", and the mask becomes a signed distance field the
 * particles bounce off. Distances are CSS px in the hero's box.
 */

export type SolidField = {
  columns: number;
  rows: number;
  /** CSS px per grid cell. */
  cell: number;
  /** Distance to the solid surface at each cell centre; negative inside. */
  distance: Float32Array;
};

/** How far the solid surface stands off the ink, so dots touch, not overlap. */
const SOLID_PADDING = 4;
const INF = 1e20;

/**
 * 1-D squared Euclidean distance transform (Felzenszwalb & Huttenlocher) of
 * `length` values in `grid`, starting at `offset`, `stride` apart.
 */
function transformLine(
  grid: Float64Array,
  offset: number,
  stride: number,
  length: number,
  f: Float64Array,
  v: Uint32Array,
  z: Float64Array,
) {
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  f[0] = grid[offset];

  for (let q = 1, k = 0, s = 0; q < length; q++) {
    f[q] = grid[offset + q * stride];
    const q2 = q * q;
    do {
      const r = v[k];
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
    } while (s <= z[k] && --k > -1);
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }

  for (let q = 0, k = 0; q < length; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k];
    grid[offset + q * stride] = f[r] + (q - r) * (q - r);
  }
}

/** Squared distance (in cells) from every cell to the nearest zero cell. */
function transform(grid: Float64Array, columns: number, rows: number) {
  const size = Math.max(columns, rows);
  const f = new Float64Array(size);
  const v = new Uint32Array(size);
  const z = new Float64Array(size + 1);
  for (let x = 0; x < columns; x++) transformLine(grid, x, columns, rows, f, v, z);
  for (let y = 0; y < rows; y++) transformLine(grid, y * columns, 1, columns, f, v, z);
}

/** Marks empty cells that cannot be reached from the border as solid. */
function fillEnclosed(mask: Uint8Array, columns: number, rows: number) {
  const outside = new Uint8Array(mask.length);
  const queue = new Uint32Array(mask.length);
  let head = 0;
  let tail = 0;
  const visit = (index: number) => {
    if (mask[index] || outside[index]) return;
    outside[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < columns; x++) {
    visit(x);
    visit((rows - 1) * columns + x);
  }
  for (let y = 0; y < rows; y++) {
    visit(y * columns);
    visit(y * columns + columns - 1);
  }
  while (head < tail) {
    const index = queue[head++];
    const x = index % columns;
    if (x > 0) visit(index - 1);
    if (x < columns - 1) visit(index + 1);
    if (index >= columns) visit(index - columns);
    if (index < mask.length - columns) visit(index + columns);
  }

  for (let index = 0; index < mask.length; index++) {
    if (!outside[index]) mask[index] = 1;
  }
}

/**
 * Builds the distance field from a mask (1 = ink). The surface sits `padding`
 * CSS px outside the ink.
 */
export function buildSolidField(
  mask: Uint8Array,
  columns: number,
  rows: number,
  cell: number,
  padding = SOLID_PADDING,
): SolidField {
  const solid = mask.slice();
  fillEnclosed(solid, columns, rows);

  const toInk = new Float64Array(solid.length);
  const toAir = new Float64Array(solid.length);
  for (let index = 0; index < solid.length; index++) {
    toInk[index] = solid[index] ? 0 : INF;
    toAir[index] = solid[index] ? INF : 0;
  }
  transform(toInk, columns, rows);
  transform(toAir, columns, rows);

  // Cell centres sit half a cell from the edge between ink and air.
  const distance = new Float32Array(solid.length);
  for (let index = 0; index < solid.length; index++) {
    const cells = solid[index]
      ? -(Math.sqrt(toAir[index]) - 0.5)
      : Math.sqrt(toInk[index]) - 0.5;
    distance[index] = cells * cell - padding;
  }

  return { columns, rows, cell, distance };
}

/** Bilinear distance at (x, y); points off the grid read its nearest edge. */
export function sampleDistance(field: SolidField, x: number, y: number) {
  const { columns, rows, cell, distance } = field;
  const gx = Math.min(Math.max(x / cell - 0.5, 0), columns - 1);
  const gy = Math.min(Math.max(y / cell - 0.5, 0), rows - 1);
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const x1 = Math.min(x0 + 1, columns - 1);
  const y1 = Math.min(y0 + 1, rows - 1);
  const tx = gx - x0;
  const ty = gy - y0;
  const top = distance[y0 * columns + x0] * (1 - tx) + distance[y0 * columns + x1] * tx;
  const bottom = distance[y1 * columns + x0] * (1 - tx) + distance[y1 * columns + x1] * tx;
  return top * (1 - ty) + bottom * ty;
}

/** Unit direction away from the solid at (x, y), written into `out`. */
export function sampleNormal(
  field: SolidField,
  x: number,
  y: number,
  out: { x: number; y: number },
) {
  const step = field.cell;
  const nx = sampleDistance(field, x + step, y) - sampleDistance(field, x - step, y);
  const ny = sampleDistance(field, x, y + step) - sampleDistance(field, x, y - step);
  const length = Math.hypot(nx, ny);
  if (length < 1e-6) {
    out.x = 0;
    out.y = -1;
  } else {
    out.x = nx / length;
    out.y = ny / length;
  }
  return out;
}

function transformText(text: string, transform: string, lang: string) {
  if (transform === "uppercase") return text.toLocaleUpperCase(lang || undefined);
  if (transform === "lowercase") return text.toLocaleLowerCase(lang || undefined);
  return text;
}

/**
 * Draws each glyph at the position the browser gave it, so wrapping, balance
 * and letter-spacing all match without re-running layout.
 */
function drawGlyphs(context: CanvasRenderingContext2D, element: HTMLElement) {
  const lang = document.documentElement.lang;
  const range = document.createRange();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    const parent = text.parentElement;
    if (!parent) continue;
    const style = getComputedStyle(parent);
    const fontSize = Number.parseFloat(style.fontSize);
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics = context.measureText("H");
    const ascent = metrics.fontBoundingBoxAscent ?? fontSize * 0.8;
    const descent = metrics.fontBoundingBoxDescent ?? fontSize * 0.2;

    for (let index = 0; index < text.data.length; ) {
      const length = (text.data.codePointAt(index) ?? 0) > 0xffff ? 2 : 1;
      const glyph = text.data.slice(index, index + length);
      if (glyph.trim()) {
        range.setStart(text, index);
        range.setEnd(text, index + length);
        const box = range.getBoundingClientRect();
        if (box.width > 0) {
          // The box is the font's content area; centre the em box in it.
          const baseline = box.top + (box.height - ascent - descent) / 2 + ascent;
          context.fillText(
            transformText(glyph, style.textTransform, lang),
            box.left,
            baseline,
          );
        }
      }
      index += length;
    }
  }
}

/** Fills each line of text as one rounded bar: small copy is solid as a block. */
function drawLines(context: CanvasRenderingContext2D, element: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const boxes = [...range.getClientRects()]
    .filter((box) => box.width > 0 && box.height > 0)
    .sort((a, b) => a.top - b.top);

  const lines: Array<{ left: number; top: number; right: number; bottom: number }> = [];
  for (const box of boxes) {
    const line = lines.at(-1);
    if (line && box.top < (line.top + line.bottom) / 2) {
      line.left = Math.min(line.left, box.left);
      line.right = Math.max(line.right, box.right);
      line.top = Math.min(line.top, box.top);
      line.bottom = Math.max(line.bottom, box.bottom);
    } else {
      lines.push({ left: box.left, top: box.top, right: box.right, bottom: box.bottom });
    }
  }

  for (const line of lines) {
    const height = line.bottom - line.top;
    context.beginPath();
    context.roundRect(line.left, line.top, line.right - line.left, height, Math.min(height / 2, 10));
    context.fill();
  }
}

/**
 * Rasterises every `[data-hero-solid]` element into a distance field over
 * `bounds` (the hero's client rect). "lines" draws line boxes, anything else
 * the glyphs themselves.
 */
export function rasterizeSolids(
  bounds: DOMRect,
  elements: HTMLElement[],
  cell: number,
): SolidField | null {
  const columns = Math.max(1, Math.ceil(bounds.width / cell));
  const rows = Math.max(1, Math.ceil(bounds.height / cell));
  const canvas = document.createElement("canvas");
  canvas.width = columns;
  canvas.height = rows;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.scale(1 / cell, 1 / cell);
  context.translate(-bounds.left, -bounds.top);
  context.fillStyle = "#000";
  context.textBaseline = "alphabetic";
  for (const element of elements) {
    if (element.dataset.heroSolid === "lines") drawLines(context, element);
    else drawGlyphs(context, element);
  }

  const { data } = context.getImageData(0, 0, columns, rows);
  const mask = new Uint8Array(columns * rows);
  for (let index = 0; index < mask.length; index++) {
    mask[index] = data[index * 4 + 3] > 96 ? 1 : 0;
  }
  return buildSolidField(mask, columns, rows, cell);
}
