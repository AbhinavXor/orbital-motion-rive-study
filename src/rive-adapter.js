/**
 * Rive interaction adapter contract.
 *
 * This project intentionally ships with an SVG/DOM fallback so the portfolio demo runs without a proprietary binary
 * asset. When a .riv file is authored, wire the same interaction state into Rive using this adapter shape.
 *
 * Expected Rive State Machine inputs:
 *   pointerX       Number  [-1..1]
 *   pointerY       Number  [-1..1]
 *   scroll         Number  [0..1]
 *   focus          Boolean
 *   burst          Trigger
 *   reducedMotion  Boolean
 */
export class RiveInteractionAdapter {
  constructor({ riveInstance, stateMachineName = 'Main' }) {
    this.rive = riveInstance;
    this.stateMachineName = stateMachineName;
    this.inputs = new Map();
  }

  connect(inputs) {
    this.inputs.clear();
    for (const input of inputs ?? []) this.inputs.set(input.name, input);
  }

  setNumber(name, value) {
    const input = this.inputs.get(name);
    if (input) input.value = Number(value);
  }

  setBoolean(name, value) {
    const input = this.inputs.get(name);
    if (input) input.value = Boolean(value);
  }

  fire(name) {
    const input = this.inputs.get(name);
    input?.fire?.();
  }

  update({ pointerX, pointerY, scroll, focus, reducedMotion }) {
    this.setNumber('pointerX', pointerX);
    this.setNumber('pointerY', pointerY);
    this.setNumber('scroll', scroll);
    this.setBoolean('focus', focus);
    this.setBoolean('reducedMotion', reducedMotion);
  }
}
