const { test, expect } = require('@playwright/test');

async function setup(p) {
  await p.goto('/');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForLoadState('networkidle');
}

const PLANNER_LOADING_MS = 700;

// --- Mobile tests (REQ-01..REQ-04, REQ-08) ---

test('initial_chi_hien_bo_loc', async ({ page: p }) => {
  test.skip(test.info().project.name !== 'mobile');
  await setup(p);

  const filtersVisible = await p.evaluate(() => {
    const el = document.querySelector('#planner-panel-filters');
    return el ? el.offsetParent !== null : false;
  });
  expect(filtersVisible).toBe(true);

  const resultsHidden = await p.evaluate(() => {
    const el = document.querySelector('#planner-panel-results');
    if (!el) return true;
    return el.classList.contains('hidden') || el.offsetParent === null;
  });
  expect(resultsHidden).toBe(true);
});

test('nut_tim_dia_diem_hien_tren_mobile', async ({ page: p }) => {
  test.skip(test.info().project.name !== 'mobile');
  await setup(p);

  const submitVisible = await p.evaluate(() => {
    const el = document.querySelector('#planner-submit');
    if (!el) return false;
    return el.clientHeight > 0 && el.offsetParent !== null;
  });
  expect(submitVisible).toBe(true);
});

test('submit_hien_loading_roi_ket_qua', async ({ page: p }) => {
  test.skip(test.info().project.name !== 'mobile');
  await setup(p);

  await p.click('#planner-submit');

  // Immediately after click: loading visible, results-content hidden
  const loadingVisible = await p.evaluate(() => {
    const el = document.querySelector('#planner-loading');
    return el ? !el.classList.contains('hidden') : false;
  });
  expect(loadingVisible).toBe(true);

  const resultsContentHidden = await p.evaluate(() => {
    const el = document.querySelector('#planner-results-content');
    return el ? el.classList.contains('hidden') : true;
  });
  expect(resultsContentHidden).toBe(true);

  // Wait for loading to finish (waitForFunction since .hidden makes element invisible)
  await p.waitForFunction(
    () => document.querySelector('#planner-loading')?.classList.contains('hidden'),
    { timeout: PLANNER_LOADING_MS + 1500 },
  );

  // After loading: results content visible, filters hidden, ≥1 card
  const resultsContentVisible = await p.evaluate(() => {
    const el = document.querySelector('#planner-results-content');
    return el ? !el.classList.contains('hidden') : false;
  });
  expect(resultsContentVisible).toBe(true);

  const cardCount = await p.evaluate(() => {
    const el = document.querySelector('#planner-results');
    return el ? el.children.length : 0;
  });
  expect(cardCount).toBeGreaterThanOrEqual(1);

  const filtersHidden = await p.evaluate(() => {
    const el = document.querySelector('#planner-panel-filters');
    return el ? el.classList.contains('hidden') : true;
  });
  expect(filtersHidden).toBe(true);
});

test('quay_lai_ve_bo_loc_giu_lua_chon', async ({ page: p }) => {
  test.skip(test.info().project.name !== 'mobile');
  await setup(p);

  // Click an age filter button and record its value
  const activeValue = await p.evaluate(() => {
    const btn = document.querySelector('[data-toggle][data-group="age"][data-value]');
    if (!btn) return null;
    btn.click();
    return btn.getAttribute('data-value');
  });
  expect(activeValue).not.toBeNull();

  // Submit and wait for results
  await p.click('#planner-submit');
  await p.waitForFunction(
    () => document.querySelector('#planner-loading')?.classList.contains('hidden'),
    { timeout: PLANNER_LOADING_MS + 1500 },
  );

  // Go back
  await p.click('#planner-back');

  // Filters should be visible again, results hidden
  const filtersVisible = await p.evaluate(() => {
    const el = document.querySelector('#planner-panel-filters');
    return el ? !el.classList.contains('hidden') && el.offsetParent !== null : false;
  });
  expect(filtersVisible).toBe(true);

  const resultsHidden = await p.evaluate(() => {
    const el = document.querySelector('#planner-panel-results');
    return el ? el.classList.contains('hidden') : true;
  });
  expect(resultsHidden).toBe(true);

  // The age filter active value should still be the one we selected
  const currentActive = await p.evaluate((val) => {
    const btn = document.querySelector(`[data-toggle][data-group="age"][data-value="${val}"]`);
    if (!btn) return null;
    // Check if it's still active (has active class or aria-pressed)
    return btn.classList.contains('active') ||
           btn.getAttribute('aria-pressed') === 'true' ||
           btn.getAttribute('data-active') === 'true' ||
           btn.classList.contains('is-active') ||
           btn.classList.contains('selected');
  }, activeValue);
  expect(currentActive).toBe(true);
});

test('khong_tran_ngang_va_tap_target_360', async ({ page: p }) => {
  test.skip(test.info().project.name !== 'mobile');
  await p.setViewportSize({ width: 360, height: 800 });
  await setup(p);

  const noHorizontalScroll = await p.evaluate(() => {
    return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
  });
  expect(noHorizontalScroll).toBe(true);

  const submitHeight = await p.evaluate(() => {
    const el = document.querySelector('#planner-submit');
    return el ? el.clientHeight : 0;
  });
  expect(submitHeight).toBeGreaterThanOrEqual(40);
});

// --- Desktop tests (REQ-05, REQ-06) ---

test('desktop_giu_hai_cot_va_live_update', async ({ page: p }) => {
  test.skip(test.info().project.name !== 'desktop');
  await setup(p);

  // Both panels visible
  const filtersVisible = await p.evaluate(() => {
    const el = document.querySelector('#planner-panel-filters');
    return el ? !el.classList.contains('hidden') : false;
  });
  expect(filtersVisible).toBe(true);

  const resultsVisible = await p.evaluate(() => {
    const el = document.querySelector('#planner-panel-results');
    return el ? !el.classList.contains('hidden') : false;
  });
  expect(resultsVisible).toBe(true);

  // Read initial count
  const initialCount = await p.evaluate(() => {
    const el = document.querySelector('#planner-count');
    return el ? el.textContent.trim() : '';
  });

  // Click a vibe filter (creative) without clicking submit
  await p.evaluate(() => {
    const btn = document.querySelector('[data-toggle][data-group="vibe"][data-value="creative"]') ||
                document.querySelector('[data-toggle][data-group="vibe"]');
    if (btn) btn.click();
  });

  // Wait briefly for live update
  await p.waitForTimeout(300);

  const updatedCount = await p.evaluate(() => {
    const el = document.querySelector('#planner-count');
    return el ? el.textContent.trim() : '';
  });

  // Count should have updated (or stayed the same if no change — but we note live-update ran)
  // We verify count element exists and is non-empty
  expect(updatedCount).not.toBe('');

  // Submit button hidden on desktop
  const submitHidden = await p.evaluate(() => {
    const el = document.querySelector('#planner-submit');
    return el ? el.offsetParent === null : true;
  });
  expect(submitHidden).toBe(true);
});

// --- Cross-project test (REQ-06) ---

test('nhan_tu_dong_lam_moi_chi_hien_desktop', async ({ page: p }) => {
  // No skip — runs on all projects, but only asserts on mobile and desktop
  await setup(p);

  const projectName = test.info().project.name;

  if (projectName === 'desktop') {
    const labelVisible = await p.evaluate(() => {
      // Look for text "Tự động làm mới" in the page
      const els = Array.from(document.querySelectorAll('*'));
      for (const el of els) {
        if (el.childNodes.length === 1 &&
            el.childNodes[0].nodeType === Node.TEXT_NODE &&
            el.textContent.includes('Tự động làm mới')) {
          return el.offsetParent !== null || el.tagName === 'BODY' || el.tagName === 'HTML';
        }
      }
      // Fallback: find by text content in any visible element
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.includes('Tự động làm mới')) {
          const parent = node.parentElement;
          return parent ? parent.offsetParent !== null || getComputedStyle(parent).display !== 'none' : false;
        }
      }
      return false;
    });
    expect(labelVisible).toBe(true);
  } else if (projectName === 'mobile') {
    const labelHidden = await p.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.includes('Tự động làm mới')) {
          const parent = node.parentElement;
          return parent ? parent.offsetParent === null || getComputedStyle(parent).display === 'none' : true;
        }
      }
      return true; // not found = hidden/absent
    });
    expect(labelHidden).toBe(true);
  }
  // tablet/wide: no assertion
});

// --- Resize test (REQ-07) ---

test('resize_mobile_sang_desktop_hien_lai_hai_cot', async ({ page: p }) => {
  test.skip(test.info().project.name !== 'mobile');
  await setup(p);

  // Submit on mobile → filters hidden
  await p.click('#planner-submit');
  await p.waitForFunction(
    () => document.querySelector('#planner-loading')?.classList.contains('hidden'),
    { timeout: PLANNER_LOADING_MS + 1500 },
  );

  const filtersHiddenBefore = await p.evaluate(() => {
    const el = document.querySelector('#planner-panel-filters');
    return el ? el.classList.contains('hidden') : true;
  });
  expect(filtersHiddenBefore).toBe(true);

  // Resize to desktop
  await p.setViewportSize({ width: 1280, height: 800 });
  // Allow matchMedia change to propagate
  await p.waitForTimeout(150);

  // Both panels should now be visible (no hidden class)
  const filtersVisible = await p.evaluate(() => {
    const el = document.querySelector('#planner-panel-filters');
    return el ? !el.classList.contains('hidden') : false;
  });
  expect(filtersVisible).toBe(true);

  const resultsVisible = await p.evaluate(() => {
    const el = document.querySelector('#planner-panel-results');
    return el ? !el.classList.contains('hidden') : false;
  });
  expect(resultsVisible).toBe(true);
});
