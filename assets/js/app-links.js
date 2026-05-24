(function () {
  const APP_LINKS = {
    ios: 'https://apps.apple.com/vn/app/cu%E1%BB%91i-tu%E1%BA%A7n-%C4%91i-%C4%91%C3%A2u/id6765682490',
    android:
      'https://github.com/unknown-studio-dev/weekend-go-android-distribution/releases/download/v1.0.3/cuoituandidauv1.0.3.apk',
  };

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

  function boot() {
    document.querySelectorAll('a[data-app-link]').forEach((el) => {
      const url = APP_LINKS[el.dataset.appLink];
      if (url) el.href = url;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
