import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GiftProfile } from './gift-ideas.ts';
import type { OutgoingEmail } from './mailer.ts';

vi.mock('$app/env/private', () => ({
	APP_URL: 'https://app.test',
	CRON_SECRET: 'test-secret-that-is-long-enough',
	OPENROUTER_API_KEY: ''
}));

const sendEmails = vi.fn<(emails: OutgoingEmail[]) => Promise<boolean[]>>();
vi.mock('./mailer.ts', () => ({ sendEmails: (emails: OutgoingEmail[]) => sendEmails(emails) }));

type Resolve = (profiles: GiftProfile[], deadline: number) => Promise<Map<string, string[]>>;
const resolveGiftIdeas = vi.fn<Resolve>();
const pruneGiftIdeasCache = vi.fn<() => Promise<void>>();
vi.mock('./gift-ideas.ts', async (importOriginal) => ({
	...(await importOriginal<typeof import('./gift-ideas.ts')>()),
	resolveGiftIdeas: (profiles: GiftProfile[], deadline: number) =>
		resolveGiftIdeas(profiles, deadline),
	pruneGiftIdeasCache: () => pruneGiftIdeasCache()
}));

const pruneAiUsage = vi.fn<() => Promise<void>>();
vi.mock('./ai.ts', async (importOriginal) => ({
	...(await importOriginal<typeof import('./ai.ts')>()),
	pruneAiUsage: () => pruneAiUsage()
}));

type Row = Record<string, unknown>;
let tables: Record<'profiles' | 'contacts' | 'reminder_log', Row[]>;

/** Just enough of the supabase-js query builder for the reminder job, backed by `tables`. */
function fakeClient() {
	return {
		from(table: keyof typeof tables) {
			const filters: ((row: Row) => boolean)[] = [];
			let op: 'select' | 'upsert' | 'delete' = 'select';
			let upsertRows: Row[] = [];
			let range: [number, number] | null = null;
			const logKey = (r: Row) => `${r.contact_id}|${r.kind}|${r.occurrence_date}`;

			const exec = () => {
				const rows = tables[table];
				if (op === 'upsert') {
					const inserted = upsertRows.filter((row) => !rows.some((r) => logKey(r) === logKey(row)));
					rows.push(...inserted);
					return { data: inserted, error: null };
				}
				if (op === 'delete') {
					tables[table] = rows.filter((row) => !filters.every((f) => f(row)));
					return { data: null, error: null };
				}
				const matching = rows.filter((row) => filters.every((f) => f(row)));
				return { data: range ? matching.slice(range[0], range[1] + 1) : matching, error: null };
			};

			const builder = {
				select: () => builder,
				order: () => builder,
				eq: (col: string, value: unknown) => (filters.push((r) => r[col] === value), builder),
				not: (col: string) => (filters.push((r) => r[col] !== null), builder),
				in: (col: string, values: unknown[]) => (
					filters.push((r) => values.includes(r[col])),
					builder
				),
				match: (obj: Row) => (
					filters.push((r) => Object.entries(obj).every(([k, v]) => r[k] === v)),
					builder
				),
				range: (from: number, to: number) => ((range = [from, to]), builder),
				upsert: (rows: Row[]) => ((op = 'upsert'), (upsertRows = rows), builder),
				delete: () => ((op = 'delete'), builder),
				then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
					Promise.resolve(exec()).then(resolve, reject)
			};
			return builder;
		}
	};
}

vi.mock('./supabase.ts', () => ({ getSupabaseAdmin: () => fakeClient() }));

const { runReminderJob } = await import('./reminder-job.ts');
const { cacheKey } = await import('./gift-ideas.ts');

// 2026-11-02 08:30 UTC
const now = new Date(Date.UTC(2026, 10, 2, 8, 30));

const profile = (id: string, overrides: Row = {}): Row => ({
	id,
	email: `${id}@example.com`,
	timezone: 'UTC',
	send_hour: 8,
	gift_lead_days: 14,
	emails_enabled: true,
	...overrides
});

const contact = (id: string, user_id: string, overrides: Row = {}): Row => ({
	id,
	user_id,
	name: id,
	birth_day: 2,
	birth_month: 11,
	birth_year: null,
	is_gift: false,
	gender: null,
	pills: [],
	custom_pills: [],
	...overrides
});

beforeEach(() => {
	sendEmails.mockReset();
	sendEmails.mockImplementation(async (emails) => emails.map(() => true));
	resolveGiftIdeas.mockReset();
	resolveGiftIdeas.mockImplementation(async () => new Map());
	pruneGiftIdeasCache.mockReset();
	pruneAiUsage.mockReset();
	tables = {
		profiles: [profile('ana')],
		contacts: [
			contact('Bea', 'ana', { birth_year: 1990 }),
			contact('Carlo', 'ana', {
				birth_day: 16,
				is_gift: true,
				pills: ['nerd'],
				custom_pills: ['Lego']
			}),
			contact('Dino', 'ana', { birth_day: 16 })
		],
		reminder_log: []
	};
});

describe('runReminderJob', () => {
	it('sends one digest per user with day-of and gift reminders', async () => {
		const result = await runReminderJob(now);

		expect(result).toEqual({ usersDue: 1, remindersClaimed: 2, emailsSent: 1, emailsFailed: 0 });
		const [[emails]] = sendEmails.mock.calls;
		expect(emails).toHaveLength(1);
		expect(emails[0].to).toBe('ana@example.com');
		expect(emails[0].subject).toBe('🎂 Birthday reminders: Bea and Carlo');
		expect(emails[0].text).toContain('Bea turns 36 today');
		expect(emails[0].text).toContain("Carlo's birthday is in 14 days (Monday 16 November)");
		expect(emails[0].text).toContain('Into: Nerd, Lego');
		expect(emails[0].text).not.toContain('Dino');
		expect(emails[0].html).toContain('https://app.test/settings');
		expect(emails[0].html).toContain('https://app.test/contacts/Carlo');
		expect(emails[0].headers?.['List-Unsubscribe']).toMatch(
			/^<https:\/\/app\.test\/unsubscribe\?u=ana&t=[\w-]+>$/
		);
		expect(tables.reminder_log).toHaveLength(2);
	});

	it('adds AI gift ideas to gift reminders, without sending names to the AI', async () => {
		resolveGiftIdeas.mockImplementation(
			async (profiles) => new Map(profiles.map((p) => [cacheKey(p), ['Lego Technic set']]))
		);

		await runReminderJob(now);

		const [[profiles, deadline]] = resolveGiftIdeas.mock.calls;
		expect(profiles).toEqual([
			{ interests: ['lego', 'nerd'], gender: null, ageRange: null, locale: 'en' }
		]);
		expect(deadline).toBeGreaterThan(Date.now());
		const [[emails]] = sendEmails.mock.calls;
		expect(emails[0].text).toContain(
			'AI gift ideas (AI-generated: check they suit them):\n  * Lego Technic set'
		);
	});

	it("writes in the user's language, gift ideas included", async () => {
		tables.profiles = [profile('ana', { locale: 'it' })];

		await runReminderJob(now);

		const [[profiles]] = resolveGiftIdeas.mock.calls;
		expect(profiles).toEqual([expect.objectContaining({ locale: 'it' })]);
		const [[emails]] = sendEmails.mock.calls;
		expect(emails[0].subject).toBe('🎂 Promemoria compleanni: Bea e Carlo');
		expect(emails[0].text).toContain('Bea compie 36 anni oggi');
		expect(emails[0].text).toContain('Il compleanno di Carlo è tra 14 giorni (lunedì 16 novembre)');
	});

	it('does not send the same reminder twice', async () => {
		await runReminderJob(now);
		const later = new Date(now.getTime() + 3_600_000);
		const result = await runReminderJob(later);

		expect(result.remindersClaimed).toBe(0);
		expect(sendEmails).toHaveBeenCalledTimes(1);
	});

	it('waits for the local send hour and skips users with emails off', async () => {
		tables.profiles = [
			profile('ana', { send_hour: 9 }),
			profile('ben', { emails_enabled: false }),
			profile('cy', { timezone: 'Asia/Tokyo', send_hour: 17 })
		];
		tables.contacts = [
			contact('A', 'ana'),
			contact('B', 'ben'),
			// 17:30 in Tokyo, already Nov 2 there
			contact('C', 'cy')
		];

		const result = await runReminderJob(now);

		expect(result.usersDue).toBe(1);
		expect(sendEmails.mock.calls[0][0].map((e) => e.to)).toEqual(['cy@example.com']);
	});

	it('releases claims when sending fails so the next run retries', async () => {
		sendEmails.mockImplementationOnce(async (emails) => emails.map(() => false));

		const failed = await runReminderJob(now);
		expect(failed).toMatchObject({ emailsSent: 0, emailsFailed: 1 });
		expect(tables.reminder_log).toHaveLength(0);

		const retried = await runReminderJob(now);
		expect(retried).toMatchObject({ remindersClaimed: 2, emailsSent: 1 });
		expect(tables.reminder_log).toHaveLength(2);
	});

	it('does nothing when no birthdays are due', async () => {
		tables.contacts = [contact('Z', 'ana', { birth_month: 6 })];

		const result = await runReminderJob(now);

		expect(result).toEqual({ usersDue: 1, remindersClaimed: 0, emailsSent: 0, emailsFailed: 0 });
		expect(sendEmails).not.toHaveBeenCalled();
	});

	it('prunes expired gift ideas and old AI usage on every run, even with nothing to send', async () => {
		tables.profiles = [];

		await runReminderJob(now);

		expect(pruneGiftIdeasCache).toHaveBeenCalledTimes(1);
		expect(pruneAiUsage).toHaveBeenCalledTimes(1);
	});
});
