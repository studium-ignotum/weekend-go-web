document.addEventListener('DOMContentLoaded', () => {
  const dismiss = document.getElementById('dismiss-sticky');
  const bar = document.getElementById('sticky-bar');
  if (!dismiss || !bar) return;
  dismiss.addEventListener('click', () => bar.classList.add('hidden'));
});
