import { daysBetween, type CalendarDate } from '#lib/dates.ts';
import { formatLongDate, messages, upperFirst, type Locale } from '#lib/i18n.ts';
import { pillLabel, pillName, type Pill } from '#lib/pills.ts';
import { LIGHT, button, emailDocument, escapeHtml, text } from './email-layout.ts';
import type { ReminderKind } from './reminders.ts';

export { escapeHtml };

export interface DigestItem {
	contactId: string;
	name: string;
	kind: ReminderKind;
	occurrence: CalendarDate;
	age: number | null;
	pills: Pill[];
	customPills: string[];
	/** AI suggestions (see gift-ideas.ts); the section is hidden when empty. */
	giftIdeas: string[];
}

export interface Digest {
	today: CalendarDate;
	items: DigestItem[];
	/** The app's base URL: links to contacts and settings are built from it. */
	appUrl: string;
	/** Turns reminder emails off without signing in (see unsubscribe.ts). */
	unsubscribeUrl: string;
	/** The language the user last used the site in. */
	locale: Locale;
}

/** "Anna turns 30 today", "Marco's birthday is in 14 days". */
function sentence(item: DigestItem, today: CalendarDate, locale: Locale): string {
	const days = daysBetween(today, item.occurrence);
	return messages(locale).email.sentence(item.name, item.age, days);
}

/** "Anna", "Anna and Marco", "Anna, Marco and Lia", "Anna, Marco, Lia and 2 more". */
function nameList(names: string[], locale: Locale): string {
	return names.length === 1 ? names[0] : messages(locale).email.nameList(names);
}

export function digestSubject({
	today,
	items,
	locale
}: Pick<Digest, 'today' | 'items' | 'locale'>): string {
	const t = messages(locale).email;
	if (items.length === 1) {
		const [item] = items;
		return item.kind === 'day_of'
			? `🎂 ${heading(items, today, locale)}`
			: `🎁 ${t.giftSubject(item.name, daysBetween(today, item.occurrence))}`;
	}
	const names = nameList(
		items.map((item) => item.name),
		locale
	);
	return items.every((item) => item.kind === 'day_of')
		? `🎂 ${t.birthdaysToday(names)}`
		: `🎂 ${t.reminders(names)}`;
}

function heading(items: DigestItem[], today: CalendarDate, locale: Locale): string {
	const t = messages(locale).email;
	if (items.length === 1) {
		const [item] = items;
		return item.kind === 'day_of' && item.age === null
			? t.birthdayToday(item.name)
			: sentence(item, today, locale);
	}
	const dayOf = items.filter((item) => item.kind === 'day_of').length;
	const advance = items.length - dayOf;
	if (!advance) return t.todayCount(dayOf);
	if (!dayOf) return t.comingUpCount(advance);
	return t.bothCount(dayOf, advance);
}

function intro(items: DigestItem[], locale: Locale): string {
	const t = messages(locale).email;
	const dayOf = items.some((item) => item.kind === 'day_of');
	const advance = items.some((item) => item.kind === 'advance');
	if (dayOf && advance) return t.introBoth;
	if (dayOf) return t.introToday;
	return t.introComingUp;
}

function preheader(items: DigestItem[], today: CalendarDate, locale: Locale): string {
	const t = messages(locale).email;
	const ideas = items.some((item) => item.giftIdeas.length) ? ` ${t.ideasInside}` : '';
	if (items.length === 1) return intro(items, locale) + ideas;
	const shown = items.slice(0, 3).map((item) => `${sentence(item, today, locale)}.`);
	if (items.length > 3) shown.push(t.andMore(items.length - 3));
	return shown.join(' ') + ideas;
}

// The rows below copy the app's contact list: date badge, name and interests, then when and age.

function dateBadge(item: DigestItem, locale: Locale): string {
	const today = item.kind === 'day_of';
	const month = messages(locale)
		.months[item.occurrence.month - 1].slice(0, 3)
		.toLocaleUpperCase(locale);
	return `<table role="presentation" width="48" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate;"><tr>
<td width="46" height="46" align="center" valign="middle" class="${today ? 'bg-accent' : 'bg-canvas border-line'}" style="width: 46px; height: 46px; border-radius: 12px; border: 1px solid ${today ? LIGHT.accent : LIGHT.line}; background-color: ${today ? LIGHT.accent : LIGHT.canvas};">
<div class="${today ? 'accent-fg' : 'accent'}" style="font-size: 10px; line-height: 10px; font-weight: 600; letter-spacing: 0.08em; color: ${today ? LIGHT.accentFg : LIGHT.accent};">${month}</div>
<div class="${today ? 'accent-fg' : 'fg'}" style="margin-top: 3px; font-size: 18px; line-height: 18px; font-weight: 600; color: ${today ? LIGHT.accentFg : LIGHT.fg};">${item.occurrence.day}</div>
</td></tr></table>`;
}

function pillsHtml(item: DigestItem, locale: Locale): string {
	const labels = [...item.pills.map((pill) => pillLabel(pill, locale)), ...item.customPills];
	if (!labels.length) return '';
	return `<div style="margin-top: 2px;">${labels
		.map(
			(label) =>
				`<span class="bg-muted fg-muted" style="display: inline-block; margin: 4px 4px 0 0; padding: 2px 8px; border-radius: 999px; background-color: ${LIGHT.surfaceMuted}; font-size: 12px; line-height: 16px; color: ${LIGHT.fgMuted}; white-space: nowrap;">${escapeHtml(label)}</span>`
		)
		.join('')}</div>`;
}

function giftIdeasHtml(item: DigestItem, locale: Locale): string {
	if (!item.giftIdeas.length) return '';
	const t = messages(locale).editContact;
	const ideas = item.giftIdeas
		.map(
			(idea) => `<tr>
<td valign="top" class="accent" style="width: 14px; padding: 6px 0 0; font-size: 14px; line-height: 20px; color: ${LIGHT.accent};">&bull;</td>
<td class="fg" style="padding: 6px 0 0; font-size: 14px; line-height: 20px; color: ${LIGHT.fg};">${escapeHtml(idea)}</td>
</tr>`
		)
		.join('');
	return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate;"><tr>
<td class="bg-accent-soft" style="padding: 14px 16px; border-radius: 12px; background-color: ${LIGHT.accentSoft};">
<div class="fg" style="font-size: 13px; line-height: 20px; font-weight: 600; color: ${LIGHT.fg};">${t.ideasTitle}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${ideas}</table>
<div class="fg-muted" style="margin-top: 8px; font-size: 12px; line-height: 18px; color: ${LIGHT.fgMuted};">${t.ideasDisclaimer}</div>
</td></tr></table>`;
}

function itemHtml(item: DigestItem, digest: Digest, first: boolean): string {
	const { locale } = digest;
	const t = messages(locale);
	const contactUrl = escapeHtml(new URL(`/contacts/${item.contactId}`, digest.appUrl).href);
	const today = item.kind === 'day_of';
	const days = daysBetween(digest.today, item.occurrence);
	const when = today ? t.when.today : days === 1 ? t.when.tomorrow : t.when.inDays(days);
	const [addInterests, toGetIdeas] = t.email.addInterests;
	// Without interests there's nothing to base gift ideas on: say how to get them.
	const nudge =
		item.kind === 'advance' && !item.pills.length && !item.customPills.length
			? `<p class="fg-muted" style="${text.small} margin-top: 4px; font-size: 12px; line-height: 18px;"><a href="${contactUrl}" class="accent" style="${text.link}">${addInterests}</a>${toGetIdeas}</p>`
			: '';
	const ideas = giftIdeasHtml(item, locale);
	return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="border-line" style="${first ? '' : `border-top: 1px solid ${LIGHT.line};`}">
<tr>
<td width="48" valign="top" style="width: 48px; padding: 16px 0;">${dateBadge(item, locale)}</td>
<td valign="top" style="padding: 16px 12px 16px 16px;">
<a href="${contactUrl}" class="fg" style="font-size: 15px; line-height: 22px; font-weight: 500; color: ${LIGHT.fg}; text-decoration: none;">${escapeHtml(item.name)}</a>
${pillsHtml(item, locale)}${nudge}
</td>
<td valign="top" align="right" style="padding: 16px 0; white-space: nowrap; text-align: right;">
<div class="${today ? 'accent' : 'fg'}" style="font-size: 14px; line-height: 22px; font-weight: ${today ? 500 : 400}; color: ${today ? LIGHT.accent : LIGHT.fg};">${when}</div>
${item.age === null ? '' : `<div class="fg-muted" style="font-size: 12px; line-height: 16px; color: ${LIGHT.fgMuted};">${t.when.turns(item.age)}</div>`}
</td>
</tr>
${ideas ? `<tr><td colspan="3" style="padding: 0 0 16px;">${ideas}</td></tr>` : ''}
</table>`;
}

function sectionHtml(title: string | null, items: DigestItem[], digest: Digest): string {
	if (!items.length) return '';
	const label = title
		? `<p class="fg-muted" style="margin: 28px 0 0; font-size: 12px; line-height: 16px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: ${LIGHT.fgMuted};">${title}</p>`
		: '';
	return `${label}<div style="margin-top: ${title ? 4 : 20}px;">${items
		.map((item, i) => itemHtml(item, digest, i === 0))
		.join('')}</div>`;
}

function itemText(item: DigestItem, today: CalendarDate, locale: Locale): string {
	const t = messages(locale).email;
	const date = item.kind === 'advance' ? ` (${formatLongDate(item.occurrence, locale)})` : '';
	const labels = [...item.pills.map((pill) => pillName(pill, locale)), ...item.customPills];
	const pills = labels.length ? `\n  ${t.into}: ${labels.join(', ')}` : '';
	const ideas = item.giftIdeas.length
		? `\n  ${t.giftIdeasText}:${item.giftIdeas.map((idea) => `\n  * ${idea}`).join('')}`
		: '';
	return `- ${sentence(item, today, locale)}${date}${pills}${ideas}`;
}

export function renderDigest(digest: Digest): { subject: string; html: string; text: string } {
	const { today, items, appUrl, unsubscribeUrl, locale } = digest;
	const t = messages(locale).email;
	const dayOf = items.filter((item) => item.kind === 'day_of');
	const advance = items.filter((item) => item.kind === 'advance');
	// Section labels only help when there are both kinds.
	const labelled = dayOf.length > 0 && advance.length > 0;
	const contactsUrl = new URL('/contacts', appUrl).href;
	const settingsUrl = new URL('/settings', appUrl).href;
	const subject = digestSubject(digest);

	const body = `
<p class="fg-muted" style="${text.small}">${upperFirst(formatLongDate(today, locale))}</p>
<h1 class="fg" style="${text.h1} margin-top: 4px;">${escapeHtml(heading(items, today, locale))}</h1>
<p class="fg-muted" style="${text.lead}">${intro(items, locale)}</p>
${sectionHtml(labelled ? t.today : null, dayOf, digest)}
${sectionHtml(labelled ? t.comingUp : null, advance, digest)}
<div style="margin: 28px 0 0;">${button(contactsUrl, t.open)}</div>`;

	const footer = `
<p style="margin: 0;">${t.why}</p>
<p style="margin: 8px 0 0;"><a href="${escapeHtml(settingsUrl)}" class="fg-muted" style="${text.footerLink}">${t.changeWhen}</a> &nbsp;·&nbsp; <a href="${escapeHtml(unsubscribeUrl)}" class="fg-muted" style="${text.footerLink}">${t.turnOff}</a></p>`;

	const html = emailDocument({
		title: subject,
		preheader: preheader(items, today, locale),
		body,
		footer,
		siteUrl: appUrl,
		locale
	});

	const section = (title: string, list: DigestItem[]) =>
		list.length
			? `${labelled ? `${title.toLocaleUpperCase(locale)}\n` : ''}${list.map((item) => itemText(item, today, locale)).join('\n\n')}`
			: '';
	const plain = [
		upperFirst(formatLongDate(today, locale)),
		`${heading(items, today, locale)}. ${intro(items, locale)}`,
		section(t.today, dayOf),
		section(t.comingUp, advance),
		`${t.open}: ${contactsUrl}`,
		['--', t.why, `${t.changeWhen}: ${settingsUrl}`, `${t.turnOff}: ${unsubscribeUrl}`].join('\n')
	]
		.filter(Boolean)
		.join('\n\n');

	return { subject, html, text: plain };
}
