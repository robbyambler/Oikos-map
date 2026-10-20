// Save a copy of the map as a file, and open a saved copy again.
// The file never leaves the device unless the visitor moves it themselves.
//
// A saved file looks like:
//   { "app": "oikos-map", "version": 1, "savedAt": "2026-10-17T...", "people": [ ... ] }
//
// Opening a file is treated with suspicion: anything could be in it. We check
// every person carefully and refuse the whole file if anything is off, so a bad
// file can never break or half-replace someone's map.

import { Kind, Person } from "./people";

const APP = "oikos-map";
const VERSION = 1;
const MAX_PEOPLE = 2000;
const MAX_NAME = 100;
const MAX_ID = 100;

export const FILE_NAME = "oikos-map.json";

// Turn the map into the text of a backup file.
export function makeBackup(people: Person[]): string {
  const data = {
    app: APP,
    version: VERSION,
    savedAt: new Date().toISOString(),
    people: people.map(({ id, name, kind, parentId }) => ({ id, name, kind, parentId })),
  };
  return JSON.stringify(data, null, 2);
}

// Download the map as oikos-map.json.
export function downloadBackup(people: Person[]): void {
  const blob = new Blob([makeBackup(people)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = FILE_NAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before letting go of the file.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type ReadResult = { ok: true; people: Person[] } | { ok: false; message: string };

const NOT_A_MAP = "That file doesn't look like an Oikos Map. Try another file, or save a fresh copy and use that.";

function isKind(value: unknown): value is Kind {
  return value === "believer" || value === "nonbeliever";
}

// Read the text of a backup file and check it thoroughly. Never throws.
export function readBackup(text: string): ReadResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, message: NOT_A_MAP };
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) return { ok: false, message: NOT_A_MAP };
  const file = data as Record<string, unknown>;
  if (file.app !== APP) return { ok: false, message: NOT_A_MAP };

  if (typeof file.version === "number" && file.version > VERSION) {
    return {
      ok: false,
      message:
        "That map was saved by a newer version of Oikos Map. Refresh this page to get the latest version, then try again.",
    };
  }
  if (file.version !== VERSION) return { ok: false, message: NOT_A_MAP };

  const list = file.people;
  if (!Array.isArray(list) || list.length === 0) return { ok: false, message: NOT_A_MAP };
  if (list.length > MAX_PEOPLE) {
    return {
      ok: false,
      message: `That file has more than ${MAX_PEOPLE} people in it, which is more than Oikos Map can open.`,
    };
  }

  // Check each person, keeping only the fields we know about.
  const people: Person[] = [];
  const ids = new Set<string>();
  for (const item of list) {
    if (typeof item !== "object" || item === null) return { ok: false, message: NOT_A_MAP };
    const raw = item as Record<string, unknown>;
    const { id, parentId } = raw;
    if (typeof id !== "string" || id.length === 0 || id.length > MAX_ID || ids.has(id)) {
      return { ok: false, message: NOT_A_MAP };
    }
    if (typeof raw.name !== "string") return { ok: false, message: NOT_A_MAP };
    const name = raw.name.trim().slice(0, MAX_NAME);
    if (name.length === 0) return { ok: false, message: NOT_A_MAP };
    if (parentId !== null && typeof parentId !== "string") return { ok: false, message: NOT_A_MAP };
    // You (the center) are always drawn as a circle, so your kind is optional.
    let kind: Kind;
    if (isKind(raw.kind)) kind = raw.kind;
    else if (parentId === null && raw.kind === undefined) kind = "nonbeliever";
    else return { ok: false, message: NOT_A_MAP };
    ids.add(id);
    people.push({ id, name, kind, parentId });
  }

  // Exactly one person in the middle, and everyone else connected to someone real.
  const roots = people.filter((p) => p.parentId === null);
  if (roots.length !== 1) return { ok: false, message: NOT_A_MAP };
  if (people.some((p) => p.parentId !== null && (!ids.has(p.parentId) || p.parentId === p.id))) {
    return { ok: false, message: NOT_A_MAP };
  }

  // Everyone must trace back to you. Walking out from you and reaching every
  // person proves there are no loops (A connected to B connected to A).
  const kids = new Map<string, string[]>();
  for (const p of people) {
    if (p.parentId !== null) kids.set(p.parentId, [...(kids.get(p.parentId) ?? []), p.id]);
  }
  const reached = new Set<string>([roots[0].id]);
  const queue = [roots[0].id];
  while (queue.length > 0) {
    const id = queue.pop()!;
    for (const kid of kids.get(id) ?? []) {
      if (!reached.has(kid)) {
        reached.add(kid);
        queue.push(kid);
      }
    }
  }
  if (reached.size !== people.length) return { ok: false, message: NOT_A_MAP };

  return { ok: true, people };
}
