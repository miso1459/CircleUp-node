import { test, expect } from '@playwright/test';
import Database from 'better-sqlite3';

let adminUser: { email: string; password: string } | null = null;

test.describe('Resizable Dialog', () => {
	test.beforeEach(async ({ page }) => {
		// Create admin user once per worker
		if (!adminUser) {
			const timestamp = Date.now();
			const email = `dialog-test-admin-${timestamp}@example.com`;
			const password = 'TestPassword123!';

			await page.goto('/demo/better-auth/login');
			await page.evaluate(
				async ({ email, password }) => {
					const fd = new FormData();
					fd.append('email', email);
					fd.append('password', password);
					fd.append('name', 'Dialog Test Admin');
					await fetch('/demo/better-auth/login?/signUpEmail', {
						method: 'POST',
						body: fd
					});
				},
				{ email, password }
			);

			// Promote to admin directly in DB
			const db = new Database('local.db');
			db.prepare('UPDATE user SET role = ? WHERE email = ?').run('admin', email);
			db.close();

			adminUser = { email, password };
		}

		// Sign in with admin user
		await page.goto('/demo/better-auth/login');
		await page.evaluate(
			async ({ email, password }) => {
				const fd = new FormData();
				fd.append('email', email);
				fd.append('password', password);
				await fetch('/demo/better-auth/login?/signInEmail', {
					method: 'POST',
					body: fd
				});
			},
			{ email: adminUser.email, password: adminUser.password }
		);

		// Navigate to admin/menus and clear localStorage
		await page.goto('/admin/menus');
		await page.evaluate(() => {
			const keys = Object.keys(localStorage).filter((k) => k.startsWith('dialog-size-'));
			keys.forEach((k) => localStorage.removeItem(k));
		});
	});

	test('Add dialog: drag bottom-right corner resizes dialog', async ({ page }) => {
		await page.goto('/admin/menus');

		// Open Add dialog (header button is the first one with this name)
		await page.getByRole('button', { name: '메뉴 추가' }).first().click();

		const dialog = page.getByRole('dialog', { name: '메뉴 추가' });
		await expect(dialog).toBeVisible();

		const initialBox = await dialog.boundingBox();
		expect(initialBox).not.toBeNull();

		// Find bottom-right resize handle
		const handle = dialog.locator('[data-resize-dir="bottom-right"]');
		const handleBox = await handle.boundingBox();
		expect(handleBox).not.toBeNull();

		// Drag handle by 100px right and 80px down
		await page.mouse.move(
			handleBox!.x + handleBox!.width / 2,
			handleBox!.y + handleBox!.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(
			handleBox!.x + handleBox!.width / 2 + 100,
			handleBox!.y + handleBox!.height / 2 + 80
		);
		await page.mouse.up();

		// Assert bounding box changed (width +100, height +80 due to 1:1 resize)
		await expect
			.poll(async () => {
				const newBox = await dialog.boundingBox();
				return { width: newBox?.width, height: newBox?.height };
			})
			.toEqual({
				width: initialBox!.width + 100,
				height: initialBox!.height + 80
			});
	});

	test('Resize dialog: close and reopen preserves size', async ({ page }) => {
		await page.goto('/admin/menus');

		// Open Add dialog
		await page.getByRole('button', { name: '메뉴 추가' }).first().click();

		const dialog = page.getByRole('dialog', { name: '메뉴 추가' });
		await expect(dialog).toBeVisible();

		// Resize dialog
		const handle = dialog.locator('[data-resize-dir="bottom-right"]');
		const handleBox = await handle.boundingBox();
		expect(handleBox).not.toBeNull();

		await page.mouse.move(
			handleBox!.x + handleBox!.width / 2,
			handleBox!.y + handleBox!.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(
			handleBox!.x + handleBox!.width / 2 + 50,
			handleBox!.y + handleBox!.height / 2 + 40
		);
		await page.mouse.up();

		const resizedWidth = 650;
		const resizedHeight = 440;
		await expect
			.poll(async () => {
				const box = await dialog.boundingBox();
				return { width: box?.width, height: box?.height };
			})
			.toEqual({ width: resizedWidth, height: resizedHeight });

		// Close dialog with Escape
		await page.keyboard.press('Escape');
		await expect(dialog).not.toBeVisible();

		// Reopen dialog
		await page.getByRole('button', { name: '메뉴 추가' }).first().click();
		await expect(dialog).toBeVisible();

		// Assert size persisted
		await expect
			.poll(async () => {
				const box = await dialog.boundingBox();
				return { width: box?.width, height: box?.height };
			})
			.toEqual({ width: resizedWidth, height: resizedHeight });
	});

	test('Click Medium button resets dialog to 600x400', async ({ page }) => {
		await page.goto('/admin/menus');

		// Open Add dialog
		await page.getByRole('button', { name: '메뉴 추가' }).first().click();

		const dialog = page.getByRole('dialog', { name: '메뉴 추가' });
		await expect(dialog).toBeVisible();

		// Resize dialog to something else
		const handle = dialog.locator('[data-resize-dir="bottom-right"]');
		const handleBox = await handle.boundingBox();
		expect(handleBox).not.toBeNull();

		await page.mouse.move(
			handleBox!.x + handleBox!.width / 2,
			handleBox!.y + handleBox!.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(
			handleBox!.x + handleBox!.width / 2 + 50,
			handleBox!.y + handleBox!.height / 2 + 40
		);
		await page.mouse.up();

		// Wait for resize to complete
		await expect
			.poll(async () => {
				const box = await dialog.boundingBox();
				return box?.width;
			})
			.not.toBe(600);

		// Click Medium button
		await dialog.getByRole('button', { name: 'Medium' }).click();

		// Assert size reset to 600x400 (±2px tolerance)
		await expect
			.poll(async () => {
				const box = await dialog.boundingBox();
				return (
					box !== null &&
					box.width >= 598 &&
					box.width <= 602 &&
					box.height >= 398 &&
					box.height <= 402
				);
			})
			.toBe(true);
	});

	test('Resize to large size clamps to viewport minus 48px', async ({ page }) => {
		const viewport = await page.evaluate(() => ({
			width: window.innerWidth,
			height: window.innerHeight
		}));

		await page.goto('/admin/menus');

		// Open Add dialog
		await page.getByRole('button', { name: '메뉴 추가' }).first().click();

		const dialog = page.getByRole('dialog', { name: '메뉴 추가' });
		await expect(dialog).toBeVisible();

		// Try to resize to a very large size
		const handle = dialog.locator('[data-resize-dir="bottom-right"]');
		const handleBox = await handle.boundingBox();
		expect(handleBox).not.toBeNull();

		await page.mouse.move(
			handleBox!.x + handleBox!.width / 2,
			handleBox!.y + handleBox!.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(
			handleBox!.x + handleBox!.width / 2 + 2000,
			handleBox!.y + handleBox!.height / 2 + 2000
		);
		await page.mouse.up();

		// Assert clamped to viewport - 48px
		await expect
			.poll(async () => {
				const box = await dialog.boundingBox();
				return { width: box?.width, height: box?.height };
			})
			.toEqual({
				width: viewport.width - 48,
				height: viewport.height - 48
			});
	});

	test('Delete dialog: resize cursor appears on edge hover', async ({ page }) => {
		await page.goto('/admin/menus');

		// Click delete on first menu item
		await page.getByTitle('메뉴 삭제').first().click();

		const dialog = page.getByRole('dialog', { name: '메뉴 삭제' });
		await expect(dialog).toBeVisible();

		// Hover over bottom edge handle
		const handle = dialog.locator('[data-resize-dir="bottom"]');
		await handle.hover();

		// Assert resize cursor
		const cursor = await handle.evaluate((el) => window.getComputedStyle(el).cursor);
		expect(cursor).toBe('ns-resize');
	});

	test('Prompt dialog: TiptapEditor visible inside resized dialog', async ({ page }) => {
		await page.goto('/admin/menus');

		// Click prompt on first menu item
		await page.getByTitle('Prompt').first().click();

		const dialog = page.getByRole('dialog', { name: /Prompt/ });
		await expect(dialog).toBeVisible();

		// Resize dialog
		const handle = dialog.locator('[data-resize-dir="bottom-right"]');
		const handleBox = await handle.boundingBox();
		expect(handleBox).not.toBeNull();

		await page.mouse.move(
			handleBox!.x + handleBox!.width / 2,
			handleBox!.y + handleBox!.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(
			handleBox!.x + handleBox!.width / 2 + 100,
			handleBox!.y + handleBox!.height / 2 + 80
		);
		await page.mouse.up();

		// Wait for resize
		await expect
			.poll(async () => {
				const box = await dialog.boundingBox();
				return box?.width;
			})
			.toBeGreaterThan(600);

		// Assert TiptapEditor is visible
		const editor = dialog.locator('.tiptap-editor');
		await expect(editor).toBeVisible();
	});
});
