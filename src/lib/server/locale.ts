import type { Cookies, RequestEvent } from '@sveltejs/kit';
import {
	defaultLocale,
	LOCALE_COOKIE,
	LOCALE_COOKIE_MAX_AGE,
	parseLocale,
	type Locale
} from '#lib/i18n.ts';

export function setLocaleCookie(cookies: Cookies, locale: Locale): void {
	// Not httpOnly, so the language switcher can change it from the browser.
	cookies.set(LOCALE_COOKIE, locale, {
		path: '/',
		maxAge: LOCALE_COOKIE_MAX_AGE,
		httpOnly: false
	});
}

/**
 * The language to show: the one picked on this browser, else the account's (remembered on this browser
 * from then on), else Italian for visitors in Italy and English for everyone else. Vercel sets the
 * country header from the IP address; without it (local dev) visitors get English.
 */
export async function resolveLocale(event: RequestEvent): Promise<Locale> {
	const chosen = parseLocale(event.cookies.get(LOCALE_COOKIE));
	if (chosen) return chosen;

	if (event.locals.user) {
		const { data } = await event.locals.supabase
			.from('profiles')
			.select('locale')
			.eq('id', event.locals.user.id)
			.maybeSingle();
		if (data?.locale) {
			setLocaleCookie(event.cookies, data.locale);
			return data.locale;
		}
	}

	return defaultLocale(event.request.headers.get('x-vercel-ip-country'));
}
