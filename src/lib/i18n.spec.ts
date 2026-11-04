import { describe, expect, it } from 'vitest';
import { en } from './messages/en.ts';
import { it as italian } from './messages/it.ts';
import {
	defaultLocale,
	formatDate,
	formatDayMonth,
	formatLongDate,
	parseLocale,
	upperFirst
} from './i18n.ts';

describe('defaultLocale', () => {
	it('is Italian only for visitors in Italy', () => {
		expect(defaultLocale('IT')).toBe('it');
		expect(defaultLocale('it')).toBe('it');
		expect(defaultLocale('CH')).toBe('en');
		expect(defaultLocale(null)).toBe('en');
	});
});

describe('parseLocale', () => {
	it('accepts only supported languages', () => {
		expect(parseLocale('it')).toBe('it');
		expect(parseLocale('en')).toBe('en');
		expect(parseLocale('de')).toBeNull();
		expect(parseLocale(undefined)).toBeNull();
	});
});

describe('date formatting', () => {
	const date = { year: 2026, month: 11, day: 14 };

	it('names the day and month in each language', () => {
		expect(formatDayMonth(date, 'en')).toBe('14 November');
		expect(formatDayMonth(date, 'it')).toBe('14 novembre');
		expect(formatLongDate(date, 'en')).toBe('Saturday 14 November');
		expect(formatLongDate(date, 'it')).toBe('sabato 14 novembre');
		expect(formatLongDate({ year: 2028, month: 2, day: 29 }, 'en')).toBe('Tuesday 29 February');
		expect(formatDate(date, 'it')).toBe('14 novembre 2026');
	});

	it('capitalizes for the start of a line', () => {
		expect(upperFirst(formatLongDate(date, 'it'))).toBe('Sabato 14 novembre');
	});
});

describe('messages', () => {
	it('have twelve months and seven weekdays in every language', () => {
		for (const m of [en, italian]) {
			expect(m.months).toHaveLength(12);
			expect(m.weekdays).toHaveLength(7);
		}
	});
});
