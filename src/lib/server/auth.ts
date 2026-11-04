/** Only allow same-site relative redirects after sign-in (no `//evil.com`, no absolute URLs). */
export function safeNext(next: string | null | undefined, fallback = '/contacts'): string {
	if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
		return fallback;
	}
	return next;
}
