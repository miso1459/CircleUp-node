import { requireRole } from '$lib/server/middleware/rbac';
import {
	getAllUsers,
	updateUser,
	updateUserRole,
	updateUserLang,
	deleteUser,
	updateUserStatus
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
		const name = data.get('name') as string;
		const role = data.get('role') as string;
		const lang = data.get('lang') as string;
		const isActive = data.get('isActive') as string;

		if (userId && name) await updateUser(userId, { name });
		if (userId && role) await updateUserRole(userId, role);
		if (userId && lang) await updateUserLang(userId, lang);
		if (userId && isActive !== null) await updateUserStatus(userId, isActive === 'true');

		return { success: true };
	},
	deleteUser: async ({ request }) => {
		const data = await request.formData();
		const userId = data.get('userId') as string;
		if (userId) await deleteUser(userId);
		return { success: true };
	}
};
