import {
  MotionSnapshot,
  RiveController,
} from './rive-controller';

const root =
  document.documentElement;

const body =
  document.body;

const stage =
  document.querySelector<HTMLElement>(
    '#motion-stage',
  );

const canvas =
  document.querySelector<HTMLCanvasElement>(
    '#rive-canvas',
  );

const status =
  document.querySelector<HTMLElement>(
    '#interaction-status',
  );

const scrollMeter =
  document.querySelector<HTMLElement>(
    '#scroll-meter-fill',
  );

const reducedMotion =
  window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  );

const clamp = (
  value: number,
  min: number,
  max: number,
): number =>
  Math.max(
    min,
    Math.min(max, value),
  );

const lerp = (
  from: number,
  to: number,
  amount: number,
): number =>
  from +
  (to - from) * amount;

interface State {
  pointerX: number;
  pointerY: number;

  targetX: number;
  targetY: number;

  scroll: number;

  focus: boolean;

  burst: number;
}

const state: State = {
  pointerX: 0,
  pointerY: 0,

  targetX: 0,
  targetY: 0,

  scroll: 0,

  focus: false,

  burst: 0,
};

const rive =
  canvas && stage
    ? new RiveController({
        canvas,
        host: stage,

        src:
          '/assets/orbital-core.riv',

        stateMachineName:
          'Main',
      })
    : null;

void rive?.init();


function snapshot():
MotionSnapshot {
  return {
    pointerX:
      state.pointerX,

    pointerY:
      state.pointerY,

    scroll:
      state.scroll,

    focus:
      state.focus,

    reducedMotion:
      reducedMotion.matches,
  };
}


function setStatus(
  value: string,
): void {
  if (status) {
    status.textContent =
      value;
  }
}


function syncCSS(): void {
  root.style.setProperty(
    '--mx',
    state.pointerX.toFixed(4),
  );

  root.style.setProperty(
    '--my',
    state.pointerY.toFixed(4),
  );

  root.style.setProperty(
    '--scroll',
    state.scroll.toFixed(4),
  );

  root.style.setProperty(
    '--focus',
    state.focus
      ? '1'
      : '0',
  );

  root.style.setProperty(
    '--burst',
    state.burst.toFixed(4),
  );

  rive?.update(
    snapshot(),
  );
}


function updatePointer(
  event: PointerEvent,
): void {
  if (
    !stage ||
    reducedMotion.matches
  ) {
    return;
  }

  const rect =
    stage.getBoundingClientRect();

  if (
    rect.width <= 0 ||
    rect.height <= 0
  ) {
    return;
  }

  const x =
    clamp(
      (
        event.clientX -
        rect.left
      ) /
        rect.width,
      0,
      1,
    );

  const y =
    clamp(
      (
        event.clientY -
        rect.top
      ) /
        rect.height,
      0,
      1,
    );

  state.targetX =
    (x - 0.5) * 2;

  state.targetY =
    (y - 0.5) * 2;

  setStatus('pointer');
}


function resetPointer(): void {
  state.targetX = 0;
  state.targetY = 0;

  setStatus('idle');
}


function updateScroll(): void {
  const range =
    Math.max(
      1,
      document.documentElement
        .scrollHeight -
        window.innerHeight,
    );

  const pageProgress =
    clamp(
      window.scrollY /
        range,
      0,
      1,
    );

  scrollMeter?.style
    .setProperty(
      'transform',
      `scaleX(${pageProgress})`,
    );

  const behavior =
    document.querySelector<HTMLElement>(
      '#behavior',
    );

  if (behavior) {
    const rect =
      behavior
        .getBoundingClientRect();

    const denominator =
      Math.max(
        1,
        rect.height +
          window.innerHeight,
      );

    state.scroll =
      clamp(
        (
          window.innerHeight -
          rect.top
        ) /
          denominator,
        0,
        1,
      );
  } else {
    state.scroll =
      pageProgress;
  }
}


function burst(): void {
  setStatus('click');

  if (
    !reducedMotion.matches
  ) {
    state.burst = 1;
  }

  rive?.trigger(
    'burst',
  );

  body.classList.remove(
    'is-bursting',
  );

  void body.offsetWidth;

  body.classList.add(
    'is-bursting',
  );

  window.setTimeout(
    () => {
      body.classList.remove(
        'is-bursting',
      );

      setStatus('idle');
    },
    reducedMotion.matches
      ? 80
      : 800,
  );
}


function toggleFocus(
  element: HTMLElement,
): void {
  state.focus =
    !state.focus;

  element.setAttribute(
    'aria-pressed',
    String(state.focus),
  );

  setStatus(
    state.focus
      ? 'focus'
      : 'idle',
  );
}


document
  .querySelectorAll<HTMLElement>(
    '[data-trigger="burst"]',
  )
  .forEach(
    (element) => {
      element.addEventListener(
        'click',
        burst,
      );
    },
  );


document
  .querySelectorAll<HTMLElement>(
    '[data-trigger="focus"]',
  )
  .forEach(
    (element) => {
      element.addEventListener(
        'click',
        () =>
          toggleFocus(
            element,
          ),
      );
    },
  );


document
  .querySelectorAll<HTMLElement>(
    '[data-tilt]',
  )
  .forEach(
    (element) => {
      const reset = (): void => {
        element.style.transform =
          '';

        element.style.setProperty(
          '--cx',
          '.5',
        );

        element.style.setProperty(
          '--cy',
          '.5',
        );
      };

      element.addEventListener(
        'pointermove',
        (event) => {
          if (
            reducedMotion.matches
          ) {
            return;
          }

          const rect =
            element
              .getBoundingClientRect();

          const x =
            clamp(
              (
                event.clientX -
                rect.left
              ) /
                rect.width,
              0,
              1,
            );

          const y =
            clamp(
              (
                event.clientY -
                rect.top
              ) /
                rect.height,
              0,
              1,
            );

          const rotateX =
            (0.5 - y) * 6;

          const rotateY =
            (x - 0.5) * 8;

          element.style.transform =
            [
              'perspective(1000px)',
              `rotateX(${rotateX}deg)`,
              `rotateY(${rotateY}deg)`,
              'translateY(-3px)',
            ].join(' ');

          element.style.setProperty(
            '--cx',
            x.toFixed(3),
          );

          element.style.setProperty(
            '--cy',
            y.toFixed(3),
          );
        },
      );

      element.addEventListener(
        'pointerleave',
        reset,
      );

      element.addEventListener(
        'pointercancel',
        reset,
      );
    },
  );


stage?.addEventListener(
  'pointermove',
  updatePointer,
);

stage?.addEventListener(
  'pointerleave',
  resetPointer,
);

stage?.addEventListener(
  'pointercancel',
  resetPointer,
);

stage?.addEventListener(
  'keydown',
  (event) => {
    if (
      event.key !==
        'Enter' &&
      event.key !== ' '
    ) {
      return;
    }

    event.preventDefault();

    burst();
  },
);


let scrollQueued = false;

window.addEventListener(
  'scroll',
  () => {
    if (scrollQueued) {
      return;
    }

    scrollQueued = true;

    requestAnimationFrame(
      () => {
        updateScroll();
        setStatus('scroll');

        scrollQueued =
          false;
      },
    );
  },
  {
    passive: true,
  },
);


window.addEventListener(
  'resize',
  updateScroll,
  {
    passive: true,
  },
);


reducedMotion
  .addEventListener?.(
    'change',
    () => {
      if (
        reducedMotion.matches
      ) {
        state.targetX = 0;
        state.targetY = 0;

        state.pointerX = 0;
        state.pointerY = 0;

        state.burst = 0;
      }

      syncCSS();
    },
  );


let frame = 0;

function animate(): void {
  if (
    !reducedMotion.matches
  ) {
    state.pointerX =
      lerp(
        state.pointerX,
        state.targetX,
        0.075,
      );

    state.pointerY =
      lerp(
        state.pointerY,
        state.targetY,
        0.075,
      );

    state.burst =
      Math.max(
        0,
        state.burst *
          0.9 -
          0.001,
      );
  }

  syncCSS();

  frame =
    requestAnimationFrame(
      animate,
    );
}


window.addEventListener(
  'pagehide',
  () => {
    cancelAnimationFrame(
      frame,
    );

    rive?.destroy();
  },
  {
    once: true,
  },
);


updateScroll();
syncCSS();
animate();
