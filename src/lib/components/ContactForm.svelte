<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { messages } from '#lib/i18n.ts';
	import type { ContactFormErrors, ContactFormValues } from '#lib/server/contact-form.ts';
	import ContactFields from './ContactFields.svelte';

	interface Props {
		values: ContactFormValues;
		errors?: ContactFormErrors;
		message?: string;
		leadDays: number;
		submitLabel: string;
	}

	let { values, errors = {}, message, leadDays, submitLabel }: Props = $props();

	let submitting = $state(false);
</script>

<form
	method="POST"
	action="?/save"
	class="space-y-8 rounded-2xl border border-line bg-surface p-6 sm:p-8"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	}}
>
	<ContactFields {values} {errors} {leadDays} />

	{#if message}
		<p class="text-sm text-danger">{message}</p>
	{/if}

	<div class="flex items-center gap-2 border-t border-line pt-6">
		<button disabled={submitting} class="btn btn-primary">{submitLabel}</button>
		<a href={resolve('/(app)/contacts')} class="btn btn-ghost"
			>{messages(page.data.locale).cancel}</a
		>
	</div>
</form>
