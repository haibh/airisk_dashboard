import { test, expect } from '@playwright/test';

// Set timeout for redirect tests
test.setTimeout(60000);

test.describe('Authentication - Unauthorized Access Redirect', () => {
  test('should redirect to login when accessing dashboard without auth', async ({ page, context }) => {
    // Clear all cookies to simulate unauthenticated state
    await context.clearCookies();

    // Try to access dashboard directly with extended timeout
    await page.goto('/en/dashboard', { waitUntil: 'domcontentloaded', timeout: 45000 });

    // Wait for potential redirect
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Verify redirect to login page
    expect(page.url()).toContain('/en/login');
  });

  test('should prevent direct dashboard access for unauthenticated user', async ({ context }) => {
    const page = await context.newPage();

    // Ensure no cookies exist
    await context.clearCookies();

    // Attempt direct dashboard navigation with extended timeout
    await page.goto('/en/dashboard', { waitUntil: 'domcontentloaded', timeout: 45000 });

    // Wait for potential redirect
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Should be redirected to login
    expect(page.url()).toContain('/en/login');

    await page.close();
  });
});
