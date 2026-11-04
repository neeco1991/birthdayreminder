import { describe, expect, it } from 'vitest';
import { authEmail, confirmationEmail, magicLinkEmail } from './auth-emails.ts';

describe.each([
	['magic link', 'magicLink'],
	['confirmation', 'confirmation']
] as const)('%s email', (_, kind) => {
	describe.each(['en', 'it'] as const)('in %s', (locale) => {
		const email = authEmail(kind, locale);

		it('links to /auth/confirm with the token hash, so any browser can open it', () => {
			expect(email.html).toContain(
				'href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=email"'
			);
			expect(email.html).not.toContain('{{ .ConfirmationURL }}');
		});

		it('includes the code, in the preview text too', () => {
			expect(email.html.match(/\{\{ \.Token \}\}/g)).toHaveLength(2);
		});

		it('uses only variables Supabase provides', () => {
			const variables = new Set(email.html.match(/\{\{[^}]*\}\}/g));
			expect([...variables].sort()).toEqual([
				'{{ .Email }}',
				'{{ .SiteURL }}',
				'{{ .Token }}',
				'{{ .TokenHash }}'
			]);
		});

		it('loads the logo from the app', () => {
			expect(email.html).toContain('src="{{ .SiteURL }}/email/logo.png"');
		});

		it('is marked as written in its language', () => {
			expect(email.html).toContain(`<html lang="${locale}">`);
		});
	});
});

describe.each([
	['magic link', magicLinkEmail, 'magicLink'],
	['confirmation', confirmationEmail, 'confirmation']
] as const)('uploaded %s template', (_, uploaded, kind) => {
	const branch = '{{ if eq (printf "%v" .Data.locale) "it" }}';

	it("picks Italian from the user's metadata, and English otherwise", () => {
		for (const field of ['subject', 'html'] as const) {
			expect(uploaded[field]).toBe(
				`${branch}${authEmail(kind, 'it')[field]}{{ else }}${authEmail(kind, 'en')[field]}{{ end }}`
			);
		}
	});
});
