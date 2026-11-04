import { error } from '@sveltejs/kit';
import { messages } from '#lib/i18n.ts';
import { getSupabaseAdmin } from '#lib/server/supabase.ts';
import type { RequestHandler } from './$types';

const CONTACT_COLUMNS =
	'name, birth_day, birth_month, birth_year, is_gift, gender, pills, custom_pills, created_at, updated_at';

/** Everything stored about the signed-in user, as a JSON download (GDPR rights of access and portability). */
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const [auth, profile, contacts, aiUsage] = await Promise.all([
		locals.supabase.auth.getUser(),
		locals.supabase
			.from('profiles')
			.select('email, timezone, send_hour, gift_lead_days, emails_enabled, locale, created_at')
			.eq('id', locals.user.id)
			.single(),
		// Only the service role can read reminder_log and ai_usage, so these run as admin, scoped to the user.
		getSupabaseAdmin()
			.from('contacts')
			.select(`${CONTACT_COLUMNS}, reminders_sent:reminder_log(kind, occurrence_date, sent_at)`)
			.eq('user_id', locals.user.id)
			.order('name'),
		getSupabaseAdmin().from('ai_usage').select('feature, day, calls').eq('user_id', locals.user.id)
	]);
	if (auth.error || profile.error || contacts.error || aiUsage.error) {
		console.error(
			'[export] failed',
			(auth.error ?? profile.error ?? contacts.error ?? aiUsage.error)?.message
		);
		error(500, messages(locals.locale).settings.exportFailed);
	}

	const { user } = auth.data;
	const now = new Date();
	const data = {
		exported_at: now.toISOString(),
		account: {
			email: user.email,
			created_at: user.created_at,
			last_sign_in_at: user.last_sign_in_at,
			sign_in_methods: user.app_metadata.providers ?? [],
			// What the sign-in provider (e.g. Google) shared, stored with the account by Supabase Auth.
			sign_in_profile: user.user_metadata
		},
		settings: profile.data,
		contacts: contacts.data,
		ai_usage_today: aiUsage.data
	};

	return new Response(JSON.stringify(data, null, 2), {
		headers: {
			'content-type': 'application/json',
			'content-disposition': `attachment; filename="birthday-reminder-data-${now.toISOString().slice(0, 10)}.json"`,
			'cache-control': 'no-store'
		}
	});
};
