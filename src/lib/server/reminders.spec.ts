import { describe, expect, it } from 'vitest';
import { dueReminders, sendDateFor } from './reminders.ts';

const contact = (
	overrides: Partial<{
		birth_day: number;
		birth_month: number;
		birth_year: number | null;
		is_gift: boolean;
	}> = {}
) => ({
	birth_day: 16,
	birth_month: 11,
	birth_year: null,
	is_gift: false,
	...overrides
});

describe('dueReminders', () => {
	const today = { year: 2026, month: 11, day: 2 };

	it('sends a day-of reminder to every contact', () => {
		const due = dueReminders(contact({ birth_day: 2 }), today, 14);
		expect(due).toEqual([
			{ contact: expect.anything(), kind: 'day_of', occurrence: { year: 2026, month: 11, day: 2 } }
		]);
	});

	it('sends an advance reminder only to gift contacts', () => {
		expect(dueReminders(contact({ is_gift: false }), today, 14)).toEqual([]);
		expect(dueReminders(contact({ is_gift: true }), today, 14)).toEqual([
			{
				contact: expect.anything(),
				kind: 'advance',
				occurrence: { year: 2026, month: 11, day: 16 }
			}
		]);
	});

	it('sends both reminders to a gift contact on their birthday', () => {
		const due = dueReminders(contact({ birth_day: 2, is_gift: true }), today, 365);
		expect(due.map((r) => r.kind)).toEqual(['day_of', 'advance']);
		expect(due[1].occurrence).toEqual({ year: 2027, month: 11, day: 2 });
	});

	it('handles lead times that cross into next year', () => {
		const due = dueReminders(
			contact({ birth_day: 8, birth_month: 1, is_gift: true }),
			{ year: 2026, month: 12, day: 25 },
			14
		);
		expect(due).toEqual([
			{ contact: expect.anything(), kind: 'advance', occurrence: { year: 2027, month: 1, day: 8 } }
		]);
	});

	it('celebrates Feb 29 birthdays on Feb 28 in non-leap years', () => {
		const leapling = contact({ birth_day: 29, birth_month: 2, birth_year: 2000, is_gift: true });
		expect(dueReminders(leapling, { year: 2027, month: 2, day: 28 }, 7).map((r) => r.kind)).toEqual(
			['day_of']
		);
		expect(dueReminders(leapling, { year: 2027, month: 2, day: 21 }, 7)).toEqual([
			{ contact: leapling, kind: 'advance', occurrence: { year: 2027, month: 2, day: 28 } }
		]);
		expect(dueReminders(leapling, { year: 2028, month: 2, day: 28 }, 7)).toEqual([]);
	});

	it('returns nothing on other days', () => {
		expect(dueReminders(contact({ is_gift: true }), today, 7)).toEqual([]);
	});
});

describe('sendDateFor', () => {
	// 2026-11-02 08:30 UTC
	const now = new Date(Date.UTC(2026, 10, 2, 8, 30));

	it('waits until the local send hour', () => {
		expect(sendDateFor({ timezone: 'UTC', send_hour: 9 }, now)).toBeNull();
	});

	it('sends at the send hour and catches up later the same day', () => {
		expect(sendDateFor({ timezone: 'UTC', send_hour: 8 }, now)).toEqual({
			year: 2026,
			month: 11,
			day: 2
		});
		expect(sendDateFor({ timezone: 'UTC', send_hour: 6 }, now)).toEqual({
			year: 2026,
			month: 11,
			day: 2
		});
	});

	it("uses the user's local date", () => {
		expect(sendDateFor({ timezone: 'Pacific/Honolulu', send_hour: 8 }, now)).toEqual({
			year: 2026,
			month: 11,
			day: 1
		});
		expect(sendDateFor({ timezone: 'America/New_York', send_hour: 8 }, now)).toBeNull();
	});
});
