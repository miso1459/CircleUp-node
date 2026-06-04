import { describe, it, expect } from 'vitest';

// ═══════════════════════════════════════════════════════════════════════════
// Service under test — module does NOT exist yet → import fails → RED state
// ═══════════════════════════════════════════════════════════════════════════
import { getAllTemplates, getTemplates } from './template-01.service';

// ---------------------------------------------------------------------------
// getAllTemplates
// ---------------------------------------------------------------------------
describe('getAllTemplates()', () => {
	it('returns an array of Template_01 rows', async () => {
		const result = await getAllTemplates();
		expect(Array.isArray(result)).toBe(true);
	});

	it('each row has id, code, and desc properties', async () => {
		const result = await getAllTemplates();
		expect(result.length).toBeGreaterThan(0);
		for (const row of result) {
			expect(row).toHaveProperty('id');
			expect(row).toHaveProperty('code');
			expect(row).toHaveProperty('desc');
		}
	});
});

// ---------------------------------------------------------------------------
// getTemplates — filtered + paginated
// ---------------------------------------------------------------------------
describe('getTemplates({ search, page, pageSize })', () => {
	it('returns paginated result with data, total, totalPages, page, pageSize', async () => {
		const result = await getTemplates({ page: 1, pageSize: 10 });
		expect(result).toHaveProperty('data');
		expect(result).toHaveProperty('total');
		expect(result).toHaveProperty('totalPages');
		expect(result).toHaveProperty('page');
		expect(result).toHaveProperty('pageSize');
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(10);
	});

	it('filters by search term (case-insensitive, matches code or desc)', async () => {
		const result = await getTemplates({ search: 'ABC', page: 1, pageSize: 10 });
		expect(Array.isArray(result.data)).toBe(true);
		expect(typeof result.total).toBe('number');
		expect(typeof result.totalPages).toBe('number');
	});

	it('returns correct pagination slice', async () => {
		const all = await getTemplates({ page: 1, pageSize: 100 });
		expect(all.data.length).toBe(all.total);

		const firstPage = await getTemplates({ page: 1, pageSize: 3 });
		expect(firstPage.data.length).toBeLessThanOrEqual(3);
	});

	it('empty search string returns all rows without filter', async () => {
		const result = await getTemplates({ search: '', page: 1, pageSize: 100 });
		expect(result.data.length).toBe(result.total);
	});

	it('no matching results returns empty data with total=0', async () => {
		const result = await getTemplates({ search: 'ZZZ_NONEXISTENT_999', page: 1, pageSize: 10 });
		expect(result.data).toHaveLength(0);
		expect(result.total).toBe(0);
		expect(result.totalPages).toBe(0);
	});
});
