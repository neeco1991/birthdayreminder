// The shell every email shares: the reminder digest (email.ts) and the Supabase sign-in emails
// (auth-emails.ts). It mirrors the app's look: logo and wordmark, a white card with a hairline border,
// near-black primary button, violet accent. Email clients only reliably support tables and inline
// styles, so that's all this uses; the <style> block only adds dark mode where clients support it.
import type { Locale } from '#lib/i18n.ts';

/** The app's semantic colors (src/routes/layout.css) as hex, since email clients don't know oklch. */
export const LIGHT = {
	canvas: '#fafafa',
	surface: '#ffffff',
	surfaceMuted: '#f4f4f5',
	line: '#e4e4e7',
	fg: '#18181b',
	fgMuted: '#71717a',
	accent: '#7c3aed',
	accentSoft: '#f5f3ff',
	accentFg: '#ffffff'
};

const DARK: typeof LIGHT = {
	canvas: '#09090b',
	surface: '#18181b',
	surfaceMuted: '#232327',
	line: '#27272a',
	fg: '#f4f4f5',
	fgMuted: '#a1a1aa',
	accent: '#a78bfa',
	accentSoft: '#292636',
	accentFg: '#09090b'
};

// No web fonts: loading Inter from Google would tell Google who opened the email.
export const FONT = `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji'`;
export const MONO = `ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace`;

export function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

/**
 * Dark mode overrides, keyed by the class names used below. `@media` covers Apple Mail, iOS Mail and
 * Outlook for Mac; `[data-ogsc]`/`[data-ogsb]` cover Outlook.com. Gmail ignores both and darkens on its own.
 */
const darkRules = Object.entries({
	'bg-canvas': `background-color: ${DARK.canvas}`,
	'bg-surface': `background-color: ${DARK.surface}`,
	'bg-muted': `background-color: ${DARK.surfaceMuted}`,
	'bg-accent-soft': `background-color: ${DARK.accentSoft}`,
	'bg-accent': `background-color: ${DARK.accent}; border-color: ${DARK.accent}`,
	'border-line': `border-color: ${DARK.line}`,
	fg: `color: ${DARK.fg}`,
	'fg-muted': `color: ${DARK.fgMuted}`,
	accent: `color: ${DARK.accent}`,
	'accent-fg': `color: ${DARK.accentFg}`,
	btn: `background-color: ${DARK.fg}; color: ${DARK.surface}`
});

const css = `
:root { color-scheme: light dark; supported-color-schemes: light dark; }
body { margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; }
table { border-collapse: collapse; }
img { border: 0; outline: none; text-decoration: none; }
a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
@media (max-width: 600px) { .card-pad { padding: 24px 20px !important; } }
@media (prefers-color-scheme: dark) {
${darkRules.map(([name, rule]) => `  .${name} { ${rule.replaceAll(';', ' !important;')} !important; }`).join('\n')}
}
${darkRules.map(([name, rule]) => `[data-ogsc] .${name}, [data-ogsb] .${name} { ${rule.replaceAll(';', ' !important;')} !important; }`).join('\n')}
`;

export interface EmailShell {
	/** The subject, repeated as the document title. */
	title: string;
	/** Preview text that inbox lists show after the subject. */
	preheader: string;
	/** HTML inside the card. */
	body: string;
	/** HTML under the card: why they got this email, settings links. */
	footer: string;
	/** The app's base URL, for the logo and the wordmark link. */
	siteUrl: string;
	/** The language the email is written in. */
	locale: Locale;
}

export function emailDocument({
	title,
	preheader,
	body,
	footer,
	siteUrl,
	locale
}: EmailShell): string {
	const home = escapeHtml(siteUrl.replace(/\/+$/, ''));
	return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(title)}</title>
<style>${css}</style>
</head>
<body class="bg-canvas" style="margin: 0; padding: 0; background-color: ${LIGHT.canvas};">
<div style="display: none; max-height: 0; max-width: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; mso-hide: all;">${escapeHtml(preheader)}${'&zwnj;&nbsp;'.repeat(90)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-canvas" style="background-color: ${LIGHT.canvas};">
<tr><td align="center" style="padding: 40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; border-collapse: separate;">
<tr><td style="padding: 0 4px 20px;">
<a href="${home}" style="text-decoration: none;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding-right: 10px;"><img src="${home}/email/logo.png" width="28" height="28" alt="" style="display: block; border-radius: 8px; background-color: ${LIGHT.accent};"></td>
<td class="fg" style="font-family: ${FONT}; font-size: 16px; line-height: 28px; font-weight: 600; letter-spacing: -0.01em; color: ${LIGHT.fg};">Birthday Reminder</td>
</tr></table></a>
</td></tr>
<tr><td class="bg-surface border-line card-pad" style="padding: 32px; background-color: ${LIGHT.surface}; border: 1px solid ${LIGHT.line}; border-radius: 16px; font-family: ${FONT}; color: ${LIGHT.fg};">
${body}
</td></tr>
<tr><td class="fg-muted" style="padding: 24px 4px 0; font-family: ${FONT}; font-size: 12px; line-height: 18px; color: ${LIGHT.fgMuted};">
${footer}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** The app's `btn btn-primary`. `label` is HTML. */
export function button(href: string, label: string): string {
	return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate;"><tr>
<td class="btn" bgcolor="${LIGHT.fg}" style="border-radius: 10px; background-color: ${LIGHT.fg};"><a class="btn" href="${escapeHtml(href)}" target="_blank" style="display: inline-block; padding: 12px 24px; border-radius: 10px; font-family: ${FONT}; font-size: 15px; line-height: 20px; font-weight: 600; color: ${LIGHT.surface}; text-decoration: none;">${label}</a></td>
</tr></table>`;
}

/** Inline styles for the text roles the emails use. */
export const text = {
	h1: `margin: 0; font-size: 22px; line-height: 30px; font-weight: 600; letter-spacing: -0.01em; color: ${LIGHT.fg};`,
	lead: `margin: 8px 0 0; font-size: 15px; line-height: 24px; color: ${LIGHT.fgMuted};`,
	small: `margin: 0; font-size: 13px; line-height: 20px; color: ${LIGHT.fgMuted};`,
	link: `color: ${LIGHT.accent}; text-decoration: none; font-weight: 500;`,
	footerLink: `color: ${LIGHT.fgMuted}; text-decoration: underline;`
};
