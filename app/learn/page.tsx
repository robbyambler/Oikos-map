import type { Metadata } from "next";
import Link from "next/link";
import type { Person } from "@/lib/people";
import MapView from "@/components/MapView";
import Shape, { LetterDot, Legend } from "@/components/Shape";

// A short, static walkthrough for people new to the idea of an oikos map.
// It never reads or writes the visitor's saved map; the example below uses made-up people.

export const metadata: Metadata = {
  title: "How it works · Oikos Map",
  description: "Five short steps to mapping the people God has put around you.",
};

const EXAMPLE: Person[] = [
  { id: "ex-you", name: "Jamie", kind: "nonbeliever", parentId: null },
  { id: "ex-sam", name: "Sam", kind: "nonbeliever", parentId: "ex-you" },
  { id: "ex-maria", name: "Maria", kind: "believer", parentId: "ex-you" },
  { id: "ex-dan", name: "Pastor Dan", kind: "believer", parentId: "ex-you" },
  { id: "ex-jo", name: "Aunt Jo", kind: "nonbeliever", parentId: "ex-you" },
  { id: "ex-lee", name: "Lee", kind: "nonbeliever", parentId: "ex-sam" },
  { id: "ex-priya", name: "Priya", kind: "nonbeliever", parentId: "ex-maria" },
  { id: "ex-tom", name: "Tom", kind: "believer", parentId: "ex-maria" },
  { id: "ex-ben", name: "Ben", kind: "nonbeliever", parentId: "ex-jo" },
];

const EXAMPLE_DESCRIPTION =
  "An example map for someone named Jamie. Jamie is the filled circle in the middle. Around Jamie: Sam and Aunt Jo, drawn as circles because they don't yet follow Jesus, and Maria and Pastor Dan, drawn as squares because they do. Beyond them are their people: Lee, connected to Sam; Priya and Tom, connected to Maria; and Ben, connected to Aunt Jo.";

const BLESS = [
  { letter: "B", word: "Begin with prayer", line: "Ask God to open their heart, and your eyes." },
  { letter: "L", word: "Listen", line: "Ask good questions and really hear their story." },
  { letter: "E", word: "Eat", line: "Share a meal or a coffee. Tables make friends." },
  { letter: "S", word: "Serve", line: "Look for a simple, practical way to help." },
  { letter: "S", word: "Share", line: "When the moment is right, tell them what Jesus has done for you.", link: true },
];

const STEP_COLORS = ["#2F7A78", "#8A3B6E", "#9A6400", "#3B5BA9", "#B0413E"];

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="sketch-card bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-3 font-display text-2xl font-bold leading-tight sm:text-3xl">
        <LetterDot letter={String(n)} color={STEP_COLORS[n - 1]} seed={"step" + n} />
        <span>
          <span className="sr-only">Step {n}: </span>
          {title}
        </span>
      </h2>
      <div className="mt-3 space-y-3 text-lg leading-relaxed">{children}</div>
    </li>
  );
}

export default function LearnPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <nav className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-semibold text-ink underline underline-offset-2">
          <span aria-hidden="true">← </span>Back to my map
        </Link>
        <Link href="/" className="btn-quiet text-sm">
          Start my map
        </Link>
      </nav>

      <header className="squiggle-bottom mt-6 pb-5">
        <h1 className="font-display text-4xl font-bold leading-[1.1] sm:text-5xl">How an oikos map works</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">
          Five short steps. No experience needed, and there are no wrong answers.
        </p>
      </header>

      <figure className="sketch-card mt-8 bg-white p-4 sm:p-6">
        <div className="mx-auto max-w-md">
          <MapView people={EXAMPLE} fit title={EXAMPLE_DESCRIPTION} />
        </div>
        <figcaption className="mt-3 space-y-3">
          <p className="text-center text-sm text-ink-soft">An example map for Jamie, with made-up people. Yours will have your name in the middle.</p>
          <Legend />
        </figcaption>
      </figure>

      <ol className="mt-8 space-y-5">
        <Step n={1} title="What's an oikos?">
          <p>
            <em>Oikos</em> is the Greek word for household: the family, friends, and neighbors God has already put in
            your everyday life.
          </p>
          <blockquote className="sketch-box bg-mist px-4 py-3">
            &ldquo;Believe in the Lord Jesus, and you will be saved, you and your household.&rdquo;
            <span className="mt-1 block text-base text-ink-soft">Acts 16:31 (ESV)</span>
          </blockquote>
          <p>The good news has always traveled through ordinary relationships. Yours included.</p>
          <p>
            Here&apos;s the part that changes everything: <strong>everyone you know has an oikos of their own.</strong>{" "}
            Each person on your map is connected to people you may never meet, and each of them can be reached
            through that person in a way only they can.
          </p>
        </Step>

        <Step n={2} title="Start with you">
          <p className="flex items-start gap-3">
            <span className="mt-1">
              <Shape kind="nonbeliever" color="#1F2A2E" size={22} seed="learn-you" />
            </span>
            <span>
              You&apos;re the circle in the middle. Just type your name. Everything else on the map grows out from
              you.
            </span>
          </p>
        </Step>

        <Step n={3} title="Add the people in your life">
          <p>For each person, pick a shape:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="mt-1">
                <Shape kind="believer" color="#8A3B6E" size={22} seed="learn-sq" />
              </span>
              <span>
                <strong>Square:</strong> someone who already follows Jesus. Train them, and they can start reaching their own oikos right away.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1">
                <Shape kind="nonbeliever" color="#2F7A78" size={22} seed="learn-ci" />
              </span>
              <span>
                <strong>Circle:</strong> someone who doesn&apos;t yet follow Jesus.
              </span>
            </li>
          </ul>
          <div className="sketch-box border-2 border-dashed border-pencil/50 bg-mist px-4 py-3">
            <p className="font-semibold">Not sure who to add? Think through:</p>
            <p>
              <strong>F</strong>riends, <strong>R</strong>elatives, <strong>A</strong>cquaintances,{" "}
              <strong>N</strong>eighbors, <strong>C</strong>oworkers or classmates.
            </p>
          </div>
        </Step>

        <Step n={4} title="Add the people connected to them">
          <p>
            Your friend has a sister. Your coworker has a roommate. Every person on your map has an oikos of their
            own, and they are the one best placed to reach it. Tap anyone to add the people in <em>their</em> life.
            Go as far out as you like, or stop at one ring. Both are fine.
          </p>
        </Step>

        <Step n={5} title="Now what?">
          <p>Pray for the people on your map every day. Then try a few simple steps with one or two of them:</p>
          <ul className="space-y-3">
            {BLESS.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <LetterDot letter={b.letter} color="#1F2A2E" seed={"learn-bless" + i} />
                <span>
                  <strong>{b.word}.</strong> {b.line}
                  {b.link && (
                    <>
                      {" "}
                      <Link href="/share" className="no-print font-semibold text-ink underline underline-offset-2">
                        See a simple way to share
                      </Link>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p>
            <strong>Don&apos;t forget the squares.</strong> Believers on your map don&apos;t have to wait. Help them
            map their own oikos and equip them to share Jesus, so they can begin reaching their people right away.
          </p>
          <p>No pressure, no script. Just love the people God already gave you.</p>
        </Step>
      </ol>

      <section className="mt-8 space-y-4 text-center">
        <p className="text-ink-soft">
          <span aria-hidden="true">🔒 </span>
          Your map stays on your device. Nothing is sent anywhere. You can print it, or save a copy as a file.
        </p>
        <p className="text-sm text-ink-soft">
          Scripture quotations marked ESV are from the ESV&reg; Bible (The Holy Bible, English Standard Version&reg;),
          &copy; 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights
          reserved.
        </p>
        <Link href="/" className="btn-primary inline-block px-8 py-4 font-display text-2xl">
          Start my map
        </Link>
      </section>
    </main>
  );
}
