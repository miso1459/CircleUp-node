import { db } from '$lib/server/db';
import { menu } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Menu {
	id: string;
	parentId: string | null;
	type: 'folder' | 'link';
	path: string | null;
	ko_name: string;
	en_name: string;
	icon: string | null;
	prompt: string | null;
	role: string[];
	sort_order: number;
	is_active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateMenuInput {
	type: 'folder' | 'link';
	path?: string | null;
	ko_name: string;
	en_name: string;
	icon?: string | null;
	prompt?: string | null;
	role?: string[];
	sort_order?: number;
	parentId?: string | null;
}

export interface UpdateMenuInput {
	type?: 'folder' | 'link';
	path?: string | null;
	ko_name?: string;
	en_name?: string;
	icon?: string | null;
	prompt?: string | null;
	role?: string[];
	sort_order?: number;
	is_active?: boolean;
	parentId?: string | null;
}

export interface MenuTreeNode {
	id: string;
	parentId: string | null;
	type: 'folder' | 'link';
	path: string | null;
	ko_name: string;
	en_name: string;
	icon: string | null;
	prompt: string | null;
	role: string[];
	sort_order: number;
	is_active: boolean;
	children: MenuTreeNode[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convenience type: a DB row with parsed role array instead of raw JSON string. */
type MenuRowWithRoles = Omit<typeof menu.$inferSelect, 'role'> & { role: string[] };

/** Parse role JSON string to array. */
function parseRole(roleStr: string): string[] {
	try {
		const parsed = JSON.parse(roleStr);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

/** Map raw DB row to MenuRowWithRoles (parsed role array). */
function toMenuRowWithRoles(row: typeof menu.$inferSelect): MenuRowWithRoles {
	return {
		id: row.id,
		parentId: row.parentId,
		type: row.type,
		path: row.path,
		ko_name: row.ko_name,
		en_name: row.en_name,
		icon: row.icon,
		prompt: row.prompt,
		role: parseRole(row.role),
		sort_order: row.sort_order,
		is_active: row.is_active,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

/** Map raw DB row to Menu domain type. */
function toMenu(row: typeof menu.$inferSelect): Menu {
	return {
		...row,
		role: parseRole(row.role),
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

/**
 * Build a recursive tree from a flat menu list.
 * Root nodes are identified by parentId === null.
 */
function buildTree(
	items: MenuRowWithRoles[],
	parentId: string | null
): MenuTreeNode[] {
	return items
		.filter((item) => item.parentId === parentId)
		.sort((a, b) => a.sort_order - b.sort_order)
		.map((item) => ({
			id: item.id,
			parentId: item.parentId,
			type: item.type,
			path: item.path,
			ko_name: item.ko_name,
			en_name: item.en_name,
			icon: item.icon,
			prompt: item.prompt,
			role: item.role,
			sort_order: item.sort_order,
			is_active: item.is_active,
			children: buildTree(items, item.id)
		}));
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

/** Create a new menu entry. */
export async function createMenu(input: CreateMenuInput): Promise<Menu> {
	const [row] = await db
		.insert(menu)
		.values({
			type: input.type,
			path: input.path ?? null,
			ko_name: input.ko_name,
			en_name: input.en_name,
			icon: input.icon ?? null,
			prompt: input.prompt ?? null,
			role: JSON.stringify(input.role ?? ['all']),
			sort_order: input.sort_order ?? 0,
			parentId: input.parentId ?? null
		})
		.returning();

	return toMenu(row);
}

/** Get a single menu by its id. Returns undefined when not found. */
export async function getMenuById(id: string): Promise<Menu | undefined> {
	const [row] = await db.select().from(menu).where(eq(menu.id, id)).limit(1);
	return row ? toMenu(row) : undefined;
}

/** Get all menus as a flat list sorted by sort_order. */
export async function getAllMenus(): Promise<Menu[]> {
	const rows = await db.select().from(menu).orderBy(asc(menu.sort_order));
	return rows.map(toMenu);
}

/** Update an existing menu. Returns undefined when not found. */
export async function updateMenu(
	id: string,
	input: UpdateMenuInput
): Promise<Menu | undefined> {
	const values: Record<string, unknown> = {};
	if (input.type !== undefined) values.type = input.type;
	if (input.path !== undefined) values.path = input.path;
	if (input.ko_name !== undefined) values.ko_name = input.ko_name;
	if (input.en_name !== undefined) values.en_name = input.en_name;
	if (input.icon !== undefined) values.icon = input.icon;
	if (input.prompt !== undefined) values.prompt = input.prompt;
	if (input.role !== undefined) values.role = JSON.stringify(input.role);
	if (input.sort_order !== undefined) values.sort_order = input.sort_order;
	if (input.is_active !== undefined) values.is_active = input.is_active;
	if (input.parentId !== undefined) values.parentId = input.parentId;

	if (Object.keys(values).length === 0) {
		return getMenuById(id);
	}

	const [row] = await db.update(menu).set(values).where(eq(menu.id, id)).returning();
	return row ? toMenu(row) : undefined;
}

/**
 * Delete a menu by id.
 * Returns success: false + message when the menu has child menus or doesn't exist.
 */
export async function deleteMenu(
	id: string
): Promise<{ success: boolean; message?: string }> {
	// Check for child menus
	const children = await db
		.select({ id: menu.id })
		.from(menu)
		.where(eq(menu.parentId, id))
		.limit(1);

	if (children.length > 0) {
		return { success: false, message: '하위 메뉴가 존재하여 삭제할 수 없습니다.' };
	}

	const [deleted] = await db
		.delete(menu)
		.where(eq(menu.id, id))
		.returning({ id: menu.id });

	if (!deleted) {
		return { success: false, message: '메뉴를 찾을 수 없습니다.' };
	}

	return { success: true };
}

// ---------------------------------------------------------------------------
// Tree & Role-based queries
// ---------------------------------------------------------------------------

/** Get the full menu tree (all active menus). */
export async function getMenuTree(): Promise<MenuTreeNode[]> {
	const rows = await db.select().from(menu).orderBy(asc(menu.sort_order));
	const items = rows.map(toMenuRowWithRoles);
	return buildTree(items, null);
}

/**
 * Get menu tree filtered by user roles.
 * - Menus with role containing 'all' are visible to everyone.
 * - Otherwise the user must have at least one matching role.
 * - Only active menus are returned.
 */
export async function getMenusByRole(roles: string[]): Promise<MenuTreeNode[]> {
	const rows = await db.select().from(menu).orderBy(asc(menu.sort_order));

	const filtered = rows
		.filter((r) => r.is_active)
		.map(toMenuRowWithRoles)
		.filter((item) => {
			if (item.role.includes('all')) return true;
			return roles.some((role) => item.role.includes(role));
		});

	return buildTree(filtered, null);
}
