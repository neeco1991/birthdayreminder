<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { resolve } from '$app/paths';
	import { messages } from '#lib/i18n.ts';
	import { MIN_AGE } from '#lib/legal.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let submitting = $state(false);

	let t = $derived(messages(data.locale).login);
	let signIn = $derived(messages(data.locale).nav.signIn);

	const submit: SubmitFunction = () => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	};
</script>

<svelte:head>
	<title>{signIn} · Birthday Reminder</title>
</svelte:head>

<div class="mx-auto max-w-sm rounded-2xl border border-line bg-surface p-8 sm:mt-6">
	<h1 class="text-xl font-semibold tracking-tight">{signIn}</h1>
	<p class="mt-1 text-sm text-fg-muted">{t.newHere}</p>

	{#if data.authError}
		<p class="mt-6 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">{t.linkFailed}</p>
	{/if}

	{#if form?.sent}
		<div class="mt-6 rounded-lg bg-accent-soft px-4 py-3 text-sm">
			<p class="font-medium">{form.resent ? t.resent : t.checkInbox}</p>
			<p class="mt-1">{t.sentTo[0]}<strong>{form.email}</strong>{t.sentTo[1]}</p>
		</div>

		<form method="POST" action="?/code" class="mt-6" use:enhance={submit}>
			<input type="hidden" name="email" value={form.email} />
			<label class="block text-sm font-medium" for="code">{t.code}</label>
			<input
				id="code"
				name="code"
				type="text"
				inputmode="numeric"
				autocomplete="one-time-code"
				pattern="[0-9]*"
				minlength={data.codeLength}
				maxlength={data.codeLength}
				required
				aria-invalid={form.codeError ? 'true' : undefined}
				aria-describedby={form.codeError ? 'code-error' : undefined}
				class="mt-1.5 w-full text-center font-mono text-lg tracking-[0.4em] tabular-nums"
			/>
			{#if form.codeError}
				<p id="code-error" class="mt-1.5 text-sm text-danger">{form.codeError}</p>
			{/if}
			<button disabled={submitting} class="mt-4 btn h-10 w-full btn-primary">{signIn}</button>
		</form>

		<div class="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-fg-muted">
			<!-- The forms are enhanced, so the URL is still the sign-in page's: reloading starts over. -->
			<button type="button" onclick={() => location.reload()} class="cursor-pointer hover:text-fg">
				{t.differentEmail}
			</button>
			<form method="POST" action="?/email" use:enhance={submit}>
				<input type="hidden" name="email" value={form.email} />
				<input type="hidden" name="resend" value="1" />
				<button disabled={submitting} class="cursor-pointer hover:text-fg disabled:opacity-50"
					>{t.sendNew}</button
				>
			</form>
		</div>
	{:else}
		<!-- Not enhanced: the action redirects to Google, which client-side navigation can't follow. -->
		<form method="POST" action="?/google" class="mt-6">
			<button class="btn h-10 w-full btn-secondary">
				<svg class="size-4" viewBox="0 0 48 48" aria-hidden="true">
					<path
						fill="#FFC107"
						d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
					/>
					<path
						fill="#FF3D00"
						d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
					/>
					<path
						fill="#4CAF50"
						d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
					/>
					<path
						fill="#1976D2"
						d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
					/>
				</svg>
				{t.google}
			</button>
		</form>

		<div class="my-6 flex items-center gap-3 text-xs text-fg-muted">
			<div class="h-px flex-1 bg-line"></div>
			{t.or}
			<div class="h-px flex-1 bg-line"></div>
		</div>

		<form method="POST" action="?/email" use:enhance={submit}>
			<label class="block text-sm font-medium" for="email">{t.email}</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				autocomplete="email"
				value={form?.email ?? ''}
				class="mt-1.5 w-full"
			/>
			<button disabled={submitting} class="mt-4 btn h-10 w-full btn-primary">
				{t.emailMe}
			</button>
		</form>

		<p class="mt-6 text-xs leading-relaxed text-fg-muted">
			{t.consent.start(MIN_AGE)}<a href={resolve('/terms')} class="underline hover:text-fg"
				>{t.consent.terms}</a
			>{t.consent.middle}<a href={resolve('/privacy')} class="underline hover:text-fg"
				>{t.consent.privacy}</a
			>{t.consent.end}
		</p>
	{/if}

	{#if form?.error}
		<p class="mt-4 text-sm text-danger">{form.error}</p>
	{/if}
</div>
