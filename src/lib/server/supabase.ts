import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { RequestEvent } from '@sveltejs/kit';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, SUPABASE_URL } from '$app/env/private';
import type { Database } from '#lib/database.types.ts';

export type Supabase = SupabaseClient<Database>;

/** Per-request client that acts as the signed-in user (RLS applies). Must not be shared across requests. */
export function createSupabaseServerClient(event: RequestEvent): Supabase {
	return createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet, headers) => {
				for (const { name, value, options } of cookiesToSet) {
					// Only the server reads the session, so the cookies can be httpOnly.
					event.cookies.set(name, value, { ...options, path: '/', httpOnly: true });
				}
				event.setHeaders(headers);
			}
		}
	});
}

let admin: Supabase | undefined;

/** Service-role client: bypasses RLS. Only for the reminder job, account deletion and data export. */
export function getSupabaseAdmin(): Supabase {
	admin ??= createClient<Database>(SUPABASE_URL, SUPABASE_SECRET_KEY, {
		auth: { persistSession: false, autoRefreshToken: false }
	});
	return admin;
}
