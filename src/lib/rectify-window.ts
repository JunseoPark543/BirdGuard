export type Point = [number, number];
export type Quad = [Point, Point, Point, Point];
export type PixelImage = { width: number; height: number; data: Uint8ClampedArray };

const cross = (a: Point, b: Point, c: Point) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
export function polygonArea(points: Point[]) {
  return Math.abs(points.reduce((sum, p, i) => {
    const next = points[(i + 1) % points.length];
    return sum + p[0] * next[1] - next[0] * p[1];
  }, 0)) / 2;
}

// Order a convex perimeter, independent of the model's starting corner/direction.
export function windowQuad(points: Point[]): Quad | null {
  const sorted = points.filter(p => p.every(Number.isFinite))
    .filter((p, i, all) => all.findIndex(q => p[0] === q[0] && p[1] === q[1]) === i)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 4) return null;
  const half = (input: Point[]) => {
    const hull: Point[] = [];
    for (const point of input) {
      while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) hull.pop();
      hull.push(point);
    }
    return hull.slice(0, -1);
  };
  const hull = [...half(sorted), ...half([...sorted].reverse())];
  if (hull.length < 4) return null;
  // For detailed outlines, use the largest inscribed quadrilateral, never a
  // bounding rectangle that would silently include the surrounding facade.
  let best: Quad | null = null;
  let area = 1;
  for (let a = 0; a < hull.length - 3; a++) for (let b = a + 1; b < hull.length - 2; b++) {
    for (let c = b + 1; c < hull.length - 1; c++) for (let d = c + 1; d < hull.length; d++) {
      const candidate: Quad = [hull[a], hull[b], hull[c], hull[d]];
      const current = polygonArea(candidate);
      if (current > area) { best = candidate; area = current; }
    }
  }
  if (!best) return null;
  const start = best.reduce((index, p, i, all) => p[0] + p[1] < all[index][0] + all[index][1] ? i : index, 0);
  return [...best.slice(start), ...best.slice(0, start)] as Quad;
}

// Solve a homography from the unit output square to the photographed corners.
// Backward sampling avoids gaps when the photographed window is expanded.
export function windowProjection(quad: Quad) {
  const square: Quad = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const rows = square.flatMap(([u, v], i) => {
    const [x, y] = quad[i];
    return [[u, v, 1, 0, 0, 0, -u * x, -v * x, x], [0, 0, 0, u, v, 1, -u * y, -v * y, y]];
  });
  for (let col = 0; col < 8; col++) {
    let pivot = col;
    for (let row = col + 1; row < 8; row++) if (Math.abs(rows[row][col]) > Math.abs(rows[pivot][col])) pivot = row;
    [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
    const divisor = rows[col][col];
    if (Math.abs(divisor) < 1e-10) throw new Error("창문 모서리를 구분하기 어렵습니다. 영역을 다시 선택해주세요.");
    for (let j = col; j <= 8; j++) rows[col][j] /= divisor;
    for (let row = 0; row < 8; row++) {
      if (row === col) continue;
      const factor = rows[row][col];
      for (let j = col; j <= 8; j++) rows[row][j] -= factor * rows[col][j];
    }
  }
  const h = rows.map(row => row[8]);
  return (u: number, v: number): Point => {
    const denominator = h[6] * u + h[7] * v + 1;
    return [(h[0] * u + h[1] * v + h[2]) / denominator, (h[3] * u + h[4] * v + h[5]) / denominator];
  };
}

export function rectifyWindowPixels(source: PixelImage, quad: Quad, maxEdge = 900): PixelImage {
  const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const estimatedWidth = (distance(quad[0], quad[1]) + distance(quad[3], quad[2])) / 2;
  const estimatedHeight = (distance(quad[0], quad[3]) + distance(quad[1], quad[2])) / 2;
  if (estimatedWidth < 2 || estimatedHeight < 2 || polygonArea(quad) < 4) throw new Error("선택한 창문 영역이 너무 작습니다.");
  const scale = Math.min(1, maxEdge / Math.max(estimatedWidth, estimatedHeight));
  const width = Math.max(2, Math.round(estimatedWidth * scale));
  const height = Math.max(2, Math.round(estimatedHeight * scale));
  const data = new Uint8ClampedArray(width * height * 4);
  const project = windowProjection(quad);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const [sx, sy] = project((x + .5) / width, (y + .5) / height);
    if (!Number.isFinite(sx) || !Number.isFinite(sy) || sx < 0 || sy < 0 || sx >= source.width || sy >= source.height) continue;
    const x0 = Math.floor(sx), y0 = Math.floor(sy);
    const x1 = Math.min(x0 + 1, source.width - 1), y1 = Math.min(y0 + 1, source.height - 1);
    const dx = sx - x0, dy = sy - y0;
    const samples = [[x0, y0, (1 - dx) * (1 - dy)], [x1, y0, dx * (1 - dy)], [x0, y1, (1 - dx) * dy], [x1, y1, dx * dy]];
    const out = (y * width + x) * 4;
    let alpha = 0;
    const color = [0, 0, 0];
    for (const [px, py, weight] of samples) {
      const pos = (py * source.width + px) * 4;
      const contribution = source.data[pos + 3] / 255 * weight;
      alpha += contribution;
      for (let channel = 0; channel < 3; channel++) color[channel] += source.data[pos + channel] * contribution;
    }
    if (alpha > 0) for (let channel = 0; channel < 3; channel++) data[out + channel] = color[channel] / alpha;
    data[out + 3] = alpha * 255;
  }
  return { width, height, data };
}

export function extractWindowPlane(image: HTMLImageElement, polygon: Point[]) {
  const scale = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
  const source = document.createElement("canvas");
  source.width = Math.max(1, Math.round(image.naturalWidth * scale));
  source.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const points: Point[] = polygon.map(([x, y]) => [x / 1000 * source.width, y / 1000 * source.height]);
  const quad = windowQuad(points);
  if (!quad) throw new Error("평면으로 펼칠 창문의 네 모서리를 직접 선택해주세요.");
  const context = source.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("이 브라우저에서 창문 미리보기를 만들 수 없습니다.");
  // Preserve the actual outline, including concavities, before resampling.
  context.beginPath();
  points.forEach(([x, y], i) => i === 0 ? context.moveTo(x, y) : context.lineTo(x, y));
  context.closePath();
  context.clip();
  context.drawImage(image, 0, 0, source.width, source.height);
  const pixels = rectifyWindowPixels(context.getImageData(0, 0, source.width, source.height), quad);
  const output = document.createElement("canvas");
  output.width = pixels.width;
  output.height = pixels.height;
  const outputContext = output.getContext("2d");
  if (!outputContext) throw new Error("창문 미리보기 생성에 실패했습니다.");
  const imageData = outputContext.createImageData(pixels.width, pixels.height);
  imageData.data.set(pixels.data);
  outputContext.putImageData(imageData, 0, 0);
  return { url: output.toDataURL("image/png"), width: pixels.width, height: pixels.height };
}
