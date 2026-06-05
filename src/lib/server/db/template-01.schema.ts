import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const template_01 = sqliteTable('Template_01', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	code: text('code').notNull(),
	desc: text('desc').notNull(),
	createdBy: text('created_by'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedBy: text('updated_by'),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.$onUpdate(() => new Date())
		.notNull()
});
