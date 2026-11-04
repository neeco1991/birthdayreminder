// The site and its emails come in English and Italian. A visitor's language is, in order: the one they
// picked on this browser (a cookie), the one saved on their account, Italian if they connect from
// Italy, otherwise English (see hooks.server.ts).
import { dayOfWeek, type CalendarDate } from './dates.ts';
import { Constants, type Enums } from './database.types.ts';
import { en, type Messages } from './messages/en.ts';
import { it } from './messages/it.ts';

export type Locale = Enums<'locale'>;

export const LOCALES = Constants.public.Enums.locale;

/** Each language's name in that language, for the switcher. */
export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', it: 'Italiano' };

export const LOCALE_COOKIE = 'lang';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const MESSAGES: Record<Locale, Messages> = { en, it };

export function parseLocale(value: unknown): Locale | null {
	return LOCALES.find((locale) => locale === value) ?? null;
}

/** Italian when connecting from Italy, English otherwise. `country` is an ISO 3166-1 alpha-2 code. */
export function defaultLocale(country: string | null): Locale {
	return country?.toUpperCase() === 'IT' ? 'it' : 'en';
}

export function messages(locale: Locale): Messages {
	return MESSAGES[locale] ?? en;
}

/** e.g. "14 November", "14 novembre" */
export function formatDayMonth(date: Pick<CalendarDate, 'day' | 'month'>, locale: Locale): string {
	return `${date.day} ${messages(locale).months[date.month - 1]}`;
}

/** e.g. "Saturday 14 November", "sabato 14 novembre" */
export function formatLongDate(date: CalendarDate, locale: Locale): string {
	return `${messages(locale).weekdays[dayOfWeek(date)]} ${formatDayMonth(date, locale)}`;
}

/** e.g. "3 November 2026", "3 novembre 2026" */
export function formatDate(date: CalendarDate, locale: Locale): string {
	return `${formatDayMonth(date, locale)} ${date.year}`;
}

export function formatNumber(value: number, locale: Locale): string {
	return value.toLocaleString(locale);
}

/** For text that starts a line: Italian writes weekdays and months in lower case. */
export function upperFirst(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
