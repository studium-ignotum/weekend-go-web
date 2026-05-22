const APP_LINKS = {
  ios: 'https://apps.apple.com/vn/app/cu%E1%BB%91i-tu%E1%BA%A7n-%C4%91i-%C4%91%C3%A2u/id6765682490',
  android:
    'https://github.com/unknown-studio-dev/weekend-go-android-distribution/releases/download/v1.0.3/cuoituandidauv1.0.3.apk',
};

document.querySelectorAll('a[data-app-link]').forEach((el) => {
  const url = APP_LINKS[el.dataset.appLink];
  if (url) el.href = url;
});
