import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { clampSize, createDialogSizeStore } from '../resizable-dialog-store.svelte';

// ---------------------------------------------------------------------------
// clampSize — pure function tests
// ---------------------------------------------------------------------------
describe('clampSize', () => {
	it('clamps values below minimum to MIN_WIDTH × MIN_HEIGHT', () => {
		expect(clampSize(100, 100, 1920, 1080)).toEqual({ width: 320, height: 240 });
	});

	it('clamps values above maximum to viewport minus margin', () => {
		expect(clampSize(3000, 2000, 1920, 1080)).toEqual({ width: 1872, height: 1032 });
	});

	it('passes through values within bounds unchanged', () => {
		expect(clampSize(500, 400, 1920, 1080)).toEqual({ width: 500, height: 400 });
	});

	it('clamps zero input to MIN_WIDTH × MIN_HEIGHT', () => {
		expect(clampSize(0, 0, 1920, 1080)).toEqual({ width: 320, height: 240 });
	});

	it('clamps negative input to MIN_WIDTH × MIN_HEIGHT', () => {
		expect(clampSize(-100, -50, 1920, 1080)).toEqual({ width: 320, height: 240 });
	});
});

// ---------------------------------------------------------------------------
// createDialogSizeStore — requires mocked browser globals
// ---------------------------------------------------------------------------
describe('createDialogSizeStore', () => {
	const STORAGE_KEY_PREFIX = 'dialog-size-';

	beforeEach(() => {
		const store: Record<string, string> = {};
		vi.stubGlobal('localStorage', {
			getItem: vi.fn((key: string) => store[key] ?? null),
			setItem: vi.fn((key: string, value: string) => {
				store[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete store[key];
			}),
			clear: vi.fn(() => {
				for (const k of Object.keys(store)) delete store[k];
			}),
			key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
			get length() {
				return Object.keys(store).length;
			}
		});
		vi.stubGlobal('window', {});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('initializes with default dimensions when no localStorage entry exists', () => {
		const dialog = createDialogSizeStore('test-dialog');
		expect(dialog.width).toBe(600);
		expect(dialog.height).toBe(400);
	});

	it('initializes from valid localStorage JSON', () => {
		localStorage.setItem(
			STORAGE_KEY_PREFIX + 'test-dialog',
			JSON.stringify({ width: 800, height: 600 })
		);
		const dialog = createDialogSizeStore('test-dialog');
		expect(dialog.width).toBe(800);
		expect(dialog.height).toBe(600);
	});

	it('falls back to defaults when localStorage contains invalid JSON', () => {
		localStorage.setItem(STORAGE_KEY_PREFIX + 'test-dialog', 'not-json');
		const dialog = createDialogSizeStore('test-dialog');
		expect(dialog.width).toBe(600);
		expect(dialog.height).toBe(400);
	});

	it('resetToMedium restores default 600×400 dimensions', () => {
		const dialog = createDialogSizeStore('test-dialog');
		dialog.setSize(800, 600);
		dialog.resetToMedium();
		expect(dialog.width).toBe(600);
		expect(dialog.height).toBe(400);
	});

	it('setSize writes to localStorage', () => {
		const dialog = createDialogSizeStore('test-dialog');
		dialog.setSize(800, 600);
		const stored = JSON.parse(localStorage.getItem('dialog-size-test-dialog')!);
		expect(stored).toEqual({ width: 800, height: 600 });
	});
});
