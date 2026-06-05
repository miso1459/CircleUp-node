import { db } from '$lib/server/db';
import { template_01 } from '$lib/server/db/template-01.schema';
import { like, sql, or } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Template01 {
	id: number;
	code: string;
	desc: string;
	createdBy: string | null;
	createdAt: Date;
	updatedBy: string | null;
	updatedAt: Date;
}

export interface GetTemplatesOptions {
	search?: string;
	page?: number;
	pageSize?: number;
}

export interface GetTemplatesResult {
	data: Template01[];
	total: number;
	totalPages: number;
	page: number;
	pageSize: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toTemplate01(row: typeof template_01.$inferSelect): Template01 {
	return {
		id: row.id,
		code: row.code,
		desc: row.desc,
		createdBy: row.createdBy,
		createdAt: row.createdAt,
		updatedBy: row.updatedBy,
		updatedAt: row.updatedAt
	};
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getAllTemplates(): Promise<Template01[]> {
	const rows = await db.select().from(template_01);
	return rows.map(toTemplate01);
}

export async function getTemplates(opts: GetTemplatesOptions = {}): Promise<GetTemplatesResult> {
	const { search, page = 1, pageSize = 10 } = opts;

	const effectivePage = Math.max(1, page);
	const effectivePageSize = Math.max(1, pageSize);
	const offset = (effectivePage - 1) * effectivePageSize;

	// Build where clause
	let whereClause;
	if (search && search.trim() !== '') {
		const term = `%${search.toLowerCase()}%`;
		whereClause = or(
			like(sql`LOWER(${template_01.code})`, term),
			like(sql`LOWER(${template_01.desc})`, term)
		);
	}

	// Get total count
	const countResult = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(template_01)
		.where(whereClause);
	const total = Number(countResult[0]?.count ?? 0);

	// Get paginated data
	const rows = await db
		.select()
		.from(template_01)
		.where(whereClause)
		.limit(effectivePageSize)
		.offset(offset);

	const totalPages = total === 0 ? 0 : Math.ceil(total / effectivePageSize);

	return {
		data: rows.map(toTemplate01),
		total,
		totalPages,
		page: effectivePage,
		pageSize: effectivePageSize
	};
}