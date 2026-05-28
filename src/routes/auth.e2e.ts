import { expect, test } from '@playwright/test';

test.describe('Auth & RBAC', () => {
	test('login page renders Card, Input fields, and submit Button', async ({ page }) => {
		await page.goto('/login');

		// Card title
		await expect(page.getByRole('heading', { name: 'CircleUp' })).toBeVisible();

		// Sign In button
		await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
	});

	test('email and password input fields are present', async ({ page }) => {
		await page.goto('/login');

		// Email field
		const emailInput = page.getByLabel('Email');
		await expect(emailInput).toBeVisible();
		await expect(emailInput).toHaveAttribute('type', 'email');

		// Password field
		const passwordInput = page.getByLabel('Password');
		await expect(passwordInput).toBeVisible();
		await expect(passwordInput).toHaveAttribute('type', 'password');
	});

	test('displays all 6 social login buttons', async ({ page }) => {
		await page.goto('/login');

		await expect(page.getByRole('button', { name: 'Sign in with GitHub' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in with Naver' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in with Apple' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in with Instagram' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in with TikTok' })).toBeVisible();
	});

	test('dummy social buttons (Naver, Apple, Instagram, TikTok) show toast on click', async ({
		page
	}) => {
		await page.goto('/login');

		const dummyProviders = ['Naver', 'Apple', 'Instagram', 'TikTok'];

		for (const provider of dummyProviders) {
			await page.getByRole('button', { name: `Sign in with ${provider}` }).click();

			// Toast message "Coming soon" should appear
			await expect(page.getByText('Coming soon')).toBeVisible({ timeout: 5000 });
		}
	});

	test('unauthenticated access to /admin redirects to /login', async ({ page }) => {
		await page.goto('/admin');

		// Should be redirected to /login
		await page.waitForURL('/login', { timeout: 10000 });
		await expect(page.getByRole('heading', { name: 'CircleUp' })).toBeVisible();
	});
});
