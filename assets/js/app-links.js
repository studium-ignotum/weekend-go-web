(function () {
  function trackEvent(name, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }
  }

  document.addEventListener('click', (event) => {
    const appLink = event.target.closest('a[data-app-link]');
    if (appLink) {
      trackEvent('app_download_cta_tapped', {
        destination_url: appLink.href,
        placement: appLink.dataset.appLinkPlacement || 'unknown',
        platform: appLink.dataset.appLink,
      });
      return;
    }

    const planWebLink = event.target.closest('a[data-plan-web-link]');
    if (planWebLink) {
      trackEvent('plan_web_view_opened', {
        destination_url: planWebLink.href,
        placement: planWebLink.dataset.planWebPlacement || 'unknown',
      });
    }
  });
})();
