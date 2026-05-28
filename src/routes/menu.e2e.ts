import { test, expect } from '@playwright/test';

test.describe('Menu Management', () => {
	test('NavigationMenu is visible on the home page', async ({ page }) => {
		await page.goto('/');
		const nav = page.locator('[data-slot="navigation-menu"]');
		await expect(nav).toBeVisible();
	});

	test('NavigationMenu contains "홈" link for guest users (ko locale)', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('link', { name: '홈' })).toBeVisible();
	});

	test('"메뉴관리" is not shown for unauthenticated users', async ({ page }) => {
		await page.goto('/');
		const menuManagement = page.getByRole('link', { name: '메뉴관리' });
		// Guest users only see menus with role "all"; "메뉴관리" requires "admin"
		await expect(menuManagement).not.toBeVisible();
	});

	test('accessing /admin/menus redirects to /login when not authenticated', async ({
		page
	}) => {
		await page.goto('/admin/menus');
		// requireRole('admin') throws 302 redirect to /login
		await expect(page).toHaveURL(/\/login/);
	});
});
