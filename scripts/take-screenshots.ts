/**
 * Screenshot capture script for README documentation.
 * Uses Playwright to log in and capture key feature pages.
 * Run: npx playwright test scripts/take-screenshots.ts --headed
 * Or:  npx tsx scripts/take-screenshots.ts
 */

import { chromium } from 'playwright';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
const EMAIL = 'admin@airm-ip.local';
const PASSWORD = 'Test@123456';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  // --- Login ---
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/en/login`);
  await page.waitForLoadState('networkidle');

  // Take login page screenshot first
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-login.png'), fullPage: false });
  console.log('  01-login.png');

  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for navigation after login (change-password or dashboard)
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');

  // Check if we landed on change-password page (mustChangePassword=true for seed users)
  if (page.url().includes('change-password')) {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-change-password.png'), fullPage: false });
    console.log('  02-change-password.png');

    // Change password to proceed to dashboard
    const newPassword = 'NewTest@123456';
    await page.fill('#currentPassword', PASSWORD);
    await page.fill('#newPassword', newPassword);
    await page.fill('#confirmPassword', newPassword);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Navigate to login and re-authenticate with new password
    await page.goto(`${BASE_URL}/en/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', newPassword);
    await page.click('button[type="submit"]');
  }

  // Wait for dashboard to load
  await page.waitForURL(/dashboard/, { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Let charts render

  // --- Dashboard ---
  console.log('Capturing dashboard...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-dashboard.png'), fullPage: false });
  console.log('  03-dashboard.png');

  // --- Risk Assessment ---
  console.log('Capturing risk assessment...');
  await page.goto(`${BASE_URL}/en/risk-assessment`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-risk-assessment.png'), fullPage: false });
  console.log('  04-risk-assessment.png');

  // --- Frameworks ---
  console.log('Capturing frameworks...');
  await page.goto(`${BASE_URL}/en/frameworks`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-frameworks.png'), fullPage: false });
  console.log('  05-frameworks.png');

  // --- AI Systems ---
  console.log('Capturing AI systems...');
  await page.goto(`${BASE_URL}/en/ai-systems`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-ai-systems.png'), fullPage: false });
  console.log('  06-ai-systems.png');

  // --- Evidence Management ---
  console.log('Capturing evidence...');
  await page.goto(`${BASE_URL}/en/evidence`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-evidence.png'), fullPage: false });
  console.log('  07-evidence.png');

  // --- Settings ---
  console.log('Capturing settings...');
  await page.goto(`${BASE_URL}/en/settings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-settings.png'), fullPage: false });
  console.log('  08-settings.png');

  // --- Landing Page ---
  console.log('Capturing landing page...');
  const landingPage = await context.newPage();
  await landingPage.goto(`${BASE_URL}/en`);
  await landingPage.waitForLoadState('networkidle');
  await landingPage.waitForTimeout(1500);
  await landingPage.screenshot({ path: path.join(SCREENSHOT_DIR, '00-landing.png'), fullPage: false });
  console.log('  00-landing.png');
  await landingPage.close();

  await browser.close();
  console.log('\nDone! Screenshots saved to docs/screenshots/');
}

main().catch((e) => {
  console.error('Screenshot capture failed:', e);
  process.exit(1);
});
