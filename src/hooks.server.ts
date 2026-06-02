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
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

/**
 * Sync the user's DB lang preference to the Paraglide locale cookie.
 *
 * Only syncs ONCE per session (tracked via PARAGLIDE_LANG_SYNCED cookie).
 * After the initial sync, user's manual nav language changes are preserved.
 */
const handleLangSync: Handle = async ({ event, resolve }) => {
	if (event.locals.user) {
		const existingCookie = event.request.headers.get('cookie') || '';
		const hasSyncedFlag = existingCookie.includes('PARAGLIDE_LANG_SYNCED=');

		if (!hasSyncedFlag) {
			// First request after login: sync from DB
			const dbUser = await getUserById(event.locals.user.id);
			if (dbUser?.lang) {
				const newHeaders = new Headers(event.request.headers);
				const cookies = existingCookie
					.split('; ')
					.filter(
						(c) =>
							!c.startsWith('PARAGLIDE_LOCALE=') &&
							!c.startsWith('PARAGLIDE_LANG_SYNCED=')
					);
				cookies.unshift(`PARAGLIDE_LOCALE=${dbUser.lang}`);
				cookies.unshift('PARAGLIDE_LANG_SYNCED=true');
				newHeaders.set('cookie', cookies.join('; '));
				event.request = new Request(event.request, { headers: newHeaders });

				const response = await resolve(event);
				const newResponse = new Response(response.body, response);
				newResponse.headers.append(
					'Set-Cookie',
					`${cookieName}=${dbUser.lang}; Path=/; Max-Age=${cookieMaxAge}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`
				);
				newResponse.headers.append(
					'Set-Cookie',
					`PARAGLIDE_LANG_SYNCED=true; Path=/; Max-Age=${cookieMaxAge}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`
				);
				return newResponse;
			}
		}
	}
	return resolve(event);
};

export const handle: Handle = sequence(handleBetterAuth, handleLangSync, handleParaglide);
