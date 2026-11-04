<script lang="ts">
	import ContactForm from '#lib/components/ContactForm.svelte';
	import { messages } from '#lib/i18n.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let title = $derived(messages(data.locale).contacts.add);
</script>

<svelte:head>
	<title>{title} · Birthday Reminder</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>

<ContactForm
	values={form?.values ?? data.values}
	errors={form?.errors}
	message={form?.message}
	leadDays={data.profile.gift_lead_days}
	submitLabel={title}
/>
