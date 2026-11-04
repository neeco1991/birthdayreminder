import * as z from 'zod';
import { messages, type Locale } from '#lib/i18n.ts';
import { type ContactFormErrors, type ContactFormValues, validateContact } from './contact-form.ts';

export const MAX_IMPORT_CONTACTS = 500;

/** What an import file looks like, shown on the import page and in errors. */
export const IMPORT_FILE_EXAMPLE =
	'[{ "name": "Anna", "date": "29/02/1992", "notification_before": 14 }]';

/**
 * An import file: `date` is DD/MM/YYYY, or DD/MM/ without the year,
 * and `notification_before` > 0 asked for an advance reminder.
 */
const importFileSchema = z.array(
	z.object({
		name: z.string(),
		date: z.string().nullish(),
		notification_before: z.number().nullish()
	})
);

const DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{4})?)?$/;

/** One prefilled contact to review. `key` names its fields in the import form. */
export interface ImportEntry {
	key: string;
	values: ContactFormValues;
	errors: ContactFormErrors;
}

/** Turns a file into prefilled contacts, already validated so the ones needing a fix stand out. */
export function parseImportFile(
	text: string,
	locale: Locale
): { ok: true; entries: ImportEntry[] } | { ok: false; message: string } {
	const e = messages(locale).importContacts.errors;
	let json: unknown;
	try {
		json = JSON.parse(text);
	} catch {
		return { ok: false, message: e.invalidJson };
	}

	const result = importFileSchema.safeParse(json);
	if (!result.success) return { ok: false, message: e.wrongShape(IMPORT_FILE_EXAMPLE) };
	const friends = result.data;
	if (friends.length === 0) return { ok: false, message: e.noContacts };
	if (friends.length > MAX_IMPORT_CONTACTS) {
		return { ok: false, message: e.tooManyContacts(friends.length, MAX_IMPORT_CONTACTS) };
	}

	const entries = friends.map((friend, index): ImportEntry => {
		const date = friend.date?.trim() ?? '';
		const match = DATE_PATTERN.exec(date);
		const values: ContactFormValues = {
			name: friend.name.trim(),
			// Through Number so "07" becomes "7", matching the day and month options.
			birth_day: match ? String(Number(match[1])) : '',
			birth_month: match ? String(Number(match[2])) : '',
			birth_year: match?.[3] ?? '',
			is_gift: (friend.notification_before ?? 0) > 0,
			gender: '',
			pills: [],
			custom_pills: []
		};

		const missingDate = date ? e.unreadableDate(date) : e.noDateInFile;
		return importEntry(String(index), values, locale, match ? undefined : missingDate);
	});

	return { ok: true, entries };
}

/** A prefilled contact to review, validated up front. `missingDate` flags a birthday that couldn't be read. */
export function importEntry(
	key: string,
	values: ContactFormValues,
	locale: Locale,
	missingDate?: string
): ImportEntry {
	const validation = validateContact(values, locale);
	const errors = validation.ok ? {} : validation.errors;
	if (missingDate) errors.birth_day = [missingDate];
	return { key, values, errors };
}
