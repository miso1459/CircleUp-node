import { requireRole } from '$lib/server/middleware/rbac';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	requireRole('admin')(event);
	return {};
};
