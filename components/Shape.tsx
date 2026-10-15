import { Kind, BRANCH_COLORS } from "@/lib/people";
import { sketchCircle, sketchSquare } from "@/lib/sketch";

// The hand-drawn square or circle, drawn inside an SVG. Used on the map and in Shape below.
export function SketchShape({
  kind,
  size,
  color,
  fill = "white",
  strokeWidth = 3,
  seed,
}: {
  kind: Kind;
  size: number;
  color: string;
  fill?: string;
  strokeWidth?: number;
  seed: string;
}) {
  const shape = kind === "believer" ? sketchSquare(size * 0.92, seed) : sketchCircle(size / 2, seed);
  return (
    <>
      <path d={shape.fill} fill={fill} />
      <path
        d={shape.stroke}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

// A small square or circle used in the legend, list, and buttons.
export default function Shape({
  kind,
  color = "currentColor",
  size = 16,
  seed = kind,
}: {
  kind: Kind;
  color?: string;
  size?: number;
  seed?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-12 -12 24 24"
      aria-hidden="true"
      className="inline-block shrink-0 overflow-visible"
    >
      <SketchShape kind={kind} size={17} color={color} strokeWidth={2.6} seed={seed} />
    </svg>
  );
}

// A filled hand-drawn circle with a letter in it (used on the BLESS card).
export function LetterDot({ letter, color, seed }: { letter: string; color: string; seed: string }) {
  const shape = sketchCircle(13, seed);
  return (
    <svg width="30" height="30" viewBox="-15 -15 30 30" aria-hidden="true" className="shrink-0 overflow-visible">
      <path d={shape.fill} fill={color} />
      <path d={shape.stroke} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <text y="6" textAnchor="middle" fill="white" fontSize="17" fontWeight="700" className="font-hand">
        {letter}
      </text>
    </svg>
  );
}

export function Legend() {
  return (
    <ul className="legend flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
      <li className="flex items-center gap-2">
        <Shape kind="believer" color="#1F2A2E" size={18} />
        Square: follows Jesus (someone to equip)
      </li>
      <li className="flex items-center gap-2">
        <Shape kind="nonbeliever" color="#1F2A2E" size={18} />
        Circle: doesn&apos;t yet follow Jesus
      </li>
      <li className="flex items-center gap-2">
        <svg width="34" height="16" viewBox="0 0 34 16" aria-hidden="true" className="shrink-0">
          {BRANCH_COLORS.slice(0, 3).map((c, i) => (
            <path
              key={c}
              d={`M${3 + i * 11} ${13 - i} C${5 + i * 11} 9 ${4 + i * 11} 6 ${7 + i * 11} ${2 + i}`}
              stroke={c}
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </svg>
        Each color is one branch of your map
      </li>
    </ul>
  );
}
