# Rive Build Specification

This document maps the live portfolio interaction into a clean Rive implementation.

## Artboard

**Artboard:** `OrbitalCore`

Import `assets/orbital-core.svg` and preserve logical group naming where possible:

- `outer-orbit`
- `mid-orbit`
- `core`
- `satellites`
- `micro-particles`

Recommended artboard size: `720 × 720`.

## State Machine

**State Machine:** `Main`

### Inputs

| Name | Type | Purpose |
|---|---|---|
| `pointerX` | Number | Horizontal parallax / depth response (`-1..1`) |
| `pointerY` | Number | Vertical parallax / depth response (`-1..1`) |
| `scroll` | Number | Scroll-scrubbed narrative progress (`0..1`) |
| `focus` | Boolean | Toggle a closer / more saturated inspection state |
| `burst` | Trigger | One-shot pulse / expansion event |
| `reducedMotion` | Boolean | Disable non-essential movement |

## Animation design

### Pointer response

Use subtle transforms only. The goal is a premium depth illusion rather than exaggerated game-like movement.

- `outer-orbit`: rotate Y-equivalent / horizontal offset at low amplitude.
- `mid-orbit`: inverse offset for parallax separation.
- `core`: very small translation and scale shift.
- `satellites`: slightly larger parallax response than the core.

### Scroll response

Create a timeline controlled by `scroll`:

- `0.00–0.30` — assembled state.
- `0.30–0.65` — inspection state: orbits separate, satellites move outward, labels can reveal.
- `0.65–1.00` — transformed state: composition rotates, scales and rebalances.

Use blend states rather than hard cuts.

### Focus state

When `focus = true`:

- Increase core scale by roughly 3–5%.
- Reduce orbital travel slightly so the composition feels more stable.
- Increase highlight / glow intensity moderately.
- Avoid a large jump; interpolate over ~250–350 ms.

### Burst trigger

When `burst` fires:

1. Core highlight increases quickly.
2. Outer orbit expands briefly.
3. Mid orbit contracts slightly.
4. A small satellite pulse travels outward.
5. Entire scene settles back within ~600–750 ms.

### Reduced motion

If `reducedMotion = true`:

- Pointer parallax should be disabled.
- Scroll may still switch semantic states, but avoid continuous large movement.
- Burst should become a subtle opacity/highlight change.

## Web integration contract

`src/rive-adapter.js` defines the interface expected from the web runtime. In a real Rive implementation:

1. Load the `.riv` file.
2. Start the `Main` state machine.
3. Read the state-machine inputs.
4. Pass them to `RiveInteractionAdapter.connect()`.
5. Update number/boolean inputs from the page interaction state.
6. Fire `burst` on click.

Keep the DOM fallback in production if animation is critical to content comprehension. A failed animation asset should never make the website unusable.
