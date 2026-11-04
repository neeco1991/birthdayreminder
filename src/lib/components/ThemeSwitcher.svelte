<script lang="ts">
	import { page } from '$app/state';
	import { messages } from '#lib/i18n.ts';
	import { parseTheme, THEME_COOKIE, THEME_COOKIE_MAX_AGE, type Theme } from '#lib/theme.ts';

	let { theme }: { theme: Theme | null } = $props();

	let current = $derived(theme);
	let t = $derived(messages(page.data.locale).theme);

	let options = $derived([
		{
			value: 'light',
			label: t.light,
			icon: 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4'
		},
		{
			value: 'system',
			label: t.system,
			icon: 'M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 21h8M12 17v4'
		},
		{ value: 'dark', label: t.dark, icon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z' }
	]);

	// Without JavaScript the form posts to /theme instead, which sets the same cookie.
	function choose(event: SubmitEvent) {
		event.preventDefault();
		const value = parseTheme((event.submitter as HTMLButtonElement | null)?.value);
		current = value;
		document.documentElement.dataset.theme = value ?? '';
		document.cookie = value
			? `${THEME_COOKIE}=${value}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`
			: `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`;
	}
</script>

<form
	method="POST"
	action="/theme"
	onsubmit={choose}
	aria-label={t.label}
	class="inline-flex gap-0.5 rounded-full border border-line p-0.5"
>
	<input type="hidden" name="redirectTo" value={page.url.pathname + page.url.search} />
	{#each options as option (option.value)}
		<button
			name="theme"
			value={option.value}
			title={option.label}
			aria-label={option.label}
			aria-pressed={(current ?? 'system') === option.value}
			class="grid size-7 cursor-pointer place-items-center rounded-full text-fg-muted transition-colors hover:text-fg aria-pressed:bg-surface-muted aria-pressed:text-fg"
		>
			<svg
				class="size-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d={option.icon} />
			</svg>
		</button>
	{/each}
</form>
