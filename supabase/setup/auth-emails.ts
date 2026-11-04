// Uploads the sign-in emails (src/lib/server/auth-emails.ts) to the Supabase project in
// SUPABASE_PROJECT_REF, with the code length and expiry they promise. Run with `make auth-emails`.
// Needs a SUPABASE_ACCESS_TOKEN with Project Settings and Auth Config set to Read-write
// (project_admin_write and auth_config_write in the API docs).
import {
	OTP_EXPIRY_SECONDS,
	OTP_LENGTH,
	confirmationEmail,
	magicLinkEmail
} from '../../src/lib/server/auth-emails.ts';

const { SUPABASE_PROJECT_REF: ref, SUPABASE_ACCESS_TOKEN: token } = process.env;
if (!ref || !token) {
	console.error('Set SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN in .env first.');
	process.exit(1);
}

const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
	method: 'PATCH',
	headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
	body: JSON.stringify({
		mailer_subjects_magic_link: magicLinkEmail.subject,
		mailer_templates_magic_link_content: magicLinkEmail.html,
		mailer_subjects_confirmation: confirmationEmail.subject,
		mailer_templates_confirmation_content: confirmationEmail.html,
		mailer_otp_length: OTP_LENGTH,
		mailer_otp_exp: OTP_EXPIRY_SECONDS
	})
});

if (!response.ok) {
	console.error(`Supabase answered ${response.status}: ${await response.text()}`);
	process.exit(1);
}
console.log(`Sign-in emails updated on ${ref}.`);
