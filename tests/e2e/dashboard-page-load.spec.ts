import { test, expect } from '@playwright/test';

// Increase timeout for dashboard tests which require data loading
test.setTimeout(90000);

test.describe('Dashboard Page Load', () => {
  test.beforeEach(async ({ page }) => {
    // Session is pre-authenticated via storageState — navigate directly
    await page.goto('/en/dashboard', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForSelector('[class*="card"], [data-slot="card"]', { timeout: 20000 });
  });

  test('should load dashboard successfully after login', async ({ page }) => {
    expect(page.url()).toContain('/en/dashboard');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('should display stat cards with data', async ({ page }) => {
    // Wait for stat data to load (stat cards show numeric values like "0", "85%")
    const statCards = page.locator('[data-slot="card"]');
    await expect(statCards.first()).toBeVisible({ timeout: 10000 });

    const cardCount = await statCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(4);
  });

  test('should display dashboard heading and breadcrumb', async ({ page }) => {
    // Executive Dashboard heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 5000 });
    const headingText = await heading.textContent();
    expect(headingText).toBeTruthy();

    // Breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible({ timeout: 5000 });
  });

  test('should display sidebar navigation', async ({ page }) => {
    const sidebar = page.locator('aside, [data-sidebar]').first();
    await expect(sidebar).toBeVisible({ timeout: 5000 });

    // Verify key nav links exist
    const dashboardLink = page.locator('a[href*="/dashboard"]');
    await expect(dashboardLink.first()).toBeVisible({ timeout: 3000 });
  });

  test('should display widget controls', async ({ page }) => {
    // Bento grid layout has customize button
    const customizeBtn = page.getByRole('button', { name: /Customize/i });
    if ((await customizeBtn.count()) > 0) {
      await expect(customizeBtn.first()).toBeVisible({ timeout: 5000 });
    }

    // Widget controls (minimize/hide) should be present
    const widgetButtons = page.getByRole('button', { name: /Minimize|Hide widget|Drag to reorder/i });
    expect(await widgetButtons.count()).toBeGreaterThan(0);
  });

  test('should have multiple widget sections', async ({ page }) => {
    // Dashboard should have at least 4 widget/card sections
    const widgets = page.locator('[data-slot="card"]');
    const count = await widgets.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });
});
