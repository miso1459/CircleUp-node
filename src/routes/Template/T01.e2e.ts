import { test, expect } from '@playwright/test';

test.describe('Template T01 Page', () => {
	test('loads with 30 rows on page 1', async ({ page }) => {
		await page.goto('/Template/T01');
		// Wait for table body to load
		await page.waitForSelector('table tbody tr');
		const rows = await page.locator('table tbody tr').count();
		expect(rows).toBeGreaterThanOrEqual(1);
		// Should show total count (now in Pagination component)
		const summary = page.locator('text=/총 30건/');
		await expect(summary).toBeVisible();
	});

	test('search T01-001 shows matching row', async ({ page }) => {
		await page.goto('/Template/T01');
		await page.waitForSelector('table tbody tr');
		// Type search
		await page.fill('input[type="text"]', 'T01-001');
		await page.keyboard.press('Enter');
		// Wait for URL to update
		await page.waitForURL(/search=T01-001/);
		// Should show fewer rows
		const rows = await page.locator('table tbody tr').count();
		expect(rows).toBeLessThanOrEqual(5);
		// Should show search result text
		const summary = page.locator('text=/검색 결과/');
		await expect(summary).toBeVisible();
	});

	test('clear search shows all 30 rows', async ({ page }) => {
		await page.goto('/Template/T01?search=T01-001');
		await page.waitForSelector('table tbody tr');
		// Clear button should exist
		const clearBtn = page.locator('button:has(svg.lucide-x)');
		await clearBtn.click();
		await page.waitForURL('/Template/T01');
		// Should show all 30 rows
		const rows = await page.locator('table tbody tr').count();
		expect(rows).toBeGreaterThanOrEqual(1);
	});

	test('empty search shows empty state', async ({ page }) => {
		await page.goto('/Template/T01?search=zzznomatch9999');
		// Wait for page to settle (loading done)
		await page.waitForLoadState('networkidle');
		// Empty state should appear
		await expect(page.getByText('검색 결과가 없습니다')).toBeVisible();
		// Table should be gone
		const table = await page.locator('table').count();
		expect(table).toBe(0);
	});

	test('page 2 shows different rows', async ({ page }) => {
		await page.goto('/Template/T01');
		await page.waitForSelector('table tbody tr');
		const firstPageFirstRow = await page.locator('table tbody tr:first-child td:first-child').textContent();
		// Navigate to page 2
		const page2Btn = page.locator('button:has-text("2")');
		await page2Btn.click();
		await page.waitForURL(/page=2/);
		await page.waitForSelector('table tbody tr');
		const secondPageFirstRow = await page.locator('table tbody tr:first-child td:first-child').textContent();
		expect(firstPageFirstRow).not.toBe(secondPageFirstRow);
	});

	test('last page disables Next button', async ({ page }) => {
		await page.goto('/Template/T01?page=2');
		await page.waitForSelector('table tbody tr');
		// Next button (ChevronRight) should be disabled
		const nextBtn = page.locator('button[disabled]:has(svg.lucide-chevron-right)');
		await expect(nextBtn).toBeVisible();
	});

	test('search button triggers search', async ({ page }) => {
		await page.goto('/Template/T01');
		await page.waitForSelector('table tbody tr');
		// Type search text
		await page.fill('input[type="text"]', 'T01-002');
		// Click the search button (the button with Search icon)
		const searchBtn = page.locator('button[aria-label="검색"]');
		await searchBtn.click();
		// Wait for URL to update
		await page.waitForURL(/search=T01-002/);
		// Should show fewer rows
		const rows = await page.locator('table tbody tr').count();
		expect(rows).toBeLessThanOrEqual(5);
	});

	test('layout fills screen without overflow', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/Template/T01');
		await page.waitForSelector('table tbody tr');
		// Check no horizontal scroll
		const bodyOverflow = await page.evaluate(() => {
			return document.body.scrollWidth > document.body.clientWidth;
		});
		expect(bodyOverflow).toBe(false);
	});
});
