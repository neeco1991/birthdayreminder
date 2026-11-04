<script lang="ts">
	import { resolve } from '$app/paths';
	import { messages } from '#lib/i18n.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let t = $derived(messages(data.locale).home);
	let signIn = $derived(messages(data.locale).nav.signIn);
</script>

<div class="max-w-xl sm:pt-6">
	<h1 class="text-3xl font-semibold tracking-tight text-balance">{t.title}</h1>
	<p class="mt-4 text-lg text-pretty text-fg-muted">{t.lead}</p>

	<div class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
		{#if data.user}
			<a href={resolve('/(app)/contacts')} class="btn btn-primary">{t.goToContacts}</a>
		{:else}
			<a href={resolve('/login')} class="btn btn-primary">{signIn}</a>
			<span class="text-sm text-fg-muted">{t.signInHint}</span>
		{/if}
	</div>

	<h2 class="mt-12 text-lg font-semibold">{t.howTitle}</h2>
	<ol class="mt-3 list-decimal space-y-2 pl-5 marker:text-fg-muted">
		{#each t.steps as step (step)}
			<li class="pl-1">{step}</li>
		{/each}
	</ol>

	<h2 class="mt-10 text-lg font-semibold">{t.freeTitle}</h2>
	<p class="mt-3">{t.freeText}</p>
	<p class="mt-3 text-fg-muted">
		{t.privacyNote[0]}<a href={resolve('/privacy')} class="text-fg underline underline-offset-2"
			>{t.privacyNote[1]}</a
		>{t.privacyNote[2]}
	</p>
</div>
