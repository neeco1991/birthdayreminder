import { error, redirect } from '@sveltejs/kit';
import { parseLocale } from '#lib/i18n.ts';
import { safeNext } from '#lib/server/auth.ts';
import { setLocaleCookie } from '#lib/server/locale.ts';
import type { RequestHandler } from './$types';

// The language switcher posts here only when JavaScript is off; otherwise it sets the cookie itself.
export const POST: RequestHandler = async ({ request, cookies }) => {
	const form = await request.formData();
	const locale = parseLocale(form.get('locale'));
	if (!locale) error(400, 'Unknown language');
	setLocaleCookie(cookies, locale);
	const back = form.get('redirectTo');
	redirect(303, safeNext(typeof back === 'string' ? back : null, '/'));
};
