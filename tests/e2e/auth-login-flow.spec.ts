import { test, expect } from '@playwright/test';

// Set timeout for auth tests (slower due to server startup)
test.setTimeout(60000);

test.describe('Authentication Login Flow', () => {
  const VALID_EMAIL = 'admin@airm-ip.local';
  const VALID_PASSWORD = 'Test@123456';

  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test with longer timeout
    await page.goto('/en/login', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill in email
    await page.fill('input[id="email"]', VALID_EMAIL);

    // Fill in password
    await page.fill('input[id="password"]', VALID_PASSWORD);

    // Click login button and wait for navigation
    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 30000 }),
      page.click('button[type="submit"]')
    ]);

    // Verify we are on the dashboard
    expect(page.url()).toContain('/en/dashboard');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill in invalid email
    await page.fill('input[id="email"]', 'invalid@example.com');

    // Fill in invalid password
    await page.fill('input[id="password"]', 'InvalidPassword123');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for error alert to appear instead of hard-coded timeout
    const errorElement = page.getByRole('alert').filter({ hasText: /Invalid|error|failed/i });
    await expect(errorElement).toBeVisible({ timeout: 5000 });

    // Check that we're still on the login page
    expect(page.url()).toContain('/en/login');
  });

  test('should require email field', async ({ page }) => {
    // Leave email empty and fill password
    await page.fill('input[id="password"]', VALID_PASSWORD);

    // Try to submit form
    const emailInput = page.locator('input[id="email"]');
    const isRequired = await emailInput.evaluate((el: HTMLInputElement) => el.required);

    expect(isRequired).toBe(true);
  });

  test('should require password field', async ({ page }) => {
    // Fill email and leave password empty
    await page.fill('input[id="email"]', VALID_EMAIL);

    // Verify password field is required
    const passwordInput = page.locator('input[id="password"]');
    const isRequired = await passwordInput.evaluate((el: HTMLInputElement) => el.required);

    expect(isRequired).toBe(true);
  });

  test('should show loading state during login', async ({ page }) => {
    // Fill in credentials
    await page.fill('input[id="email"]', VALID_EMAIL);
    await page.fill('input[id="password"]', VALID_PASSWORD);

    const submitButton = page.locator('button[type="submit"]');

    // Click login button
    await submitButton.click();

    // Verify button shows loading state (check immediately after click)
    await expect(submitButton).toBeDisabled({ timeout: 2000 });

    // Wait for navigation to complete
    await page.waitForURL('**/dashboard', { timeout: 30000 }).catch(() => {
      // Ignore timeout if login completes too fast
    });
  });
});
