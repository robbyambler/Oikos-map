// A compact, hand-drawn style layout, like a network map drawn on paper:
// you sit in the middle, the people in your life sit close around you, and
// each person's own people sit in a small cluster just beyond them.
// The map stays small and leaves blank paper around it.
//
// How it works:
// 1. Each branch (one of the people closest to you, plus everyone connected
//    through them) gets its own wedge of the circle, like a slice of pie,
//    sized by how many people are in it. That keeps each branch together.
// 2. Each person starts a short hop from the person they're connected to,
//    heading outward in their wedge, with a little nudge of their own (nearer
//    or further, a bit to the side, a little bigger or smaller, a little tilted).
//    The nudge comes from their id, so it's the same every time.
// 3. A tidy-up pass, repeated a few hundred times:
//    - pull people back toward their person, so lines stay short
//    - keep people further out than their person, and inside their wedge
//    - push apart anyone who overlaps, and nudge people off lines that aren't theirs
//    It always runs the same way, so the same map always comes out the same.

import { Person, childrenOf, findRoot } from "./people";
import { seededRandom, sketchLinePoints } from "./sketch";

export type PlacedPerson = {
  person: Person;
  x: number;
  y: number;
  depth: number;
  size: number; // width of the shape
  tilt: number; // degrees
  label: string;
  fontSize: number;
};

export type Layout = {
  placed: PlacedPerson[];
  box: { x: number; y: number; width: number; height: number }; // for the SVG viewBox
};

const FIRST_HOP = 95; // how far the people closest to you sit from you
const HOP = 66; // how far everyone else sits from the person they're connected to
const MARGIN = 26; // breathing room around the whole drawing
const PAD = 10; // gap kept between people
const LABEL_GAP = 5; // gap between a shape and its name
const MIN_VIEW = 420; // smallest drawing width, so early maps aren't blown up

export function shortName(name: string): string {
  return name.length > 16 ? name.slice(0, 15) + "…" : name;
}

// Roughly how wide a name is in the handwriting font.
export function labelWidthOf(p: { label: string; fontSize: number }): number {
  return p.label.length * p.fontSize * 0.5 + 8;
}

// The rectangle a person takes up: their shape plus their name underneath.
function boxOf(p: PlacedPerson) {
  const width = Math.max(p.size, labelWidthOf(p)) + PAD;
  const top = -p.size / 2;
  const bottom = p.size / 2 + LABEL_GAP + p.fontSize * 1.25;
  return { cx: p.x, cy: p.y + (top + bottom) / 2, w: width, h: bottom - top + PAD };
}

function leafCount(people: Person[], id: string): number {
  const kids = childrenOf(people, id);
  if (kids.length === 0) return 1;
  return kids.reduce((sum, kid) => sum + leafCount(people, kid.id), 0);
}

// Angle difference, wrapped to -π..π.
function angleDiff(a: number, b: number): number {
  const d = a - b;
  return Math.atan2(Math.sin(d), Math.cos(d));
}

// The screen map and the print map both ask for the same layout, so remember
// the last one instead of working it out twice.
let lastPeople: Person[] | null = null;
let lastLayout: Layout | null = null;

export function layoutMap(people: Person[]): Layout {
  if (people === lastPeople && lastLayout) return lastLayout;
  lastLayout = computeLayout(people);
  lastPeople = people;
  return lastLayout;
}

function computeLayout(people: Person[]): Layout {
  const root = findRoot(people);
  if (!root) return { placed: [], box: { x: 0, y: 0, width: 1, height: 1 } };

  // Step 1: give everyone a slice of the circle (their direction), and remember
  // which branch wedge they belong to.
  const slices = new Map<string, { start: number; end: number; depth: number }>();
  const wedgeOf = new Map<string, { mid: number; half: number }>();
  function assign(id: string, start: number, end: number, depth: number, wedge?: { mid: number; half: number }) {
    slices.set(id, { start, end, depth });
    if (depth === 1) wedge = { mid: (start + end) / 2, half: (end - start) / 2 };
    if (wedge) wedgeOf.set(id, wedge);
    const kids = childrenOf(people, id);
    const total = kids.reduce((sum, k) => sum + leafCount(people, k.id), 0);
    let cursor = start;
    for (const kid of kids) {
      const share = ((end - start) * leafCount(people, kid.id)) / total;
      assign(kid.id, cursor, cursor + share, depth + 1, wedge);
      cursor += share;
    }
  }
  // Start near the top and go clockwise, turned a little so it doesn't look ruled.
  const turn = (seededRandom(root.id)() - 0.5) * 0.6;
  assign(root.id, -Math.PI / 2 + turn, (3 * Math.PI) / 2 + turn, 0);

  // Step 2: start each person a short hop outward from their person.
  const byId = new Map<string, PlacedPerson>();
  const hopOf = new Map<string, number>();
  function place(p: Person, parent?: PlacedPerson) {
    const { start, end, depth } = slices.get(p.id)!;
    const rand = seededRandom(p.id);
    const wiggle = () => rand() * 2 - 1;
    const isRoot = depth === 0;
    const angle = (start + end) / 2 + wiggle() * Math.min((end - start) * 0.3, 0.3);
    const hop = isRoot ? 0 : (depth === 1 ? FIRST_HOP : HOP) * (1 + wiggle() * 0.12);
    const me: PlacedPerson = {
      person: p,
      depth,
      x: (parent?.x ?? 0) + hop * Math.cos(angle),
      y: (parent?.y ?? 0) + hop * Math.sin(angle),
      size: isRoot ? 54 : 36 + wiggle() * 5,
      tilt: wiggle() * (isRoot ? 6 : 11),
      label: isRoot ? `${shortName(p.name)} (you)` : shortName(p.name),
      fontSize: isRoot ? 21 : 18,
    };
    byId.set(p.id, me);
    hopOf.set(p.id, hop);
    for (const kid of childrenOf(people, p.id)) place(kid, me);
  }
  place(root);
  // Keep the original order of people, so the drawing order never shuffles.
  const placed = people.filter((p) => byId.has(p.id)).map((p) => byId.get(p.id)!);

  // Push apart everyone who overlaps. Returns true if anyone moved.
  function separate(): boolean {
    let moved = false;
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i];
        const b = placed[j];
        const A = boxOf(a);
        const B = boxOf(b);
        const dx = B.cx - A.cx;
        const dy = B.cy - A.cy;
        const overlapX = (A.w + B.w) / 2 - Math.abs(dx);
        const overlapY = (A.h + B.h) / 2 - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;
        moved = true;
        // Push along whichever direction needs the smaller move.
        const pushX = overlapX < overlapY ? (dx >= 0 ? overlapX : -overlapX) : 0;
        const pushY = overlapX < overlapY ? 0 : dy >= 0 ? overlapY : -overlapY;
        // You stay put in the middle; everyone else shares the move.
        const shareA = a.depth === 0 ? 0 : b.depth === 0 ? 1 : 0.5;
        a.x -= pushX * shareA;
        a.y -= pushY * shareA;
        b.x += pushX * (1 - shareA);
        b.y += pushY * (1 - shareA);
      }
    }
    return moved;
  }

  // Nudge people off lines that aren't theirs.
  function clearLines() {
    for (const child of placed) {
      const parent = child.person.parentId ? byId.get(child.person.parentId) : undefined;
      if (!parent) continue;
      const pts = sketchLinePoints([parent.x, parent.y], [child.x, child.y], child.person.id);
      for (const other of placed) {
        if (other === child || other === parent || other.depth === 0) continue;
        const B = boxOf(other);
        for (let k = 0; k < pts.length - 1; k++) {
          const [x1, y1] = pts[k];
          const [x2, y2] = pts[k + 1];
          // Quick skip when this piece of line is nowhere near them.
          if (
            Math.max(x1, x2) < B.cx - B.w / 2 ||
            Math.min(x1, x2) > B.cx + B.w / 2 ||
            Math.max(y1, y2) < B.cy - B.h / 2 ||
            Math.min(y1, y2) > B.cy + B.h / 2
          )
            continue;
          const len = Math.hypot(x2 - x1, y2 - y1) || 1;
          const steps = Math.ceil(len / 8);
          let hit = false;
          for (let s = 0; s <= steps && !hit; s++) {
            const px = x1 + ((x2 - x1) * s) / steps;
            const py = y1 + ((y2 - y1) * s) / steps;
            hit = Math.abs(px - B.cx) < B.w / 2 && Math.abs(py - B.cy) < B.h / 2;
          }
          if (!hit) continue;
          // Step sideways off the line, toward whichever side they're already on.
          const nx = -(y2 - y1) / len;
          const ny = (x2 - x1) / len;
          const side = (other.x - x1) * nx + (other.y - y1) * ny >= 0 ? 1 : -1;
          other.x += nx * side * 3;
          other.y += ny * side * 3;
          break;
        }
      }
    }
  }

  // Step 3: tidy up.
  for (let round = 0; round < 300; round++) {
    for (const child of placed) {
      const parent = child.person.parentId ? byId.get(child.person.parentId) : undefined;
      if (!parent) continue;

      // Short lines: if they've drifted further than their hop, pull them part way back.
      const dx = child.x - parent.x;
      const dy = child.y - parent.y;
      const dist = Math.hypot(dx, dy) || 1;
      const extra = dist - hopOf.get(child.person.id)!;
      if (extra > 0) {
        child.x -= (dx / dist) * extra * 0.15;
        child.y -= (dy / dist) * extra * 0.15;
      }

      // Further out than their person, so clusters grow outward.
      const r = Math.hypot(child.x, child.y) || 1;
      const minR = Math.hypot(parent.x, parent.y) + (child.depth === 1 ? FIRST_HOP : HOP * 0.5);
      if (r < minR) {
        child.x *= 1 + ((minR - r) / r) * 0.3;
        child.y *= 1 + ((minR - r) / r) * 0.3;
      }

      // Inside their branch's wedge, so branches don't mix.
      const wedge = wedgeOf.get(child.person.id)!;
      const a = Math.atan2(child.y, child.x);
      const off = angleDiff(a, wedge.mid);
      const limit = Math.max(wedge.half - 0.04, 0.05);
      if (Math.abs(off) > limit) {
        const target = wedge.mid + Math.sign(off) * limit;
        const newA = a + angleDiff(target, a) * 0.3;
        const rr = Math.hypot(child.x, child.y);
        child.x = rr * Math.cos(newA);
        child.y = rr * Math.sin(newA);
      }
    }
    separate();
    if (round % 3 === 0) clearLines();
  }
  // Finish with overlap-only passes so no one is left sitting on anyone else.
  for (let round = 0; round < 300 && separate(); round++);

  // The drawing's edges, so the viewBox hugs the map.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of placed) {
    const b = boxOf(p);
    minX = Math.min(minX, b.cx - b.w / 2);
    maxX = Math.max(maxX, b.cx + b.w / 2);
    minY = Math.min(minY, b.cy - b.h / 2);
    maxY = Math.max(maxY, b.cy + b.h / 2);
  }
  // Small maps get some empty paper around them, so a map of just you isn't drawn huge.
  const width = Math.max(maxX - minX + 2 * MARGIN, MIN_VIEW);
  const height = Math.max(maxY - minY + 2 * MARGIN, MIN_VIEW * 0.75);
  const box = {
    x: (minX + maxX) / 2 - width / 2,
    y: (minY + maxY) / 2 - height / 2,
    width,
    height,
  };
  return { placed, box };
}
