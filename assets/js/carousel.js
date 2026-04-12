// Breakpoints (aligned with Tailwind)
const BREAKPOINT_XS = 480;
const BREAKPOINT_SM = 640;
const BREAKPOINT_LG = 1024;

// Spread scale factors per breakpoint
const SPREAD_XS = 0.38;
const SPREAD_SM = 0.5;
const SPREAD_LG = 0.7;
const SPREAD_DEFAULT = 1.0;

// CoverFlow Carousel
const ANIMATION_DURATION_MS = 600;
const AUTOPLAY_INTERVAL_MS = 3000;

const carousel = document.getElementById("phone-carousel");
const phones = Array.from(carousel.querySelectorAll(".phone-item"));
const total = phones.length;
let centerIndex = 0;
let animating = false;
let autoTimer;

// CoverFlow position configs
const COVERFLOW_POSITIONS = [
  // DOM index 0: far-left (-2)
  { scale: 0.55, rotateY: 55,  translateX: -420, opacity: 0.4, zIndex: 2  },
  // DOM index 1: left (-1)
  { scale: 0.75, rotateY: 40,  translateX: -230, opacity: 0.7, zIndex: 5  },
  // DOM index 2: center
  { scale: 1.0,  rotateY: 0,   translateX: 0,    opacity: 1.0, zIndex: 10 },
  // DOM index 3: right (+1)
  { scale: 0.75, rotateY: -40, translateX: 230,  opacity: 0.7, zIndex: 5  },
  // DOM index 4: far-right (+2)
  { scale: 0.55, rotateY: -55, translateX: 420,  opacity: 0.4, zIndex: 2  },
  // DOM index 5: hidden (behind)
  { scale: 0.5,  rotateY: 0,   translateX: 0,    opacity: 0,   zIndex: 0  },
  // DOM index 6: hidden (behind)
  { scale: 0.5,  rotateY: 0,   translateX: 0,    opacity: 0,   zIndex: 0  },
];

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
    const pos = COVERFLOW_POSITIONS[domIndex];
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

  // 1. Disable transitions, reorder DOM
  applyPositions(false);
  reorderDOM();

  // 2. Set starting positions (shifted by direction) without transition
  const items = carousel.querySelectorAll(".phone-item");
  const spread = getSpreadScale();
  const shift = direction === 1 ? 1 : -1;
  items.forEach((phone, domIndex) => {
    // Start from the adjacent position (simulates where items were before the move)
    const fromIdx = Math.max(0, Math.min(COVERFLOW_POSITIONS.length - 1, domIndex + shift));
    const fromPos = COVERFLOW_POSITIONS[fromIdx];
    const tx = Math.round(fromPos.translateX * spread);
    phone.style.transition = 'none';
    phone.style.transform = `translate(-50%, -50%) translateX(${tx}px) scale(${fromPos.scale}) rotateY(${fromPos.rotateY}deg)`;
    phone.style.opacity = fromPos.opacity;
    phone.style.zIndex = COVERFLOW_POSITIONS[domIndex].zIndex;
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
document.getElementById("carousel-next").addEventListener("click", () => {
  goNext();
  resetAutoPlay();
});
document.getElementById("carousel-prev").addEventListener("click", () => {
  goPrev();
  resetAutoPlay();
});

// Autoplay
function startAutoPlay() {
  autoTimer = setInterval(goNext, AUTOPLAY_INTERVAL_MS);
}
function resetAutoPlay() {
  clearInterval(autoTimer);
  startAutoPlay();
}
startAutoPlay();
