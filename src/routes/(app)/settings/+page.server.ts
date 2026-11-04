import { error, fail, redirect } from '@sveltejs/kit';
import * as z from 'zod';
import { isValidTimeZone } from '#lib/dates.ts';
import { messages, type Locale } from '#lib/i18n.ts';
import { getSupabaseAdmin } from '#lib/server/supabase.ts';
import type { Actions, PageServerLoad } from './$types';

function settingsSchema(locale: Locale) {
	const e = messages(locale).settings.errors;
	return z.object({
		emails_enabled: z.boolean(),
		send_hour: z.coerce.number().int().min(0).max(23),
		timezone: z.string().refine(isValidTimeZone, e.timezone),
		gift_lead_days: z.coerce
			.number(e.leadDaysNumber)
			.int(e.leadDaysWhole)
			.min(1, e.leadDaysMin)
			.max(60, e.leadDaysMax)
	});
}

function timeZones(): string[] {
	const zones = Intl.supportedValuesOf('timeZone');
	return zones.includes('UTC') ? zones : ['UTC', ...zones];
}

export const load: PageServerLoad = ({ locals }) => {
	return { email: locals.user?.email ?? '', timeZones: timeZones() };
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		if (!locals.user) error(401, 'Unauthorized');
		const form = await request.formData();
		const parsed = settingsSchema(locals.locale).safeParse({
			emails_enabled: form.get('emails_enabled') === 'on',
			send_hour: form.get('send_hour'),
			timezone: form.get('timezone'),
			gift_lead_days: form.get('gift_lead_days')
		});
		if (!parsed.success) {
			return fail(400, { errors: z.flattenError(parsed.error).fieldErrors });
		}

		const { error: dbError } = await locals.supabase
			.from('profiles')
			.update(parsed.data)
			.eq('id', locals.user.id);
		if (dbError) {
			console.error('[settings] update failed', dbError.message);
			return fail(500, { message: messages(locals.locale).settings.saveFailed });
		}
		return { saved: true };
	},

	deleteAccount: async ({ locals }) => {
		if (!locals.user) error(401, 'Unauthorized');
		// Profile, contacts and reminder history are removed by ON DELETE CASCADE.
		const { error: dbError } = await getSupabaseAdmin().auth.admin.deleteUser(locals.user.id);
		if (dbError) {
			console.error('[settings] deleteUser failed', dbError.message);
			return fail(500, { message: messages(locals.locale).settings.deleteFailed });
		}
		// The user no longer exists server-side; this just clears the session cookies.
		await locals.supabase.auth.signOut({ scope: 'local' });
		redirect(303, '/');
	}
};
