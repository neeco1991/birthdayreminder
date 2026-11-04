import { timingSafeEqual } from 'node:crypto';
import { error, json } from '@sveltejs/kit';
import { CRON_SECRET } from '$app/env/private';
import { runReminderJob } from '#lib/server/reminder-job.ts';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 60 };

function authorized(header: string | null): boolean {
	const expected = Buffer.from(`Bearer ${CRON_SECRET}`);
	const actual = Buffer.from(header ?? '');
	return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Called hourly by pg_cron (see supabase/setup/cron.sql). GET matches what Vercel Cron sends too.
export const GET: RequestHandler = async ({ request }) => {
	if (!authorized(request.headers.get('authorization'))) error(401, 'Unauthorized');

	const result = await runReminderJob();
	console.log('[reminders]', result);
	return json(result);
};
