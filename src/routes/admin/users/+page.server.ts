import { requireRole } from '$lib/server/middleware/rbac';
import {
	getAllUsers,
	updateUserRole,
	updateUserLang
} from '$lib/server/services/user.service';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	requireRole('admin')(event);
	const users = await getAllUsers();
	return { users };
};

export const actions: Actions = {
	updateUser: async ({ request }) => {
		const data = await request.formData();
		const userId = data.get('userId') as string;
		const role = data.get('role') as string;
		const lang = data.get('lang') as string;

		if (userId && role) await updateUserRole(userId, role);
		if (userId && lang) await updateUserLang(userId, lang);

		return { success: true };
	}
};
