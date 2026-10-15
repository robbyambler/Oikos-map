"use client";

import { useId, useState } from "react";
import { Kind } from "@/lib/people";
import Shape from "./Shape";

type Props = {
  heading: string;
  submitLabel: string;
  initialName?: string;
  initialKind?: Kind;
  nameLabel?: string;
  believerLabel?: string;
  nonbelieverLabel?: string;
  hint?: React.ReactNode;
  autoFocus?: boolean;
  askKind?: boolean; // false for you (the center): you're always a circle, so we don't ask
  onSubmit: (name: string, kind: Kind) => void;
  onCancel?: () => void;
};

export default function PersonForm({
  heading,
  submitLabel,
  initialName = "",
  initialKind,
  nameLabel = "Name",
  believerLabel = "Follows Jesus",
  nonbelieverLabel = "Doesn't yet follow Jesus",
  hint,
  autoFocus,
  askKind = true,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialName);
  const [kind, setKind] = useState<Kind | null>(initialKind ?? null);
  const [error, setError] = useState("");
  const id = useId();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Type a name (a first name or nickname is fine).");
    if (askKind && !kind) return setError("Pick a square or a circle.");
    onSubmit(name.trim(), kind ?? "nonbeliever");
    setName("");
    setKind(null);
    setError("");
  }

  const option = (value: Kind, label: string) => (
    <label
      className={`sketch-box flex flex-1 cursor-pointer items-center gap-3 border-2 px-3 py-3 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
        kind === value ? "border-ink bg-white" : "border-line bg-white/60 hover:border-ink-soft"
      }`}
    >
      <input
        type="radio"
        name={id + "-kind"}
        value={value}
        checked={kind === value}
        onChange={() => setKind(value)}
        className="sr-only"
      />
      <Shape kind={value} color="#1F2A2E" size={28} />
      <span className="leading-tight">
        <span className="block font-semibold">{value === "believer" ? "Square" : "Circle"}</span>
        <span className="text-sm text-ink-soft">{label}</span>
      </span>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <h3 className="font-display text-2xl font-bold">{heading}</h3>
      {hint}
      <div>
        <label htmlFor={id + "-name"} className="mb-1 block font-semibold">
          {nameLabel}
        </label>
        <input
          id={id + "-name"}
          type="text"
          value={name}
          autoFocus={autoFocus}
          autoComplete="off"
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          className="sketch-box w-full border-2 border-pencil bg-white px-3 py-2.5 text-lg focus:border-ink"
        />
      </div>
      {askKind && (
        <fieldset>
          <legend className="mb-1 font-semibold">Square or circle?</legend>
          <div className="flex flex-col gap-2 sm:flex-row">
            {option("believer", believerLabel)}
            {option("nonbeliever", nonbelieverLabel)}
          </div>
        </fieldset>
      )}
      {error && (
        <p role="alert" className="text-sm font-semibold text-[#9B2C2C]">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-quiet">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
