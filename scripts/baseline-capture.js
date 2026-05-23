// Baseline screenshot capture for index.html across 4 viewports
// Records overflow, lazy-load gaps, and basic nav info.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR =
  '/Users/thuylenguyenmai/Desktop/01_Work/Unknown Studio/Cutadida/.hoangsa/sessions/design/index-responsive/baseline';
const URL = 'http://localhost:3030/index.html';

const viewports = [
  { name: 'mobile', file: 'index-mobile-375.png', width: 375, height: 812 },
  { name: 'tablet', file: 'index-tablet-768.png', width: 768, height: 1024 },
  { name: 'desktop', file: 'index-desktop-1280.png', width: 1280, height: 800 },
  { name: 'wide', file: 'index-wide-1440.png', width: 1440, height: 900 },
];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const results = [];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    // Wait for fonts/images
    await page.waitForTimeout(800);

    const data = await page.evaluate(() => {
      const horizontalOverflow = document.documentElement.scrollWidth - window.innerWidth;
      const imgs = Array.from(document.images);
      const imgsNoLoading = imgs.filter((i) => !i.hasAttribute('loading')).length;
      const totalImgs = imgs.length;

      // Nav visibility heuristics
      const nav = document.querySelector('nav, header nav, [role="navigation"]');
      const navVisible = nav ? !!(nav.offsetWidth || nav.offsetHeight) : false;

      // Hamburger button
      const hamburger = document.querySelector(
        '[data-mobile-toggle], [aria-label*="menu" i], .hamburger, button[aria-controls]',
      );
      const hamburgerPresent = !!hamburger;
      let hamburgerVisible = false;
      if (hamburger) {
        const r = hamburger.getBoundingClientRect();
        const style = window.getComputedStyle(hamburger);
        hamburgerVisible =
          r.width > 0 && r.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      }

      // Page scroll height
      const docHeight = document.documentElement.scrollHeight;

      // Sections present
      const sectionIds = Array.from(document.querySelectorAll('section[id], [id]'))
        .map((e) => e.id)
        .filter(Boolean)
        .slice(0, 30);

      return {
        horizontalOverflow,
        totalImgs,
        imgsNoLoading,
        navVisible,
        hamburgerPresent,
        hamburgerVisible,
        docHeight,
        sectionIds,
      };
    });

    // Try toggling hamburger if present on mobile/tablet
    let hamburgerToggleWorked = null;
    if ((vp.name === 'mobile' || vp.name === 'tablet') && data.hamburgerPresent) {
      try {
        const before = await page.evaluate(() => {
          const m = document.querySelector(
            '#mobile-menu, [data-mobile-menu], nav ul[hidden], .mobile-menu',
          );
          return m ? window.getComputedStyle(m).display : null;
        });
        await page
          .click('[data-mobile-toggle], [aria-label*="menu" i], .hamburger, button[aria-controls]')
          .catch(() => {});
        await page.waitForTimeout(300);
        const after = await page.evaluate(() => {
          const m = document.querySelector(
            '#mobile-menu, [data-mobile-menu], nav ul[hidden], .mobile-menu',
          );
          return m ? window.getComputedStyle(m).display : null;
        });
        hamburgerToggleWorked = before !== after;
      } catch (e) {
        hamburgerToggleWorked = false;
      }
    }

    const filePath = path.join(OUT_DIR, vp.file);
    await page.screenshot({ path: filePath, fullPage: true });

    results.push({ vp, data, hamburgerToggleWorked, filePath });
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT_DIR, '_capture-data.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
})();
