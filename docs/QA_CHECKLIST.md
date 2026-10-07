# QA Checklist

## Responsive

- [ ] 1440px+ desktop: hero layout balanced and stage does not exceed visual column.
- [ ] 1024px tablet/desktop: no overlap between copy and stage.
- [ ] 768px tablet: stage moves below hero copy cleanly.
- [ ] 390px mobile: no horizontal scrolling; buttons remain usable.
- [ ] Landscape mobile: animation remains visible without trapping scroll.

## Interaction

- [ ] Pointer movement is smooth and returns to center on pointer leave.
- [ ] Scroll state progresses smoothly and story cards update correctly.
- [ ] Burst can be fired repeatedly without getting stuck.
- [ ] Focus state toggles and exposes correct `aria-pressed` value.
- [ ] Hover card tilt resets on pointer leave.
- [ ] Keyboard Enter/Space on the hero stage triggers the burst interaction.

## Accessibility

- [ ] Skip link is visible on keyboard focus.
- [ ] All interactive controls have keyboard focus styles.
- [ ] `prefers-reduced-motion: reduce` removes continuous decorative movement.
- [ ] Decorative graphics use empty alt text or `aria-hidden` as appropriate.
- [ ] Text contrast remains readable against animated backgrounds.

## Performance

- [ ] No raster frame sequence is loaded.
- [ ] No large video is required for the hero.
- [ ] Pointer and scroll updates are batched with `requestAnimationFrame`.
- [ ] Avoid adding heavy blur/filter effects on large moving layers on low-end mobile.
- [ ] If using Rive, load the runtime only on pages that need it.
- [ ] Compress `.riv` and SVG assets before production handoff.

## Browser review

Test current stable versions of:

- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge
- [ ] iOS Safari
- [ ] Android Chrome
