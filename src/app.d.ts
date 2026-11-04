import type { Supabase } from '#lib/server/supabase.ts';
import type { Locale } from '#lib/i18n.ts';
import type { Theme } from '#lib/theme.ts';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: Supabase;
			user: { id: string; email: string } | null;
			/** The visitor's light/dark choice, or null to follow the system. */
			theme: Theme | null;
			/** The language to show the page in (see hooks.server.ts). */
			locale: Locale;
		}
		interface PageData {
			/** From the root layout, so every page and component can find its text. */
			locale: Locale;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
