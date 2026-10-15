"use client";

import { useMemo } from "react";
import { Person, branchColor, describe, shapeOf } from "@/lib/people";
import { labelWidthOf, layoutMap } from "@/lib/layout";
import { sketchCircle, sketchLine } from "@/lib/sketch";
import { SketchShape } from "./Shape";

type Props = {
  people: Person[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  fit: boolean; // true = shrink to fit the box; false = actual size (scroll to pan)
  title?: string;
};

export default function MapView({ people, selectedId, onSelect, fit, title }: Props) {
  // Working out the layout takes a moment on big maps, so only redo it when people change.
  const { placed, box } = useMemo(() => layoutMap(people), [people]);
  const interactive = Boolean(onSelect);
  const byId = new Map(placed.map((p) => [p.person.id, p]));

  return (
    <svg
      viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
      width={fit ? "100%" : box.width}
      height={fit ? undefined : box.height}
      className="map-svg block mx-auto"
      // "Fit" only ever shrinks the map to fit; it never blows a small map up.
      style={fit ? { maxHeight: "75vh", maxWidth: box.width } : undefined}
      role={interactive ? "group" : "img"}
      aria-label={title ?? "Your oikos map"}
    >
      {/* Hand-drawn lines between connected people */}
      {placed.map(({ person, x, y }) => {
        const parent = person.parentId ? byId.get(person.parentId) : undefined;
        if (!parent) return null;
        const width = 2.2 + ((person.id.charCodeAt(0) + person.id.length) % 4) * 0.3;
        return (
          <path
            key={"line-" + person.id}
            className="map-line"
            d={sketchLine([parent.x, parent.y], [x, y], person.id)}
            fill="none"
            stroke={branchColor(people, person)}
            strokeOpacity="0.55"
            strokeWidth={width}
            strokeLinecap="round"
          />
        );
      })}

      {/* People */}
      {placed.map((p) => {
        const { person, x, y, depth, size, tilt, label, fontSize } = p;
        const isRoot = depth === 0;
        const color = branchColor(people, person);
        const selected = person.id === selectedId;
        const halo = sketchCircle(size * 0.82, person.id + ":halo");
        return (
          <g
            key={person.id}
            className="map-node"
            transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
            tabIndex={interactive ? 0 : undefined}
            role={interactive ? "button" : undefined}
            aria-pressed={interactive ? selected : undefined}
            aria-label={interactive ? `${person.name}${isRoot ? " (you)" : ""}, ${describe(person)}` : undefined}
            onClick={() => onSelect?.(person.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(person.id);
              }
            }}
            style={interactive ? { cursor: "pointer" } : undefined}
          >
            <title>{`${person.name}: ${describe(person)}`}</title>
            {/* Halo shows selection and keyboard focus */}
            <path
              className="map-halo"
              d={halo.stroke}
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              stroke={selected ? color : "transparent"}
            />
            <g transform={`rotate(${tilt.toFixed(1)})`}>
              <SketchShape
                kind={shapeOf(person)}
                size={size}
                color={color}
                fill={selected || isRoot ? color : "white"}
                strokeWidth={isRoot ? 4 : 3.4}
                seed={person.id}
              />
            </g>
            {/* A soft patch of paper behind the name, so lines never run through it */}
            <rect
              x={-labelWidthOf(p) / 2}
              y={size / 2 + 4}
              width={labelWidthOf(p)}
              height={fontSize * 1.25}
              rx={fontSize * 0.5}
              fill="white"
              fillOpacity="0.9"
            />
            <text
              y={size / 2 + 5 + fontSize * 0.95}
              textAnchor="middle"
              className="map-label"
              fontSize={fontSize}
              fontWeight={700}
              fill="#1F2A2E"
              stroke="white"
              strokeWidth="4"
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
