import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'pnpm run build && pnpm run preview', port: 4173, timeout: 300000 },
	testMatch: ['**/*.e2e.{ts,js}', '**/tests/e2e/**/*.ts']
});
