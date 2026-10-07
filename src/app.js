const root = document.documentElement;
const body = document.body;
const stage = document.querySelector('#motion-stage');
const scrollFill = document.querySelector('#scroll-meter-fill');
const storyCards = [...document.querySelectorAll('[data-story-step]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const interactionStatus = document.querySelector('#interaction-status');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (start, end, amount) => start + (end - start) * amount;

const state = {
  pointerX: 0,
  pointerY: 0,
  targetX: 0,
  targetY: 0,
  scroll: 0,
  focus: false,
  burst: 0,
};

function setCssState() {
  root.style.setProperty('--mx', state.pointerX.toFixed(4));
  root.style.setProperty('--my', state.pointerY.toFixed(4));
  root.style.setProperty('--scroll', state.scroll.toFixed(4));
  root.style.setProperty('--focus', state.focus ? '1' : '0');
  root.style.setProperty('--burst', state.burst.toFixed(4));
}

function updateScrollState() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pageProgress = clamp(scrollTop / scrollRange, 0, 1);
  scrollFill.style.transform = `scaleX(${pageProgress})`;

  const stageSection = document.querySelector('#system');
  const rect = stageSection.getBoundingClientRect();
  const localRange = Math.max(1, window.innerHeight + rect.height);
  state.scroll = clamp((window.innerHeight - rect.top) / localRange, 0, 1);

  const activeIndex = state.scroll < 0.33 ? 0 : state.scroll < 0.66 ? 1 : 2;
  storyCards.forEach((card, index) => card.classList.toggle('is-active', index === activeIndex));
}

function animate() {
  if (!reduceMotion.matches) {
    state.pointerX = lerp(state.pointerX, state.targetX, 0.075);
    state.pointerY = lerp(state.pointerY, state.targetY, 0.075);
    state.burst = Math.max(0, state.burst * 0.9 - 0.002);
    setCssState();
  }
  requestAnimationFrame(animate);
}

function setInteractionStatus(value) {
  if (interactionStatus) interactionStatus.textContent = value;
}

function handlePointerMove(event) {
  if (reduceMotion.matches || !stage) return;
  const rect = stage.getBoundingClientRect();
  const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
  state.targetX = (x - 0.5) * 2;
  state.targetY = (y - 0.5) * 2;
  setInteractionStatus('pointer');
}

function resetPointer() {
  state.targetX = 0;
  state.targetY = 0;
  setInteractionStatus('idle');
}

function triggerBurst() {
  if (reduceMotion.matches) return;
  setInteractionStatus('click');
  state.burst = 1;
  body.classList.remove('is-bursting');
  // Force reflow so repeat clicks restart the keyframe effect.
  void body.offsetWidth;
  body.classList.add('is-bursting');
  window.setTimeout(() => {
    body.classList.remove('is-bursting');
    setInteractionStatus('idle');
  }, 700);
}

function toggleFocus(button) {
  state.focus = !state.focus;
  setInteractionStatus(state.focus ? 'focus' : 'idle');
  button?.setAttribute('aria-pressed', String(state.focus));
  setCssState();
}

function bindTriggers() {
  document.querySelectorAll('[data-trigger="burst"]').forEach((button) => {
    button.addEventListener('click', triggerBurst);
  });
  document.querySelectorAll('[data-trigger="focus"]').forEach((button) => {
    button.addEventListener('click', () => toggleFocus(button));
  });
}

function bindTiltCards() {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    const reset = () => {
      card.style.transform = '';
      card.style.setProperty('--cx', '.5');
      card.style.setProperty('--cy', '.5');
    };

    card.addEventListener('pointermove', (event) => {
      if (reduceMotion.matches) return;
      const rect = card.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      const rx = (0.5 - y) * 8;
      const ry = (x - 0.5) * 10;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      card.style.setProperty('--cx', x.toFixed(3));
      card.style.setProperty('--cy', y.toFixed(3));
    });

    card.addEventListener('pointerleave', reset);
    card.addEventListener('blur', reset, true);
  });
}

function initKeyboardStageControls() {
  stage?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerBurst();
    }
  });
}

let scrollTicking = false;
function onScroll() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    updateScrollState();
    setInteractionStatus('scroll');
    window.clearTimeout(onScroll.statusTimer);
    onScroll.statusTimer = window.setTimeout(() => setInteractionStatus('idle'), 120);
    scrollTicking = false;
  });
}

stage?.addEventListener('pointermove', handlePointerMove);
stage?.addEventListener('pointerleave', resetPointer);
stage?.addEventListener('pointercancel', resetPointer);
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', updateScrollState, { passive: true });
reduceMotion.addEventListener?.('change', () => {
  if (reduceMotion.matches) resetPointer();
});

bindTriggers();
bindTiltCards();
initKeyboardStageControls();
updateScrollState();
setCssState();
animate();
