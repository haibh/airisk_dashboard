import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: [
      'node_modules',
      '.claude/**',
      'dist',
      '.next',
    ],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/app/api/**/*.ts',
        'src/lib/**/*.ts',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/dist/',
        '**/.next/',
        'src/app/**/*.tsx',
        'src/components/**',
        'src/store/**',
        'src/types/**',
        'src/i18n/**',
      ],
      thresholds: {
        lines: 25,
        functions: 20,
        branches: 25,
        statements: 25,
      },
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    target: 'node18',
  },
});
