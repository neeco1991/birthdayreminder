import { APP_URL } from '$app/env/private';
import { ageAt, toISODate, type CalendarDate } from '#lib/dates.ts';
import type { Tables } from '#lib/database.types.ts';
import type { Locale } from '#lib/i18n.ts';
import { renderDigest, type DigestItem } from './email.ts';
import { cacheKey, giftProfile, pruneGiftIdeasCache, resolveGiftIdeas } from './gift-ideas.ts';
import { sendEmails, type OutgoingEmail } from './mailer.ts';
import { dueReminders, sendDateFor, type DueReminder } from './reminders.ts';
import { getSupabaseAdmin, type Supabase } from './supabase.ts';
import { unsubscribeUrl } from './unsubscribe.ts';

type Profile = Pick<
	Tables<'profiles'>,
	'id' | 'email' | 'timezone' | 'send_hour' | 'gift_lead_days' | 'locale'
>;
type Contact = Pick<
	Tables<'contacts'>,
	| 'id'
	| 'user_id'
	| 'name'
	| 'birth_day'
	| 'birth_month'
	| 'birth_year'
	| 'is_gift'
	| 'gender'
	| 'pills'
	| 'custom_pills'
>;
type LogRow = Pick<Tables<'reminder_log'>, 'contact_id' | 'kind' | 'occurrence_date'>;

export interface JobResult {
	usersDue: number;
	remindersClaimed: number;
	emailsSent: number;
	emailsFailed: number;
}

const PAGE_SIZE = 1000;
const USER_CHUNK = 100;
// Time the AI gets for gift ideas, well inside the route's 60 s limit: reminders are already
// claimed by then, so the emails must go out even if the AI is slow.
const GIFT_IDEAS_BUDGET_MS = 25_000;

async function fetchAll<T>(
	page: (
		from: number,
		to: number
	) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
	const rows: T[] = [];
	for (let from = 0; ; from += PAGE_SIZE) {
		const { data, error } = await page(from, from + PAGE_SIZE - 1);
		if (error) throw new Error(error.message);
		rows.push(...(data ?? []));
		if (!data || data.length < PAGE_SIZE) return rows;
	}
}

function logKey(row: LogRow): string {
	return `${row.contact_id}|${row.kind}|${row.occurrence_date}`;
}

function toLogRow(reminder: DueReminder<Contact>): LogRow {
	return {
		contact_id: reminder.contact.id,
		kind: reminder.kind,
		occurrence_date: toISODate(reminder.occurrence)
	};
}

async function releaseClaims(db: Supabase, rows: LogRow[]): Promise<void> {
	await Promise.all(
		rows.map(async (row) => {
			const { error } = await db.from('reminder_log').delete().match(row);
			if (error) console.error('[reminders] could not release claim', row, error.message);
		})
	);
}

/**
 * Sends today's reminders to every user whose local send hour has been reached.
 * Safe to run repeatedly (hourly): each reminder is claimed in reminder_log before sending,
 * so it goes out once; if sending fails the claim is released and the next run retries.
 */
export async function runReminderJob(now = new Date()): Promise<JobResult> {
	const db = getSupabaseAdmin();

	// First, so it runs every hour even when there's nothing to send.
	await pruneGiftIdeasCache();

	const profiles = await fetchAll<Profile>((from, to) =>
		db
			.from('profiles')
			.select('id, email, timezone, send_hour, gift_lead_days, locale')
			.eq('emails_enabled', true)
			.not('email', 'is', null)
			.order('id')
			.range(from, to)
	);

	const dueUsers = new Map<string, { profile: Profile; today: CalendarDate }>();
	for (const profile of profiles) {
		const today = sendDateFor(profile, now);
		if (today) dueUsers.set(profile.id, { profile, today });
	}

	const reminders: DueReminder<Contact>[] = [];
	const userIds = [...dueUsers.keys()];
	for (let start = 0; start < userIds.length; start += USER_CHUNK) {
		const chunk = userIds.slice(start, start + USER_CHUNK);
		const contacts = await fetchAll<Contact>((from, to) =>
			db
				.from('contacts')
				.select(
					'id, user_id, name, birth_day, birth_month, birth_year, is_gift, gender, pills, custom_pills'
				)
				.in('user_id', chunk)
				.order('id')
				.range(from, to)
		);
		for (const contact of contacts) {
			const { profile, today } = dueUsers.get(contact.user_id)!;
			reminders.push(...dueReminders(contact, today, profile.gift_lead_days));
		}
	}

	if (reminders.length === 0) {
		return { usersDue: dueUsers.size, remindersClaimed: 0, emailsSent: 0, emailsFailed: 0 };
	}

	// Claim: ON CONFLICT DO NOTHING ... RETURNING gives back only the rows this run inserted.
	const { data: claimed, error: claimError } = await db
		.from('reminder_log')
		.upsert(reminders.map(toLogRow), {
			onConflict: 'contact_id,kind,occurrence_date',
			ignoreDuplicates: true
		})
		.select('contact_id, kind, occurrence_date');
	if (claimError) throw new Error(claimError.message);

	const claimedKeys = new Set(claimed.map(logKey));
	const byUser = new Map<string, DueReminder<Contact>[]>();
	for (const reminder of reminders) {
		if (!claimedKeys.has(logKey(toLogRow(reminder)))) continue;
		const list = byUser.get(reminder.contact.user_id) ?? [];
		list.push(reminder);
		byUser.set(reminder.contact.user_id, list);
	}

	const recipients = [...byUser.keys()];
	if (recipients.length === 0) {
		return { usersDue: dueUsers.size, remindersClaimed: 0, emailsSent: 0, emailsFailed: 0 };
	}

	// Emails and gift ideas are in the language the user last used the site in.
	const localeOf = (userId: string): Locale => dueUsers.get(userId)!.profile.locale ?? 'en';

	const giftProfiles = new Map(
		recipients.flatMap((userId) =>
			byUser.get(userId)!.flatMap((reminder) => {
				const profile =
					reminder.kind === 'advance'
						? giftProfile(reminder.contact, reminder.occurrence, localeOf(userId))
						: null;
				return profile ? [[reminder, profile] as const] : [];
			})
		)
	);
	const giftIdeas = await resolveGiftIdeas(
		[...giftProfiles.values()],
		Date.now() + GIFT_IDEAS_BUDGET_MS
	);

	const emails: OutgoingEmail[] = recipients.map((userId) => {
		const { profile, today } = dueUsers.get(userId)!;
		const locale = localeOf(userId);
		const items: DigestItem[] = byUser.get(userId)!.map((reminder) => {
			const { contact, kind, occurrence } = reminder;
			const profile = giftProfiles.get(reminder);
			return {
				contactId: contact.id,
				name: contact.name,
				kind,
				occurrence,
				age: ageAt(contact, occurrence),
				pills: contact.pills,
				customPills: contact.custom_pills,
				giftIdeas: profile ? (giftIdeas.get(cacheKey(profile)) ?? []) : []
			};
		});
		// Today's birthdays first, then upcoming ones.
		items.sort((a, b) =>
			a.kind === b.kind ? a.name.localeCompare(b.name, locale) : a.kind === 'day_of' ? -1 : 1
		);
		const unsubscribe = unsubscribeUrl(userId);
		return {
			to: profile.email!,
			...renderDigest({ today, items, appUrl: APP_URL, unsubscribeUrl: unsubscribe, locale }),
			// Lets mail apps show their own unsubscribe button. No List-Unsubscribe-Post (one-click):
			// SvelteKit's CSRF check rejects form POSTs without an Origin header, which is how those arrive.
			headers: { 'List-Unsubscribe': `<${unsubscribe}>` }
		};
	});

	const results = await sendEmails(emails);

	const failedClaims = recipients
		.filter((_, i) => !results[i])
		.flatMap((userId) => byUser.get(userId)!.map(toLogRow));
	if (failedClaims.length) await releaseClaims(db, failedClaims);

	const emailsSent = results.filter(Boolean).length;
	return {
		usersDue: dueUsers.size,
		remindersClaimed: claimed.length,
		emailsSent,
		emailsFailed: results.length - emailsSent
	};
}
