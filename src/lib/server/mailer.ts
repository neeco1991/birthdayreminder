import { Resend } from 'resend';
import { EMAIL_FROM, RESEND_API_KEY } from '$app/env/private';
import { CONTACT_EMAIL } from '#lib/legal.ts';

export interface OutgoingEmail {
	to: string;
	subject: string;
	html: string;
	text: string;
	headers?: Record<string, string>;
}

// Resend's batch endpoint accepts at most 100 emails per call.
const BATCH_SIZE = 100;

/** Sends the emails and returns, for each one, whether it was accepted. */
export async function sendEmails(emails: OutgoingEmail[]): Promise<boolean[]> {
	if (!RESEND_API_KEY) {
		for (const email of emails) {
			console.log(
				`[mailer] RESEND_API_KEY not set, not sending.\nTo: ${email.to}\nSubject: ${email.subject}\n\n${email.text}\n`
			);
		}
		return emails.map(() => true);
	}

	const resend = new Resend(RESEND_API_KEY);
	const results: boolean[] = [];

	for (let start = 0; start < emails.length; start += BATCH_SIZE) {
		const chunk = emails.slice(start, start + BATCH_SIZE);
		const { data, error } = await resend.batch.send(
			// Replies reach the public contact address instead of bouncing off the sending one.
			chunk.map((email) => ({ from: EMAIL_FROM, replyTo: CONTACT_EMAIL, ...email })),
			{ batchValidation: 'permissive' }
		);

		if (error) {
			console.error('[mailer] batch failed', error);
			results.push(...chunk.map(() => false));
			continue;
		}

		const failed = new Set(data.errors.map((e) => e.index));
		for (const e of data.errors)
			console.error(`[mailer] email to ${chunk[e.index].to} failed: ${e.message}`);
		results.push(...chunk.map((_, i) => !failed.has(i)));
	}

	return results;
}
