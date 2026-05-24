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
