import { test, expect } from '@playwright/test';

test.describe('Authentication - Unauthorized Access Redirect', () => {
  test('should redirect to login when accessing dashboard without auth', async ({ page, context }) => {
    // Clear all cookies to simulate unauthenticated state
    await context.clearCookies();

    // Try to access dashboard directly
    await page.goto('/en/dashboard', { waitUntil: 'networkidle' });

    // Verify redirect to login page
    expect(page.url()).toContain('/en/login');
  });

  test('should prevent direct dashboard access for unauthenticated user', async ({ context }) => {
    const page = await context.newPage();

    // Ensure no cookies exist
    await context.clearCookies();

    // Attempt direct dashboard navigation
    await page.goto('/en/dashboard', { waitUntil: 'networkidle' });

    // Should be redirected to login
    expect(page.url()).toContain('/en/login');

    await page.close();
  });
});
