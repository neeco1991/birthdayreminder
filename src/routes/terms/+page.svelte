<script lang="ts">
	import type { Component } from 'svelte';
	import type { Locale } from '#lib/i18n.ts';
	import type { PageProps } from './$types';
	import En from './en.svelte';
	import It from './it.svelte';

	let { data }: PageProps = $props();

	// Typed as a Record so adding a language fails type-checking until the terms are translated.
	const VERSIONS: Record<Locale, Component> = { en: En, it: It };
	let Terms = $derived(VERSIONS[data.locale]);
</script>

<Terms />
