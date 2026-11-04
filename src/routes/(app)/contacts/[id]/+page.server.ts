import { error, fail, redirect } from '@sveltejs/kit';
import { nextOccurrence, todayIn } from '#lib/dates.ts';
import { messages } from '#lib/i18n.ts';
import { AI_DAILY_LIMITS, AiUnavailableError, claimAiCall, isAiEnabled } from '#lib/server/ai.ts';
import { contactToValues, parseContactForm } from '#lib/server/contact-form.ts';
import { getGiftIdeas, giftProfile } from '#lib/server/gift-ideas.ts';
import type { Actions, PageServerLoad } from './$types';

const CONTACT_COLUMNS =
	'id, name, birth_day, birth_month, birth_year, is_gift, gender, pills, custom_pills';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: contact } = await locals.supabase
		.from('contacts')
		.select(CONTACT_COLUMNS)
		.eq('id', params.id)
		.maybeSingle();
	// RLS hides other users' contacts, so "not yours" and "doesn't exist" look the same.
	if (!contact) error(404, messages(locals.locale).editContact.notFound);

	return { contact, values: contactToValues(contact), aiEnabled: isAiEnabled() };
};

export const actions: Actions = {
	save: async ({ params, request, locals }) => {
		const t = messages(locals.locale);
		const parsed = parseContactForm(await request.formData(), locals.locale);
		if (!parsed.ok) return fail(400, { values: parsed.values, errors: parsed.errors });

		const { data, error: dbError } = await locals.supabase
			.from('contacts')
			.update(parsed.data)
			.eq('id', params.id)
			.select('id');
		if (dbError) {
			console.error('[contacts] update failed', dbError.message);
			return fail(500, {
				values: parsed.values,
				message: t.contactForm.saveFailed
			});
		}
		if (data.length === 0) error(404, t.editContact.notFound);

		redirect(303, '/contacts');
	},

	// From the saved contact: only interests, gender and age range reach the AI, never the name.
	giftIdeas: async ({ params, locals }) => {
		if (!locals.user) error(401, 'Unauthorized');
		const t = messages(locals.locale);
		const [{ data: contact }, { data: profile }] = await Promise.all([
			locals.supabase.from('contacts').select(CONTACT_COLUMNS).eq('id', params.id).maybeSingle(),
			locals.supabase.from('profiles').select('timezone').eq('id', locals.user.id).maybeSingle()
		]);
		if (!contact) error(404, t.editContact.notFound);

		const today = todayIn(profile?.timezone ?? null);
		const gift = contact.is_gift
			? giftProfile(contact, nextOccurrence(contact, today), locals.locale)
			: null;
		if (!gift) {
			return fail(400, { ideasMessage: t.editContact.ideasNeedDetails });
		}
		if (!isAiEnabled()) return fail(503, { ideasMessage: t.ai.unavailable });
		if (!(await claimAiCall(locals.user.id, 'gift_ideas'))) {
			return fail(429, { ideasMessage: t.editContact.ideasLimit(AI_DAILY_LIMITS.gift_ideas) });
		}

		try {
			return { ideas: await getGiftIdeas(gift) };
		} catch (e) {
			if (!(e instanceof AiUnavailableError)) throw e;
			console.error('[contacts] gift ideas failed:', e.message);
			return fail(503, { ideasMessage: t.ai.unavailable });
		}
	},

	delete: async ({ params, locals }) => {
		const { error: dbError } = await locals.supabase.from('contacts').delete().eq('id', params.id);
		if (dbError) {
			console.error('[contacts] delete failed', dbError.message);
			return fail(500, { message: messages(locals.locale).editContact.deleteFailed });
		}
		redirect(303, '/contacts');
	}
};
