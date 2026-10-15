# Oikos Map

A simple web app that helps a visitor build an "oikos" (household) map: the people in their lives they want to pray for, share the gospel with, and equip to do the same.

## Who It's For
Ordinary believers, not ministry professionals. Many will be on a phone, and many will be new to this idea. Assume no prior knowledge of the term "oikos" — explain it in one plain sentence where it first appears.

## Principles
- Simple over complete. A first-time visitor should have a usable map in a few minutes.
- Privacy first. These are real people's names. Default to storing data on the visitor's device only. No accounts, no tracking, nothing shared without a clear, deliberate action.
- Plain language. No jargon, no church-speak walls of text.
- Warm and encouraging in tone, never guilt-driven.
- One job done well. Resist feature creep; flag it when a request pulls the app beyond building and viewing the map.

## Stack
- Next.js (App Router) + TypeScript + Tailwind
- Deploy on Vercel
- No database or auth until a real need appears. Ask before adding either.

## Working Notes
- Keep code simple and readable; avoid clever abstractions.
- Mobile-first, accessible (keyboard, contrast, screen readers).
- Explain what a change does in plain terms before or after making it.
- Track work in BACKLOG.md.
