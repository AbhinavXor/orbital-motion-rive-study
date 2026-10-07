import {
  Alignment,
  Fit,
  Layout,
  Rive,
} from '@rive-app/canvas';

export interface MotionSnapshot {
  pointerX: number;
  pointerY: number;
  scroll: number;
  focus: boolean;
  reducedMotion: boolean;
}

interface RuntimeInput {
  name: string;
  value?: number | boolean;
  fire?: () => void;
}

interface ControllerOptions {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  src: string;
  stateMachineName?: string;
}

const EXPECTED_INPUTS = [
  'pointerX',
  'pointerY',
  'scroll',
  'focus',
  'burst',
  'reducedMotion',
] as const;

export class RiveController {
  private readonly canvas: HTMLCanvasElement;
  private readonly host: HTMLElement;
  private readonly src: string;
  private readonly stateMachineName: string;

  private rive: Rive | null = null;

  private readonly inputs =
    new Map<string, RuntimeInput>();

  private resizeObserver:
    ResizeObserver | null = null;

  private visibilityObserver:
    IntersectionObserver | null = null;

  private ready = false;
  private destroyed = false;

  private lastFocus = false;

  constructor({
    canvas,
    host,
    src,
    stateMachineName = 'Main',
  }: ControllerOptions) {
    this.canvas = canvas;
    this.host = host;
    this.src = src;
    this.stateMachineName =
      stateMachineName;
  }

  get isReady(): boolean {
    return this.ready &&
      !this.destroyed;
  }

  async init(): Promise<boolean> {
    try {
      const response =
        await fetch(this.src, {
          cache: 'no-store',
          credentials: 'same-origin',
        });

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`,
        );
      }

      const contentType =
        response.headers.get(
          'content-type',
        ) ?? '';

      if (
        contentType.includes(
          'text/html',
        )
      ) {
        throw new Error(
          'Received HTML instead of Rive binary.',
        );
      }

      const buffer =
        await response.arrayBuffer();

      if (
        buffer.byteLength < 64
      ) {
        throw new Error(
          'Rive binary is unexpectedly small.',
        );
      }

      this.rive = new Rive({
        buffer,
        canvas: this.canvas,

        autoplay: true,

        stateMachines:
          this.stateMachineName,

        layout: new Layout({
          fit: Fit.Contain,
          alignment:
            Alignment.Center,
        }),

        onLoad: () => {
          if (
            this.destroyed ||
            !this.rive
          ) {
            return;
          }

          this.connectInputs();

          this.rive
            .resizeDrawingSurfaceToCanvas();

          this.ready = true;

          this.host.dataset.rive =
            'ready';

          this.installObservers();
        },
      });

      return true;
    } catch (error) {
      console.error(
        '[Rive] load failed:',
        error,
      );

      this.host.dataset.rive =
        'fallback';

      return false;
    }
  }

  update(
    snapshot: MotionSnapshot,
  ): void {
    if (!this.isReady) {
      return;
    }

    const pointerX =
      snapshot.reducedMotion
        ? 0
        : snapshot.pointerX;

    const pointerY =
      snapshot.reducedMotion
        ? 0
        : snapshot.pointerY;

    const scroll =
      snapshot.reducedMotion
        ? 0
        : snapshot.scroll;

    this.setNumber(
      'pointerX',
      pointerX,
    );

    this.setNumber(
      'pointerY',
      pointerY,
    );

    this.setNumber(
      'scroll',
      scroll,
    );

    this.setBoolean(
      'focus',
      snapshot.focus,
    );

    this.setBoolean(
      'reducedMotion',
      snapshot.reducedMotion,
    );

    if (
      snapshot.focus &&
      !this.lastFocus &&
      !snapshot.reducedMotion
    ) {
      this.playAnimation(
        'Focus',
      );
    }

    this.lastFocus =
      snapshot.focus;
  }

  trigger(
    name: string,
  ): void {
    if (!this.isReady) {
      return;
    }

    const input =
      this.inputs.get(name);

    input?.fire?.();

    if (name === 'burst') {
      this.playAnimation(
        'Burst',
      );
    }
  }

  playAnimation(
    name: string,
  ): void {
    if (
      !this.rive ||
      this.destroyed
    ) {
      return;
    }

    try {
      this.rive.play(name);
    } catch (error) {
      console.warn(
        `[Rive] Unable to play ${name}:`,
        error,
      );
    }
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.ready = false;

    this.resizeObserver
      ?.disconnect();

    this.visibilityObserver
      ?.disconnect();

    this.inputs.clear();

    try {
      this.rive?.cleanup();
    } finally {
      this.rive = null;
    }
  }

  private connectInputs(): void {
    if (!this.rive) {
      return;
    }

    this.inputs.clear();

    const values =
      this.rive.stateMachineInputs(
        this.stateMachineName,
      ) as RuntimeInput[] | undefined;

    for (
      const input of values ?? []
    ) {
      this.inputs.set(
        input.name,
        input,
      );
    }

    const missing =
      EXPECTED_INPUTS.filter(
        (name) =>
          !this.inputs.has(name),
      );

    if (missing.length > 0) {
      console.warn(
        '[Rive] Missing runtime inputs:',
        missing,
      );
    }
  }

  private setNumber(
    name: string,
    value: number,
  ): void {
    const input =
      this.inputs.get(name);

    if (!input) {
      return;
    }

    input.value = value;
  }

  private setBoolean(
    name: string,
    value: boolean,
  ): void {
    const input =
      this.inputs.get(name);

    if (!input) {
      return;
    }

    input.value = value;
  }

  private installObservers(): void {
    this.resizeObserver =
      new ResizeObserver(() => {
        this.rive
          ?.resizeDrawingSurfaceToCanvas();
      });

    this.resizeObserver.observe(
      this.host,
    );

    this.visibilityObserver =
      new IntersectionObserver(
        ([entry]) => {
          if (
            !entry ||
            !this.rive
          ) {
            return;
          }

          if (
            entry.isIntersecting
          ) {
            this.rive.play();
          } else {
            this.rive.pause();
          }
        },
        {
          rootMargin:
            '150px 0px',
          threshold: 0.01,
        },
      );

    this.visibilityObserver.observe(
      this.host,
    );
  }
}
