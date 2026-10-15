# Oikos Map

A simple web app for building your "oikos" (household) map: the people in your life you want to pray for, share the gospel with, and equip to do the same. Squares are believers, circles are non-believers. You are always a circle in the center.

Everything is saved in your own browser. There are no accounts, no tracking, and nothing is sent anywhere.

**Live site:** https://robbyambler.github.io/Oikos-map/

## Run it locally

```
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploy

This is a static site on GitHub Pages. Every push to `main` builds and publishes it through `.github/workflows/pages.yml`. To check the build locally, run `npm run build`; the site lands in `out/`.
