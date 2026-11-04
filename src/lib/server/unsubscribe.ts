import { createHmac, timingSafeEqual } from 'node:crypto';
import { APP_URL, CRON_SECRET } from '$app/env/private';

// Reminder emails link to /unsubscribe with the user's ID and a signature, so turning emails off
// doesn't need a sign-in. The signature is keyed on CRON_SECRET: changing it invalidates old links.

function sign(userId: string): string {
	return createHmac('sha256', CRON_SECRET).update(`unsubscribe:${userId}`).digest('base64url');
}

export function unsubscribeUrl(userId: string): string {
	const url = new URL('/unsubscribe', APP_URL);
	url.searchParams.set('u', userId);
	url.searchParams.set('t', sign(userId));
	return url.href;
}

/** The user ID the link was made for, or null when the signature doesn't match. */
export function verifyUnsubscribe(params: URLSearchParams): string | null {
	const userId = params.get('u');
	const token = params.get('t');
	if (!userId || !token) return null;
	const expected = Buffer.from(sign(userId));
	const given = Buffer.from(token);
	return given.length === expected.length && timingSafeEqual(given, expected) ? userId : null;
}
