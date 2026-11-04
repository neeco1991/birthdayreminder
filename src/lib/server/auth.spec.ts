import { describe, expect, it } from 'vitest';
import { safeNext } from './auth.ts';

describe('safeNext', () => {
	it('keeps relative paths', () => {
		expect(safeNext('/settings?tab=1')).toBe('/settings?tab=1');
	});

	it('rejects open redirects', () => {
		for (const next of ['https://evil.com', '//evil.com', '/\\evil.com', 'evil.com', '', null]) {
			expect(safeNext(next)).toBe('/contacts');
		}
	});
});
