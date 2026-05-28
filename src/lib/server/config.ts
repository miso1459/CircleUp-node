import { env } from '$env/dynamic/private';

export function getAdminEmails(): string[] {
	if (!env.ADMIN_EMAILS) return [];
	return env.ADMIN_EMAILS.split(',').map((email) => email.trim()).filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
	return getAdminEmails().includes(email);
}
