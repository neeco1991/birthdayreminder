<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import ContactForm from '#lib/components/ContactForm.svelte';
	import { messages } from '#lib/i18n.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let t = $derived(messages(data.locale).editContact);

	let askingForIdeas = $state(false);
</script>

<svelte:head>
	<title>{data.contact.name} · Birthday Reminder</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-semibold tracking-tight">{t.title(data.contact.name)}</h1>

<ContactForm
	values={form?.values ?? data.values}
	errors={form?.errors}
	message={form?.message}
	leadDays={data.profile.gift_lead_days}
	submitLabel={t.save}
/>

{#if data.contact.is_gift}
	<section class="mt-6 rounded-2xl border border-line bg-surface p-6 sm:p-8">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h2 class="font-semibold">{t.ideasTitle}</h2>
				<p class="mt-1 text-sm text-fg-muted">{t.ideasHint}</p>
			</div>
			{#if data.aiEnabled}
				<!-- applyAction instead of update: reloading the page data would reset unsaved edits above. -->
				<form
					method="POST"
					action="?/giftIdeas"
					use:enhance={() => {
						askingForIdeas = true;
						return async ({ result }) => {
							await applyAction(result);
							askingForIdeas = false;
						};
					}}
				>
					<button disabled={askingForIdeas} class="btn btn-secondary">
						{askingForIdeas ? t.thinking : t.suggest}
					</button>
				</form>
			{/if}
		</div>

		{#if form?.ideas}
			{#if form.ideas.length}
				<ul class="mt-5 list-disc space-y-1.5 pl-5 marker:text-accent">
					{#each form.ideas as idea (idea)}
						<li>{idea}</li>
					{/each}
				</ul>
				<p class="mt-4 text-xs text-fg-muted">{t.ideasDisclaimer}</p>
			{:else}
				<p class="mt-4 text-sm text-fg-muted">{t.noIdeas}</p>
			{/if}
		{/if}
		{#if form?.ideasMessage}
			<p class="mt-4 text-sm text-danger">{form.ideasMessage}</p>
		{/if}
		{#if !data.aiEnabled}
			<p class="mt-4 text-sm text-fg-muted">{t.ideasUnavailable}</p>
		{/if}
	</section>
{/if}

<form
	method="POST"
	action="?/delete"
	class="mt-6 text-right"
	use:enhance={({ cancel }) => {
		if (!confirm(t.confirmDelete(data.contact.name))) cancel();
	}}
>
	<button
		class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
	>
		{t.delete}
	</button>
</form>
