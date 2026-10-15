// Small helpers that make SVG shapes look hand-drawn.
//
// Everything here is "random" but repeatable: the randomness comes from a seed
// (usually a person's id), so the same person always gets the same wobble on
// screen, after a reload, and on the printed page.

// Turn a string into a number we can seed with.
function hashString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// A tiny seeded random number generator (mulberry32). Returns numbers 0..1.
export function seededRandom(seed: string): () => number {
  let a = hashString(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A random number between -1 and 1.
function wiggle(rand: () => number): number {
  return rand() * 2 - 1;
}

type Point = [number, number];

const n = (v: number) => Math.round(v * 10) / 10;

// Draws a smooth curve through the points (Catmull-Rom turned into Bézier curves).
function smoothPath(points: Point[], closed: boolean): string {
  const count = points.length;
  const at = (i: number): Point =>
    closed ? points[(i + count) % count] : points[Math.max(0, Math.min(count - 1, i))];
  let d = `M${n(points[0][0])} ${n(points[0][1])}`;
  const last = closed ? count : count - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${n(c1[0])} ${n(c1[1])} ${n(c2[0])} ${n(c2[1])} ${n(p2[0])} ${n(p2[1])}`;
  }
  return closed ? d + " Z" : d;
}

export type SketchShape = {
  fill: string; // a closed outline, for the fill color
  stroke: string; // the "pen line", which overlaps a little where it starts and ends
};

// A slightly lumpy circle of radius r, centered at 0,0.
export function sketchCircle(r: number, seed: string): SketchShape {
  const rand = seededRandom(seed + ":circle");
  const steps = 9;
  const start = rand() * Math.PI * 2;
  const radii = Array.from({ length: steps }, () => r * (1 + wiggle(rand) * 0.06));
  const point = (i: number, radius: number): Point => {
    const a = start + (i / steps) * Math.PI * 2;
    return [radius * Math.cos(a), radius * Math.sin(a)];
  };
  const ring = radii.map((radius, i) => point(i, radius));
  // The pen goes once around and a little past where it started, drifting outward.
  const drift = r * (0.05 + rand() * 0.05);
  const pen = [...ring, point(steps, radii[0] + drift), point(steps + 1.2, radii[1] + drift * 1.6)];
  return { fill: smoothPath(ring, true), stroke: smoothPath(pen, false) };
}

// A slightly crooked square with side s, centered at 0,0.
export function sketchSquare(s: number, seed: string): SketchShape {
  const rand = seededRandom(seed + ":square");
  const h = s / 2;
  const j = s * 0.05;
  const corners: Point[] = [
    [-h + wiggle(rand) * j, -h + wiggle(rand) * j],
    [h + wiggle(rand) * j, -h + wiggle(rand) * j],
    [h + wiggle(rand) * j, h + wiggle(rand) * j],
    [-h + wiggle(rand) * j, h + wiggle(rand) * j],
  ];
  // Each side bows out or in a touch, like a pen line.
  const bows = corners.map(() => wiggle(rand) * s * 0.045);
  const side = (a: Point, b: Point, bow: number) => {
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const cx = mx + (-(b[1] - a[1]) / len) * bow;
    const cy = my + ((b[0] - a[0]) / len) * bow;
    return ` Q${n(cx)} ${n(cy)} ${n(b[0])} ${n(b[1])}`;
  };
  let fill = `M${n(corners[0][0])} ${n(corners[0][1])}`;
  for (let i = 0; i < 4; i++) fill += side(corners[i], corners[(i + 1) % 4], bows[i]);

  // The pen starts a little before the first corner and runs a little past it at the end.
  const over = s * 0.12;
  const first = corners[0];
  const second = corners[1];
  const startPt: Point = [first[0] - over * 0.4, first[1] + over * 0.9];
  const endPt: Point = [
    first[0] + (second[0] - first[0]) * 0.18,
    first[1] + (second[1] - first[1]) * 0.18 - s * 0.03,
  ];
  let stroke = `M${n(startPt[0])} ${n(startPt[1])} L${n(first[0])} ${n(first[1])}`;
  for (let i = 0; i < 4; i++) stroke += side(corners[i], corners[(i + 1) % 4], bows[i]);
  stroke += ` L${n(endPt[0])} ${n(endPt[1])}`;
  return { fill: fill + " Z", stroke };
}

// The points along a gently bent line from a to b. Used both to draw the line
// and (in the layout) to keep other people from sitting on top of it.
export function sketchLinePoints(a: Point, b: Point, seed: string): Point[] {
  const rand = seededRandom(seed + ":line");
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const bend1 = wiggle(rand) * Math.min(len * 0.13, 24);
  const bend2 = wiggle(rand) * Math.min(len * 0.09, 16);
  return [
    a,
    [a[0] + dx * 0.33 + px * bend1, a[1] + dy * 0.33 + py * bend1],
    [a[0] + dx * 0.68 + px * bend2, a[1] + dy * 0.68 + py * bend2],
    b,
  ];
}

export function sketchLine(a: Point, b: Point, seed: string): string {
  return smoothPath(sketchLinePoints(a, b, seed), false);
}
