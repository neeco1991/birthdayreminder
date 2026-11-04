import { fail } from '@sveltejs/kit';
import { messages } from '#lib/i18n.ts';
import { getSupabaseAdmin } from '#lib/server/supabase.ts';
import { verifyUnsubscribe } from '#lib/server/unsubscribe.ts';
import type { Actions, PageServerLoad } from './$types';

// The link in every reminder email. Opening it only asks; the button does it, so link scanners
// that open every URL in an email can't turn reminders off.
export const load: PageServerLoad = ({ url }) => {
	return { valid: verifyUnsubscribe(url.searchParams) !== null };
};

export const actions: Actions = {
	default: async ({ url, locals }) => {
		const t = messages(locals.locale).unsubscribe;
		const userId = verifyUnsubscribe(url.searchParams);
		if (!userId) return fail(400, { message: t.invalid });

		const { error } = await getSupabaseAdmin()
			.from('profiles')
			.update({ emails_enabled: false })
			.eq('id', userId);
		if (error) {
			console.error('[unsubscribe] update failed', error.message);
			return fail(500, { message: t.failed });
		}
		return { done: true };
	}
};
