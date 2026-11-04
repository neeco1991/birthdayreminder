import { redirect } from '@sveltejs/kit';
import { safeNext } from '#lib/server/auth.ts';
import { parseTheme, THEME_COOKIE, THEME_COOKIE_MAX_AGE } from '#lib/theme.ts';
import type { RequestHandler } from './$types';

// The theme switcher posts here only when JavaScript is off; otherwise it sets the cookie itself.
export const POST: RequestHandler = async ({ request, cookies }) => {
	const form = await request.formData();
	const theme = parseTheme(form.get('theme'));
	if (theme) {
		// Not httpOnly, so the switcher can change it from the browser.
		cookies.set(THEME_COOKIE, theme, { path: '/', maxAge: THEME_COOKIE_MAX_AGE, httpOnly: false });
	} else {
		cookies.delete(THEME_COOKIE, { path: '/' });
	}
	const back = form.get('redirectTo');
	redirect(303, safeNext(typeof back === 'string' ? back : null, '/'));
};
