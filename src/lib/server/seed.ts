#!/usr/bin/env tsx
/**
 * Seed script for CircleUp
 *
 * Creates default menus and promotes admin users.
 *
 * Usage: pnpm seed
 *
 * Idempotent: safe to run multiple times.
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Manual .env loader (dotenv is not in direct dependencies)
// ---------------------------------------------------------------------------

function loadEnv(): void {
	const envPath = resolve(process.cwd(), '.env');
	if (!existsSync(envPath)) {
		console.warn('⚠️  .env file not found at', envPath);
		return;
	}
	const content = readFileSync(envPath, 'utf-8');
	for (const line of content.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const eqIdx = trimmed.indexOf('=');
		if (eqIdx <= 0) continue;
		const key = trimmed.slice(0, eqIdx).trim();
		let value = trimmed.slice(eqIdx + 1).trim();
		// Remove surrounding quotes
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (!process.env[key]) {
			process.env[key] = value;
		}
	}
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAdminEmails(): string[] {
	const raw = process.env.ADMIN_EMAILS;
	if (!raw) return [];
	return raw
		.split(',')
		.map((e) => e.trim())
		.filter(Boolean);
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

interface MenuSeed {
	ko_name: string;
	en_name: string;
	type: 'folder' | 'link';
	path: string | null;
	role: string[];
	sort_order: number;
	parentId?: string;
}

const seedMenus: MenuSeed[] = [
	{ ko_name: '홈', en_name: 'Home', type: 'link', path: '/', role: ['all'], sort_order: 0 },
	{ ko_name: '로그인', en_name: 'Login', type: 'link', path: '/login', role: ['all'], sort_order: 1 },
	{ ko_name: '로그아웃', en_name: 'Logout', type: 'link', path: '/logout', role: ['user', 'admin'], sort_order: 2 },
	{ ko_name: '설정', en_name: 'Settings', type: 'folder', path: null, role: ['admin'], sort_order: 3 },
	{ ko_name: '메뉴관리', en_name: 'Menu Management', type: 'link', path: '/admin/menus', role: ['admin'], sort_order: 0, parentId: '설정' },
	{ ko_name: '사용자 관리', en_name: 'User Management', type: 'link', path: '/admin/users', role: ['admin'], sort_order: 1, parentId: '설정' }
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
	loadEnv();

	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error('DATABASE_URL is not set. Check your .env file.');
	}

	const client = new Database(databaseUrl);
	const db = drizzle(client, { schema });

	console.log('🌱 Starting seed...');

	// -----------------------------------------------------------------------
	// 1. Seed menus (idempotent: skip if ko_name already exists)
	// -----------------------------------------------------------------------
	let menuCount = 0;
	const createdIds: Record<string, string> = {};

	for (const m of seedMenus) {
		const existing = db
			.select()
			.from(schema.menu)
			.where(eq(schema.menu.ko_name, m.ko_name))
			.get();

		if (existing) {
			createdIds[m.ko_name] = existing.id;
			console.log(`  ⏭️  Menu "${m.ko_name}" (${m.en_name}) already exists, skipping`);
			continue;
		}

		const result = db.insert(schema.menu)
			.values({
				type: m.type,
				path: m.path ?? null,
				ko_name: m.ko_name,
				en_name: m.en_name,
				role: JSON.stringify(m.role),
				sort_order: m.sort_order,
				parentId: m.parentId ? (createdIds[m.parentId] ?? null) : null
			})
			.returning({ id: schema.menu.id })
			.get();

		if (result) {
			createdIds[m.ko_name] = result.id;
		}

		console.log(`  ✅ Created menu "${m.ko_name}" (${m.en_name})`);
		menuCount++;
	}

	if (menuCount === 0) {
		console.log('  📋 All menus already exist, nothing to create');
	}

	// -----------------------------------------------------------------------
	// 2. Promote ADMIN_EMAILS users to admin role
	// -----------------------------------------------------------------------
	const adminEmails = getAdminEmails();

	if (adminEmails.length === 0) {
		console.log('  ⏭️  No ADMIN_EMAILS configured, skipping admin promotion');
	} else {
		let promotedCount = 0;
		for (const email of adminEmails) {
			const existingUser = db
				.select()
				.from(schema.user)
				.where(eq(schema.user.email, email))
				.get();

			if (!existingUser) {
				console.log(`  ⏭️  User "${email}" not found, skipping`);
				continue;
			}

			if (existingUser.role === 'admin') {
				console.log(`  ⏭️  User "${email}" is already admin, skipping`);
				continue;
			}

			db.update(schema.user)
				.set({ role: 'admin' })
				.where(eq(schema.user.email, email))
				.run();

			console.log(`  ✅ Promoted "${email}" to admin`);
			promotedCount++;
		}

		if (promotedCount === 0) {
			console.log('  📋 No users needed promotion');
		}
	}

	console.log('✅ Seed completed');
}

try {
	main();
} catch (err) {
	console.error('❌ Seed failed:', err);
	process.exit(1);
}
