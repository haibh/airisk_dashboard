import { test, expect } from '@playwright/test';

test.describe('Authentication Login Flow', () => {
  const VALID_EMAIL = 'admin@airm-ip.local';
  const VALID_PASSWORD = 'Test@123456';

  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/en/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill in email
    await page.fill('input[id="email"]', VALID_EMAIL);

    // Fill in password
    await page.fill('input[id="password"]', VALID_PASSWORD);

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/en/dashboard', { timeout: 10000 });

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

    // Wait a bit for error to appear
    await page.waitForTimeout(2000);

    // Check that we're still on the login page
    expect(page.url()).toContain('/en/login');

    // Verify error message is displayed
    const errorElement = page.locator('[role="alert"]');
    await expect(errorElement).toBeVisible();
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

    // Click login button
    await page.click('button[type="submit"]');

    // Verify button shows loading state
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();

    // Wait for navigation or error
    await page.waitForTimeout(1000);
  });
});
