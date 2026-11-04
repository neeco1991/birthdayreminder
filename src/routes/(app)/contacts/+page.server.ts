import { error } from '@sveltejs/kit';
import { ageAt, daysBetween, nextOccurrence, todayIn } from '#lib/dates.ts';
import { messages } from '#lib/i18n.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { profile } = await parent();
	const { data, error: dbError } = await locals.supabase
		.from('contacts')
		.select('id, name, birth_day, birth_month, birth_year, is_gift, pills, custom_pills');
	if (dbError) error(500, messages(locals.locale).contacts.loadFailed);

	const today = todayIn(profile.timezone);
	const contacts = data
		.map((contact) => {
			const next = nextOccurrence(contact, today);
			return {
				...contact,
				next,
				daysUntil: daysBetween(today, next),
				turning: ageAt(contact, next)
			};
		})
		.sort((a, b) => a.daysUntil - b.daysUntil || a.name.localeCompare(b.name, locals.locale));

	return { contacts };
};
