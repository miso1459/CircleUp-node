import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Require that the current user has one of the specified roles.
 *
 * Usage in +page.server.ts load function:
 *   import { requireRole } from '$lib/server/middleware/rbac';
 *
 *   export const load = async (event) => {
 *     requireRole('admin')(event);
 *     // ... load data
 *   };
 *
 * @param roles - One or more role names that are allowed.
 */
export function requireRole(...roles: string[]) {
	return (event: RequestEvent): void => {
		if (!event.locals.user) {
			throw redirect(302, '/login');
		}
		if (!roles.includes(event.locals.user.role)) {
			throw redirect(302, '/');
		}
	};
}
