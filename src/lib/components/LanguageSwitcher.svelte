<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import {
		LOCALE_COOKIE,
		LOCALE_COOKIE_MAX_AGE,
		LOCALE_NAMES,
		LOCALES,
		messages,
		parseLocale,
		type Locale
	} from '#lib/i18n.ts';

	let { locale }: { locale: Locale } = $props();

	// Without JavaScript the form posts to /language instead, which sets the same cookie.
	async function choose(event: SubmitEvent) {
		event.preventDefault();
		const value = parseLocale((event.submitter as HTMLButtonElement | null)?.value);
		if (!value || value === locale) return;
		document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
		document.documentElement.lang = value;
		// Reloads the page data, which carries the language. Signed in, this also saves it on the
		// account (see the (app) layout), so reminder emails follow.
		await invalidateAll();
	}
</script>

<form
	method="POST"
	action="/language"
	onsubmit={choose}
	aria-label={messages(locale).language}
	class="inline-flex gap-0.5 rounded-full border border-line p-0.5"
>
	<input type="hidden" name="redirectTo" value={page.url.pathname + page.url.search} />
	{#each LOCALES as option (option)}
		<button
			name="locale"
			value={option}
			lang={option}
			title={LOCALE_NAMES[option]}
			aria-label={LOCALE_NAMES[option]}
			aria-pressed={locale === option}
			class="h-7 cursor-pointer rounded-full px-2.5 text-xs font-medium text-fg-muted uppercase transition-colors hover:text-fg aria-pressed:bg-surface-muted aria-pressed:text-fg"
		>
			{option}
		</button>
	{/each}
</form>
