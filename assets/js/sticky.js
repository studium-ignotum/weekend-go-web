document.addEventListener('DOMContentLoaded', () => {
  const dismiss = document.getElementById('dismiss-sticky');
  const bar = document.getElementById('sticky-bar');
  if (!bar) return;

  let dismissed = false;
  if (dismiss) {
    dismiss.addEventListener('click', () => {
      dismissed = true;
      bar.classList.remove('show');
    });
  }

  window.addEventListener(
    'scroll',
    () => {
      if (dismissed) return;
      if (window.scrollY > 400) bar.classList.add('show');
      else bar.classList.remove('show');
    },
    { passive: true },
  );
});
