// Saves the map in this browser only (localStorage). Nothing is sent anywhere.
// Some browsers block storage (private windows, strict settings), so every
// read and write is wrapped in try/catch and the app keeps working without it.

import { Person } from "./people";

const KEY = "oikos-map-v1";

export function loadPeople(): { people: Person[]; ok: boolean } {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { people: [], ok: true };
    const data = JSON.parse(raw);
    const list = Array.isArray(data?.people) ? data.people : [];
    const people = list
      .filter(
        (p: Person) =>
          typeof p?.id === "string" &&
          typeof p?.name === "string" &&
          (p.parentId === null || typeof p.parentId === "string") &&
          // You (the center) don't need a kind; everyone else does.
          (p.parentId === null || p.kind === "believer" || p.kind === "nonbeliever"),
      )
      .map((p: Person) => (p.parentId === null ? { ...p, kind: p.kind ?? "nonbeliever" } : p));
    return { people, ok: true };
  } catch {
    return { people: [], ok: false };
  }
}

export function savePeople(people: Person[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ version: 1, people }));
    return true;
  } catch {
    return false;
  }
}
