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
  { scale: 0.55, rotateY: 55,  translateX: -420, opacity: 0.4, zIndex: 2  },
  { scale: 0.75, rotateY: 40,  translateX: -230, opacity: 0.7, zIndex: 5  },
  { scale: 1.0,  rotateY: 0,   translateX: 0,    opacity: 1.0, zIndex: 10 },
  { scale: 0.75, rotateY: -40, translateX: 230,  opacity: 0.7, zIndex: 5  },
  { scale: 0.55, rotateY: -55, translateX: 420,  opacity: 0.4, zIndex: 2  },
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
let isScrollMode = false;
let cloneFirst = null;
let cloneLast = null;

function getViewportMode() {
  const w = window.innerWidth;
  if (w < BREAKPOINT_XS) return 'mobile';
  if (w < BREAKPOINT_MD) return 'tablet';
  return 'desktop';
}

function getPositions() {
  switch (getViewportMode()) {
    case 'mobile':  return POSITIONS_MOBILE;
    case 'tablet':  return POSITIONS_TABLET;
    default:        return POSITIONS_DESKTOP;
  }
}

function getPosition(domIndex) {
  const positions = getPositions();
  return domIndex < positions.length ? positions[domIndex] : HIDDEN;
}

function buildDots() {
  const container = document.getElementById('carousel-dots');
  if (!container) return;
  // Idempotent: clear first
  container.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Ảnh ${i + 1}`);
    dot.setAttribute('role', 'tab');
    dot.addEventListener('click', () => {
      if (getViewportMode() === 'mobile') return;  // decorative on mobile
      if (i === centerIndex) return;
      const direction = i > centerIndex ? 1 : -1;
      goTo(i, direction);
      resetAutoPlay();
    });
    container.appendChild(dot);
  }
}

function updateDots(active) {
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === active);
    dot.setAttribute('aria-selected', i === active ? 'true' : 'false');
  });
}

function initScrollMode() {
  if (isScrollMode) return;
  isScrollMode = true;

  phones.forEach(phone => { phone.style.cssText = ''; });

  cloneLast = phones[phones.length - 1].cloneNode(true);
  cloneFirst = phones[0].cloneNode(true);
  cloneLast.classList.add('clone');
  cloneFirst.classList.add('clone');
  cloneLast.setAttribute('aria-hidden', 'true');
  cloneFirst.setAttribute('aria-hidden', 'true');
  cloneLast.tabIndex = -1;
  cloneFirst.tabIndex = -1;
  carousel.prepend(cloneLast);
  carousel.append(cloneFirst);

  requestAnimationFrame(() => {
    scrollToIndex(centerIndex, 'instant');
    updateCenterClass();
  });

  if ('onscrollend' in carousel) {
    carousel.addEventListener('scrollend', handleScrollEnd);
  } else {
    carousel.addEventListener('scroll', debounceScrollEnd, { passive: true });
  }
}

function destroyScrollMode() {
  if (!isScrollMode) return;
  isScrollMode = false;

  if (cloneLast?.parentNode) cloneLast.remove();
  if (cloneFirst?.parentNode) cloneFirst.remove();
  cloneLast = null;
  cloneFirst = null;

  carousel.removeEventListener('scrollend', handleScrollEnd);
  carousel.removeEventListener('scroll', debounceScrollEnd);

  reorderDOM();
  applyPositions(false);
}

function scrollToIndex(idx, behavior) {
  const items = Array.from(carousel.children);
  // offset by 1 because clone-of-last is prepended at index 0
  const targetDomIdx = idx + 1;
  const target = items[targetDomIdx];
  if (!target) return;
  const containerWidth = carousel.offsetWidth;
  const scrollTarget = target.offsetLeft - (containerWidth - target.offsetWidth) / 2;
  carousel.scrollTo({ left: scrollTarget, behavior: behavior || 'smooth' });
}

function handleScrollEnd() {
  const scrollLeft = carousel.scrollLeft;
  const containerWidth = carousel.offsetWidth;
  const items = Array.from(carousel.children);

  let closestIdx = 0;
  let closestDist = Infinity;
  items.forEach((item, i) => {
    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    const dist = Math.abs(itemCenter - (scrollLeft + containerWidth / 2));
    if (dist < closestDist) { closestDist = dist; closestIdx = i; }
  });

  const item = items[closestIdx];

  if (item.classList.contains('clone')) {
    if (item === cloneLast) {
      centerIndex = phones.length - 1;
    } else {
      centerIndex = 0;
    }
    scrollToIndex(centerIndex, 'instant');
  } else {
    centerIndex = phones.indexOf(item);
    if (centerIndex === -1) centerIndex = 0;
  }

  updateDots(centerIndex);
  carousel.dataset.centerIndex = String(centerIndex);
  updateCenterClass();
}

function updateCenterClass() {
  if (!isScrollMode) return;
  const items = Array.from(carousel.children);
  const targetDomIdx = centerIndex + 1; // offset for prepended clone
  items.forEach((el, i) => el.classList.toggle('is-center', i === targetDomIdx));
}

let scrollEndTimer = null;
function debounceScrollEnd() {
  clearTimeout(scrollEndTimer);
  scrollEndTimer = setTimeout(handleScrollEnd, 100);
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

function applyPositions(transition) {
  if (isScrollMode) {
    updateDots(centerIndex);
    carousel.dataset.centerIndex = String(centerIndex);
    carousel.dataset.viewportMode = getViewportMode();
    return;
  }
  const items = carousel.querySelectorAll(".phone-item");
  items.forEach((phone, domIndex) => {
    const pos = getPosition(domIndex);
    phone.style.transition = transition
      ? `transform ${ANIMATION_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${ANIMATION_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
      : 'none';
    phone.style.transform = `translate(-50%, -50%) translateX(${pos.translateX}px) scale(${pos.scale}) rotateY(${pos.rotateY}deg)`;
    phone.style.opacity = pos.opacity;
    phone.style.zIndex = pos.zIndex;
  });
  // Expose state for tests
  carousel.dataset.centerIndex = String(centerIndex);
  carousel.dataset.viewportMode = getViewportMode();
  updateDots(centerIndex);
}

function goTo(newCenter, direction) {
  if (isScrollMode) {
    centerIndex = ((newCenter % total) + total) % total;
    scrollToIndex(centerIndex, 'smooth');
    updateDots(centerIndex);
    updateCenterClass();
    carousel.dataset.centerIndex = String(centerIndex);
    return;
  }
  if (animating || newCenter === centerIndex) return;
  animating = true;
  centerIndex = newCenter;

  reorderDOM();

  const items = carousel.querySelectorAll(".phone-item");
  const shift = direction === 1 ? 1 : -1;
  items.forEach((phone, domIndex) => {
    const fromIdx = Math.max(0, Math.min(items.length - 1, domIndex + shift));
    const fromPos = getPosition(fromIdx);
    phone.style.transition = 'none';
    phone.style.transform = `translate(-50%, -50%) translateX(${fromPos.translateX}px) scale(${fromPos.scale}) rotateY(${fromPos.rotateY}deg)`;
    phone.style.opacity = fromPos.opacity;
    phone.style.zIndex = getPosition(domIndex).zIndex;
  });

  void carousel.offsetHeight;

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
buildDots();
updateDots(centerIndex);

if (getViewportMode() !== 'desktop') {
  initScrollMode();
}

// Next / Prev buttons
document.getElementById("carousel-next")?.addEventListener("click", () => {
  goNext();
  resetAutoPlay();
});
document.getElementById("carousel-prev")?.addEventListener("click", () => {
  goPrev();
  resetAutoPlay();
});

// Swipe gestures (mobile + tablet)
let touchStart = null;
let touchLock = 'none';

function handleTouchStart(e) {
  if (isScrollMode) return;
  touchStart = {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY,
    t: performance.now(),
  };
  touchLock = 'none';
}

function handleTouchMove(e) {
  if (isScrollMode) return;
  if (!touchStart || touchLock !== 'none') return;
  const dx = Math.abs(e.touches[0].clientX - touchStart.x);
  const dy = Math.abs(e.touches[0].clientY - touchStart.y);
  if (Math.max(dx, dy) < SWIPE_DEADZONE_PX) return;
  // Lock direction: horizontal if dx/dy ratio above threshold, else vertical (release to page scroll)
  touchLock = (dx / (dy || 0.0001) > SWIPE_LOCK_RATIO) ? 'horizontal' : 'vertical';
  // NOTE: no preventDefault — touch-action: pan-y in CSS handles scroll intent
}

function handleTouchEnd(e) {
  if (isScrollMode) return;
  if (!touchStart) return;
  if (touchLock !== 'horizontal') {
    touchStart = null;
    touchLock = 'none';
    return;
  }
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dt = performance.now() - touchStart.t;
  const velocity = Math.abs(dx) / (dt || 1);
  const threshold = Math.max(SWIPE_DISTANCE_MIN_PX, carousel.offsetWidth * SWIPE_DISTANCE_RATIO);
  const triggered = Math.abs(dx) >= threshold || velocity >= SWIPE_VELOCITY_FLICK;
  if (triggered) {
    if (dx < 0) goNext(); else goPrev();
    resetAutoPlay();
  }
  touchStart = null;
  touchLock = 'none';
}

carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
carousel.addEventListener('touchmove',  handleTouchMove,  { passive: true });
carousel.addEventListener('touchend',   handleTouchEnd,   { passive: true });

// Resize — debounced, re-apply layout when viewport mode changes
let lastViewportMode = getViewportMode();
let resizeTimer = null;
function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const current = getViewportMode();
    if (current !== lastViewportMode) {
      lastViewportMode = current;
      if (current === 'desktop') {
        destroyScrollMode();
      } else {
        initScrollMode();
      }
    }
  }, 150);
}
window.addEventListener('resize', handleResize);

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

// Reduced-motion change listener — re-apply (no-op for mobile since it's already flat)
reducedMotionMQ.addEventListener('change', (e) => {
  isPaused = e.matches;
  if (isPaused) stopAutoPlay(); else startAutoPlay();
  // Desktop/tablet transforms are driven by POSITIONS arrays — don't need to change them here,
  // but if user prefers reduced motion, it's a CSS concern (transition: none via @media).
});

carousel.dataset.centerIndex = String(centerIndex);
carousel.dataset.viewportMode = getViewportMode();

// Pause autoplay when tab is not visible
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoPlay();
  } else {
    resetAutoPlay();
  }
});
