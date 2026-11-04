import { fail, redirect } from '@sveltejs/kit';
import * as z from 'zod';
import { SUPABASE_URL } from '$app/env/private';
import { messages } from '#lib/i18n.ts';
import { safeNext } from '#lib/server/auth.ts';
import { OTP_LENGTH } from '#lib/server/auth-emails.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	return { authError: url.searchParams.has('error'), codeLength: OTP_LENGTH };
};

function callbackUrl(url: URL): string {
	const callback = new URL('/auth/callback', url.origin);
	callback.searchParams.set('next', safeNext(url.searchParams.get('next')));
	return callback.href;
}

export const actions: Actions = {
	email: async ({ request, url, locals }) => {
		const e = messages(locals.locale).login.errors;
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		if (!z.email().safeParse(email).success) {
			return fail(400, { email, error: e.invalidEmail });
		}

		const { error } = await locals.supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: callbackUrl(url),
				// Saved with new accounts only, so their first email is in the right language. The
				// (app) layout keeps it up to date after that.
				data: { locale: locals.locale }
			}
		});
		if (error) {
			console.error('[login] signInWithOtp failed', error.message);
			const tooMany = error.status === 429;
			const message = tooMany ? e.tooManyAttempts : e.sendFailed;
			// A failed resend keeps the code form, since the earlier email still works.
			return form.has('resend')
				? fail(tooMany ? 429 : 500, { email, sent: true, codeError: message })
				: fail(tooMany ? 429 : 500, { email, error: message });
		}

		return { email, sent: true, resent: form.has('resend') };
	},

	// The code from the email, for when the link would open on another device.
	code: async ({ request, url, locals }) => {
		const e = messages(locals.locale).login.errors;
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const code = String(form.get('code') ?? '').replace(/\s/g, '');
		if (!z.email().safeParse(email).success) {
			return fail(400, { email, error: e.invalidEmail });
		}
		if (code.length !== OTP_LENGTH || !/^\d+$/.test(code)) {
			return fail(400, { email, sent: true, codeError: e.codeFormat(OTP_LENGTH) });
		}

		const { error } = await locals.supabase.auth.verifyOtp({ email, token: code, type: 'email' });
		if (error) {
			console.error('[login] verifyOtp failed', error.message);
			return fail(error.status === 429 ? 429 : 400, {
				email,
				sent: true,
				codeError: error.status === 429 ? e.tooManyAttempts : e.codeFailed
			});
		}
		redirect(303, safeNext(url.searchParams.get('next')));
	},

	google: async ({ url, locals }) => {
		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo: callbackUrl(url) }
		});
		if (error || !data.url) {
			console.error('[login] signInWithOAuth failed', error?.message);
			return fail(500, { email: '', error: messages(locals.locale).login.errors.googleFailed });
		}
		redirect(303, data.url, { external: [SUPABASE_URL] });
	}
};
