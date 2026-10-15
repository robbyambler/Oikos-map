"use client";

import dynamic from "next/dynamic";

// The app reads saved data from this browser, so it only renders in the browser.
const OikosApp = dynamic(() => import("@/components/OikosApp"), {
  ssr: false,
  loading: () => <p className="p-6 text-ink-soft">Loading your map…</p>,
});

export default function Home() {
  return <OikosApp />;
}
