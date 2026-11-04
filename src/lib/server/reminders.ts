import {
	addDays,
	isSameDate,
	occurrenceInYear,
	zonedNow,
	type Birthday,
	type CalendarDate
} from '#lib/dates.ts';

export type ReminderKind = 'day_of' | 'advance';

export interface DueReminder<C> {
	contact: C;
	kind: ReminderKind;
	/** The birthday this reminder is about. */
	occurrence: CalendarDate;
}

export interface ReminderPrefs {
	timezone: string | null;
	send_hour: number;
}

/**
 * The user's local date if their send hour has been reached today, otherwise null.
 * Using "at or after" rather than "exactly at" lets a missed hourly run catch up later the same day.
 */
export function sendDateFor(prefs: ReminderPrefs, now: Date): CalendarDate | null {
	const { hour, ...today } = zonedNow(now, prefs.timezone);
	return hour >= prefs.send_hour ? today : null;
}

/** Every contact gets a day-of reminder; gift contacts also get one `leadDays` before. */
export function dueReminders<C extends Birthday & { is_gift: boolean }>(
	contact: C,
	today: CalendarDate,
	leadDays: number
): DueReminder<C>[] {
	const due: DueReminder<C>[] = [];

	const thisYear = occurrenceInYear(contact, today.year);
	if (isSameDate(thisYear, today)) {
		due.push({ contact, kind: 'day_of', occurrence: thisYear });
	}

	if (contact.is_gift && leadDays > 0) {
		const target = addDays(today, leadDays);
		const upcoming = occurrenceInYear(contact, target.year);
		if (isSameDate(upcoming, target)) {
			due.push({ contact, kind: 'advance', occurrence: upcoming });
		}
	}

	return due;
}
