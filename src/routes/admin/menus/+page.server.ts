import {
	getMenuTree,
	getAllMenus,
	createMenu,
	updateMenu,
	deleteMenu
} from '$lib/server/services/menu.service';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const menuTree = await getMenuTree();
	const flatMenus = await getAllMenus();
	return { menuTree, flatMenus };
};

export const actions: Actions = {
	createMenu: async ({ request }) => {
		const formData = await request.formData();
		const type = formData.get('type') as string;
		const ko_name = formData.get('ko_name') as string;
		const en_name = formData.get('en_name') as string;
		const path = formData.get('path') as string | null;
		const icon = formData.get('icon') as string | null;
		const sort_order = parseInt(formData.get('sort_order') as string) || 0;
		const parentId = formData.get('parentId') as string | null;

		const selectedRoles = formData.getAll('role') as string[];
		const role = selectedRoles.length > 0 ? selectedRoles : ['all'];

		if (!type || !ko_name || !en_name) {
			return fail(400, { error: '필수 필드가 누락되었습니다.' });
		}

		await createMenu({
			type: type as 'folder' | 'link',
			ko_name,
			en_name,
			path: path || null,
			icon: icon || null,
			prompt: (formData.get('prompt') as string) || null,
			role,
			sort_order,
			parentId: parentId || null
		});

		return { success: true };
	},

	updateMenu: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const type = formData.get('type') as string;
		const ko_name = formData.get('ko_name') as string;
		const en_name = formData.get('en_name') as string;
		const path = formData.get('path') as string | null;
		const icon = formData.get('icon') as string | null;
		const sort_order = parseInt(formData.get('sort_order') as string) || 0;
		const parentId = formData.get('parentId') as string | null;
		const is_active = formData.get('is_active') as string | null;
		const prompt = formData.get('prompt') as string | null;

		const selectedRoles = formData.getAll('role') as string[];
		const role = selectedRoles.length > 0 ? selectedRoles : ['all'];

		if (!id || !type || !ko_name || !en_name) {
			return fail(400, { error: '필수 필드가 누락되었습니다.' });
		}

		const result = await updateMenu(id, {
			type: type as 'folder' | 'link',
			ko_name,
			en_name,
			path: path || null,
			icon: icon || null,
			role,
			sort_order,
			parentId: parentId || null,
			is_active: is_active === 'true',
			prompt: prompt ?? null
		});

		if (!result) {
			return fail(404, { error: '메뉴를 찾을 수 없습니다.' });
		}

		return { success: true };
	},

	deleteMenu: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: '메뉴 ID가 누락되었습니다.' });
		}

		const result = await deleteMenu(id);
		if (!result.success) {
			return fail(400, { error: result.message });
		}

		return { success: true };
	},

	updatePrompt: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const prompt = formData.get('prompt') as string | null;

		if (!id) {
			return fail(400, { error: '메뉴 ID가 누락되었습니다.' });
		}

		const result = await updateMenu(id, {
			prompt: prompt ?? null
		});

		if (!result) {
			return fail(404, { error: '메뉴를 찾을 수 없습니다.' });
		}

		return { success: true };
	},

	reorderMenu: async ({ request }) => {
		const formData = await request.formData();
		const updatesJson = formData.get('updates') as string;

		if (!updatesJson) {
			return fail(400, { error: '업데이트 데이터가 누락되었습니다.' });
		}

		type ReorderItem = { id: string; parentId: string | null; sort_order: number };
		const updates: ReorderItem[] = JSON.parse(updatesJson);

		for (const u of updates) {
			await updateMenu(u.id, {
				parentId: u.parentId ?? null,
				sort_order: u.sort_order
			});
		}

		return { success: true };
	}
};
