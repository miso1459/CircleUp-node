import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';
import type { User } from 'better-auth';
import { getTextDirection, cookieName, cookieMaxAge, cookieDomain } from '$lib/paraglide/runtime';
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

		// Detect fresh login: session created within last 30 seconds
		const createdAt = session.session.createdAt instanceof Date
			? session.session.createdAt.getTime()
			: new Date(session.session.createdAt).getTime();
		event.locals.isFreshLogin = (Date.now() - createdAt) < 30_000;
	} else {
		event.locals.user = null;
		event.locals.session = null;
		event.locals.isFreshLogin = false;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

/**
 * Sync the user's DB lang preference to the Paraglide locale cookie.
 *
 * - Fresh login: ALWAYS override cookie from DB (user's profile language takes priority).
 * - Existing session: respect existing cookie (user's manual nav switch is preserved).
 *
 * Sets BOTH request cookie (for SSR rendering) AND response Set-Cookie
 * (so the browser persists the preference for client-side hydration).
 */
const handleLangSync: Handle = async ({ event, resolve }) => {
	if (event.locals.user && event.locals.isFreshLogin) {
		const dbUser = await getUserById(event.locals.user.id);
		if (dbUser?.lang) {
			// 1. Modify request headers so paraglideMiddleware reads correct locale for SSR
			const newHeaders = new Headers(event.request.headers);
			const existingCookie = event.request.headers.get('cookie') || '';
			const cookies = existingCookie
				.split('; ')
				.filter((c) => !c.startsWith('PARAGLIDE_LOCALE='));
			cookies.unshift(`PARAGLIDE_LOCALE=${dbUser.lang}`);
			newHeaders.set('cookie', cookies.join('; '));
			event.request = new Request(event.request, { headers: newHeaders });

			// 2. After resolve, set Set-Cookie on response so browser persists it
			const response = await resolve(event);
			const newResponse = new Response(response.body, response);
			const cookieValue = `${cookieName}=${dbUser.lang}; Path=/; Max-Age=${cookieMaxAge}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`;
			newResponse.headers.append('Set-Cookie', cookieValue);
			return newResponse;
		}
	}
	return resolve(event);
};

export const handle: Handle = sequence(handleBetterAuth, handleLangSync, handleParaglide);
