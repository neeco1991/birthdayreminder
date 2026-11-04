<script lang="ts">
	import { resolve } from '$app/paths';
	import { messages } from '#lib/i18n.ts';
	import { pillLabel } from '#lib/pills.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let t = $derived(messages(data.locale));

	function when(daysUntil: number): string {
		if (daysUntil === 0) return t.when.today;
		if (daysUntil === 1) return t.when.tomorrow;
		return t.when.inDays(daysUntil);
	}
</script>

<svelte:head>
	<title>{t.contacts.title} · Birthday Reminder</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-2xl font-semibold tracking-tight">{t.contacts.title}</h1>
	<div class="flex items-center gap-2">
		<a href={resolve('/(app)/contacts/import')} class="btn btn-secondary">{t.contacts.import}</a>
		<a href={resolve('/(app)/contacts/new')} class="btn btn-primary">{t.contacts.add}</a>
	</div>
</div>

<p class="mt-2 text-sm text-fg-muted">
	{t.contacts.intro[0]}<strong class="font-medium text-fg"
		>{t.days(data.profile.gift_lead_days)}</strong
	>{t.contacts.intro[1]}
	<a href={resolve('/(app)/settings')} class="font-medium text-accent hover:underline"
		>{t.contacts.change}</a
	>
</p>

{#if !data.profile.emails_enabled}
	<p class="mt-6 rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning">
		{t.contacts.emailsOff}
		<a href={resolve('/(app)/settings')} class="font-medium underline">{t.contacts.turnOn}</a>
	</p>
{/if}

{#if data.contacts.length === 0}
	<div class="mt-8 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
		<div
			class="mx-auto grid size-12 place-items-center rounded-xl border border-line bg-surface text-2xl"
		>
			🎈
		</div>
		<p class="mt-4 font-medium">{t.contacts.emptyTitle}</p>
		<p class="mt-1 text-sm text-fg-muted">{t.contacts.emptyText}</p>
		<a href={resolve('/(app)/contacts/new')} class="mt-5 btn btn-primary">
			{t.contacts.addFirst}
		</a>
		<p class="mt-4 text-sm text-fg-muted">
			{t.contacts.importPrompt}
			<a href={resolve('/(app)/contacts/import')} class="font-medium text-accent hover:underline"
				>{t.contacts.importLink}</a
			>
		</p>
	</div>
{:else}
	<ul class="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
		{#each data.contacts as contact (contact.id)}
			{@const today = contact.daysUntil === 0}
			<li>
				<a
					href={resolve('/(app)/contacts/[id]', { id: contact.id })}
					class="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-canvas sm:px-5"
				>
					<div
						class={[
							'flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border',
							today ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-canvas'
						]}
					>
						<span
							class={[
								'text-[10px] leading-none font-semibold tracking-wider uppercase',
								!today && 'text-accent'
							]}
						>
							{t.months[contact.next.month - 1].slice(0, 3)}
						</span>
						<span class="mt-0.5 text-lg leading-none font-semibold tabular-nums">
							{contact.next.day}
						</span>
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<span class="truncate font-medium">{contact.name}</span>
							{#if contact.is_gift}<span class="text-sm" title={t.contacts.giftContact}>🎁</span
								>{/if}
						</div>
						{#if contact.pills.length || contact.custom_pills.length}
							<div class="mt-1 flex flex-wrap gap-1">
								{#each [...contact.pills.map( (pill) => pillLabel(pill, data.locale) ), ...contact.custom_pills] as label, i (i)}
									<span class="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-fg-muted">
										{label}
									</span>
								{/each}
							</div>
						{/if}
					</div>
					<div class="shrink-0 text-right text-sm">
						<div class={today ? 'font-medium text-accent' : ''}>
							{when(contact.daysUntil)}
						</div>
						{#if contact.turning}
							<div class="text-xs text-fg-muted">{t.when.turns(contact.turning)}</div>
						{/if}
					</div>
				</a>
			</li>
		{/each}
	</ul>
{/if}
