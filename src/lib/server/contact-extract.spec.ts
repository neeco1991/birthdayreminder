import { describe, expect, it, vi } from 'vitest';
import type { ChatMessage } from './ai.ts';
import type { FoundContact } from './contact-extract.ts';

const completeJson =
	vi.fn<
		(request: {
			messages: ChatMessage[];
			temperature: number;
		}) => Promise<{ contacts: FoundContact[] }>
	>();
vi.mock('./ai.ts', () => ({
	completeJson: (request: { messages: ChatMessage[]; temperature: number }) => completeJson(request)
}));

const { extractContacts, foundToEntries } = await import('./contact-extract.ts');

const found = (overrides: Partial<FoundContact> = {}): FoundContact => ({
	name: 'Anna',
	birth_day: 29,
	birth_month: 2,
	birth_year: 1992,
	...overrides
});

describe('foundToEntries', () => {
	it('prefills valid contacts with no errors', () => {
		expect(foundToEntries([found()], 'en')).toEqual([
			{
				key: '0',
				values: expect.objectContaining({
					name: 'Anna',
					birth_day: '29',
					birth_month: '2',
					birth_year: '1992',
					is_gift: false
				}),
				errors: {}
			}
		]);
	});

	it('flags missing and impossible birthdays for review, and drops blank names', () => {
		const entries = foundToEntries(
			[
				found({ name: ' Marco ', birth_month: null, birth_year: null }),
				found({ name: '  ' }),
				found({ name: 'Lia', birth_day: 31, birth_month: 2, birth_year: null })
			],
			'en'
		);

		expect(entries.map((e) => e.values.name)).toEqual(['Marco', 'Lia']);
		expect(entries[0].errors.birth_day).toEqual(['No birthday found, pick one']);
		expect(entries[1].errors.birth_day).toEqual(["That date doesn't exist"]);
	});

	it('flags them in the language asked for', () => {
		const [entry] = foundToEntries([found({ birth_day: null })], 'it');
		expect(entry.errors.birth_day).toEqual(['Nessun compleanno trovato, scegline uno']);
	});
});

describe('extractContacts', () => {
	it('sends the text and the image once, as data', async () => {
		completeJson.mockResolvedValue({ contacts: [found()] });

		const entries = await extractContacts(
			{ text: 'Anna 29/02/1992', image: { type: 'image/png', base64: 'aGk=' } },
			'en'
		);

		expect(entries).toHaveLength(1);
		expect(completeJson).toHaveBeenCalledTimes(1);
		const { messages, temperature } = completeJson.mock.calls[0][0];
		expect(temperature).toBe(0);
		expect(messages[1].content).toEqual([
			{ type: 'text', text: 'Anna 29/02/1992' },
			{ type: 'image_url', image_url: { url: 'data:image/png;base64,aGk=' } }
		]);
	});
});
