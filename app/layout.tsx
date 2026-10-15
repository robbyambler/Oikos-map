import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Kalam } from "next/font/google";
import "./globals.css";

const body = Atkinson_Hyperlegible({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

// A friendly handwriting font for headings and names on the map.
// Body text and form fields stay in Atkinson Hyperlegible for easy reading.
const hand = Kalam({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Oikos Map",
  description: "Map the people God has put around you. Saved only on your device.",
};

export const viewport: Viewport = {
  themeColor: "#F1F4EF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${hand.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
