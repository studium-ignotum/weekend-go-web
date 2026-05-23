// Phone carousel — ported from legacy inline script.
// Coverflow with data-offset attribute set on .phone-slide nodes;
// styling in assets/css/carousel.css handles transform/opacity.

(function initPhoneCarousel() {
  const carousel = document.getElementById('phone-carousel');
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll('.phone-slide'));
  if (!slides.length) return;
  const total = slides.length;
  const titleEl = document.getElementById('carousel-title');
  const descEl = document.getElementById('carousel-desc');
  const dots = Array.from(document.querySelectorAll('#carousel-dots [data-dot]'));
  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');
  let active = 0;
  let autoOn = true;

  function render() {
    slides.forEach((slide, i) => {
      let diff = i - active;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;
      const offset = Math.abs(diff) > 2 ? 'far' : String(diff);
      slide.setAttribute('data-offset', offset);
      slide.setAttribute('aria-hidden', String(diff !== 0));
    });
    const cur = slides[active];
    if (titleEl) titleEl.textContent = cur.dataset.title || '';
    if (descEl) descEl.textContent = cur.dataset.desc || '';
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === active);
      d.setAttribute('aria-selected', String(i === active));
    });
  }

  function go(i) {
    active = ((i % total) + total) % total;
    render();
  }

  prevBtn &&
    prevBtn.addEventListener('click', () => {
      autoOn = false;
      go(active - 1);
    });
  nextBtn &&
    nextBtn.addEventListener('click', () => {
      autoOn = false;
      go(active + 1);
    });
  dots.forEach((d, i) =>
    d.addEventListener('click', () => {
      autoOn = false;
      go(i);
    }),
  );

  // Click a side phone to jump to it
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      if (i !== active) {
        autoOn = false;
        go(i);
      }
    });
  });

  // Keyboard navigation
  carousel.setAttribute('tabindex', '0');
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      autoOn = false;
      go(active + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      autoOn = false;
      go(active - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      autoOn = false;
      go(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      autoOn = false;
      go(total - 1);
    }
  });

  // Touch swipe
  let touchStartX = null;
  carousel.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );
  carousel.addEventListener('touchend', (e) => {
    if (touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      autoOn = false;
      go(active + (dx < 0 ? 1 : -1));
    }
    touchStartX = null;
  });

  // Auto-rotate — respects reduced-motion, pauses on interaction
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    setInterval(() => {
      if (!autoOn) return;
      go(active + 1);
    }, 4500);
  }

  render();
})();
