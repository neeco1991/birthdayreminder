<script lang="ts">
	import type { Component } from 'svelte';
	import type { Locale } from '#lib/i18n.ts';
	import type { PageProps } from './$types';
	import En from './en.svelte';
	import It from './it.svelte';

	let { data }: PageProps = $props();

	// Typed as a Record so adding a language fails type-checking until the policy is translated.
	const POLICIES: Record<Locale, Component> = { en: En, it: It };
	let Privacy = $derived(POLICIES[data.locale]);
</script>

<Privacy />
