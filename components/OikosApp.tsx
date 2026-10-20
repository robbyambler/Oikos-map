"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Kind,
  Person,
  branchColor,
  childrenOf,
  describe,
  descendantsOf,
  findRoot,
  makeId,
  shapeOf,
} from "@/lib/people";
import { sketchLine } from "@/lib/sketch";
import { loadPeople, savePeople } from "@/lib/storage";
import { downloadBackup, readBackup } from "@/lib/backup";
import MapView from "./MapView";
import ListView from "./ListView";
import PersonForm from "./PersonForm";
import BlessCard from "./BlessCard";
import Shape, { Legend, SketchShape } from "./Shape";

type Mode = "view" | "add" | "edit";

function FrancHint({ name }: { name: string }) {
  return (
    <div className="sketch-box border-2 border-dashed border-pencil/50 bg-mist px-3 py-2.5 text-sm leading-relaxed">
      <p className="font-semibold">Stuck? Think through {name}&apos;s world:</p>
      <p>
        <strong>F</strong>riends, <strong>R</strong>elatives, <strong>A</strong>cquaintances,{" "}
        <strong>N</strong>eighbors, <strong>C</strong>oworkers or classmates.
      </p>
    </div>
  );
}

export default function OikosApp() {
  // This component only runs in the browser (see app/page.tsx), so it can read
  // saved data right away.
  const [initial] = useState(loadPeople);
  const [people, setPeople] = useState<Person[]>(initial.people);
  const [storageOk, setStorageOk] = useState(initial.ok);
  const [selectedId, setSelectedId] = useState<string | null>(findRoot(initial.people)?.id ?? null);
  const [mode, setMode] = useState<Mode>("view");
  const [view, setView] = useState<"map" | "list">("map");
  const [fit, setFit] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Saving can fail (e.g. private browsing). We only flag it once.
    if (!savePeople(people)) setStorageOk(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [people]);

  const root = findRoot(people);
  const selected = people.find((p) => p.id === selectedId) ?? root;

  function select(id: string) {
    setSelectedId(id);
    setMode("view");
  }

  // You always go in the middle as a circle, so there's nothing to ask but your name.
  function addRoot(name: string) {
    const me: Person = { id: makeId(), name, kind: "nonbeliever", parentId: null };
    setPeople([me]);
    setSelectedId(me.id);
    setMode("add");
  }

  function addPerson(name: string, kind: Kind) {
    if (!selected) return;
    setPeople([...people, { id: makeId(), name, kind, parentId: selected.id }]);
    setAnnouncement(`${name} added, connected to ${selected.name}.`);
    // Stay in "add" mode so it's quick to add several people in a row.
  }

  function editPerson(name: string, kind: Kind) {
    if (!selected) return;
    // You (the center) keep whatever kind you had; only your name changes.
    const isMe = selected.parentId === null;
    setPeople(people.map((p) => (p.id === selected.id ? { ...p, name, kind: isMe ? p.kind : kind } : p)));
    setAnnouncement(`Saved changes to ${name}.`);
    setMode("view");
  }

  function removePerson() {
    if (!selected || selected.parentId === null) return;
    const branch = descendantsOf(people, selected.id);
    const message =
      branch.length > 0
        ? `Remove ${selected.name} and the ${branch.length} ${branch.length === 1 ? "person" : "people"} connected to them?`
        : `Remove ${selected.name} from your map?`;
    if (!window.confirm(message)) return;
    const gone = new Set([selected.id, ...branch.map((p) => p.id)]);
    setPeople(people.filter((p) => !gone.has(p.id)));
    setAnnouncement(`Removed ${selected.name}.`);
    setSelectedId(selected.parentId);
    setMode("view");
  }

  function startOver() {
    if (!window.confirm("Clear your whole map and start over? This can't be undone.")) return;
    setPeople([]);
    setSelectedId(null);
    setMode("view");
  }

  // ---------- Save a copy / open a saved copy ----------
  function saveCopy() {
    setFileError("");
    downloadBackup(people);
    setAnnouncement("Saved a copy of your map to this device.");
  }

  function chooseFile() {
    setFileError("");
    fileInput.current?.click();
  }

  async function openFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    // Clear the picker so choosing the same file again still works.
    input.value = "";
    if (!file) return;
    if (file.size > 5_000_000) {
      setFileError("That file is too big to be an Oikos Map. Try another file.");
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      setFileError("We couldn't read that file. Try again, or choose another file.");
      return;
    }
    const result = readBackup(text);
    if (!result.ok) {
      setFileError(result.message);
      return;
    }
    if (
      people.length > 0 &&
      !window.confirm("Replace the map on this device with the saved copy? Your current map will be gone.")
    ) {
      return;
    }
    const newRoot = findRoot(result.people);
    setPeople(result.people);
    setSelectedId(newRoot?.id ?? null);
    setMode("view");
    setFileError("");
    setAnnouncement(`Opened your saved map with ${result.people.length} ${result.people.length === 1 ? "person" : "people"}.`);
  }

  const filePicker = (
    <input
      ref={fileInput}
      type="file"
      accept=".json,application/json"
      onChange={openFile}
      className="hidden"
      tabIndex={-1}
      aria-hidden="true"
    />
  );

  const fileErrorNote = fileError && (
    <p role="alert" className="sketch-box bg-[#FCEBDD] px-3 py-2 text-sm">
      {fileError}
    </p>
  );

  const privacyNote = (
    <p className="text-sm text-ink-soft">
      <span aria-hidden="true">🔒 </span>
      Your map is saved only in this browser, on this device. Nothing is sent anywhere, and no one else can see it.
    </p>
  );

  const storageWarning = !storageOk && (
    <p role="status" className="sketch-box bg-[#FCEBDD] px-3 py-2 text-sm">
      This browser isn&apos;t letting us save, so your map will disappear when you close this tab. Print it before you
      go if you&apos;d like to keep it.
    </p>
  );

  // ---------- Welcome: no one on the map yet ----------
  if (!root) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
        <div className="grid items-center gap-8 sm:grid-cols-[1fr_200px]">
          <div>
            <h1 className="font-display text-4xl font-bold leading-[1.1] sm:text-5xl">
              Map the people God has put around you.
            </h1>
            <p className="mt-5 max-w-prose text-lg leading-relaxed">
              <em>Oikos</em> is the Greek word for household: the family, friends, and neighbors in your everyday
              life. When Paul told a jailer, &ldquo;Believe in the Lord Jesus, and you will be saved, you and your
              household&rdquo; (Acts 16:31, ESV), the good news was meant to travel through his whole oikos.
            </p>
            <p className="mt-3 max-w-prose text-lg leading-relaxed">
              And everyone you know has an oikos of their own, one that only they can reach.
            </p>
          </div>
          <WelcomeSketch />
        </div>

        <div className="no-print mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href="/learn" className="btn-quiet inline-block border-ink text-lg">
            How does this work?
          </Link>
          <Link href="/share" className="font-semibold text-ink underline underline-offset-2">
            What do I say? See a simple way to share
          </Link>
        </div>

        <div className="sketch-card mt-10 bg-white p-5 sm:p-7">
          <p className="mb-4 text-ink-soft">
            You go in the middle. Then you&apos;ll add the people in your life, and the people in theirs. It takes a few
            minutes.
          </p>
          <PersonForm
            heading="Start with you"
            submitLabel="Put me on the map"
            nameLabel="Your name"
            askKind={false}
            onSubmit={addRoot}
          />
        </div>
        <div className="mt-6 space-y-2">
          {privacyNote}
          {storageWarning}
          <p className="text-sm text-ink-soft">
            Already saved a copy of your map?{" "}
            <button type="button" onClick={chooseFile} className="font-semibold text-ink underline underline-offset-2">
              Open a saved copy
            </button>
          </p>
          {fileErrorNote}
          {filePicker}
          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </div>
      </main>
    );
  }

  // ---------- The map builder ----------
  const selectedColor = selected ? branchColor(people, selected) : "#1F2A2E";
  const isRoot = selected?.parentId === null;
  const others = people.length - 1;

  return (
    <>
      <div className="no-print flex min-h-full flex-col">
        <header className="squiggle-bottom bg-paper/90 px-4 pb-4 pt-3">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold leading-tight">Your oikos map</h1>
              <p className="text-sm text-ink-soft">
                {others === 0
                  ? "Just you so far. Let's add some people."
                  : `You and ${others} ${others === 1 ? "person" : "people"} God has placed around you.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label="Choose a view" className="sketch-pill flex border-2 border-pencil/40 bg-mist p-1">
                {(["map", "list"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    onClick={() => setView(v)}
                    className={`sketch-pill px-4 py-1.5 text-sm font-semibold ${
                      view === v ? "bg-ink text-white" : "text-ink"
                    }`}
                  >
                    {v === "map" ? "Map" : "List"}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => window.print()} className="btn-quiet">
                Print map
              </button>
            </div>
          </div>
          <div className="mx-auto mt-3 flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2">
            <button type="button" onClick={saveCopy} className="btn-quiet text-sm">
              Save a copy
            </button>
            <button type="button" onClick={chooseFile} className="btn-quiet text-sm">
              Open a saved copy
            </button>
            {filePicker}
            <p className="text-sm text-ink-soft">The file stays on your device.</p>
            <div className="ml-auto flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/learn" className="text-sm font-semibold text-ink underline underline-offset-2">
                How does this work?
              </Link>
              <Link href="/share" className="text-sm font-semibold text-ink underline underline-offset-2">
                What to share
              </Link>
            </div>
          </div>
          {fileError && <div className="mx-auto mt-3 max-w-6xl">{fileErrorNote}</div>}
        </header>

        <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section aria-label={view === "map" ? "Map" : "List"} className="min-w-0">
            {view === "map" ? (
              <>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-ink-soft">Tap or tab to anyone on the map to see their details.</p>
                  <button type="button" onClick={() => setFit(!fit)} className="btn-quiet text-sm">
                    {fit ? "Show actual size" : "Fit to screen"}
                  </button>
                </div>
                <div className="sketch-card overflow-auto bg-white" style={{ maxHeight: fit ? undefined : "75vh" }}>
                  <MapView people={people} selectedId={selected?.id} onSelect={select} fit={fit} />
                </div>
                <div className="mt-3">
                  <Legend />
                </div>
              </>
            ) : (
              <div className="sketch-card bg-white p-3">
                <ListView people={people} selectedId={selected?.id ?? null} onSelect={select} />
              </div>
            )}
          </section>

          {selected && (
            <aside aria-label="Selected person" className="min-w-0 space-y-4">
              <div className="sketch-card border-pencil/40 bg-paper-deep p-5">
                <div className="flex items-center gap-3">
                  <Shape kind={shapeOf(selected)} color={selectedColor} size={36} seed={selected.id} />
                  <div className="min-w-0">
                    <h2 className="font-display truncate text-3xl font-bold leading-tight">
                      {selected.name}
                      {isRoot && <span className="font-normal text-ink-soft"> (you)</span>}
                    </h2>
                    <p className="text-sm text-ink-soft">
                      {describe(selected)}
                      {childrenOf(people, selected.id).length > 0 &&
                        ` · ${childrenOf(people, selected.id).length} connected`}
                    </p>
                  </div>
                </div>

                {mode === "view" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setMode("add")} className="btn-primary">
                      Add someone connected to {isRoot ? "you" : selected.name.split(" ")[0]}
                    </button>
                    <button type="button" onClick={() => setMode("edit")} className="btn-quiet">
                      Edit
                    </button>
                    {!isRoot && (
                      <button type="button" onClick={removePerson} className="btn-quiet text-[#9B2C2C]">
                        Remove
                      </button>
                    )}
                  </div>
                )}

                {mode === "add" && (
                  <div className="mt-5">
                    <PersonForm
                      key={"add-" + selected.id}
                      heading={isRoot ? "Who's in your life?" : `Who's in ${selected.name.split(" ")[0]}'s life?`}
                      submitLabel="Add to map"
                      hint={<FrancHint name={isRoot ? "your" : selected.name.split(" ")[0]} />}
                      autoFocus
                      onSubmit={addPerson}
                      onCancel={() => setMode("view")}
                    />
                    <p className="mt-3 text-sm text-ink-soft">
                      Add as many as you like. Press Cancel when you&apos;re done.
                    </p>
                  </div>
                )}

                {mode === "edit" && (
                  <div className="mt-5">
                    <PersonForm
                      key={"edit-" + selected.id}
                      heading={`Edit ${selected.name}`}
                      submitLabel="Save changes"
                      initialName={selected.name}
                      initialKind={selected.kind}
                      askKind={!isRoot}
                      autoFocus
                      onSubmit={editPerson}
                      onCancel={() => setMode("view")}
                    />
                  </div>
                )}
              </div>

              {!isRoot && mode === "view" && <BlessCard person={selected} color={selectedColor} />}
              {isRoot && mode === "view" && others === 0 && (
                <p className="px-1 text-ink-soft">
                  Start with the people closest to you. Later you can add the people in <em>their</em> lives too.
                </p>
              )}
            </aside>
          )}
        </main>

        <footer className="mx-auto w-full max-w-6xl space-y-2 px-4 pb-8 pt-2">
          {privacyNote}
          {storageWarning}
          <button type="button" onClick={startOver} className="text-sm text-ink-soft underline underline-offset-2">
            Clear map and start over
          </button>
        </footer>
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>

      {/* Only shown when printing */}
      <div className="print-only">
        <h1 className="font-display text-3xl font-bold">{root.name}&apos;s oikos map</h1>
        <div className="print-map">
          <MapView people={people} fit title={`${root.name}'s oikos map`} />
        </div>
        <Legend />
      </div>
    </>
  );
}

// A little hand-drawn map for the welcome screen: you in the middle, people around you.
function WelcomeSketch() {
  const people = [
    { x: 0, y: -58, c: "#2F7A78", k: "nonbeliever", from: -1 },
    { x: 54, y: 24, c: "#8A3B6E", k: "believer", from: -1 },
    { x: -50, y: 30, c: "#9A6400", k: "nonbeliever", from: -1 },
    { x: 40, y: -88, c: "#2F7A78", k: "believer", from: 0 },
    { x: -36, y: -96, c: "#2F7A78", k: "nonbeliever", from: 0 },
    { x: 92, y: 62, c: "#8A3B6E", k: "nonbeliever", from: 1 },
    { x: -92, y: 52, c: "#9A6400", k: "nonbeliever", from: 2 },
    { x: -58, y: 86, c: "#9A6400", k: "believer", from: 2 },
  ] as const;
  return (
    <svg viewBox="-115 -115 230 225" className="hidden w-full sm:block" aria-hidden="true">
      {people.map((p, i) => {
        const from = p.from === -1 ? { x: 0, y: 0 } : people[p.from];
        return (
          <path
            key={"l" + i}
            d={sketchLine([from.x, from.y], [p.x, p.y], "welcome" + i)}
            fill="none"
            stroke={p.c}
            strokeOpacity="0.55"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        );
      })}
      {people.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${(i % 3) * 7 - 7})`}>
          <SketchShape kind={p.k as Kind} size={i < 3 ? 20 : 16} color={p.c} strokeWidth={2.8} seed={"welcome" + i} />
        </g>
      ))}
      <SketchShape kind="nonbeliever" size={32} color="#1F2A2E" fill="#1F2A2E" strokeWidth={3} seed="welcome-you" />
    </svg>
  );
}
