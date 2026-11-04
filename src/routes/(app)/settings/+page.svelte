<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import LanguageSwitcher from '#lib/components/LanguageSwitcher.svelte';
	import { messages } from '#lib/i18n.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let t = $derived(messages(data.locale));
	let ts = $derived(t.settings);

	let saving = $state(false);
	let errors = $derived(form?.errors ?? {});

	const hours = Array.from({ length: 24 }, (_, h) => h);
	const card = 'rounded-2xl border border-line bg-surface p-6 sm:p-8';
	const label = 'block text-sm font-medium';
	const inputClass = 'mt-1.5 w-full';
</script>

<svelte:head>
	<title>{ts.title} · Birthday Reminder</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-semibold tracking-tight">{ts.title}</h1>

<form
	method="POST"
	action="?/save"
	class="space-y-8 {card}"
	use:enhance={() => {
		saving = true;
		return async ({ update }) => {
			await update({ reset: false });
			saving = false;
		};
	}}
>
	<div>
		<h2 class="font-semibold">{ts.emails}</h2>
		<p class="mt-1 text-sm text-fg-muted">{ts.sentTo(data.email)}</p>
		<label class="mt-4 flex cursor-pointer items-center gap-3">
			<input type="checkbox" name="emails_enabled" checked={data.profile.emails_enabled} />
			<span>{ts.enable}</span>
		</label>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="send_hour" class={label}>{ts.sendAt}</label>
			<select
				id="send_hour"
				name="send_hour"
				class={inputClass}
				value={String(data.profile.send_hour)}
			>
				{#each hours as h (h)}
					<option value={String(h)}>{String(h).padStart(2, '0')}:00</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="timezone" class={label}>{ts.timezone}</label>
			<select
				id="timezone"
				name="timezone"
				class={inputClass}
				value={data.profile.timezone ?? 'UTC'}
			>
				{#each data.timeZones as zone (zone)}
					<option value={zone}>{zone.replaceAll('_', ' ')}</option>
				{/each}
			</select>
			{#if errors.timezone}<p class="mt-1.5 text-sm text-danger">{errors.timezone[0]}</p>{/if}
		</div>
	</div>

	<div>
		<label for="gift_lead_days" class={label}>{ts.leadDays}</label>
		<input
			id="gift_lead_days"
			name="gift_lead_days"
			type="number"
			min="1"
			max="60"
			required
			value={data.profile.gift_lead_days}
			class="{inputClass} sm:w-32"
		/>
		<p class="mt-1.5 text-xs text-fg-muted">{ts.leadDaysHint}</p>
		{#if errors.gift_lead_days}
			<p class="mt-1.5 text-sm text-danger">{errors.gift_lead_days[0]}</p>
		{/if}
	</div>

	<div class="flex items-center gap-3 border-t border-line pt-6">
		<button disabled={saving} class="btn btn-primary">{ts.save}</button>
		{#if form && 'saved' in form}<span class="text-sm text-success">{ts.saved}</span>{/if}
		{#if form && 'message' in form}<span class="text-sm text-danger">{form.message}</span>{/if}
	</div>
</form>

<!-- Outside the settings form, since the switcher is a form of its own. -->
<section class="mt-6 {card}">
	<h2 class="font-semibold">{t.language}</h2>
	<p class="mt-1 text-sm text-fg-muted">{ts.languageHint}</p>
	<div class="mt-5"><LanguageSwitcher locale={data.locale} /></div>
</section>

<section class="mt-6 {card}">
	<h2 class="font-semibold">{ts.dataTitle}</h2>
	<p class="mt-1 text-sm text-fg-muted">{ts.dataText}</p>
	<a href={resolve('/(app)/settings/export')} download class="mt-5 btn btn-secondary">
		{ts.download}
	</a>
</section>

<section class="mt-6 rounded-2xl border border-danger/30 bg-surface p-6 sm:p-8">
	<h2 class="font-semibold text-danger">{ts.deleteTitle}</h2>
	<p class="mt-1 text-sm text-fg-muted">{ts.deleteText}</p>
	<form
		method="POST"
		action="?/deleteAccount"
		class="mt-5"
		use:enhance={({ cancel }) => {
			if (!confirm(ts.deleteConfirm)) cancel();
		}}
	>
		<button class="btn btn-danger">{ts.deleteButton}</button>
	</form>
</section>
