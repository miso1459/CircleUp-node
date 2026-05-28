import { redirect, fail } from '@sveltejs/kit';
import { requireRole } from '$lib/server/middleware/rbac';
import { getUserById, updateUser } from '$lib/server/services/user.service';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	requireRole('user', 'admin')(event);

	const user = await getUserById(event.locals.user!.id);
	if (!user) {
		throw redirect(302, '/');
	}

	return { user };
};

export const actions: Actions = {
	updateProfile: async (event) => {
		requireRole('user', 'admin')(event);

		const formData = await event.request.formData();
		const name = formData.get('name') as string | null;
		const lang = formData.get('lang') as string | null;

		if (!name || name.trim().length === 0) {
			return fail(400, { error: 'Name is required', name: '', lang: lang ?? undefined });
		}

		if (!lang || !['ko', 'en'].includes(lang)) {
			return fail(400, { error: 'Invalid language', name: name.trim(), lang: 'ko' });
		}

		await updateUser(event.locals.user!.id, { name: name.trim(), lang });

		return { success: true };
	}
};
