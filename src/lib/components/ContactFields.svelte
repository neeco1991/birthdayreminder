<script lang="ts">
	import { page } from '$app/state';
	import { daysInMonth } from '#lib/dates.ts';
	import { messages } from '#lib/i18n.ts';
	import {
		MAX_CUSTOM_PILL_LENGTH,
		MAX_CUSTOM_PILLS,
		normalizeCustomPills,
		PILL_SLUGS,
		pillLabel
	} from '#lib/pills.ts';
	import type { ContactFormErrors, ContactFormValues } from '#lib/server/contact-form.ts';

	interface Props {
		values: ContactFormValues;
		errors?: ContactFormErrors;
		leadDays: number;
		/** Prepended to every field name, so one form can hold several contacts. */
		prefix?: string;
	}

	let { values, errors = {}, leadDays, prefix = '' }: Props = $props();

	const id = $props.id();
	let t = $derived(messages(page.data.locale).contactForm);
	let months = $derived(messages(page.data.locale).months);
	let month = $derived(Number(values.birth_month) || 1);
	let isGift = $derived(values.is_gift);
	let customPills = $derived(values.custom_pills);
	// The draft is submitted too, so typing one and saving without pressing Add still keeps it.
	// Cleared when the server sends the form back, since its pills then already include the draft.
	let draft = $derived.by(() => {
		void values;
		return '';
	});

	function addDraft() {
		customPills = normalizeCustomPills([...customPills, draft]).slice(0, MAX_CUSTOM_PILLS);
		draft = '';
	}

	const labelClass = 'block text-sm font-medium';
	const inputClass = 'mt-1.5 w-full';
	const pillClass =
		'cursor-pointer rounded-full border border-line px-3 py-1 text-sm text-fg-muted transition-colors select-none hover:border-line-strong hover:text-fg has-checked:border-fg has-checked:bg-fg has-checked:text-surface has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent';

	let genderOptions = $derived([['', t.genderNotSet], ...Object.entries(t.genders)]);
</script>

{#snippet fieldError(messages: string[] | undefined)}
	{#if messages?.length}
		<p class="mt-1.5 text-sm text-danger">{messages[0]}</p>
	{/if}
{/snippet}

<div class="space-y-6">
	<div>
		<label for="{id}-name" class={labelClass}>{t.name}</label>
		<input
			id="{id}-name"
			name="{prefix}name"
			required
			maxlength="100"
			value={values.name}
			class={inputClass}
		/>
		{@render fieldError(errors.name)}
	</div>

	<fieldset>
		<legend class={labelClass}>{t.birthday}</legend>
		<div class="mt-1.5 grid grid-cols-3 gap-3">
			<select
				name="{prefix}birth_month"
				required
				aria-label={t.month}
				class={inputClass}
				value={values.birth_month}
				onchange={(e) => (month = Number(e.currentTarget.value) || 1)}
			>
				<option value="" disabled>{t.month}</option>
				{#each months as name, i (i)}
					<option value={String(i + 1)}>{name}</option>
				{/each}
			</select>
			<select
				name="{prefix}birth_day"
				required
				aria-label={t.day}
				class={inputClass}
				value={values.birth_day}
			>
				<option value="" disabled>{t.day}</option>
				{#each Array.from({ length: daysInMonth(month) }, (_, i) => i + 1) as d (d)}
					<option value={String(d)}>{d}</option>
				{/each}
			</select>
			<input
				name="{prefix}birth_year"
				type="number"
				inputmode="numeric"
				min="1900"
				max={new Date().getFullYear()}
				placeholder={t.yearOptional}
				aria-label={t.yearOptional}
				value={values.birth_year}
				class={inputClass}
			/>
		</div>
		{@render fieldError(errors.birth_day ?? errors.birth_month ?? errors.birth_year)}
		<p class="mt-1.5 text-xs text-fg-muted">{t.yearHint}</p>
	</fieldset>

	<label
		class="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas p-4 transition-colors has-checked:border-accent/40 has-checked:bg-accent-soft"
	>
		<input
			type="checkbox"
			name="{prefix}is_gift"
			checked={values.is_gift}
			onchange={(e) => (isGift = e.currentTarget.checked)}
			class="mt-0.5"
		/>
		<span>
			<span class="block font-medium">{t.gift}</span>
			<span class="block text-sm text-fg-muted">{t.giftHint(leadDays)}</span>
		</span>
	</label>

	<!-- Gift details only matter for gift contacts. Disabled while hidden so they aren't submitted,
	     but kept in the page so unticking and reticking the gift box doesn't lose them. -->
	<fieldset hidden={!isGift} disabled={!isGift} aria-label={t.giftDetails} class="space-y-6">
		<fieldset>
			<legend class={labelClass}>
				{t.gender} <span class="font-normal text-fg-muted">{t.optional}</span>
			</legend>
			<div class="mt-2 flex flex-wrap gap-2">
				{#each genderOptions as [value, label] (value)}
					<label class={pillClass}>
						<input
							type="radio"
							name="{prefix}gender"
							{value}
							checked={values.gender === value}
							class="sr-only"
						/>
						{label}
					</label>
				{/each}
			</div>
			{@render fieldError(errors.gender)}
		</fieldset>

		<fieldset>
			<legend class={labelClass}>{t.interests}</legend>
			<p class="mt-1 text-xs text-fg-muted">{t.interestsHint(MAX_CUSTOM_PILLS)}</p>
			<div class="mt-3 flex flex-wrap gap-2">
				{#each PILL_SLUGS as slug (slug)}
					<label class={pillClass}>
						<input
							type="checkbox"
							name="{prefix}pills"
							value={slug}
							checked={values.pills.includes(slug)}
							class="sr-only"
						/>
						{pillLabel(slug, page.data.locale)}
					</label>
				{/each}
				{#each customPills as pill, i (i)}
					<span
						class="inline-flex items-center gap-1 rounded-full border border-fg bg-fg py-1 pr-1 pl-3 text-sm text-surface"
					>
						<input type="hidden" name="{prefix}custom_pills" value={pill} />
						{pill}
						<button
							type="button"
							aria-label={t.removePill(pill)}
							class="cursor-pointer rounded-full px-1.5 hover:bg-surface/20"
							onclick={() => (customPills = customPills.filter((_, j) => j !== i))}>×</button
						>
					</span>
				{/each}
			</div>
			{@render fieldError(errors.pills)}

			{#if customPills.length < MAX_CUSTOM_PILLS}
				<div class="mt-3 flex gap-2">
					<input
						name="{prefix}custom_pills"
						bind:value={draft}
						maxlength={MAX_CUSTOM_PILL_LENGTH}
						placeholder={t.customPlaceholder}
						aria-label={t.addYourOwn}
						class="w-full text-sm"
						onkeydown={(e) => {
							if (e.key !== 'Enter') return;
							e.preventDefault();
							addDraft();
						}}
					/>
					<button
						type="button"
						disabled={!draft.trim()}
						class="btn h-auto btn-secondary"
						onclick={addDraft}
					>
						{t.add}
					</button>
				</div>
			{/if}
			{@render fieldError(errors.custom_pills)}
		</fieldset>
	</fieldset>
</div>
