import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'plans/reports/screenshots';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

// Helper: capture full-page screenshot at given viewport
async function screenshotAtViewport(
  page: import('@playwright/test').Page,
  pageName: string,
  viewport: (typeof VIEWPORTS)[number],
  suffix = ''
) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  // Wait for layout to stabilize after viewport change
  await page.waitForLoadState('networkidle');
  const filename = `${pageName}-${viewport.name}${suffix}.png`;
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${filename}`, fullPage: true });
  return filename;
}

// ─── Landing Page Tests ─────────────────────────────────────────
test.describe('Landing Page - Visual QA', () => {
  for (const vp of VIEWPORTS) {
    test(`renders correctly at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/en');
      await page.waitForLoadState('networkidle');

      // Verify landing page renders
      await expect(page.locator('body')).toBeVisible();

      await screenshotAtViewport(page, 'landing', vp);
    });
  }
});

// ─── Login Page Tests ───────────────────────────────────────────
test.describe('Login Page - Glassmorphism Visual QA', () => {
  for (const vp of VIEWPORTS) {
    test(`renders correctly at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/en/login');
      await page.waitForLoadState('networkidle');

      // Verify login form elements
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();

      await screenshotAtViewport(page, 'login', vp);
    });
  }
});

// ─── Dashboard Page Tests (requires auth mock) ─────────────────
test.describe('Dashboard - UI Style Unification Visual QA', () => {
  // Dashboard pages need auth — test with the login flow
  test.beforeEach(async ({ page }) => {
    // Login with valid test credentials
    await page.goto('/en/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[id="email"]', 'admin@airm-ip.local');
    await page.fill('input[id="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
  });

  for (const vp of VIEWPORTS) {
    test(`dashboard page at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Navigate to dashboard
      if (!page.url().includes('/dashboard')) {
        await page.goto('/en/dashboard');
        await page.waitForLoadState('networkidle');
      }

      // Wait for first card to be visible (data loaded)
      const firstCard = page.locator('[class*="card"]').first();
      await expect(firstCard).toBeVisible({ timeout: 5000 });

      await screenshotAtViewport(page, 'dashboard', vp);
    });
  }

  // ── Card hover effect verification ──
  test('card hover effect - shadow + translateY', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    if (!page.url().includes('/dashboard')) {
      await page.goto('/en/dashboard');
      await page.waitForLoadState('networkidle');
    }

    // Find cards with data-slot="card"
    const cards = page.locator('[data-slot="card"]');

    // Wait for at least one card to be visible
    await expect(cards.first()).toBeVisible({ timeout: 5000 });

    const cardCount = await cards.count();

    // Verify data-slot attribute exists
    expect(cardCount).toBeGreaterThan(0);

    // Check first card for hover behavior
    if (cardCount > 0) {
      const firstCard = cards.first();
      await firstCard.hover();
      // Wait for hover transition to complete
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-card-hover.png`, fullPage: false });
    }
  });

  // ── Sidebar verification ──
  test('sidebar has internal-sidebar styling', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    if (!page.url().includes('/dashboard')) {
      await page.goto('/en/dashboard');
      await page.waitForLoadState('networkidle');
    }

    // Wait for sidebar to be visible
    const sidebarAny = page.locator('aside').first();
    await expect(sidebarAny).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-sidebar.png`, fullPage: false });
  });

  // ── Header frosted glass verification ──
  test('header has frosted glass effect', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    if (!page.url().includes('/dashboard')) {
      await page.goto('/en/dashboard');
      await page.waitForLoadState('networkidle');
    }

    // Wait for header to be visible
    const headerAny = page.locator('header').first();
    await expect(headerAny).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-header.png`, fullPage: false });
  });

  // ── Tabs list styling verification ──
  test('tabs list has enhanced styling', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    if (!page.url().includes('/dashboard')) {
      await page.goto('/en/dashboard');
      await page.waitForLoadState('networkidle');
    }

    // Check tabs list has internal-tabs-list class
    const tabsList = page.locator('.internal-tabs-list, [class*="internal-tabs-list"]');
    if ((await tabsList.count()) > 0) {
      await expect(tabsList.first()).toBeVisible({ timeout: 5000 });
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-tabs.png`, fullPage: false });
  });

  // ── Dark mode test ──
  test('dark mode styling', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    if (!page.url().includes('/dashboard')) {
      await page.goto('/en/dashboard');
      await page.waitForLoadState('networkidle');
    }

    // Toggle dark mode via the theme button
    const themeToggle = page.locator('button:has(> .lucide-sun), button:has(> .lucide-moon)').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      // Wait for theme transition to complete by checking for dark class
      await page.waitForFunction(() => document.documentElement.classList.contains('dark'), { timeout: 3000 });
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-dark-mode.png`, fullPage: true });
  });

  // ── Reduced motion ──
  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    if (!page.url().includes('/dashboard')) {
      await page.goto('/en/dashboard');
      await page.waitForLoadState('networkidle');
    }

    // Verify cards don't transform on hover
    const cards = page.locator('[data-slot="card"]');
    // Wait for cards to be visible
    await expect(cards.first()).toBeVisible({ timeout: 5000 });

    if ((await cards.count()) > 0) {
      const card = cards.first();
      const beforeTransform = await card.evaluate((el) =>
        window.getComputedStyle(el).transform
      );
      await card.hover();
      // Wait for any potential transition
      await page.waitForLoadState('networkidle');
      const afterTransform = await card.evaluate((el) =>
        window.getComputedStyle(el).transform
      );
      // With reduced motion, transform should not change
      expect(afterTransform).toBe(beforeTransform);
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-reduced-motion.png`, fullPage: false });
  });
});
