import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../.playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/en/login', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('input[id="email"]', { timeout: 15000 });

  // Fill credentials and submit
  await page.fill('input[id="email"]', 'admin@airm-ip.local');
  await page.fill('input[id="password"]', 'Test@123456');
  await page.click('button[type="submit"]');

  // Wait for successful redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 30000 });
  expect(page.url()).toContain('/dashboard');

  // Save signed-in state to file
  await page.context().storageState({ path: authFile });
});
