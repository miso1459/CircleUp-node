import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock data factories
// ---------------------------------------------------------------------------
function makeItem(id: number, code: string, desc: string) {
	return {
		id,
		code,
		desc,
		date: Date.now(),
		createdBy: null as string | null,
		createdAt: Date.now(),
		updatedBy: null as string | null,
		updatedAt: Date.now()
	};
}

const ALL_ITEMS = Array.from({ length: 25 }, (_, i) =>
	makeItem(i + 1, `CODE-${String(i + 1).padStart(3, '0')}`, `Description for item ${i + 1}`)
);

const SEARCH_ITEMS = [
	makeItem(1, 'SEARCH-001', 'First matching result'),
	makeItem(2, 'SEARCH-002', 'Second matching result'),
	makeItem(3, 'SEARCH-003', 'Third matching result')
];

const COMBINED_ITEMS = [
	makeItem(1, 'MATCH-001', 'Filtered result A'),
	makeItem(2, 'MATCH-002', 'Filtered result B')
];

// ---------------------------------------------------------------------------
// Mock state — mutated per test to control db behaviour
// ---------------------------------------------------------------------------
let mockItemsData: any[] = [];
let mockTotalCount = 0;

// ---------------------------------------------------------------------------
// DB mock
//
// Drizzle ORM query builder uses a chainable thenable API:
//   db.select(...).from(table).where(condition).limit(n).offset(m)
//
// The mock distinguishes items query (has .limit()) from count query (no .limit())
// by checking whether limitValue was set before .then() resolves.
// ---------------------------------------------------------------------------
vi.mock('$lib/server/db', () => {
	function createChain() {
		let limitValue: number | undefined;
		let offsetValue = 0;

		const chain = {
			from: () => chain,
			where: () => chain,
			limit: (n: number) => {
				limitValue = n;
				return chain;
			},
			offset: (n: number) => {
				offsetValue = n;
				return chain;
			},
			then: (resolve: (val: unknown) => void) => {
				if (limitValue !== undefined) {
					// Items query — apply pagination slice
					resolve(mockItemsData.slice(offsetValue, offsetValue + limitValue));
				} else {
					// Count query
					resolve([{ count: mockTotalCount }]);
				}
			}
		};

		return chain;
	}

	return {
		db: {
			select: vi.fn(() => createChain())
		}
	};
});

// ---------------------------------------------------------------------------
// Module under test — WILL FAIL to resolve in RED phase
// because +page.server.ts does not exist yet.
// ---------------------------------------------------------------------------
import { load } from './+page.server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function mockUrl(searchParams: Record<string, string> = {}): URL {
	const usp = new URLSearchParams(searchParams);
	return new URL(`http://localhost?${usp.toString()}`);
}

describe('Template T02 — +page.server.ts load', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockItemsData = [...ALL_ITEMS];
		mockTotalCount = ALL_ITEMS.length;
	});

	// -----------------------------------------------------------------------
	it('loads without query params: returns first page with default page=1', async () => {
		const result = await load({ url: mockUrl() } as any);

		expect(result).toHaveProperty('items');
		expect(result).toHaveProperty('page', 1);
		expect(result).toHaveProperty('totalPages', 2);
		expect(result).toHaveProperty('total', 25);
		expect(result.items).toHaveLength(20);
		expect(result.items[0].id).toBe(1);
		expect(result.items[19].id).toBe(20);
	});

	// -----------------------------------------------------------------------
	it('loads with ?search=keyword: returns filtered data', async () => {
		mockItemsData = [...SEARCH_ITEMS];
		mockTotalCount = SEARCH_ITEMS.length;

		const result = await load({ url: mockUrl({ search: 'SEARCH' }) } as any);

		expect(result).toHaveProperty('items');
		expect(result.items).toHaveLength(3);
		expect(result.page).toBe(1);
		expect(result.totalPages).toBe(1);
		expect(result.total).toBe(3);
	});

	// -----------------------------------------------------------------------
	it('loads with ?page=2: returns page 2 data with correct offset', async () => {
		const result = await load({ url: mockUrl({ page: '2' }) } as any);

		expect(result).toHaveProperty('items');
		expect(result.items).toHaveLength(5);
		expect(result.items[0].id).toBe(21);
		expect(result.page).toBe(2);
		expect(result.totalPages).toBe(2);
		expect(result.total).toBe(25);
	});

	// -----------------------------------------------------------------------
	it('loads with ?search=keyword&page=1: combined filter + pagination', async () => {
		mockItemsData = [...COMBINED_ITEMS];
		mockTotalCount = COMBINED_ITEMS.length;

		const result = await load({ url: mockUrl({ search: 'MATCH', page: '1' }) } as any);

		expect(result).toHaveProperty('items');
		expect(result.items).toHaveLength(2);
		expect(result.items[0].code).toBe('MATCH-001');
		expect(result.page).toBe(1);
		expect(result.totalPages).toBe(1);
		expect(result.total).toBe(2);
	});

	// -----------------------------------------------------------------------
	it.each([
		['negative number', { page: '-1' }],
		['non-numeric string', { page: 'abc' }],
		['zero', { page: '0' }]
	])('invalid page param (%s): defaults to page 1', async (_label, params) => {
		const result = await load({ url: mockUrl(params) } as any);

		expect(result).toHaveProperty('page', 1);
		expect(result.items.length).toBeGreaterThan(0);
	});

	// -----------------------------------------------------------------------
	it('search with no results: returns empty array, totalPages=0', async () => {
		mockItemsData = [];
		mockTotalCount = 0;

		const result = await load({ url: mockUrl({ search: 'NONEXISTENT' }) } as any);

		expect(result).toHaveProperty('items');
		expect(result.items).toHaveLength(0);
		expect(result.totalPages).toBe(0);
		expect(result.total).toBe(0);
		expect(result.page).toBe(1);
	});
});
