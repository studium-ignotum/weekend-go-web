const { test, expect } = require('@playwright/test');

const PAGES = [
  { path: '/',                         name: 'index' },
  { path: '/privacy.html',             name: 'privacy' },
  { path: '/terms.html',               name: 'terms' },
  { path: '/community-standards.html', name: 'community-standards' },
];

for (const page of PAGES) {
  test(`${page.name} visual`, async ({ page: p }) => {
    await p.goto(page.path);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForLoadState('networkidle');
    await p.evaluate(() => {
      const toggle = document.getElementById('carousel-toggle');
      if (toggle && toggle.dataset.state === 'playing') toggle.click();
    });
    await expect(p).toHaveScreenshot(`${page.name}.png`, { fullPage: true });
  });
}
