import { describe, expect, it } from 'vitest';
import { parseContactForm } from './contact-form.ts';

function formData(fields: Record<string, string | string[]>): FormData {
	const form = new FormData();
	for (const [key, value] of Object.entries(fields)) {
		for (const v of Array.isArray(value) ? value : [value]) form.append(key, v);
	}
	return form;
}

const valid = { name: ' Anna ', birth_day: '29', birth_month: '2', birth_year: '' };

describe('parseContactForm', () => {
	it('parses a valid contact', () => {
		const result = parseContactForm(
			formData({ ...valid, is_gift: 'on', pills: ['nerd', 'coffee', 'nerd'] }),
			'en'
		);
		expect(result).toMatchObject({
			ok: true,
			data: {
				name: 'Anna',
				birth_day: 29,
				birth_month: 2,
				birth_year: null,
				is_gift: true,
				pills: ['nerd', 'coffee']
			}
		});
	});

	it('rejects Feb 29 in a non-leap year', () => {
		const result = parseContactForm(formData({ ...valid, birth_year: '1999' }), 'en');
		expect(result.ok).toBe(false);
		expect(!result.ok && result.errors.birth_day).toEqual(["That date doesn't exist"]);
	});

	it('rejects unknown pills and future years', () => {
		const result = parseContactForm(
			formData({ ...valid, birth_day: '1', birth_year: '3000', pills: ['astronaut'] }),
			'en'
		);
		expect(result.ok).toBe(false);
		expect(!result.ok && Object.keys(result.errors).sort()).toEqual(['birth_year', 'pills']);
	});

	it('drops gift details from contacts that are not gift contacts', () => {
		const result = parseContactForm(
			formData({ ...valid, gender: 'female', pills: ['nerd'], custom_pills: ['Lego'] }),
			'en'
		);
		expect(result).toMatchObject({ ok: true, data: { gender: null, pills: [], custom_pills: [] } });
	});

	it('reads an optional gender', () => {
		const gift = { ...valid, is_gift: 'on' };
		expect(parseContactForm(formData({ ...gift, gender: 'male' }), 'en')).toMatchObject({
			ok: true,
			data: { gender: 'male' }
		});
		expect(parseContactForm(formData({ ...gift, gender: '' }), 'en')).toMatchObject({
			ok: true,
			data: { gender: null }
		});
		const invalid = parseContactForm(formData({ ...gift, gender: 'robot' }), 'en');
		expect(!invalid.ok && invalid.errors.gender).toEqual(['Pick male or female']);
	});

	it('tidies custom pills and drops blanks and repeats', () => {
		const result = parseContactForm(
			formData({
				...valid,
				is_gift: 'on',
				custom_pills: [' Star  Wars ', 'lego', '', 'star wars', 'Lego']
			}),
			'en'
		);
		expect(result.ok && result.data.custom_pills).toEqual(['Star Wars', 'lego']);
	});

	it('limits custom pills', () => {
		const tooMany = parseContactForm(
			formData({
				...valid,
				is_gift: 'on',
				custom_pills: Array.from({ length: 11 }, (_, i) => `p${i}`)
			}),
			'en'
		);
		expect(!tooMany.ok && tooMany.errors.custom_pills).toEqual(['Add at most 10']);
		const tooLong = parseContactForm(
			formData({ ...valid, is_gift: 'on', custom_pills: 'x'.repeat(31) }),
			'en'
		);
		expect(!tooLong.ok && tooLong.errors.custom_pills).toEqual(['Keep each under 30 characters']);
	});

	it('reads one contact out of a form holding several', () => {
		const result = parseContactForm(
			formData({ 'a.name': 'Anna', 'a.birth_day': '1', 'a.birth_month': '2', 'b.name': 'Bea' }),
			'en',
			'a.'
		);
		expect(result).toMatchObject({
			ok: true,
			data: { name: 'Anna', birth_day: 1, birth_month: 2 }
		});
	});

	it('requires a name', () => {
		const result = parseContactForm(formData({ ...valid, name: '   ' }), 'en');
		expect(!result.ok && result.errors.name).toEqual(['Name is required']);
	});

	it('gives errors in the language asked for', () => {
		const result = parseContactForm(formData({ ...valid, name: '', birth_year: '1999' }), 'it');
		expect(!result.ok && result.errors).toMatchObject({
			name: ['Il nome è obbligatorio'],
			birth_day: ['Questa data non esiste']
		});
	});
});
