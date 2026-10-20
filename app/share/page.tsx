import type { Metadata } from "next";
import Link from "next/link";
import { LetterDot } from "@/components/Shape";
import ThreeCircles from "@/components/ThreeCircles";
import {
  CIRCLES,
  CREDIT,
  INTRO,
  LET_GO,
  LINKS,
  PAGE,
  PRACTICE,
  STORY,
  TRANSLATION_NOTE,
  type Verse,
} from "@/lib/shareContent";

// A static page with one simple way to talk about Jesus. It never reads or
// writes the visitor's saved map. All the words come from lib/shareContent.ts;
// this file only lays them out.

export const metadata: Metadata = {
  title: `${PAGE.title} · Oikos Map`,
  description: PAGE.metaDescription,
};

const STEP_COLORS = ["#2F7A78", "#B0413E", "#3B5BA9", "#1F2A2E", "#2F7A78", "#8A3B6E", "#9A6400"];

function VerseQuote({ verse }: { verse: Verse }) {
  return (
    <blockquote className="sketch-box bg-mist px-4 py-3 text-base leading-relaxed">
      {verse.text}
      <span className="mt-1 block text-sm text-ink-soft">{verse.ref}</span>
    </blockquote>
  );
}

function Section({ id, heading, children }: { id: string; heading: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="sketch-card mt-8 break-inside-avoid bg-white p-5 sm:p-6">
      <h2 id={id} className="font-display text-3xl font-bold leading-tight">
        {heading}
      </h2>
      <div className="mt-3 space-y-3 text-lg leading-relaxed">{children}</div>
    </section>
  );
}

export default function SharePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <nav aria-label="Page" className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-semibold text-ink underline underline-offset-2">
          <span aria-hidden="true">← </span>
          {LINKS.backToMap}
        </Link>
        <Link href="/learn" className="btn-quiet text-sm">
          {LINKS.learn}
        </Link>
      </nav>

      <header className="squiggle-bottom mt-6 pb-5">
        <h1 className="font-display text-4xl font-bold leading-[1.1] sm:text-5xl">{PAGE.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">{PAGE.lead}</p>
      </header>

      <div className="mt-6 space-y-3 text-lg leading-relaxed">
        {INTRO.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <aside
        aria-labelledby="listen-first"
        className="sketch-box mt-5 border-2 border-dashed border-pencil/50 bg-mist px-4 py-3 text-lg leading-relaxed"
      >
        <h2 id="listen-first" className="font-display text-2xl font-bold">
          {INTRO.listenFirst.heading}
        </h2>
        <p className="mt-1">{INTRO.listenFirst.text}</p>
      </aside>

      <section aria-labelledby="circles" className="mt-10">
        <h2 id="circles" className="font-display text-3xl font-bold leading-tight sm:text-4xl">
          {CIRCLES.heading}
        </h2>
        <p className="mt-2 text-lg leading-relaxed text-ink-soft">{CIRCLES.intro}</p>

        <ol className="mt-6 space-y-5">
          {CIRCLES.steps.map((s, i) => (
            <li key={i} className="sketch-card break-inside-avoid bg-white p-5 sm:p-6">
              <h3 className="flex items-center gap-3 font-display text-2xl font-bold leading-tight sm:text-3xl">
                <LetterDot letter={String(i + 1)} color={STEP_COLORS[i % STEP_COLORS.length]} seed={"share-step" + i} />
                <span>
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.heading}
                </span>
              </h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:items-start">
                <figure className="mx-auto w-full max-w-sm sm:order-last sm:max-w-none sm:pt-2">
                  <ThreeCircles step={i + 1} description={s.diagramDescription} />
                </figure>
                <div className="space-y-3 text-lg leading-relaxed">
                  {s.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                  {s.verse && <VerseQuote verse={s.verse} />}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Section id="story" heading={STORY.heading}>
        <p>{STORY.intro}</p>
        <ol className="space-y-3">
          {STORY.parts.map((part, i) => (
            <li key={i} className="flex items-start gap-3">
              <LetterDot letter={String(i + 1)} color="#1F2A2E" seed={"story" + i} />
              <span>
                <strong>{part.label}.</strong> {part.prompt}
              </span>
            </li>
          ))}
        </ol>
        <p className="sketch-box border-2 border-dashed border-pencil/50 bg-mist px-4 py-3">{STORY.note}</p>
      </Section>

      <Section id="practice" heading={PRACTICE.heading}>
        {PRACTICE.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Section>

      <Section id="let-go" heading={LET_GO.heading}>
        {LET_GO.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Section>

      <section aria-labelledby="credit" className="mt-10 space-y-2 text-ink-soft">
        <h2 id="credit" className="font-display text-2xl font-bold text-ink">
          {CREDIT.heading}
        </h2>
        {CREDIT.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>
          <a
            href={CREDIT.learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ink underline underline-offset-2"
          >
            {CREDIT.learnMoreText}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
        <p className="text-sm">{TRANSLATION_NOTE}</p>
      </section>

      <div className="no-print mt-10 flex flex-col items-center gap-4 text-center">
        <Link href="/" className="btn-primary inline-block px-8 py-4 font-display text-2xl">
          My map
        </Link>
        <Link href="/learn" className="font-semibold text-ink underline underline-offset-2">
          {LINKS.learn}
        </Link>
      </div>
    </main>
  );
}
