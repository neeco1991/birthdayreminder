import { error, fail, redirect } from '@sveltejs/kit';
import { formatNumber, messages } from '#lib/i18n.ts';
import { AI_DAILY_LIMITS, AiUnavailableError, claimAiCall, isAiEnabled } from '#lib/server/ai.ts';
import {
	extractContacts,
	IMAGE_TYPES,
	MAX_IMAGE_BYTES,
	MAX_TEXT_LENGTH
} from '#lib/server/contact-extract.ts';
import { parseContactForm } from '#lib/server/contact-form.ts';
import {
	IMPORT_FILE_EXAMPLE,
	parseImportFile,
	type ImportEntry
} from '#lib/server/contact-import.ts';
import type { Actions, PageServerLoad } from './$types';

const MAX_FILE_BYTES = 1_000_000;

// Reading a screenshot can take a while.
export const config = { maxDuration: 60 };

export const load: PageServerLoad = () => ({
	aiEnabled: isAiEnabled(),
	aiDailyLimit: AI_DAILY_LIMITS.contact_import,
	maxTextLength: MAX_TEXT_LENGTH,
	imageTypes: IMAGE_TYPES,
	fileExample: IMPORT_FILE_EXAMPLE
});

export const actions: Actions = {
	// Step 1: read the file into prefilled contacts. Nothing is saved yet.
	upload: async ({ request, locals }) => {
		const e = messages(locals.locale).importContacts.errors;
		const file = (await request.formData()).get('file');
		if (!(file instanceof File) || file.size === 0) return fail(400, { message: e.noFile });
		if (file.size > MAX_FILE_BYTES) return fail(400, { message: e.fileTooBig });

		const parsed = parseImportFile(await file.text(), locals.locale);
		if (!parsed.ok) return fail(400, { message: parsed.message });
		return { entries: parsed.entries };
	},

	// Step 1, with AI: find contacts in pasted text or a screenshot. The input is sent to the AI once
	// and never stored, logged or echoed back (see the privacy policy, section 5).
	extract: async ({ request, locals }) => {
		if (!locals.user) error(401, 'Unauthorized');
		const t = messages(locals.locale);
		const e = t.importContacts.errors;
		const form = await request.formData();
		const text = String(form.get('text') ?? '').trim();
		const upload = form.get('image');
		const image = upload instanceof File && upload.size > 0 ? upload : null;

		if (!text && !image) return fail(400, { aiMessage: e.noInput });
		if (text.length > MAX_TEXT_LENGTH) {
			return fail(400, {
				aiMessage: e.tooMuchText(formatNumber(MAX_TEXT_LENGTH, locals.locale))
			});
		}
		if (image && !IMAGE_TYPES.includes(image.type)) return fail(400, { aiMessage: e.imageType });
		if (image && image.size > MAX_IMAGE_BYTES) return fail(400, { aiMessage: e.imageTooBig });
		if (!isAiEnabled()) return fail(503, { aiMessage: t.ai.unavailable });
		if (!(await claimAiCall(locals.user.id, 'contact_import'))) {
			return fail(429, { aiMessage: e.aiLimit(AI_DAILY_LIMITS.contact_import) });
		}

		try {
			const entries = await extractContacts(
				{
					text,
					image: image && {
						type: image.type,
						base64: Buffer.from(await image.arrayBuffer()).toString('base64')
					}
				},
				locals.locale
			);
			if (entries.length === 0) return fail(422, { aiMessage: e.nothingFound });
			return { entries, fromAi: true };
		} catch (err) {
			if (!(err instanceof AiUnavailableError)) throw err;
			console.error('[contacts] AI import failed:', err.message);
			return fail(503, { aiMessage: t.ai.unavailable });
		}
	},

	// Step 2: save the reviewed contacts, all or nothing.
	save: async ({ request, locals }) => {
		const form = await request.formData();
		const results = form
			.getAll('entry')
			.map(String)
			.map((key) => ({ key, ...parseContactForm(form, locals.locale, `${key}.`) }));
		const entries: ImportEntry[] = results.map((r) => ({
			key: r.key,
			values: r.values,
			errors: r.ok ? {} : r.errors
		}));
		// Keeps the "found by AI" notice when the review comes back with errors.
		const fromAi = form.get('from_ai') === 'on';

		const contacts = results.flatMap((r) => (r.ok ? [r.data] : []));
		if (contacts.length === 0 || contacts.length < results.length) {
			return fail(400, { entries, fromAi });
		}

		const { error } = await locals.supabase.from('contacts').insert(contacts);
		if (error) {
			console.error('[contacts] import failed', error.message);
			return fail(500, {
				entries,
				fromAi,
				message: messages(locals.locale).importContacts.saveFailed
			});
		}

		redirect(303, '/contacts');
	}
};
