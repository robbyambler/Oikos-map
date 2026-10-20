import { seededRandom, sketchCircle } from "@/lib/sketch";
import { DIAGRAM_LABELS as L } from "@/lib/shareContent";
import { SketchShape } from "./Shape";

// The hand-drawn "three circles" picture on the /share page.
// `step` (1 to 7) says how much of it has been drawn so far, so the same
// drawing can grow one piece at a time down the page. All the wobble is seeded,
// so it looks the same on every visit and in print.

type Pt = [number, number];

const INK = "#1F2A2E";
const SOFT = "#4A5A5F";
const MADE = "#2F7A78"; // teal
const BROKEN = "#B0413E"; // brick
const JESUS = "#3B5BA9"; // blue
const SENT = "#8A3B6E"; // plum

const R = 50;
const D: Pt = [150, 100]; // made good
const B: Pt = [345, 100]; // broken
const J: Pt = [247, 228]; // Jesus

const r1 = (v: number) => Math.round(v * 10) / 10;

// A point on the edge of a circle, nudged out by `gap`, facing toward `to`.
function edge(center: Pt, to: Pt, gap = 6): Pt {
  const dx = to[0] - center[0];
  const dy = to[1] - center[1];
  const len = Math.hypot(dx, dy) || 1;
  return [center[0] + (dx / len) * (R + gap), center[1] + (dy / len) * (R + gap)];
}

// A slightly bent pen line from a to b with an arrowhead at b.
// `bow` bends the line to one side (pixels); the seed adds a little wobble.
function arrow(a: Pt, b: Pt, bow: number, seed: string) {
  const rand = seededRandom(seed + ":arrow");
  const j = () => (rand() * 2 - 1) * 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const bend = bow + j();
  const c: Pt = [(a[0] + b[0]) / 2 + (-dy / len) * bend, (a[1] + b[1]) / 2 + (dx / len) * bend];
  const start: Pt = [a[0] + j(), a[1] + j()];
  const line = `M${r1(start[0])} ${r1(start[1])} Q${r1(c[0])} ${r1(c[1])} ${r1(b[0])} ${r1(b[1])}`;
  return { line, head: arrowHead(c, b, rand) };
}

// Two short strokes at the tip, pointing the way the line was heading.
function arrowHead(from: Pt, tip: Pt, rand: () => number) {
  const ang = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
  const size = 10;
  const spread = 0.5 + rand() * 0.08;
  const p1: Pt = [tip[0] - size * Math.cos(ang - spread), tip[1] - size * Math.sin(ang - spread)];
  const p2: Pt = [tip[0] - size * Math.cos(ang + spread), tip[1] - size * Math.sin(ang + spread)];
  return `M${r1(p1[0])} ${r1(p1[1])} L${r1(tip[0])} ${r1(tip[1])} L${r1(p2[0])} ${r1(p2[1])}`;
}

// A little loop that leaves the broken circle and curves right back into it.
function loop(angleDeg: number, seed: string) {
  const rand = seededRandom(seed + ":loop");
  const a = (angleDeg * Math.PI) / 180;
  const at = (ang: number, rad: number): Pt => [B[0] + rad * Math.cos(ang), B[1] + rad * Math.sin(ang)];
  const out = at(a - 0.2, R + 4);
  const far1 = at(a - 0.28, R + 34 + rand() * 6);
  const far2 = at(a + 0.32, R + 34 + rand() * 6);
  const back = at(a + 0.24, R + 5);
  const line = `M${r1(out[0])} ${r1(out[1])} C${r1(far1[0])} ${r1(far1[1])} ${r1(far2[0])} ${r1(far2[1])} ${r1(back[0])} ${r1(back[1])}`;
  return { line, head: arrowHead(far2, back, rand) };
}

// A tangled scribble inside the broken circle.
function scribble(seed: string) {
  const rand = seededRandom(seed + ":scribble");
  let d = "";
  let x = B[0] - 26;
  let y = B[1] + 18;
  d += `M${r1(x)} ${r1(y)}`;
  for (let i = 0; i < 12; i++) {
    const nx = B[0] - 28 + rand() * 56;
    const ny = B[1] + 6 + rand() * 30;
    const cx = (x + nx) / 2 + (rand() * 2 - 1) * 14;
    const cy = (y + ny) / 2 + (rand() * 2 - 1) * 12;
    d += ` Q${r1(cx)} ${r1(cy)} ${r1(nx)} ${r1(ny)}`;
    x = nx;
    y = ny;
  }
  return d;
}

function Circle({ at, color, seed }: { at: Pt; color: string; seed: string }) {
  const shape = sketchCircle(R, seed);
  return (
    <g transform={`translate(${at[0]} ${at[1]})`}>
      <path d={shape.fill} fill="white" />
      <path d={shape.stroke} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Pen({ d, color, width = 2.6, opacity = 1 }: { d: string; color: string; width?: number; opacity?: number }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeOpacity={opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Arrow({ a, color }: { a: { line: string; head: string }; color: string }) {
  return (
    <>
      <Pen d={a.line} color={color} />
      <Pen d={a.head} color={color} />
    </>
  );
}

// Handwritten words with a soft white edge so they stay readable over lines.
function Label({
  x,
  y,
  children,
  size = 15,
  anchor = "middle",
  color = SOFT,
  bold = false,
}: {
  x: number;
  y: number;
  children: string;
  size?: number;
  anchor?: "start" | "middle" | "end";
  color?: string;
  bold?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={bold ? 700 : 400}
      fill={color}
      stroke="white"
      strokeWidth="4"
      strokeLinejoin="round"
      paintOrder="stroke"
      className="font-hand"
    >
      {children}
    </text>
  );
}

// The arrows are worked out once; they never change.
const OWN_WAY = arrow(edge(D, B, 4), edge(B, D, 8), -22, "own-way");
const LOOPS = [-48, -5, 38].map((deg, i) => loop(deg, "fix" + i));
const SCRIBBLE = scribble("broken");
const TURN = arrow(edge(B, J), edge(J, B, 8), -14, "turn");
const MADE_NEW = arrow(edge(J, D), edge(D, J, 8), -14, "made-new");
const PEOPLE: { at: Pt; kind: "believer" | "nonbeliever"; color: string }[] = [
  { at: [42, 34], kind: "nonbeliever", color: "#9A6400" },
  { at: [26, 104], kind: "believer", color: SENT },
  { at: [48, 172], kind: "nonbeliever", color: "#2F7A78" },
];
const SENT_ARROWS = PEOPLE.map((p, i) => {
  const from = edge(D, p.at, 4);
  const dx = p.at[0] - from[0];
  const dy = p.at[1] - from[1];
  const len = Math.hypot(dx, dy);
  const to: Pt = [p.at[0] - (dx / len) * 17, p.at[1] - (dy / len) * 17];
  return arrow(from, to, i === 1 ? 4 : -6, "sent" + i);
});

export default function ThreeCircles({ step, description }: { step: number; description: string }) {
  return (
    <svg viewBox="0 0 440 320" role="img" className="h-auto w-full overflow-visible">
      <title>{description}</title>

      {/* 1. Made good */}
      <Circle at={D} color={MADE} seed="made" />
      <Label x={D[0]} y={D[1] + 6} size={21} bold color={MADE}>
        {L.made}
      </Label>

      {/* 2. Our own way, broken, and the quick fixes that loop back */}
      {step >= 2 && (
        <g>
          <Arrow a={OWN_WAY} color={INK} />
          <Label x={(D[0] + B[0]) / 2} y={44} size={17}>
            {L.ownWay}
          </Label>
          <Circle at={B} color={BROKEN} seed="broken" />
          <Pen d={SCRIBBLE} color={BROKEN} width={2} opacity={0.7} />
          <Label x={B[0]} y={B[1] - 12} size={21} bold color={BROKEN}>
            {L.broken}
          </Label>
          {LOOPS.map((l, i) => (
            <Arrow key={i} a={l} color={BROKEN} />
          ))}
          <Label x={396} y={20} size={17}>
            {L.quickFixes}
          </Label>
        </g>
      )}

      {/* 3. Jesus */}
      {step >= 3 && (
        <g>
          <Circle at={J} color={JESUS} seed="jesus" />
          <Pen d={`M${J[0] + 1} ${J[1] - 34} Q${J[0] - 2} ${J[1] - 10} ${J[0] + 1} ${J[1] + 14}`} color={JESUS} width={3.4} />
          <Pen d={`M${J[0] - 17} ${J[1] - 19} Q${J[0]} ${J[1] - 22} ${J[0] + 17} ${J[1] - 18}`} color={JESUS} width={3.4} />
          <Label x={J[0]} y={J[1] + 36} size={21} bold color={JESUS}>
            {L.jesus}
          </Label>
        </g>
      )}

      {/* 4. Turn and trust */}
      {step >= 4 && (
        <g>
          <Arrow a={TURN} color={INK} />
          <Label x={316} y={198} anchor="start" size={17}>
            {L.turn}
          </Label>
        </g>
      )}

      {/* 5. Made new */}
      {step >= 5 && (
        <g>
          <Arrow a={MADE_NEW} color={MADE} />
          <Label x={180} y={198} anchor="end" size={17}>
            {L.madeNew}
          </Label>
        </g>
      )}

      {/* 6. Sent back out to your people */}
      {step >= 6 && (
        <g>
          {SENT_ARROWS.map((a, i) => (
            <Arrow key={i} a={a} color={SENT} />
          ))}
          {PEOPLE.map((p, i) => (
            <g key={i} transform={`translate(${p.at[0]} ${p.at[1]})`}>
              <SketchShape kind={p.kind} size={20} color={p.color} strokeWidth={2.6} seed={"share-person" + i} />
            </g>
          ))}
          <Label x={6} y={212} anchor="start" size={17}>
            {L.people}
          </Label>
        </g>
      )}

      {/* 7. Where are you? */}
      {step >= 7 && (
        <g>
          <Label x={96} y={50} size={26} bold color={INK}>
            ?
          </Label>
          <Label x={368} y={176} size={26} bold color={INK}>
            ?
          </Label>
          <Label x={312} y={276} size={26} bold color={INK}>
            ?
          </Label>
          <Label x={J[0]} y={314} size={22} bold color={INK}>
            {L.question}
          </Label>
        </g>
      )}
    </svg>
  );
}
