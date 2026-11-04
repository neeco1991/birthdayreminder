import * as z from 'zod';
import { Constants } from '#lib/database.types.ts';
import { isValidBirthday } from '#lib/dates.ts';
import { messages, type Locale } from '#lib/i18n.ts';
import {
	MAX_CUSTOM_PILL_LENGTH,
	MAX_CUSTOM_PILLS,
	normalizeCustomPills,
	PILL_SLUGS
} from '#lib/pills.ts';

/** Raw form values, echoed back to the form when validation fails. */
export interface ContactFormValues {
	name: string;
	birth_day: string;
	birth_month: string;
	birth_year: string;
	is_gift: boolean;
	gender: string;
	pills: string[];
	custom_pills: string[];
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string[]>>;

function contactSchema(locale: Locale) {
	const e = messages(locale).contactForm.errors;
	return (
		z
			.object({
				name: z.string().trim().min(1, e.nameRequired).max(100, e.nameTooLong),
				birth_day: z.coerce.number().int().min(1, e.pickDay).max(31),
				birth_month: z.coerce.number().int().min(1, e.pickMonth).max(12),
				birth_year: z.preprocess(
					(value) => (value === '' ? null : value),
					z.coerce
						.number(e.yearFormat)
						.int()
						.min(1900, e.yearTooEarly)
						.refine((year) => year <= new Date().getFullYear(), e.yearInFuture)
						.nullable()
				),
				is_gift: z.boolean(),
				gender: z.preprocess(
					(value) => (value === '' ? null : value),
					z.enum(Constants.public.Enums.gender, e.pickGender).nullable()
				),
				pills: z.array(z.enum(PILL_SLUGS)).max(10, e.tooManyPills),
				custom_pills: z
					.array(
						z.string().max(MAX_CUSTOM_PILL_LENGTH, e.customPillTooLong(MAX_CUSTOM_PILL_LENGTH))
					)
					.max(MAX_CUSTOM_PILLS, e.tooManyCustomPills(MAX_CUSTOM_PILLS))
			})
			.refine((c) => isValidBirthday(c.birth_day, c.birth_month, c.birth_year), {
				message: e.noSuchDate,
				path: ['birth_day']
			})
			// Gender and pills are for gift ideas, so only gift contacts keep them.
			.transform((c) => ({
				...c,
				gender: c.is_gift ? c.gender : null,
				pills: c.is_gift ? c.pills : [],
				custom_pills: c.is_gift ? c.custom_pills : []
			}))
	);
}

type ContactSchema = ReturnType<typeof contactSchema>;

export type ContactInput = z.infer<ContactSchema>;

// One schema per language, built on first use: an import validates up to 500 contacts at once.
const schemas = new Map<Locale, ContactSchema>();

function schemaFor(locale: Locale): ContactSchema {
	let schema = schemas.get(locale);
	if (!schema) schemas.set(locale, (schema = contactSchema(locale)));
	return schema;
}

export function emptyContactValues(): ContactFormValues {
	return {
		name: '',
		birth_day: '',
		birth_month: '',
		birth_year: '',
		is_gift: false,
		gender: '',
		pills: [],
		custom_pills: []
	};
}

export function contactToValues(contact: {
	name: string;
	birth_day: number;
	birth_month: number;
	birth_year: number | null;
	is_gift: boolean;
	gender: string | null;
	pills: string[];
	custom_pills: string[];
}): ContactFormValues {
	return {
		name: contact.name,
		birth_day: String(contact.birth_day),
		birth_month: String(contact.birth_month),
		birth_year: contact.birth_year === null ? '' : String(contact.birth_year),
		is_gift: contact.is_gift,
		gender: contact.gender ?? '',
		pills: contact.pills,
		custom_pills: contact.custom_pills
	};
}

/** Error messages are in `locale`. */
export function validateContact(
	values: ContactFormValues,
	locale: Locale
): { ok: true; data: ContactInput } | { ok: false; errors: ContactFormErrors } {
	const result = schemaFor(locale).safeParse(values);
	if (!result.success) return { ok: false, errors: z.flattenError(result.error).fieldErrors };
	return { ok: true, data: result.data };
}

/** `prefix` picks one contact out of a form that holds several (see ContactFields). */
export function parseContactForm(
	form: FormData,
	locale: Locale,
	prefix = ''
):
	| { ok: true; data: ContactInput; values: ContactFormValues }
	| { ok: false; values: ContactFormValues; errors: ContactFormErrors } {
	const get = (field: keyof ContactFormValues) => form.get(prefix + field);
	const values: ContactFormValues = {
		name: String(get('name') ?? ''),
		birth_day: String(get('birth_day') ?? ''),
		birth_month: String(get('birth_month') ?? ''),
		birth_year: String(get('birth_year') ?? '').trim(),
		is_gift: get('is_gift') === 'on',
		gender: String(get('gender') ?? ''),
		pills: [...new Set(form.getAll(prefix + 'pills').map(String))],
		custom_pills: normalizeCustomPills(form.getAll(prefix + 'custom_pills').map(String))
	};

	return { ...validateContact(values, locale), values };
}
