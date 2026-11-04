<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { messages } from '#lib/i18n.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let submitting = $state(false);

	let t = $derived(messages(data.locale).unsubscribe);
</script>

<svelte:head>
	<title>{t.title} · Birthday Reminder</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-sm rounded-2xl border border-line bg-surface p-8 sm:mt-6">
	{#if form?.done}
		<h1 class="text-xl font-semibold tracking-tight">{t.doneTitle}</h1>
		<p class="mt-2 text-sm text-fg-muted">{t.doneText}</p>
		<a href={resolve('/(app)/settings')} class="mt-6 btn w-full btn-secondary">{t.openSettings}</a>
	{:else if data.valid}
		<h1 class="text-xl font-semibold tracking-tight">{t.confirmTitle}</h1>
		<p class="mt-2 text-sm text-fg-muted">{t.confirmText}</p>
		<form
			method="POST"
			class="mt-6"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<button disabled={submitting} class="btn h-10 w-full btn-primary">{t.turnOff}</button>
		</form>
		{#if form?.message}<p class="mt-4 text-sm text-danger">{form.message}</p>{/if}
	{:else}
		<h1 class="text-xl font-semibold tracking-tight">{t.invalidTitle}</h1>
		<p class="mt-2 text-sm text-fg-muted">{t.invalidText}</p>
		<a href={resolve('/(app)/settings')} class="mt-6 btn w-full btn-secondary">{t.openSettings}</a>
	{/if}
</div>
