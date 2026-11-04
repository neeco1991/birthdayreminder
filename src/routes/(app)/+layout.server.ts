import { error, redirect } from '@sveltejs/kit';
import { messages, type Locale } from '#lib/i18n.ts';
import { getSupabaseAdmin } from '#lib/server/supabase.ts';
import type { LayoutServerLoad } from './$types';

const PROFILE_COLUMNS = 'timezone, send_hour, gift_lead_days, emails_enabled, locale';

/**
 * On the profile for reminder emails, and in the auth user's metadata for the sign-in emails, which
 * Supabase renders from it (see auth-emails.ts). Metadata is merged, so this keeps the other keys.
 */
async function saveLocale(userId: string, locale: Locale, locals: App.Locals): Promise<void> {
	const [profile, metadata] = await Promise.all([
		locals.supabase.from('profiles').update({ locale }).eq('id', userId),
		getSupabaseAdmin().auth.admin.updateUserById(userId, { user_metadata: { locale } })
	]);
	const failed = profile.error ?? metadata.error;
	if (failed) console.error('[profile] could not save language', failed.message);
}

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	const t = messages(locals.locale).profile;

	const { data: profile, error: dbError } = await locals.supabase
		.from('profiles')
		.select(PROFILE_COLUMNS)
		.eq('id', locals.user.id)
		.maybeSingle();
	if (dbError) error(500, t.loadFailed);

	if (profile) {
		// Emails go out in the language the user last used the site in. Reruns when the language
		// switcher reloads the page data, so a new choice is saved straight away.
		if (profile.locale !== locals.locale) await saveLocale(locals.user.id, locals.locale, locals);
		return { profile };
	}

	// The signup trigger normally creates the profile; this covers accounts created before it existed.
	const { data: created, error: createError } = await getSupabaseAdmin()
		.from('profiles')
		.upsert({ id: locals.user.id, email: locals.user.email })
		.select(PROFILE_COLUMNS)
		.single();
	if (createError) error(500, t.createFailed);
	await saveLocale(locals.user.id, locals.locale, locals);
	return { profile: created };
};
