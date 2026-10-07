# Orbital Motion — Interactive Rive Study

A production-ready interactive motion case study built with **Rive, TypeScript and Vite**.

## Live Demo

https://AbhinavXor.github.io/orbital-motion-rive-study/

## What it demonstrates

This project converts layered 2D artwork into responsive browser motion controlled by:

- Pointer / hover
- Scroll progress
- Click trigger
- Focus state
- Reduced-motion preference

The movement is handled through a real Rive state machine rather than only CSS effects.

## Rive Interaction Contract

| Input | Type | Value |
|---|---|---|
| `pointerX` | Number | -1 → 1 |
| `pointerY` | Number | -1 → 1 |
| `scroll` | Number | 0 → 1 |
| `focus` | Boolean | on / off |
| `burst` | Trigger | fire |
| `reducedMotion` | Boolean | on / off |

## Included

- Compiled Rive asset
- Editable RML source
- Native Rive state machine
- Pointer-driven blend states
- Scroll-driven blend state
- Click interaction
- TypeScript browser integration
- Responsive layout
- Reduced-motion support
- SVG fallback
- Developer handoff documentation

## Main Files

```
assets/orbital-core.riv
rive-src/scene.rml
src/rive-controller.ts
src/app.ts
styles.css
docs/
```

## Run Locally

```bash
git clone https://github.com/AbhinavXor/orbital-motion-rive-study.git
cd orbital-motion-rive-study
npm install
npm run dev
```

Open:

```
http://localhost:4173
```

## Production

```bash
npm run check
npm run build
rive rive-src --verify
rive inspect rive-src --summary
```

## Tech

- Rive
- RML
- TypeScript
- Vite
- @rive-app/canvas
- HTML
- CSS

## Portfolio Note

This is a self-initiated interactive motion case study created to demonstrate animation and developer-handoff capability.

It is not presented as paid client work.
