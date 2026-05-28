import { getMenusByRole } from '$lib/server/services/menu.service';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const userRoles = locals.user ? [locals.user.role] : ['guest'];
	const menus = await getMenusByRole(userRoles);

	return { menus };
};
