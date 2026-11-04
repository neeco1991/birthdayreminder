import { redirect } from '@sveltejs/kit';
import { safeNext } from '#lib/server/auth.ts';
import type { RequestHandler } from './$types';

// OAuth (Google) and the default magic-link template land here with a PKCE `code`.
export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (!error) redirect(303, safeNext(url.searchParams.get('next')));
		console.error('[auth] exchangeCodeForSession failed', error.message);
	}
	redirect(303, '/login?error=callback');
};
