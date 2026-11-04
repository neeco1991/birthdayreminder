import { redirect } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';
import { safeNext } from '#lib/server/auth.ts';
import type { RequestHandler } from './$types';

// Magic links from the customized email templates (see README). Unlike /auth/callback,
// this works even when the link is opened in a different browser than the one that asked for it.
export const GET: RequestHandler = async ({ url, locals }) => {
	const tokenHash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	if (tokenHash && type) {
		const { error } = await locals.supabase.auth.verifyOtp({ token_hash: tokenHash, type });
		if (!error) redirect(303, safeNext(url.searchParams.get('next')));
		console.error('[auth] verifyOtp failed', error.message);
	}
	redirect(303, '/login?error=confirm');
};
