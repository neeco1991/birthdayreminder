<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// Reminders are sent at the user's local send hour, so record their timezone on first visit.
	$effect(() => {
		if (data.profile.timezone) return;
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		fetch('/settings/timezone', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ timezone })
		}).then((res) => {
			if (res.ok) invalidateAll();
		});
	});
</script>

{@render children()}
