import { Person } from "@/lib/people";
import { LetterDot } from "./Shape";

const STEPS = [
  { letter: "B", word: "Begin with prayer", text: (n: string) => `Ask God to work in ${n}'s life, and to open a door for you.` },
  { letter: "L", word: "Listen", text: (n: string) => `Ask good questions. Learn what ${n} cares about and carries.` },
  { letter: "E", word: "Eat", text: () => `Share a meal or a coffee. Friendship grows around a table.` },
  { letter: "S", word: "Serve", text: (n: string) => `Look for a practical way to help ${n} this month.` },
  { letter: "S", word: "Share", text: () => `When the time is right, share your story and the good news of Jesus.` },
];

// A short "now what" for one person, using the BLESS pattern.
export default function BlessCard({ person, color }: { person: Person; color: string }) {
  const first = person.name.split(" ")[0];
  return (
    <section aria-labelledby="bless-heading" className="sketch-card bg-white p-4">
      <h3 id="bless-heading" className="font-display text-xl font-bold">
        A few ways to bless {first}
      </h3>
      {person.kind === "believer" && (
        <p className="mt-1 text-sm text-ink-soft">
          {first} already follows Jesus. Walk with them, and help them map their own oikos too.
        </p>
      )}
      <ol className="mt-3 space-y-2">
        {STEPS.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <LetterDot letter={step.letter} color={color} seed={`${person.id}:${i}`} />
            <span className="pt-0.5 text-[0.95rem] leading-snug">
              <strong>{step.word}.</strong> {step.text(first)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
