import { error } from '@sveltejs/kit';
import { dev } from '$app/env';
import { LOCALES, parseLocale, type Locale } from '#lib/i18n.ts';
import { authEmail } from '#lib/server/auth-emails.ts';
import { renderDigest, type DigestItem } from '#lib/server/email.ts';
import type { RequestHandler } from './$types';

// Previews of every email, with made-up data, while running `make dev`. Not served in production.
// Add ?locale=it for another language.

const today = { year: 2026, month: 11, day: 2 };

const anna: DigestItem = {
	contactId: 'preview',
	name: 'Anna',
	kind: 'day_of',
	occurrence: today,
	age: 30,
	pills: ['bookworm', 'coffee'],
	customPills: [],
	giftIdeas: []
};
const marco: DigestItem = {
	contactId: 'preview',
	name: 'Marco',
	kind: 'advance',
	occurrence: { year: 2026, month: 11, day: 16 },
	age: 41,
	pills: ['traveler', 'foodie'],
	customPills: ['Ramen'],
	giftIdeas: []
};

// What the AI would write in each language.
const MARCO_IDEAS: Record<Locale, string[]> = {
	en: [
		'A ramen-making kit with noodles, broths and toppings',
		'A cooking class on Japanese street food',
		'A compact travel backpack for weekend trips'
	],
	it: [
		'Un kit per preparare il ramen in casa',
		'Un corso di cucina di street food giapponese',
		'Uno zaino da viaggio compatto per il weekend'
	]
};
const giulia: DigestItem = {
	...marco,
	name: 'Giulia',
	age: null,
	pills: [],
	customPills: [],
	giftIdeas: []
};

function fillAuthTemplate(html: string, origin: string): string {
	return html
		.replaceAll('{{ .SiteURL }}', origin)
		.replaceAll('{{ .TokenHash }}', 'preview')
		.replaceAll('{{ .Token }}', '428193')
		.replaceAll('{{ .Email }}', 'you@example.com');
}

export const GET: RequestHandler = ({ params, url }) => {
	if (!dev) error(404);
	const locale = parseLocale(url.searchParams.get('locale')) ?? 'en';
	const query = locale === 'en' ? '' : `?locale=${locale}`;

	const digest = (items: DigestItem[]) =>
		renderDigest({
			today,
			items,
			appUrl: url.origin,
			unsubscribeUrl: `${url.origin}/unsubscribe?u=preview&t=preview`,
			locale
		});
	const signIn = (kind: 'magicLink' | 'confirmation') => {
		const email = authEmail(kind, locale);
		return { ...email, html: fillAuthTemplate(email.html, url.origin) };
	};
	const withIdeas = { ...marco, giftIdeas: MARCO_IDEAS[locale] };
	const emails: Record<string, () => { subject: string; html: string; text?: string }> = {
		'magic-link': () => signIn('magicLink'),
		confirmation: () => signIn('confirmation'),
		'birthday-today': () => digest([anna]),
		'gift-reminder': () => digest([withIdeas]),
		'gift-reminder-no-interests': () =>
			digest([{ ...giulia, occurrence: { year: 2026, month: 11, day: 3 } }]),
		digest: () => digest([anna, { ...anna, name: 'Bea', age: null, pills: [] }, withIdeas, giulia])
	};

	if (!params.name) {
		const languages = LOCALES.map((other) =>
			other === locale ? other : `<a href="/dev/emails?locale=${other}">${other}</a>`
		).join(' · ');
		const links = Object.entries(emails)
			.map(([name, render]) => {
				const { subject } = render();
				const textQuery = query ? `${query}&text` : '?text';
				return `<li><a href="/dev/emails/${name}${query}">${name}</a> · ${subject} · <a href="/dev/emails/${name}${textQuery}">text</a></li>`;
			})
			.join('');
		return new Response(
			`<!doctype html><meta charset="utf-8"><title>Emails</title><p>${languages}</p><ul>${links}</ul>`,
			{
				headers: { 'content-type': 'text/html; charset=utf-8' }
			}
		);
	}

	const render = emails[params.name];
	if (!render) error(404);
	const email = render();
	if (url.searchParams.has('text')) {
		return new Response(email.text ?? 'Supabase sends sign-in emails as HTML only.', {
			headers: { 'content-type': 'text/plain; charset=utf-8' }
		});
	}
	return new Response(email.html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
};
