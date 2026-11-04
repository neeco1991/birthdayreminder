import { describe, expect, it } from 'vitest';
import {
	addDays,
	ageAt,
	dayOfWeek,
	daysBetween,
	isValidBirthday,
	nextOccurrence,
	occurrenceInYear,
	toISODate,
	zonedNow
} from './dates.ts';

const leapling = { birth_day: 29, birth_month: 2, birth_year: 2000 };

describe('occurrenceInYear', () => {
	it('keeps Feb 29 in leap years', () => {
		expect(occurrenceInYear(leapling, 2028)).toEqual({ year: 2028, month: 2, day: 29 });
	});

	it('moves Feb 29 to Feb 28 in non-leap years', () => {
		expect(occurrenceInYear(leapling, 2027)).toEqual({ year: 2027, month: 2, day: 28 });
		expect(occurrenceInYear(leapling, 2100)).toEqual({ year: 2100, month: 2, day: 28 });
	});
});

describe('nextOccurrence', () => {
	const birthday = { birth_day: 14, birth_month: 11, birth_year: null };

	it('counts today as the next occurrence', () => {
		expect(nextOccurrence(birthday, { year: 2026, month: 11, day: 14 })).toEqual({
			year: 2026,
			month: 11,
			day: 14
		});
	});

	it('rolls over to next year once the birthday has passed', () => {
		expect(nextOccurrence(birthday, { year: 2026, month: 11, day: 15 })).toEqual({
			year: 2027,
			month: 11,
			day: 14
		});
	});
});

describe('ageAt', () => {
	it('returns the age being turned', () => {
		expect(
			ageAt({ birth_day: 4, birth_month: 11, birth_year: 1987 }, { year: 2026, month: 11, day: 4 })
		).toBe(39);
	});

	it('is null without a birth year', () => {
		expect(
			ageAt({ birth_day: 4, birth_month: 11, birth_year: null }, { year: 2026, month: 11, day: 4 })
		).toBeNull();
	});
});

describe('isValidBirthday', () => {
	it('allows Feb 29 without a year or in a leap year', () => {
		expect(isValidBirthday(29, 2, null)).toBe(true);
		expect(isValidBirthday(29, 2, 2000)).toBe(true);
	});

	it('rejects impossible dates', () => {
		expect(isValidBirthday(29, 2, 1999)).toBe(false);
		expect(isValidBirthday(31, 4, null)).toBe(false);
		expect(isValidBirthday(0, 1, null)).toBe(false);
		expect(isValidBirthday(1, 13, null)).toBe(false);
	});
});

describe('calendar arithmetic', () => {
	it('adds days across year boundaries', () => {
		expect(addDays({ year: 2026, month: 12, day: 25 }, 14)).toEqual({
			year: 2027,
			month: 1,
			day: 8
		});
	});

	it('counts days between dates', () => {
		expect(daysBetween({ year: 2026, month: 12, day: 25 }, { year: 2027, month: 1, day: 8 })).toBe(
			14
		);
	});

	it('formats ISO dates', () => {
		expect(toISODate({ year: 2027, month: 1, day: 8 })).toBe('2027-01-08');
	});
});

describe('zonedNow', () => {
	// 2026-11-02 08:30 UTC
	const now = new Date(Date.UTC(2026, 10, 2, 8, 30));

	it('gives different local dates for the same instant', () => {
		expect(zonedNow(now, 'Pacific/Honolulu')).toEqual({ year: 2026, month: 11, day: 1, hour: 22 });
		expect(zonedNow(now, 'Asia/Tokyo')).toEqual({ year: 2026, month: 11, day: 2, hour: 17 });
	});

	it('falls back to UTC for missing or invalid zones', () => {
		expect(zonedNow(now, null)).toEqual({ year: 2026, month: 11, day: 2, hour: 8 });
		expect(zonedNow(now, 'Not/AZone')).toEqual({ year: 2026, month: 11, day: 2, hour: 8 });
	});

	it('reports midnight as hour 0', () => {
		expect(zonedNow(new Date(Date.UTC(2026, 10, 2, 0, 0)), 'UTC').hour).toBe(0);
	});
});

describe('dayOfWeek', () => {
	it('counts from Sunday', () => {
		expect(dayOfWeek({ year: 2026, month: 11, day: 14 })).toBe(6);
		expect(dayOfWeek({ year: 2026, month: 11, day: 15 })).toBe(0);
	});
});
