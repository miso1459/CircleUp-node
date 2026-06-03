import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	emailAndPassword: { enabled: true },

	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: true,
				defaultValue: 'guest',
				input: false
			},
			lang: {
				type: 'string',
				required: true,
				defaultValue: 'ko',
				input: true
			},
			isActive: {
				type: 'boolean',
				required: true,
				defaultValue: true,
				input: false
			}
		}
	},

	session: {
		// 세션 만료 시간 (초 단위, 기본값: 7일)
		// expiresIn: 60 * 60 * 24 * 7, // 7일
		expiresIn: 60 * 60 // 1시간

		// 마지막 활동 기준으로 세션 갱신 여부
		// updateAge: 60 * 60 * 24, // 24시간마다 갱신

		// 쿠키 캐시 설정 (DB 요청 최소화)
		// cookieCache: {
		// 	enabled: true,
		// 	maxAge: 60 * 5, // 5분마다 DB 재검증
		// },
	},	

  socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
