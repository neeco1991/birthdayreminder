import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatMessage } from './ai.ts';

vi.mock('$app/env/private', () => ({ OPENROUTER_API_KEY: 'test-key' }));

const completeJson =
	vi.fn<(request: { messages: ChatMessage[] }) => Promise<{ ideas: string[] }>>();
vi.mock('./ai.ts', async (importOriginal) => ({
	...(await importOriginal<typeof import('./ai.ts')>()),
	completeJson: (request: { messages: ChatMessage[] }) => completeJson(request)
}));

interface CacheRow {
	key: string;
	ideas: string[];
	created_at: string;
}
let cache: CacheRow[];

/** Just enough of supabase-js for the gift_ideas_cache reads, writes and deletes. */
function fakeClient() {
	return {
		from: () => {
			let keys: string[] = [];
			let since = '';
			let deleteBefore: string | null = null;
			const builder = {
				select: () => builder,
				in: (_column: string, values: string[]) => ((keys = values), builder),
				gte: (_column: string, value: string) => ((since = value), builder),
				delete: () => builder,
				lt: (_column: string, value: string) => ((deleteBefore = value), builder),
				upsert: async (row: CacheRow) => {
					cache = [...cache.filter((r) => r.key !== row.key), row];
					return { error: null };
				},
				then: (resolve: (v: unknown) => unknown) => {
					if (deleteBefore !== null) {
						const before = deleteBefore;
						cache = cache.filter((r) => r.created_at >= before);
						return Promise.resolve({ data: null, error: null }).then(resolve);
					}
					return Promise.resolve({
						data: cache.filter((r) => keys.includes(r.key) && r.created_at >= since),
						error: null
					}).then(resolve);
				}
			};
			return builder;
		}
	};
}
vi.mock('./supabase.ts', () => ({ getSupabaseAdmin: () => fakeClient() }));

const { AiUnavailableError } = await import('./ai.ts');
const { ageRange, cacheKey, getGiftIdeas, giftProfile, pruneGiftIdeasCache, resolveGiftIdeas } =
	await import('./gift-ideas.ts');

const occurrence = { year: 2026, month: 11, day: 16 };
const contact = {
	birth_day: 16,
	birth_month: 11,
	birth_year: 1990,
	gender: 'female' as const,
	pills: ['nerd' as const, 'coffee' as const],
	custom_pills: [' Lego ', 'COFFEE']
};

beforeEach(() => {
	cache = [];
	completeJson.mockReset();
	completeJson.mockResolvedValue({ ideas: ['Lego Technic set', 'Coffee grinder'] });
});

describe('giftProfile', () => {
	it('sends only normalized interests, gender and an age range', () => {
		expect(giftProfile(contact, occurrence, 'en')).toEqual({
			interests: ['coffee', 'lego', 'nerd'],
			gender: 'female',
			ageRange: '35-44',
			locale: 'en'
		});
	});

	it('is null without interests', () => {
		expect(
			giftProfile({ ...contact, pills: [], custom_pills: [' '] }, occurrence, 'en')
		).toBeNull();
	});

	it('groups ages into ranges', () => {
		expect([null, 8, 15, 20, 64, 90].map(ageRange)).toEqual([
			null,
			'child (under 13)',
			'teenager (13-17)',
			'18-24',
			'55-64',
			'65+'
		]);
	});
});

describe('cacheKey', () => {
	it('is a hash that ignores order and case, but not age range', () => {
		const a = giftProfile(contact, occurrence, 'en')!;
		const b = giftProfile(
			{ ...contact, pills: ['coffee', 'nerd'], custom_pills: ['lego'] },
			occurrence,
			'en'
		)!;
		const older = giftProfile({ ...contact, birth_year: 1960 }, occurrence, 'en')!;

		expect(cacheKey(a)).toMatch(/^[0-9a-f]{64}$/);
		expect(cacheKey(a)).toBe(cacheKey(b));
		expect(cacheKey(a)).not.toBe(cacheKey(older));
	});
});

describe('getGiftIdeas', () => {
	it('asks the AI once, then serves the cache', async () => {
		const profile = giftProfile(contact, occurrence, 'en')!;

		await expect(getGiftIdeas(profile)).resolves.toEqual(['Lego Technic set', 'Coffee grinder']);
		await expect(getGiftIdeas(profile)).resolves.toEqual(['Lego Technic set', 'Coffee grinder']);
		expect(completeJson).toHaveBeenCalledTimes(1);
		const { locale, ...person } = profile;
		expect(completeJson.mock.calls[0][0].messages[1].content).toBe(JSON.stringify(person));
		expect(completeJson.mock.calls[0][0].messages[0].content).toContain('in English');
		expect(locale).toBe('en');
	});

	it("writes ideas in the user's language, cached apart from other languages", async () => {
		const italian = giftProfile(contact, occurrence, 'it')!;
		expect(cacheKey(italian)).not.toBe(cacheKey(giftProfile(contact, occurrence, 'en')!));

		await getGiftIdeas(italian);
		expect(completeJson.mock.calls[0][0].messages[0].content).toContain('in Italian');
		expect(completeJson.mock.calls[0][0].messages[1].content).not.toContain('locale');
	});

	it('trims, dedupes and caps the ideas', async () => {
		completeJson.mockResolvedValue({
			ideas: [' A ', 'A', '', 'B', 'C', 'D', 'E', 'F', 'x'.repeat(101)]
		});

		await expect(getGiftIdeas(giftProfile(contact, occurrence, 'en')!)).resolves.toEqual([
			'A',
			'B',
			'C',
			'D',
			'E'
		]);
	});
});

describe('pruneGiftIdeasCache', () => {
	it('deletes ideas older than 90 days and keeps the rest', async () => {
		const day = 86_400_000;
		const ago = (days: number) => new Date(Date.now() - days * day).toISOString();
		cache = [
			{ key: 'a'.repeat(64), ideas: ['Recent'], created_at: ago(89) },
			{ key: 'b'.repeat(64), ideas: ['Expired'], created_at: ago(91) }
		];

		await pruneGiftIdeasCache();

		expect(cache.map((r) => r.ideas[0])).toEqual(['Recent']);
	});
});

describe('resolveGiftIdeas', () => {
	const cached = giftProfile(contact, occurrence, 'en')!;
	const fresh = giftProfile({ ...contact, custom_pills: ['chess'] }, occurrence, 'en')!;

	it('uses the cache first and the AI for the rest', async () => {
		cache = [
			{ key: cacheKey(cached), ideas: ['From cache'], created_at: new Date().toISOString() }
		];

		const ideas = await resolveGiftIdeas([cached, fresh], Date.now() + 10_000);

		expect(ideas.get(cacheKey(cached))).toEqual(['From cache']);
		expect(ideas.get(cacheKey(fresh))).toEqual(['Lego Technic set', 'Coffee grinder']);
		expect(completeJson).toHaveBeenCalledTimes(1);
		expect(cache.map((r) => r.key)).toContain(cacheKey(fresh));
	});

	it('ignores expired cache entries', async () => {
		cache = [{ key: cacheKey(cached), ideas: ['Stale'], created_at: '2020-01-01T00:00:00Z' }];

		const ideas = await resolveGiftIdeas([cached], Date.now() + 10_000);

		expect(ideas.get(cacheKey(cached))).toEqual(['Lego Technic set', 'Coffee grinder']);
	});

	it('leaves out profiles the AI failed on, without throwing', async () => {
		completeJson.mockRejectedValue(new AiUnavailableError('OpenRouter 402: Insufficient credits'));
		vi.spyOn(console, 'error').mockImplementation(() => {});

		const ideas = await resolveGiftIdeas([fresh], Date.now() + 10_000);

		expect(ideas.size).toBe(0);
	});

	it('stops asking the AI once the deadline has passed', async () => {
		const ideas = await resolveGiftIdeas([fresh], Date.now() - 1);

		expect(ideas.size).toBe(0);
		expect(completeJson).not.toHaveBeenCalled();
	});
});
