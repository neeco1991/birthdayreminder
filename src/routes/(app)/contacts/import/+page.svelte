<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance, type SubmitFunction } from '$app/forms';
	import ContactFields from '#lib/components/ContactFields.svelte';
	import { messages } from '#lib/i18n.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let t = $derived(messages(data.locale));
	let ti = $derived(t.importContacts);

	// The entries to review come back from the upload or extract action; removing one only drops it from the page.
	let entries = $derived(form?.entries ?? []);
	let needingFix = $derived(entries.filter((entry) => Object.keys(entry.errors).length).length);

	let submitting = $state(false);

	function remove(key: string) {
		entries = entries.filter((entry) => entry.key !== key);
	}

	const submitWhile: SubmitFunction = () => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	};

	const card = 'mt-6 space-y-6 rounded-2xl border border-line bg-surface p-6 sm:p-8';
	const label = 'block text-sm font-medium';
	const fileInput =
		'mt-1.5 block w-full text-sm text-fg-muted file:mr-4 file:h-9 file:cursor-pointer file:rounded-lg file:border file:border-line file:bg-surface-muted file:px-4 file:text-sm file:font-medium file:text-fg hover:file:bg-line';
	const primaryButton = 'btn btn-primary';
	const cancelLink = 'btn btn-ghost';
</script>

<svelte:head>
	<title>{ti.title} · Birthday Reminder</title>
</svelte:head>

<h1 class="text-2xl font-semibold tracking-tight">{ti.title}</h1>

{#if entries.length === 0}
	<p class="mt-2 text-sm text-fg-muted">{ti.reviewFirst}</p>

	<form
		method="POST"
		action="?/extract"
		enctype="multipart/form-data"
		class={card}
		use:enhance={submitWhile}
	>
		<div>
			<h2 class="font-semibold">{ti.aiTitle}</h2>
			<p class="mt-1 text-sm text-fg-muted">{ti.aiHint}</p>
		</div>

		{#if data.aiEnabled}
			<div>
				<label for="text" class={label}>{ti.pasteText}</label>
				<textarea
					id="text"
					name="text"
					rows="5"
					maxlength={data.maxTextLength}
					placeholder={ti.textPlaceholder}
					class="mt-1.5 w-full text-sm"></textarea>
			</div>
			<div>
				<label for="image" class={label}>{ti.chooseScreenshot}</label>
				<input
					id="image"
					name="image"
					type="file"
					accept={data.imageTypes.join(',')}
					class={fileInput}
				/>
			</div>
			<p class="text-xs leading-relaxed text-fg-muted">
				{ti.aiPrivacy(data.aiDailyLimit)}
				<a href={resolve('/privacy')} class="underline hover:text-fg">{ti.privacyLink}</a>
			</p>

			{#if form?.aiMessage}
				<p class="text-sm text-danger">{form.aiMessage}</p>
			{/if}

			<button disabled={submitting} class={primaryButton}>
				{submitting ? ti.finding : ti.find}
			</button>
		{:else}
			<p class="text-sm text-fg-muted">{ti.aiUnavailable}</p>
		{/if}
	</form>

	<form
		method="POST"
		action="?/upload"
		enctype="multipart/form-data"
		class={card}
		use:enhance={submitWhile}
	>
		<div>
			<h2 class="font-semibold">{ti.fileTitle}</h2>
			<p class="mt-1 text-sm text-fg-muted">
				{ti.fileHint}
			</p>
		</div>
		<div>
			<label for="file" class={label}>{ti.fileLabel}</label>
			<input
				id="file"
				name="file"
				type="file"
				accept=".json,application/json"
				required
				class={fileInput}
			/>
			<p class="mt-1.5 text-xs leading-relaxed text-fg-muted">
				{ti.fileFormat[0]}<code>{data.fileExample}</code>{ti.fileFormat[1]}<code>"29/02/"</code>{ti
					.fileFormat[2]}
			</p>
		</div>

		{#if form?.message}
			<p class="text-sm text-danger">{form.message}</p>
		{/if}

		<div class="flex items-center gap-2">
			<button disabled={submitting} class={primaryButton}>{ti.continue}</button>
			<a href={resolve('/(app)/contacts')} class={cancelLink}>{t.cancel}</a>
		</div>
	</form>
{:else}
	{#if form?.fromAi}
		<p class="mt-6 rounded-lg bg-accent-soft px-4 py-3 text-sm">
			✨ <strong>{ti.foundByAi}</strong>{ti.checkAi[0]}<strong
				>{t.days(data.profile.gift_lead_days)}</strong
			>{ti.checkAi[1]}
		</p>
	{:else}
		<p class="mt-2 text-sm text-fg-muted">
			{ti.checkFile[0]}<code>notification_before</code>{ti.checkFile[1]}<strong
				>{t.days(data.profile.gift_lead_days)}</strong
			>{ti.checkFile[2]}
		</p>
	{/if}

	{#if needingFix}
		<p class="mt-4 rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning">
			{ti.needFix(needingFix)}
		</p>
	{/if}

	<form method="POST" action="?/save" class="mt-6" use:enhance={submitWhile}>
		{#if form?.fromAi}<input type="hidden" name="from_ai" value="on" />{/if}
		<ul class="space-y-4">
			{#each entries as entry (entry.key)}
				<li
					class={[
						'rounded-2xl border bg-surface p-6 sm:p-8',
						Object.keys(entry.errors).length ? 'border-danger/50' : 'border-line'
					]}
				>
					<input type="hidden" name="entry" value={entry.key} />
					<ContactFields
						prefix="{entry.key}."
						values={entry.values}
						errors={entry.errors}
						leadDays={data.profile.gift_lead_days}
					/>
					<div class="mt-6 text-right">
						<button
							type="button"
							class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
							onclick={() => remove(entry.key)}
						>
							{ti.remove}
						</button>
					</div>
				</li>
			{/each}
		</ul>

		<div
			class="sticky bottom-0 -mx-4 mt-6 flex items-center gap-2 border-t border-line bg-canvas/80 px-4 py-4 backdrop-blur-md"
		>
			<button disabled={submitting} class={primaryButton}>
				{ti.importCount(entries.length)}
			</button>
			<a href={resolve('/(app)/contacts')} class={cancelLink}>{t.cancel}</a>
			{#if form?.message}
				<p class="text-sm text-danger">{form.message}</p>
			{/if}
		</div>
	</form>
{/if}
