import { describe, expect, it } from 'vitest';
import { MAX_IMPORT_CONTACTS, parseImportFile } from './contact-import.ts';

function parse(friends: unknown) {
	return parseImportFile(JSON.stringify(friends), 'en');
}

describe('parseImportFile', () => {
	it('prefills contacts from an import file', () => {
		const result = parse([
			{ name: ' Anna ', date: '04/11/1987', notification_before: 14 },
			{ name: 'Bea', date: '7/8/', notification_before: 0 }
		]);
		expect(result).toEqual({
			ok: true,
			entries: [
				{
					key: '0',
					values: {
						name: 'Anna',
						birth_day: '4',
						birth_month: '11',
						birth_year: '1987',
						is_gift: true,
						gender: '',
						pills: [],
						custom_pills: []
					},
					errors: {}
				},
				{
					key: '1',
					values: {
						name: 'Bea',
						birth_day: '7',
						birth_month: '8',
						birth_year: '',
						is_gift: false,
						gender: '',
						pills: [],
						custom_pills: []
					},
					errors: {}
				}
			]
		});
	});

	it('leaves missing or unreadable dates blank and flags them', () => {
		const result = parse([
			{ name: 'Erin', date: null, notification_before: 0 },
			{ name: 'Fo', date: 'soon' }
		]);
		expect(
			result.ok && result.entries.map((e) => [e.values.birth_day, e.errors.birth_day])
		).toEqual([
			['', ['No birthday in the file, pick one']],
			['', ['Couldn\'t read "soon", pick the date']]
		]);
	});

	it('flags dates that read fine but are invalid', () => {
		const result = parse([{ name: 'Gil', date: '29/02/1999', notification_before: 0 }]);
		expect(result.ok && result.entries[0].errors.birth_day).toEqual(["That date doesn't exist"]);
	});

	it('rejects files that are not a list of friends', () => {
		expect(parseImportFile('{', 'en')).toEqual({
			ok: false,
			message: "That file isn't valid JSON."
		});
		expect(parse({ name: 'Anna' }).ok).toBe(false);
		expect(parse([{ date: '1/1/1990' }]).ok).toBe(false);
		expect(parse([])).toEqual({ ok: false, message: 'That file has no contacts.' });
		expect(parse(Array(MAX_IMPORT_CONTACTS + 1).fill({ name: 'X', date: null })).ok).toBe(false);
	});

	it('gives errors in the language asked for', () => {
		expect(parseImportFile('[]', 'it')).toEqual({
			ok: false,
			message: 'Il file non contiene contatti.'
		});
		const result = parseImportFile(JSON.stringify([{ name: 'Fo', date: 'presto' }]), 'it');
		expect(result.ok && result.entries[0].errors.birth_day).toEqual([
			'Impossibile leggere "presto", scegli la data'
		]);
	});
});
