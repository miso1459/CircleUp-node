import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';
import type { User } from 'better-auth';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getUserById } from '$lib/server/services/user.service';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user as User & { role: string; lang: string };
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

/**
 * Sync the user's DB lang preference to the Paraglide locale cookie
 * ONLY on first login (when no PARAGLIDE_LOCALE cookie exists).
 * User-initiated language changes via UI are preserved and NOT overwritten.
 */
const handleLangSync: Handle = async ({ event, resolve }) => {
	if (event.locals.user) {
		const existingCookie = event.request.headers.get('cookie') || '';
		const hasLocaleCookie = existingCookie.includes('PARAGLIDE_LOCALE=');

		// Only set cookie from DB if user doesn't already have one
		if (!hasLocaleCookie) {
			const dbUser = await getUserById(event.locals.user.id);
			if (dbUser?.lang) {
				const newHeaders = new Headers(event.request.headers);
				const cookies = existingCookie
					.split('; ')
					.filter((c) => !c.startsWith('PARAGLIDE_LOCALE='));
				cookies.unshift(`PARAGLIDE_LOCALE=${dbUser.lang}`);
				newHeaders.set('cookie', cookies.join('; '));
				event.request = new Request(event.request, { headers: newHeaders });
			}
		}
	}
	return resolve(event);
};

export const handle: Handle = sequence(handleBetterAuth, handleLangSync, handleParaglide);
