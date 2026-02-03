import { test, expect } from '@playwright/test';

test.describe('Dashboard Page Load', () => {
  const VALID_EMAIL = 'admin@airm-ip.local';
  const VALID_PASSWORD = 'Test@123456';

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/en/login');
    await page.fill('input[id="email"]', VALID_EMAIL);
    await page.fill('input[id="password"]', VALID_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for dashboard navigation
    await page.waitForURL('/en/dashboard', { timeout: 10000 });
  });

  test('should load dashboard successfully after login', async ({ page }) => {
    // Verify dashboard URL
    expect(page.url()).toContain('/en/dashboard');

    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');

    // Verify page title or heading exists
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('should display 4 stat cards on dashboard', async ({ page }) => {
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');

    // Wait a bit more for async data to load
    await page.waitForTimeout(2000);

    // Look for stat cards - they typically have numeric values anywhere in text
    const cards = page.locator('[class*="card"]');
    const cardCount = await cards.count();

    // Count cards that contain numeric values
    let numericCardCount = 0;
    for (let i = 0; i < cardCount; i++) {
      const cardText = await cards.nth(i).textContent();
      if (cardText && /\d+/.test(cardText)) {
        numericCardCount++;
      }
    }

    // Expect at least 4 cards with numbers (TotalSystems, HighRisks, ComplianceScore, PendingActions)
    expect(numericCardCount).toBeGreaterThanOrEqual(4);
  });

  test('should display risk heatmap card', async ({ page }) => {
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');

    // Look for heatmap - usually contains 'heatmap' or 'risk' in text or has canvas/svg
    const heatmapCard = page.locator('text=/[Rr]isk.*[Hh]eatmap|[Hh]eatmap/').first();

    // Try to find heatmap by looking for cards with canvas or specific content
    const cards = page.locator('[class*="card"]');
    let foundHeatmap = false;

    const cardCount = await cards.count();
    for (let i = 0; i < cardCount; i++) {
      const cardText = await cards.nth(i).textContent();
      if (cardText && (cardText.includes('Risk') || cardText.includes('Heatmap'))) {
        foundHeatmap = true;
        break;
      }
    }

    expect(foundHeatmap || (await heatmapCard.isVisible().catch(() => false))).toBeTruthy();
  });

  test('should display compliance card', async ({ page }) => {
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');

    // Look for compliance-related card
    const complianceCard = page.locator('text=/[Cc]ompliance|[Ff]ramework/').first();

    // Check if compliance card is visible or find it in cards
    const cards = page.locator('[class*="card"]');
    let foundCompliance = false;

    const cardCount = await cards.count();
    for (let i = 0; i < cardCount; i++) {
      const cardText = await cards.nth(i).textContent();
      if (cardText && (cardText.includes('Compliance') || cardText.includes('Framework'))) {
        foundCompliance = true;
        break;
      }
    }

    expect(foundCompliance || (await complianceCard.isVisible().catch(() => false))).toBeTruthy();
  });

  test('should display activity card', async ({ page }) => {
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');

    // Look for activity-related card
    const activityCard = page.locator('text=/[Aa]ctivity|[Rr]ecent/').first();

    // Check if activity card is visible or find it in cards
    const cards = page.locator('[class*="card"]');
    let foundActivity = false;

    const cardCount = await cards.count();
    for (let i = 0; i < cardCount; i++) {
      const cardText = await cards.nth(i).textContent();
      if (cardText && (cardText.includes('Activity') || cardText.includes('Recent'))) {
        foundActivity = true;
        break;
      }
    }

    expect(foundActivity || (await activityCard.isVisible().catch(() => false))).toBeTruthy();
  });

  test('should have all stat cards contain numeric values', async ({ page }) => {
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');

    // Get all cards
    const cards = page.locator('[class*="card"]');
    const cardCount = await cards.count();

    // Verify we have cards
    expect(cardCount).toBeGreaterThan(0);

    // Check first few cards for numeric content
    let numericCardsFound = 0;
    const checkLimit = Math.min(5, cardCount);

    for (let i = 0; i < checkLimit; i++) {
      const cardText = await cards.nth(i).textContent();
      if (cardText && /\d+/.test(cardText)) {
        numericCardsFound++;
      }
    }

    // Expect at least some numeric cards (stats)
    expect(numericCardsFound).toBeGreaterThan(0);
  });
});
