import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateUserLang } from '$lib/server/services/user.service';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { lang } = await request.json();
	if (!lang || (lang !== 'ko' && lang !== 'en')) {
		return json({ error: 'Invalid language' }, { status: 400 });
	}

	try {
		await updateUserLang(user.id, lang);
		return json({ success: true });
	} catch {
		return json({ error: 'Failed to update language' }, { status: 500 });
	}
};
