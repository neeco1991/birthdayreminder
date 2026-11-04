import { fail, redirect } from '@sveltejs/kit';
import { messages } from '#lib/i18n.ts';
import { emptyContactValues, parseContactForm } from '#lib/server/contact-form.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return { values: emptyContactValues() };
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const parsed = parseContactForm(await request.formData(), locals.locale);
		if (!parsed.ok) return fail(400, { values: parsed.values, errors: parsed.errors });

		const { error } = await locals.supabase.from('contacts').insert(parsed.data);
		if (error) {
			console.error('[contacts] insert failed', error.message);
			return fail(500, {
				values: parsed.values,
				message: messages(locals.locale).contactForm.saveFailed
			});
		}

		redirect(303, '/contacts');
	}
};
