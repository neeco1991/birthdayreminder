import { defineEnvVars } from '@sveltejs/kit/env';
import * as z from 'zod';

// All variables are private (server-only): the browser never talks to Supabase directly.
export const variables = defineEnvVars({
	SUPABASE_URL: {
		schema: z.url(),
		description: 'Supabase project URL, e.g. https://<ref>.supabase.co'
	},
	SUPABASE_PUBLISHABLE_KEY: {
		schema: z.string().min(1),
		description:
			'Supabase publishable key (or legacy anon key). Requests run as the signed-in user, under RLS.'
	},
	SUPABASE_SECRET_KEY: {
		schema: z.string().min(1),
		description:
			'Supabase secret key (or legacy service_role key). Bypasses RLS: reminder job, account deletion and data export only.'
	},
	APP_URL: {
		schema: z.url(),
		description: 'Public base URL of the app, used for links inside reminder emails.'
	},
	CRON_SECRET: {
		schema: z.string().min(16),
		description:
			'Bearer token the scheduler must send to /api/cron/reminders. Also signs the unsubscribe links in reminder emails, so changing it breaks old ones.'
	},
	RESEND_API_KEY: {
		schema: (value) => value || undefined,
		description:
			'Resend API key. Leave empty in dev to log emails to the console; in production, nothing is sent without it.'
	},
	OPENROUTER_API_KEY: {
		schema: (value) => value || undefined,
		description:
			'OpenRouter API key (Business plan, EU routing) for the AI features. Leave empty to turn them off.'
	},
	EMAIL_FROM: {
		schema: z.string().min(1),
		description:
			'Sender for reminder emails, e.g. "Birthday Reminder <emailer@birthdayreminder.eu>".'
	}
});
