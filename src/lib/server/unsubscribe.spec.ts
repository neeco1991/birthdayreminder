import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/env/private', () => ({
	APP_URL: 'https://app.test',
	CRON_SECRET: 'test-secret-that-is-long-enough'
}));

const { unsubscribeUrl, verifyUnsubscribe } = await import('./unsubscribe.ts');

describe('unsubscribe links', () => {
	it('round-trips the user ID', () => {
		const url = new URL(unsubscribeUrl('user-1'));
		expect(url.origin + url.pathname).toBe('https://app.test/unsubscribe');
		expect(verifyUnsubscribe(url.searchParams)).toBe('user-1');
	});

	it("rejects another user's ID or a tampered signature", () => {
		const { searchParams } = new URL(unsubscribeUrl('user-1'));
		const otherUser = new URLSearchParams(searchParams);
		otherUser.set('u', 'user-2');
		expect(verifyUnsubscribe(otherUser)).toBeNull();

		const tampered = new URLSearchParams(searchParams);
		tampered.set('t', `${searchParams.get('t')!.slice(0, -1)}A`);
		expect(verifyUnsubscribe(tampered)).toBeNull();
	});

	it('rejects missing parameters', () => {
		expect(verifyUnsubscribe(new URLSearchParams())).toBeNull();
		expect(verifyUnsubscribe(new URLSearchParams({ u: 'user-1' }))).toBeNull();
		expect(verifyUnsubscribe(new URLSearchParams({ u: 'user-1', t: 'short' }))).toBeNull();
	});
});
