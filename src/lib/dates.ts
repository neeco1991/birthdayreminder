/** A date on the calendar, with no time or zone attached. Months are 1-based. */
export interface CalendarDate {
	year: number;
	month: number;
	day: number;
}

export interface Birthday {
	birth_day: number;
	birth_month: number;
	birth_year: number | null;
}

export function isLeapYear(year: number): boolean {
	return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/** Days in a month; with no year, February has 29 so a Feb 29 birthday is allowed. */
export function daysInMonth(month: number, year: number | null = null): number {
	if (month === 2) return year === null || isLeapYear(year) ? 29 : 28;
	return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function isValidBirthday(day: number, month: number, year: number | null): boolean {
	return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(month, year);
}

export function isValidTimeZone(timeZone: string): boolean {
	try {
		new Intl.DateTimeFormat('en-US', { timeZone });
		return true;
	} catch {
		return false;
	}
}

/** The calendar date and hour at `now` as seen in `timeZone`. Invalid zones fall back to UTC. */
export function zonedNow(now: Date, timeZone: string | null): CalendarDate & { hour: number } {
	const zone = timeZone && isValidTimeZone(timeZone) ? timeZone : 'UTC';
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: zone,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		hourCycle: 'h23'
	}).formatToParts(now);
	const get = (type: Intl.DateTimeFormatPartTypes) =>
		Number(parts.find((part) => part.type === type)?.value);
	return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour') };
}

/** Today's calendar date in `timeZone`. */
export function todayIn(timeZone: string | null, now = new Date()): CalendarDate {
	const { year, month, day } = zonedNow(now, timeZone);
	return { year, month, day };
}

function toUTC(date: CalendarDate): number {
	return Date.UTC(date.year, date.month - 1, date.day);
}

function fromUTC(ms: number): CalendarDate {
	const d = new Date(ms);
	return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
	return fromUTC(toUTC(date) + days * 86_400_000);
}

export function daysBetween(from: CalendarDate, to: CalendarDate): number {
	return Math.round((toUTC(to) - toUTC(from)) / 86_400_000);
}

export function isSameDate(a: CalendarDate, b: CalendarDate): boolean {
	return a.year === b.year && a.month === b.month && a.day === b.day;
}

/** YYYY-MM-DD, as Postgres `date` expects. */
export function toISODate(date: CalendarDate): string {
	const pad = (n: number, width = 2) => String(n).padStart(width, '0');
	return `${pad(date.year, 4)}-${pad(date.month)}-${pad(date.day)}`;
}

/** When the birthday falls in `year`. Feb 29 birthdays are celebrated on Feb 28 in non-leap years. */
export function occurrenceInYear(birthday: Birthday, year: number): CalendarDate {
	const { birth_day: day, birth_month: month } = birthday;
	if (month === 2 && day === 29 && !isLeapYear(year)) return { year, month: 2, day: 28 };
	return { year, month, day };
}

/** The next time the birthday comes around, counting `from` itself. */
export function nextOccurrence(birthday: Birthday, from: CalendarDate): CalendarDate {
	const thisYear = occurrenceInYear(birthday, from.year);
	return daysBetween(from, thisYear) >= 0 ? thisYear : occurrenceInYear(birthday, from.year + 1);
}

/** The age the person turns on `occurrence`, or null when the birth year is unknown. */
export function ageAt(birthday: Birthday, occurrence: CalendarDate): number | null {
	if (birthday.birth_year === null) return null;
	const age = occurrence.year - birthday.birth_year;
	return age > 0 ? age : null;
}

/** 0 for Sunday, through 6 for Saturday. */
export function dayOfWeek(date: CalendarDate): number {
	return new Date(toUTC(date)).getUTCDay();
}
