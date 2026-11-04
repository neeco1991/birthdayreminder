<script lang="ts">
	import { resolve } from '$app/paths';
	import '@fontsource-variable/inter';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import LanguageSwitcher from '#lib/components/LanguageSwitcher.svelte';
	import ThemeSwitcher from '#lib/components/ThemeSwitcher.svelte';
	import { messages } from '#lib/i18n.ts';
	import { CONTACT_EMAIL } from '#lib/legal.ts';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	let t = $derived(messages(data.locale).nav);

	const current = (prefix: string) => (page.url.pathname.startsWith(prefix) ? 'page' : undefined);

	const navLink =
		'rounded-md px-3 py-1.5 text-fg-muted transition-colors hover:text-fg aria-[current=page]:bg-surface-muted aria-[current=page]:font-medium aria-[current=page]:text-fg';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Birthday Reminder</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header class="sticky top-0 z-10 border-b border-line bg-canvas/80 backdrop-blur-md">
		<div class="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
			<a
				href={data.user ? resolve('/(app)/contacts') : resolve('/')}
				class="flex items-center gap-2 font-semibold tracking-tight"
			>
				<img src={favicon} alt="" class="size-6" />
				<!-- Hidden on phones when signed in, to leave room for the nav. -->
				<span class={data.user && 'max-sm:sr-only'}>Birthday Reminder</span>
			</a>
			{#if data.user}
				<nav class="flex gap-1 text-sm">
					<a href={resolve('/(app)/contacts')} aria-current={current('/contacts')} class={navLink}
						>{t.contacts}</a
					>
					<a href={resolve('/(app)/settings')} aria-current={current('/settings')} class={navLink}
						>{t.settings}</a
					>
				</nav>
				<form method="POST" action="/auth/logout" class="ml-auto">
					<button class="{navLink} cursor-pointer text-sm">{t.signOut}</button>
				</form>
			{:else if page.url.pathname !== '/login'}
				<a href={resolve('/login')} class="ml-auto btn btn-secondary">{t.signIn}</a>
			{/if}
		</div>
	</header>

	<main class="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
		{@render children()}
	</main>

	<footer class="mx-auto w-full max-w-3xl px-4 pb-8">
		<div class="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
			<nav class="flex flex-wrap gap-x-5 gap-y-1 text-sm text-fg-muted [&_a]:hover:text-fg">
				<a href={resolve('/privacy')}>{t.privacy}</a>
				<a href={resolve('/terms')}>{t.terms}</a>
				<a href="mailto:{CONTACT_EMAIL}">{t.contact}</a>
			</nav>
			<div class="flex items-center gap-2">
				<LanguageSwitcher locale={data.locale} />
				<ThemeSwitcher theme={data.theme} />
			</div>
		</div>
	</footer>
</div>
