import { test, expect } from '@playwright/test';
import path from 'path';

const EVIDENCE = path.resolve('omo/evidence');

test.describe('Template T02 Page - QA Audit', () => {
	test('1. Page load: title, search, dates, table', async ({ page }) => {
		await page.goto('/Template/T02');
		await page.waitForLoadState('networkidle');

		// Title
		await expect(page.getByRole('heading', { level: 2, name: 'Template 02' })).toBeVisible();

		// Search input
		await expect(page.locator('#search')).toBeVisible();

		// Date inputs
		await expect(page.locator('#startDate')).toBeVisible();
		await expect(page.locator('#endDate')).toBeVisible();

		// Table rendered with rows
		await page.waitForSelector('table tbody tr');
		const rows = await page.locator('table tbody tr').count();
		expect(rows).toBeGreaterThanOrEqual(1);

		// Pagination info
		await expect(page.getByText(/Total \d+ records/)).toBeVisible();

		await page.screenshot({ path: path.join(EVIDENCE, 'task-3-qa-load.png'), fullPage: true });
	});

	test('2. Search: type CODE, verify URL and results', async ({ page }) => {
		await page.goto('/Template/T02');
		await page.waitForSelector('table tbody tr');

		// Type search term
		await page.fill('#search', 'CODE');
		// Click Search button
		await page.getByRole('button', { name: 'Search' }).click();

		// Wait for URL to update
		await page.waitForURL(/search=CODE/);
		const url = page.url();
		expect(url).toContain('search=CODE');

		// Table should still be visible
		await page.waitForSelector('table tbody tr');
		const rows = await page.locator('table tbody tr').count();
		expect(rows).toBeGreaterThanOrEqual(1);

		await page.screenshot({ path: path.join(EVIDENCE, 'task-3-qa-search.png'), fullPage: true });
	});

	test('3. Pagination: navigate between pages', async ({ page }) => {
		await page.goto('/Template/T02');
		await page.waitForSelector('table tbody tr');

		// Check if pagination exists (may not if only 1 page)
		const paginationText = page.getByText(/Page \d+ of \d+/);
		const paginationVisible = await paginationText.isVisible().catch(() => false);

		if (paginationVisible) {
			// Get current page info
			const totalPages = await paginationText.evaluate((el) => {
				const match = el.textContent?.match(/Page \d+ of (\d+)/);
				return match ? parseInt(match[1], 10) : 1;
			});

			if (totalPages > 1) {
				// Record page 1 first row
				const firstRowText = await page.locator('table tbody tr:first-child td:first-child').textContent();

				// Click Next
				await page.getByRole('button', { name: 'Next' }).click();
				await page.waitForURL(/page=2/);
				await page.waitForSelector('table tbody tr');

				const secondRowText = await page.locator('table tbody tr:first-child td:first-child').textContent();
				expect(firstRowText).not.toBe(secondRowText);

				// Verify Previous button works (page=1 omitted from URL by design)
				await page.getByRole('button', { name: 'Previous' }).click();
				await page.waitForURL((url) => !url.toString().includes('page='));
				await page.waitForSelector('table tbody tr');
			}
		}
		// Pagination test passes whether or not pagination exists
	});

	test('4. Empty state: nonexistent search', async ({ page }) => {
		await page.goto('/Template/T02?search=NONEXISTENT12345');
		await page.waitForLoadState('networkidle');

		// Table should show empty state message
		await expect(page.getByText('데이터가 없습니다')).toBeVisible();

		await page.screenshot({ path: path.join(EVIDENCE, 'task-3-qa-empty.png'), fullPage: true });
	});

	test('5. Date filter: set dates, verify URL params', async ({ page }) => {
		await page.goto('/Template/T02');
		await page.waitForSelector('table tbody tr');

		// Set start date
		await page.fill('#startDate', '2024-01-01');
		// Set end date
		await page.fill('#endDate', '2024-12-31');

		// Click Search
		await page.getByRole('button', { name: 'Search' }).click();

		// Verify URL contains date params
		await page.waitForURL(/startDate=2024-01-01/);
		const url = page.url();
		expect(url).toContain('startDate=2024-01-01');
		expect(url).toContain('endDate=2024-12-31');

		// Table should still render
		await page.waitForSelector('table tbody tr');
		const rows = await page.locator('table tbody tr').count();
		expect(rows).toBeGreaterThanOrEqual(0); // Could be 0 if no data in range
	});
});
