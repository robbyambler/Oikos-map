# Oikos Map — Backlog

A simple web app where a visitor builds their oikos (household) map: the people they want to pray for, share the gospel with, and equip. Squares are believers, circles are non-believers. Data stays on the visitor's device. Mission Control mirrors this file read-only; edit it here.

## Doing

## Backlog

- [ ] Test on a real phone (tapping people on the map, print from mobile browsers)
- [ ] Deploy to Vercel

### Later, only if needed

- [ ] Download or restore a saved copy of the map as a file
- [ ] Trainer mode for walking a group through mapping their oikos (about 45 minutes)

## Blocked

## Done

- [x] Gather requirements and source documents
- [x] Scaffold Next.js + TypeScript + Tailwind app and build the v1 map builder
- [x] Welcome screen with one-sentence oikos explanation and Acts 16:31
- [x] Add-person flow: name plus square (believer) or circle (non-believer)
- [x] Add a person to someone else, to build the outer rings
- [x] FRANC prompt (friends, relatives, acquaintances, neighbors, coworkers) to help recall people
- [x] Map view: you in the center, people around you, their people beyond, color-grouped by branch
- [x] List view of the same map, for phones and screen readers
- [x] Edit and remove a person
- [x] Save to the device only (localStorage), with a clear note that nothing leaves the device
- [x] Print dialog with a print-friendly layout of the map
- [x] BLESS next-steps card for each person (Begin with prayer, Listen, Eat, Serve, Share)
- [x] Accessibility pass: keyboard, contrast, screen reader labels
- [x] Remove the concentric guide rings from the map
- [x] Free-form, hand-drawn map: wobbly squares and circles, curved pen lines, organic spacing seeded from each person's id (same on screen, reload, and print), with an overlap and line-clearance tidy-up pass
- [x] Hand-drawn look across the app (Kalam handwriting font for headings and map names, sketched cards, buttons, legend, welcome drawing, BLESS card, list view), keeping the branch colors and Atkinson Hyperlegible for body text and forms
- [x] Compact, clustered map like the Gospel Catalysts network map: short lines, each branch in its own wedge, each person's people clustered close by; fit mode never enlarges a small map
- [x] You (the center) are always a circle: no square/circle question when adding or editing yourself; older saved maps still load
