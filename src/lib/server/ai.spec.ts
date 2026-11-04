import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as z from 'zod';

vi.mock('$app/env/private', () => ({ OPENROUTER_API_KEY: 'test-key' }));

const rpc = vi.fn();
vi.mock('./supabase.ts', () => ({ getSupabaseAdmin: () => ({ rpc }) }));

const { AiUnavailableError, claimAiCall, completeJson } = await import('./ai.ts');

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
	fetchMock.mockReset();
	vi.stubGlobal('fetch', fetchMock);
	rpc.mockReset();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

const request = {
	name: 'gift_ideas',
	schema: z.object({ ideas: z.array(z.string()) }),
	messages: [{ role: 'user' as const, content: 'Anna, 29/02/1992, secret' }],
	maxTokens: 100,
	temperature: 0,
	timeoutMs: 1_000
};

const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('completeJson', () => {
	it('asks the EU endpoint for zero-retention providers and a strict schema', async () => {
		fetchMock.mockResolvedValue(
			reply({ choices: [{ message: { content: '{"ideas":["Puzzle"]}' } }] })
		);

		await expect(completeJson(request)).resolves.toEqual({ ideas: ['Puzzle'] });

		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe('https://eu.openrouter.ai/api/v1/chat/completions');
		expect(new Headers(init?.headers).get('authorization')).toBe('Bearer test-key');
		const body = JSON.parse(String(init?.body));
		expect(body.provider).toEqual({ zdr: true, data_collection: 'deny', require_parameters: true });
		expect(body.response_format.json_schema).toMatchObject({ name: 'gift_ideas', strict: true });
		expect(body.response_format.json_schema.schema).not.toHaveProperty('$schema');
		expect(body.response_format.json_schema.schema.additionalProperties).toBe(false);
	});

	it.each([
		[
			'an error status',
			() => reply({ error: { code: 402, message: 'Insufficient credits' } }, 402),
			'OpenRouter 402: Insufficient credits'
		],
		[
			'an error inside a 200',
			() => reply({ error: { code: 502, message: 'Provider returned error' } }),
			'Provider returned error'
		],
		[
			'an answer that is not JSON',
			() => reply({ choices: [{ message: { content: 'Sure! Here you go' } }] }),
			'did not return JSON'
		],
		[
			'JSON of the wrong shape',
			() => reply({ choices: [{ message: { content: '{"ideas":"Puzzle"}' } }] }),
			'did not match the schema'
		]
	])('fails with AiUnavailableError on %s, without the input', async (_, response, message) => {
		fetchMock.mockResolvedValue(response());

		const error = await completeJson(request).catch((e: unknown) => e);

		expect(error).toBeInstanceOf(AiUnavailableError);
		expect((error as Error).message).toContain(message);
		expect((error as Error).message).not.toContain('Anna');
	});

	it('fails with AiUnavailableError on timeouts', async () => {
		fetchMock.mockRejectedValue(new DOMException('The operation timed out', 'TimeoutError'));

		await expect(completeJson(request)).rejects.toThrow(
			new AiUnavailableError('request failed: TimeoutError')
		);
	});
});

describe('claimAiCall', () => {
	it("checks the feature's daily limit", async () => {
		rpc.mockResolvedValue({ data: false, error: null });

		await expect(claimAiCall('user-1', 'contact_import')).resolves.toBe(false);
		expect(rpc).toHaveBeenCalledWith('claim_ai_call', {
			p_user_id: 'user-1',
			p_feature: 'contact_import',
			p_daily_limit: 10
		});
	});
});
