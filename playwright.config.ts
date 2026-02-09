import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.playwright/.auth/user.json');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },

  projects: [
    // Setup project: authenticates once, saves session, and warms server
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // Auth-specific tests: use fresh context (no saved session), run after setup warms server
    {
      name: 'auth-tests',
      testMatch: /auth-.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    // Dashboard & visual tests: use saved authenticated session
    {
      name: 'chromium',
      testIgnore: /auth-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
