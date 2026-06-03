import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export const menu = sqliteTable('menu', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	parentId: text('parent_id'),
	type: text('type', { enum: ['folder', 'link'] }).notNull().default('link'),
	path: text('path'),
	ko_name: text('ko_name').notNull(),
	en_name: text('en_name').notNull(),
	icon: text('icon'),
	role: text('role').notNull().default('["all"]'),
	sort_order: integer('sort_order').notNull().default(0),
	is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	prompt: text('prompt'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

export const menuRelations = relations(menu, ({ one, many }) => ({
	parent: one(menu, {
		fields: [menu.parentId],
		references: [menu.id]
	}),
	children: many(menu)
}));
