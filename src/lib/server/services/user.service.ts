import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	role: string;
	lang: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface UpdateUserInput {
	name?: string;
	image?: string | null;
	lang?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map raw DB row to User domain type. */
function toUser(row: typeof user.$inferSelect): User {
	return {
		id: row.id,
		name: row.name,
		email: row.email,
		emailVerified: row.emailVerified,
		image: row.image,
		role: row.role,
		lang: row.lang,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Get all users. */
export async function getAllUsers(): Promise<User[]> {
	const rows = await db.select().from(user);
	return rows.map(toUser);
}

/** Get a single user by id. Returns undefined when not found. */
export async function getUserById(id: string): Promise<User | undefined> {
	const [row] = await db.select().from(user).where(eq(user.id, id)).limit(1);
	return row ? toUser(row) : undefined;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Update user name, image, lang, etc. Returns undefined when not found. */
export async function updateUser(
	id: string,
	data: UpdateUserInput
): Promise<User | undefined> {
	const values: Record<string, unknown> = {};
	if (data.name !== undefined) values.name = data.name;
	if (data.image !== undefined) values.image = data.image;
	if (data.lang !== undefined) values.lang = data.lang;

	if (Object.keys(values).length === 0) {
		return getUserById(id);
	}

	const [row] = await db.update(user).set(values).where(eq(user.id, id)).returning();
	return row ? toUser(row) : undefined;
}

/** Update user role. Returns undefined when not found. */
export async function updateUserRole(id: string, role: string): Promise<User | undefined> {
	const [row] = await db.update(user).set({ role }).where(eq(user.id, id)).returning();
	return row ? toUser(row) : undefined;
}

/** Update user lang. Returns undefined when not found. */
export async function updateUserLang(id: string, lang: string): Promise<User | undefined> {
	const [row] = await db.update(user).set({ lang }).where(eq(user.id, id)).returning();
	return row ? toUser(row) : undefined;
}
