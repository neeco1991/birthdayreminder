import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { resolveLocale } from '#lib/server/locale.ts';
import { createSupabaseServerClient } from '#lib/server/supabase.ts';
import { parseTheme, THEME_COOKIE } from '#lib/theme.ts';

const PROTECTED_PREFIXES = ['/contacts', '/settings'];

function isProtected(pathname: string): boolean {
	return PROTECTED_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
	);
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient(event);

	// getClaims() verifies the JWT (refreshing it if needed) before anything renders,
	// so refreshed session cookies can still be written to this response.
	const { data } = await event.locals.supabase.auth.getClaims();
	const claims = data?.claims;
	event.locals.user = claims ? { id: claims.sub, email: claims.email ?? '' } : null;
	event.locals.theme = parseTheme(event.cookies.get(THEME_COOKIE));
	event.locals.locale = await resolveLocale(event);

	const { pathname, search } = event.url;
	if (!event.locals.user && isProtected(pathname)) {
		redirect(303, `/login?next=${encodeURIComponent(pathname + search)}`);
	}
	if (event.locals.user && pathname === '/login') {
		redirect(303, '/contacts');
	}

	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('%theme%', event.locals.theme ?? '').replace('%lang%', event.locals.locale)
	});
};
