import { describe, expect, it } from 'vitest';
import { digestSubject, escapeHtml, renderDigest, type Digest, type DigestItem } from './email.ts';

const today = { year: 2026, month: 11, day: 2 };
const item = (overrides: Partial<DigestItem> = {}): DigestItem => ({
	contactId: 'c1',
	name: 'Anna',
	kind: 'day_of',
	occurrence: today,
	age: null,
	pills: [],
	customPills: [],
	giftIdeas: [],
	...overrides
});
const digest = (items: DigestItem[]): Digest => ({
	today,
	items,
	appUrl: 'https://example.com',
	unsubscribeUrl: 'https://example.com/unsubscribe?u=1&t=x',
	locale: 'en'
});

describe('renderDigest', () => {
	it('escapes user-provided names', () => {
		const { html } = renderDigest(digest([item({ name: '<img src=x onerror=alert(1)>' })]));
		expect(html).not.toContain('<img src=x');
		expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
	});

	it('groups today and upcoming birthdays and shows pills', () => {
		const { html, text } = renderDigest(
			digest([
				item({ name: 'Anna', age: 39 }),
				item({
					contactId: 'c2',
					name: 'Marco',
					kind: 'advance',
					occurrence: { year: 2026, month: 11, day: 16 },
					pills: ['nerd', 'coffee'],
					customPills: ['Lego <Technic>']
				})
			])
		);
		expect(html).toContain('1 birthday today, 1 coming up');
		expect(html).toContain('>Today<');
		expect(html).toContain('>Coming up<');
		expect(html).toContain('Today 🎉');
		expect(html).toContain('In 14 days');
		expect(html).toContain('Turns 39');
		expect(html).toContain('🤓 Nerd');
		expect(html).toContain('Lego &lt;Technic&gt;');
		expect(html).toContain('href="https://example.com/contacts/c2"');
		expect(html).toContain('href="https://example.com/settings"');
		expect(html).toContain('href="https://example.com/unsubscribe?u=1&amp;t=x"');
		expect(text).toContain('Anna turns 39 today');
		expect(text).toContain("Marco's birthday is in 14 days (Monday 16 November)");
		expect(text).toContain('Into: Nerd, Coffee, Lego <Technic>');
		expect(text).toContain('https://example.com/settings');
		expect(text).toContain('Turn off reminder emails: https://example.com/unsubscribe?u=1&t=x');
	});

	it('leaves out section labels when there is only one kind', () => {
		const { html, text } = renderDigest(digest([item(), item({ name: 'Marco' })]));
		expect(html).toContain('2 birthdays today');
		expect(html).not.toContain('>Coming up<');
		expect(text).not.toContain('TODAY');
	});

	it('asks for interests when a gift contact has none', () => {
		const { html } = renderDigest(digest([item({ kind: 'advance' })]));
		expect(html).toContain("Add what they're into");
		expect(html).not.toContain('AI gift ideas</div>');
	});

	it('lists gift ideas when present', () => {
		const { html, text } = renderDigest(
			digest([item({ kind: 'advance', pills: ['nerd'], giftIdeas: ['Board game <deluxe>'] })])
		);
		expect(html).toContain('✨ AI gift ideas');
		expect(html).toContain('Board game &lt;deluxe&gt;');
		expect(html).toContain('AI gift ideas inside.');
		expect(html).not.toContain('Add what they');
		expect(text).toContain(
			'AI gift ideas (AI-generated: check they suit them):\n  * Board game <deluxe>'
		);
	});

	it('builds links from an app URL with a trailing slash', () => {
		const { html } = renderDigest({ ...digest([item()]), appUrl: 'https://example.com/' });
		expect(html).toContain('src="https://example.com/email/logo.png"');
		expect(html).toContain('href="https://example.com/contacts"');
	});
});

describe('digestSubject', () => {
	it('names the person for a single reminder', () => {
		expect(digestSubject({ today, locale: 'en', items: [item({ age: 30 })] })).toBe(
			'🎂 Anna turns 30 today'
		);
		expect(digestSubject({ today, locale: 'en', items: [item()] })).toBe(
			"🎂 It's Anna's birthday today"
		);
		expect(
			digestSubject({
				today,
				locale: 'en',
				items: [item({ kind: 'advance', occurrence: { year: 2026, month: 11, day: 3 } })]
			})
		).toBe("🎁 Anna's birthday is tomorrow: time to find a gift");
	});

	it('lists everyone for several reminders', () => {
		expect(
			digestSubject({
				today,
				locale: 'en',
				items: [item(), item({ name: 'Marco' }), item({ name: 'Lia' })]
			})
		).toBe('🎂 Birthdays today: Anna, Marco and Lia');
		expect(
			digestSubject({
				today,
				locale: 'en',
				items: [item(), item({ name: 'Marco', kind: 'advance' })]
			})
		).toBe('🎂 Birthday reminders: Anna and Marco');
	});

	it('shortens long lists', () => {
		const names = ['Anna', 'Marco', 'Lia', 'Bea', 'Carlo'];
		expect(digestSubject({ today, locale: 'en', items: names.map((name) => item({ name })) })).toBe(
			'🎂 Birthdays today: Anna, Marco, Lia and 2 more'
		);
	});
});

describe('in Italian', () => {
	const italian = (items: DigestItem[]): Digest => ({ ...digest(items), locale: 'it' });

	it('writes the whole digest in Italian', () => {
		const { subject, html, text } = renderDigest(
			italian([
				item({ name: 'Anna', age: 39 }),
				item({
					contactId: 'c2',
					name: 'Marco',
					kind: 'advance',
					occurrence: { year: 2026, month: 11, day: 16 },
					pills: ['coffee'],
					giftIdeas: ['Un macinacaffè']
				})
			])
		);
		expect(subject).toBe('🎂 Promemoria compleanni: Anna e Marco');
		expect(html).toContain('<html lang="it">');
		expect(html).toContain('Lunedì 2 novembre');
		expect(html).toContain('1 compleanno oggi, 1 in arrivo');
		expect(html).toContain('Oggi 🎉');
		expect(html).toContain('Tra 14 giorni');
		expect(html).toContain('Compie 39 anni');
		expect(html).toContain('☕ Caffè');
		expect(html).toContain('>NOV<');
		expect(html).toContain("✨ Idee regalo dall'IA");
		expect(text).toContain('Anna compie 39 anni oggi');
		expect(text).toContain('Il compleanno di Marco è tra 14 giorni (lunedì 16 novembre)');
		expect(text).toContain('Interessi: Caffè');
		expect(text).toContain('OGGI\n');
		expect(text).toContain('Disattiva le email di promemoria: https://example.com/unsubscribe');
		expect(text).not.toMatch(/'s birthday| turns |coming up|into:/i);
	});

	it('writes the subject in Italian', () => {
		expect(digestSubject({ today, locale: 'it', items: [item()] })).toBe(
			'🎂 Oggi è il compleanno di Anna'
		);
		expect(
			digestSubject({
				today,
				locale: 'it',
				items: [item({ kind: 'advance', occurrence: { year: 2026, month: 11, day: 3 } })]
			})
		).toBe('🎁 Il compleanno di Anna è domani: è ora di trovare un regalo');
		const names = ['Anna', 'Marco', 'Lia', 'Bea'];
		expect(digestSubject({ today, locale: 'it', items: names.map((name) => item({ name })) })).toBe(
			"🎂 Compleanni di oggi: Anna, Marco, Lia e un'altra persona"
		);
	});
});

describe('escapeHtml', () => {
	it('escapes all HTML-significant characters', () => {
		expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
			'&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;'
		);
	});
});
