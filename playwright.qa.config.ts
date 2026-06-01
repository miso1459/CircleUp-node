import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: '**/*.e2e.{ts,js}',
  use: {
    baseURL: 'http://localhost:5174',
    screenshot: 'only-on-failure',
  },
});
