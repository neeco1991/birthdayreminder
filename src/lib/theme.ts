// A visitor's light/dark choice is kept in a cookie, so the server can render the page in that theme
// (no flash of the wrong one). No cookie means "follow the system", which layout.css handles on its own.

export type Theme = 'light' | 'dark';

export const THEME_COOKIE = 'theme';
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseTheme(value: unknown): Theme | null {
	return value === 'light' || value === 'dark' ? value : null;
}
