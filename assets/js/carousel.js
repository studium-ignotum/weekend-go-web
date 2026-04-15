// Breakpoints (aligned with Tailwind)
const BREAKPOINT_XS = 480;
const BREAKPOINT_SM = 640;
const BREAKPOINT_MD = 768;
const BREAKPOINT_LG = 1024;

// CoverFlow Carousel
const ANIMATION_DURATION_MS = 600;
const AUTOPLAY_INTERVAL_MS = 3000;

// Swipe tuning
const SWIPE_DISTANCE_MIN_PX = 25;
const SWIPE_DISTANCE_RATIO  = 0.15;   // 15% of carousel width
const SWIPE_VELOCITY_FLICK  = 0.3;    // px/ms
const SWIPE_DEADZONE_PX     = 10;
const SWIPE_LOCK_RATIO      = 1.2;    // |dx|/|dy| threshold for horizontal lock

// Hidden slot config
const HIDDEN = { scale: 0.5, rotateY: 0, translateX: 0, opacity: 0, zIndex: 0 };

// POSITIONS arrays — indexed by DOM slot 0..4 = positions -2, -1, 0, +1, +2
const POSITIONS_DESKTOP = [
  { scale: 0.45, rotateY: 45,  translateX: -420, opacity: 0.4, zIndex: 2  },
  { scale: 0.6,  rotateY: 40,  translateX: -230, opacity: 0.7, zIndex: 5  },
  { scale: 0.8,  rotateY: 0,   translateX: 0,    opacity: 1.0, zIndex: 10 },
  { scale: 0.6,  rotateY: -40, translateX: 230,  opacity: 0.7, zIndex: 5  },
  { scale: 0.45, rotateY: -45, translateX: 420,  opacity: 0.4, zIndex: 2  },
];

const POSITIONS_TABLET = [
  HIDDEN,
  { scale: 0.88, rotateY: 15,  translateX: -180, opacity: 0.7, zIndex: 5  },
  { scale: 1.0,  rotateY: 0,   translateX: 0,    opacity: 1.0, zIndex: 10 },
  { scale: 0.88, rotateY: -15, translateX: 180,  opacity: 0.7, zIndex: 5  },
  HIDDEN,
];

const POSITIONS_MOBILE = [
  HIDDEN,
  { scale: 0.82, rotateY: 0,   translateX: -170, opacity: 0.55, zIndex: 5  },
  { scale: 1.0,  rotateY: 0,   translateX: 0,    opacity: 1.0,  zIndex: 10 },
  { scale: 0.82, rotateY: 0,   translateX: 170,  opacity: 0.55, zIndex: 5  },
  HIDDEN,
];

const carousel = document.getElementById("phone-carousel");
if (!carousel) throw new Error("Carousel element #phone-carousel not found");
const phones = Array.from(carousel.querySelectorAll(".phone-item"));
const total = phones.length;
let centerIndex = 0;
let animating = false;
let autoTimer;

function getPosition(domIndex) {
  return domIndex < VISIBLE_POSITIONS.length ? VISIBLE_POSITIONS[domIndex] : HIDDEN_POSITION;
}

function reorderDOM() {
  // Place 5 visible items (center ± 2) + remaining hidden
  const order = [];
  const visible = new Set();
  for (let i = -2; i <= 2; i++) {
    const idx = (centerIndex + i + total) % total;
    order.push(idx);
    visible.add(idx);
  }
  // Remaining items are hidden
  for (let i = 0; i < total; i++) {
    if (!visible.has(i)) order.push(i);
  }

  order.forEach(idx => carousel.appendChild(phones[idx]));
}

// Responsive scale factor for translateX
function getSpreadScale() {
  const w = window.innerWidth;
  if (w < BREAKPOINT_XS) return SPREAD_XS;
  if (w < BREAKPOINT_SM) return SPREAD_SM;
  if (w < BREAKPOINT_LG) return SPREAD_LG;
  return SPREAD_DEFAULT;
}

function applyPositions(transition) {
  const items = carousel.querySelectorAll(".phone-item");
  const spread = getSpreadScale();
  items.forEach((phone, domIndex) => {
    const pos = getPosition(domIndex);
    const tx = Math.round(pos.translateX * spread);
    if (transition) {
      phone.style.transition = `transform ${ANIMATION_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${ANIMATION_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    } else {
      phone.style.transition = 'none';
    }
    phone.style.transform = `translate(-50%, -50%) translateX(${tx}px) scale(${pos.scale}) rotateY(${pos.rotateY}deg)`;
    phone.style.opacity = pos.opacity;
    phone.style.zIndex = pos.zIndex;
  });
}

function goTo(newCenter, direction) {
  if (animating || newCenter === centerIndex) return;
  animating = true;
  centerIndex = newCenter;

  // 1. Reorder DOM to new center
  reorderDOM();

  // 2. Set starting positions (shifted by direction) without transition
  const items = carousel.querySelectorAll(".phone-item");
  const spread = getSpreadScale();
  const totalPositions = total;
  const shift = direction === 1 ? 1 : -1;
  items.forEach((phone, domIndex) => {
    // Start from the adjacent position (simulates where items were before the move)
    const fromIdx = Math.max(0, Math.min(totalPositions - 1, domIndex + shift));
    const fromPos = getPosition(fromIdx);
    const tx = Math.round(fromPos.translateX * spread);
    phone.style.transition = 'none';
    phone.style.transform = `translate(-50%, -50%) translateX(${tx}px) scale(${fromPos.scale}) rotateY(${fromPos.rotateY}deg)`;
    phone.style.opacity = fromPos.opacity;
    phone.style.zIndex = getPosition(domIndex).zIndex;
  });

  // 3. Force reflow
  void carousel.offsetHeight;

  // 4. Enable transitions, animate to correct positions
  applyPositions(true);

  setTimeout(() => {
    animating = false;
  }, ANIMATION_DURATION_MS);
}

function goNext() {
  goTo((centerIndex + 1) % total, 1);
}

function goPrev() {
  goTo((centerIndex - 1 + total) % total, -1);
}

// Initial render
reorderDOM();
applyPositions(false);

// Next / Prev buttons
document.getElementById("carousel-next")?.addEventListener("click", () => {
  goNext();
  resetAutoPlay();
});
document.getElementById("carousel-prev")?.addEventListener("click", () => {
  goPrev();
  resetAutoPlay();
});

// Autoplay (respect prefers-reduced-motion)
const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
let isPaused = reducedMotionMQ.matches;

function startAutoPlay() {
  if (autoTimer) clearInterval(autoTimer);
  if (isPaused) return;
  autoTimer = setInterval(goNext, AUTOPLAY_INTERVAL_MS);
}
function stopAutoPlay() {
  clearInterval(autoTimer);
  autoTimer = null;
}
function resetAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}
startAutoPlay();

// Pause autoplay when tab is not visible
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoPlay();
  } else {
    resetAutoPlay();
  }
});
