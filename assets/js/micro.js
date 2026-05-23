/* Micro-interactions — ported from legacy inline script
 * Scroll progress, nav active section, hero count-up, hero rotate, scroll reveal.
 */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Scroll progress bar =====
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY / max) * 100 : 0;
      progressBar.style.width = p + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ===== Nav active section highlight =====
  const navLinks = document.querySelectorAll('header nav a[href^="#"]');
  if (navLinks.length) {
    const sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = '#' + e.target.id;
            navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
          }
        });
      },
      { rootMargin: '-30% 0px -65% 0px' },
    );
    document.querySelectorAll('section[id]').forEach((s) => sectionObs.observe(s));
  }

  // ===== Hero count-up =====
  const countEl = document.querySelector('[data-count-target]');
  if (countEl) {
    const target = parseInt(countEl.dataset.countTarget, 10);
    const suffix = countEl.dataset.countSuffix || '';
    let ran = false;
    const countObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !ran) {
            ran = true;
            const dur = 1400;
            const start = performance.now();
            const tick = (now) => {
              const t = Math.min((now - start) / dur, 1);
              const eased = 1 - Math.pow(1 - t, 3);
              countEl.textContent = Math.floor(eased * target) + suffix;
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 },
    );
    countObs.observe(countEl);
  }

  // ===== Hero rotating suggestion =====
  const rotateEl = document.getElementById('hero-rotate-suggestion');
  if (rotateEl && !reduceMotion) {
    const items = [
      {
        title: 'Nông trại đồng quê mộc',
        quote: '"Ủng hộ con lội mương bắt cá, giã bánh trôi mướt mồ hôi..."',
      },
      {
        title: 'Trekking nhỏ Núi Hàm Lợn',
        quote: '"Lối mòn rất êm, bé 5 tuổi đi được, nhiều bóng mát."',
      },
      {
        title: 'Bảo tàng Dân tộc học VN',
        quote: '"Múa rối nước cực vui, có sân chơi rộng cho trẻ con chạy."',
      },
    ];
    let ri = 0;
    const titleEl = rotateEl.querySelector('[data-rotate-title]');
    const quoteEl = rotateEl.querySelector('[data-rotate-quote]');
    setInterval(() => {
      ri = (ri + 1) % items.length;
      rotateEl.style.opacity = '0';
      setTimeout(() => {
        if (titleEl) titleEl.textContent = items[ri].title;
        if (quoteEl) quoteEl.textContent = items[ri].quote;
        rotateEl.style.opacity = '1';
      }, 250);
    }, 5000);
  }

  // ===== Scroll reveal =====
  if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));
  }
})();
