// The sign-in emails Supabase Auth sends. They live here so they share the reminder emails' layout;
// `make auth-emails` uploads them (supabase/setup/auth-emails.ts). The `{{ .X }}` placeholders are
// Supabase's Go template variables, filled in when each email is sent.
import { LOCALES, messages, type Locale } from '#lib/i18n.ts';
import { LIGHT, MONO, button, emailDocument, escapeHtml, text } from './email-layout.ts';

/** Digits in the sign-in code. The login page checks for exactly this many. */
export const OTP_LENGTH = 6;
/** How long the link and code work. The emails say it in hours, so keep it a whole number of them. */
export const OTP_EXPIRY_SECONDS = 3600;
const EXPIRY_HOURS = OTP_EXPIRY_SECONDS / 3600;

const SITE_URL = '{{ .SiteURL }}';
// /auth/confirm verifies the token itself, so the link works in any browser (see README).
const CONFIRM_URL = `${SITE_URL}/auth/confirm?token_hash={{ .TokenHash }}&type=email`;
const TOKEN = '{{ .Token }}';

export interface AuthEmail {
	subject: string;
	html: string;
}

type Kind = 'magicLink' | 'confirmation';

/** One email in one language. The uploaded templates hold every language (see eachLocale). */
export function authEmail(kind: Kind, locale: Locale): AuthEmail {
	const t = messages(locale).authEmails;
	const copy = t[kind];
	const email = `<strong class="fg" style="color: ${LIGHT.fg}; font-weight: 600;">{{ .Email }}</strong>`;

	const body = `
<h1 class="fg" style="${text.h1}">${copy.heading}</h1>
<p class="fg-muted" style="${text.lead}">${copy.intro(email)}</p>
<div style="margin: 28px 0 0;">${button(CONFIRM_URL, copy.action)}</div>
<div class="border-line" style="margin: 32px 0 0; border-top: 1px solid ${LIGHT.line}; padding: 24px 0 0;">
<p class="fg-muted" style="${text.small}">${t.codeLabel}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 10px 0 0; border-collapse: separate;"><tr>
<td class="bg-muted fg" style="padding: 12px 14px 12px 20px; border-radius: 12px; background-color: ${LIGHT.surfaceMuted}; font-family: ${MONO}; font-size: 28px; line-height: 34px; font-weight: 600; letter-spacing: 6px; color: ${LIGHT.fg};">${TOKEN}</td>
</tr></table>
<p class="fg-muted" style="${text.small} margin-top: 16px;">${t.expiry(EXPIRY_HOURS)}</p>
</div>`;

	const footer = `
<p style="margin: 0;">${copy.ignore}</p>
<p style="margin: 12px 0 0;">${t.buttonFallback}<br><a href="${escapeHtml(CONFIRM_URL)}" class="fg-muted" style="${text.footerLink} word-break: break-all;">${escapeHtml(CONFIRM_URL)}</a></p>`;

	return {
		subject: copy.subject,
		html: emailDocument({
			title: copy.subject,
			preheader: copy.preheader(TOKEN, EXPIRY_HOURS),
			body,
			footer,
			siteUrl: SITE_URL,
			locale
		})
	};
}

/**
 * Supabase has one template per project, so the template picks the language itself: from `locale`
 * in the user's metadata, which the app keeps up to date (login page and (app) layout). Anything
 * else, including no locale at all, gets English. printf turns a missing value into "<nil>" rather
 * than an error.
 */
function eachLocale(render: (locale: Locale) => string): string {
	const branches = LOCALES.filter((locale) => locale !== 'en').map(
		(locale, i) =>
			`{{ ${i === 0 ? 'if' : 'else if'} eq (printf "%v" .Data.locale) "${locale}" }}${render(locale)}`
	);
	return `${branches.join('')}{{ else }}${render('en')}{{ end }}`;
}

function localizedEmail(kind: Kind): AuthEmail {
	return {
		subject: eachLocale((locale) => authEmail(kind, locale).subject),
		html: eachLocale((locale) => authEmail(kind, locale).html)
	};
}

/** Sent to existing users who ask for a sign-in link. */
export const magicLinkEmail = localizedEmail('magicLink');

/** Sent to new users, when the project requires confirming the email address. */
export const confirmationEmail = localizedEmail('confirmation');
