import * as z from 'zod';
import { OPENROUTER_API_KEY } from '$app/env/private';
import { getSupabaseAdmin } from './supabase.ts';

// EU in-region routing (OpenRouter Business): requests are only served by providers in Europe,
// and fail instead of leaving the region. The privacy policy (section 5) relies on this.
const ENDPOINT = 'https://eu.openrouter.ai/api/v1/chat/completions';

/** Cheap, reads images, and served by Mistral in the EU with zero data retention and structured outputs. */
export const AI_MODEL = 'mistralai/mistral-small-3.2-24b-instruct';

export type AiFeature = 'contact_import' | 'gift_ideas';

/** Per user per day: the service is free and every call costs money. */
export const AI_DAILY_LIMITS: Record<AiFeature, number> = { contact_import: 10, gift_ideas: 20 };

/** OpenRouter refused or failed (no credit, rate limit, timeout, bad output), or AI is turned off. */
export class AiUnavailableError extends Error {}

export type ChatPart =
	{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } };

export interface ChatMessage {
	role: 'system' | 'user';
	content: string | ChatPart[];
}

export function isAiEnabled(): boolean {
	return Boolean(OPENROUTER_API_KEY);
}

/**
 * Counts one AI call against the user's daily limit; false once it's used up.
 * Runs as admin: ai_usage is service-role only, so users can't reset their own count.
 */
export async function claimAiCall(userId: string, feature: AiFeature): Promise<boolean> {
	const { data, error } = await getSupabaseAdmin().rpc('claim_ai_call', {
		p_user_id: userId,
		p_feature: feature,
		p_daily_limit: AI_DAILY_LIMITS[feature]
	});
	if (error) throw new Error(`claim_ai_call failed: ${error.message}`);
	return data;
}

/**
 * One chat completion whose answer must match `schema`.
 * Never logs the messages or the answer: they can hold users' contacts.
 */
export async function completeJson<T extends z.ZodObject>(request: {
	name: string;
	schema: T;
	messages: ChatMessage[];
	maxTokens: number;
	temperature: number;
	timeoutMs: number;
}): Promise<z.output<T>> {
	if (!OPENROUTER_API_KEY) throw new AiUnavailableError('OPENROUTER_API_KEY is not set');

	// Providers reject unknown keywords in strict mode, so drop the $schema marker.
	const jsonSchema = z.toJSONSchema(request.schema);
	delete jsonSchema.$schema;

	let response: Response;
	try {
		response = await fetch(ENDPOINT, {
			method: 'POST',
			headers: {
				authorization: `Bearer ${OPENROUTER_API_KEY}`,
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				model: AI_MODEL,
				messages: request.messages,
				max_tokens: request.maxTokens,
				temperature: request.temperature,
				response_format: {
					type: 'json_schema',
					json_schema: { name: request.name, strict: true, schema: jsonSchema }
				},
				// Also enforced in the account settings; repeated here so a settings change can't
				// silently break the privacy policy: only providers that keep nothing and never train
				// on prompts, and only ones that honour the response format.
				provider: { zdr: true, data_collection: 'deny', require_parameters: true }
			}),
			signal: AbortSignal.timeout(request.timeoutMs)
		});
	} catch (e) {
		throw new AiUnavailableError(`request failed: ${e instanceof Error ? e.name : 'unknown'}`);
	}

	// Errors can also arrive in a 200 body. Only OpenRouter's message is kept: its metadata can
	// quote the input (e.g. moderation flags).
	const body = (await response.json().catch(() => null)) as {
		error?: { message?: string };
		choices?: { message?: { content?: unknown } }[];
	} | null;
	if (!response.ok || !body || body.error) {
		throw new AiUnavailableError(
			`OpenRouter ${response.status}: ${body?.error?.message ?? 'unreadable response'}`
		);
	}

	const content = body.choices?.[0]?.message?.content;
	let json: unknown;
	try {
		json = JSON.parse(typeof content === 'string' ? content : '');
	} catch {
		throw new AiUnavailableError('the model did not return JSON');
	}
	const parsed = request.schema.safeParse(json);
	if (!parsed.success) throw new AiUnavailableError("the model's answer did not match the schema");
	return parsed.data;
}
