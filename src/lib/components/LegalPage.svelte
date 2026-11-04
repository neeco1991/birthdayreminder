<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { formatDate, messages } from '#lib/i18n.ts';
	import { LEGAL_LAST_UPDATED } from '#lib/legal.ts';

	interface Props {
		title: string;
		children: Snippet;
	}

	let { title, children }: Props = $props();
</script>

<svelte:head>
	<title>{title} · Birthday Reminder</title>
	<!-- Keeps the operator's name out of search results. -->
	<meta name="robots" content="noindex" />
</svelte:head>

<article
	class="leading-relaxed text-fg/80 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-fg [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-fg [&_li]:mt-1 [&_li]:marker:text-fg-muted [&_p]:mt-3 [&_strong]:font-semibold [&_strong]:text-fg [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
>
	<h1 class="text-3xl font-semibold tracking-tight text-fg">{title}</h1>
	<p class="mt-2 text-sm text-fg-muted">
		{messages(page.data.locale).legal.lastUpdated(formatDate(LEGAL_LAST_UPDATED, page.data.locale))}
	</p>
	{@render children()}
</article>
