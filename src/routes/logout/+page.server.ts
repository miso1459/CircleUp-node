import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Will be handled by form action
};

export const actions: Actions = {
	default: async ({ request }) => {
		await auth.api.signOut({
			headers: request.headers
		});
		throw redirect(302, '/');
	}
};