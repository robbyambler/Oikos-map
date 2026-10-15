"use client";

import { Person, branchColor, childrenOf, describe, findRoot, shapeOf } from "@/lib/people";
import Shape from "./Shape";

type Props = {
  people: Person[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// The same map as a nested list. Easier on small screens and for screen readers.
export default function ListView({ people, selectedId, onSelect }: Props) {
  const root = findRoot(people);
  if (!root) return null;

  function renderPerson(person: Person, isRoot: boolean) {
    const kids = childrenOf(people, person.id);
    const color = branchColor(people, person);
    const selected = person.id === selectedId;
    return (
      <li key={person.id}>
        <button
          type="button"
          onClick={() => onSelect(person.id)}
          aria-pressed={selected}
          className={`sketch-box flex w-full items-center gap-3 px-3 text-ink py-2 text-left hover:bg-mist ${
            selected ? "bg-mist font-semibold" : ""
          }`}
        >
          <Shape kind={shapeOf(person)} color={color} size={22} seed={person.id} />
          <span className="flex-1">
            {person.name}
            {isRoot && <span className="text-ink-soft"> (you)</span>}
            {!isRoot && <span className="sr-only">, {describe(person)}</span>}
          </span>
          {kids.length > 0 && (
            <span className="text-sm text-ink-soft">
              {kids.length} connected
            </span>
          )}
        </button>
        {kids.length > 0 && (
          <ul className="branch-line ml-5 pl-3" style={{ color: isRoot ? "#9AA7A2" : color }}>
            {kids.map((kid) => renderPerson(kid, false))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <ul aria-label="Your oikos as a list" className="space-y-0.5">
      {renderPerson(root, true)}
    </ul>
  );
}
