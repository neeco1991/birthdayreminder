<script lang="ts">
	import { resolve } from '$app/paths';
	import LegalPage from '#lib/components/LegalPage.svelte';
	import { CONTACT_EMAIL, CONTROLLER_NAME, MIN_AGE } from '#lib/legal.ts';
</script>

<LegalPage title="Privacy Policy">
	<p>
		This policy explains what personal data Birthday Reminder collects, why, who it's shared with,
		and the rights you have under the EU General Data Protection Regulation (GDPR) and Italian data
		protection law. It covers both you, as a user, and the people you add as contacts.
	</p>

	<h2>1. Who is responsible for your data</h2>
	<p>
		Birthday Reminder is run by <strong>{CONTROLLER_NAME}</strong>, a private individual based in
		Italy, who is the data controller. For anything about your data, write to
		<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.
	</p>

	<h2>2. What we collect</h2>
	<h3>Your account</h3>
	<ul>
		<li>
			<strong>Email address</strong>, to sign you in and send your reminders. If you sign in with
			Google, Google also shares your name and profile picture; our sign-in provider stores them
			with your account, but Birthday Reminder doesn't use them.
		</li>
		<li>
			<strong>Settings</strong>: your timezone (detected from your browser on your first visit), the
			hour you get reminders, how many days ahead gift reminders arrive, whether reminder emails are
			on, and the language you use the site in (English or Italian), so your reminders arrive in it.
		</li>
	</ul>
	<h3>The people you add</h3>
	<ul>
		<li>Their name and birthday (day and month; the year is optional).</li>
		<li>Whether you'll buy them a gift.</li>
		<li>
			For gift contacts, optionally their gender and interests, picked from a list or written in
			your own words.
		</li>
	</ul>
	<p>
		If you import contacts from a file, we read it only to fill in the form for you to review. The
		file itself isn't stored.
	</p>
	<h3>Text and images you give the AI importer</h3>
	<p>
		If you add contacts by pasting text or uploading a screenshot, it's sent to an AI model to pick
		out names and birthdays. Neither we nor the AI provider keep it: only the contacts you review
		and confirm are saved. See section 5.
	</p>
	<h3>AI usage</h3>
	<p>
		How many times you used each AI feature today, to enforce the daily limits. Counts from earlier
		days are deleted automatically.
	</p>
	<h3>Reminder history</h3>
	<p>A record of which reminder was sent for which contact and birthday, so none is sent twice.</p>
	<h3>Technical data</h3>
	<p>
		Our hosting providers automatically log requests to the site, including IP address and browser
		details, for security and troubleshooting.
	</p>
	<p>
		Until you pick a language, we show the site in Italian if you connect from Italy and in English
		otherwise. Our hosting provider works out the country from your IP address; we use it only for
		this and don't store it.
	</p>
	<p>
		We don't use analytics or advertising trackers, we don't collect payment data, and we don't buy
		data about you from anyone.
	</p>

	<h2>3. Why we use it, and on what legal basis</h2>
	<ul>
		<li>
			<strong>To run your account and send the reminders you set up</strong>: necessary to provide
			the service you signed up for (art. 6(1)(b) GDPR).
		</li>
		<li>
			<strong
				>To pick out contacts from text or images you provide, and to suggest gift ideas, using AI</strong
			>: features of the service that you choose to use (art. 6(1)(b) GDPR). For the people you add,
			see section 4.
		</li>
		<li>
			<strong>To keep the service secure, prevent abuse and fix problems</strong>: our legitimate
			interest in running a safe, working service (art. 6(1)(f) GDPR).
		</li>
		<li>
			<strong>To comply with the law</strong>, for example when a public authority makes a lawful
			request (art. 6(1)(c) GDPR).
		</li>
	</ul>
	<p>
		The only emails we send are the reminders you set up and sign-in links. We don't send marketing
		emails.
	</p>

	<h2>4. If someone added you as a contact</h2>
	<p>
		Users add the names and birthdays of people they know so they don't forget them. We process this
		data on the basis of legitimate interests (art. 6(1)(f) GDPR): the user's interest, and ours in
		providing the service, in remembering birthdays. The impact on you is small. Your details are
		visible only to the person who added you, we never use them to contact you, and we never share
		or sell them.
	</p>
	<p>
		We don't have contact details for the people users add, so we can't tell each of them
		individually (art. 14(5)(b) GDPR). This section is how we inform you instead.
	</p>
	<p>
		If you think someone has added you and you'd like your data removed, or you object to this
		processing, email <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a> with your name and birthday.
		We'll look for matching entries and delete them.
	</p>
	<p>
		If a user adds you from a pasted text or screenshot, that content passes through an AI model
		once, without being stored. If they mark you as someone they buy gifts for, your interests may
		be used for gift ideas, but your name is never sent to the AI (see section 5).
	</p>

	<h2>5. How we use AI</h2>
	<p>
		Birthday Reminder has two optional AI features. You can always add contacts and choose gifts
		yourself instead.
	</p>
	<ul>
		<li>
			<strong>Adding contacts from text or images.</strong> The text or screenshot you provide is sent
			to an AI model, which picks out names and birthdays. You review the result before anything is saved,
			and the original text or image is discarded.
		</li>
		<li>
			<strong>Gift ideas.</strong> For gift contacts, we send the AI only their interests, gender and
			age range, and the language to write the ideas in: never their name, your name or your email address.
			Suggestions are labelled as AI-generated. We keep them for up to 90 days under a fingerprint of
			that combination, with no name or account attached, so anyone with the same combination gets them
			without another AI request.
		</li>
	</ul>
	<p>
		AI requests go through <strong>OpenRouter</strong>, using its EU routing: they're processed only
		by AI providers located in Europe (the EU/EEA, the UK or Switzerland), and only by providers
		that don't store prompts or responses. The one exception is content a provider must keep because
		it's flagged as illegal. Nothing you send is used to train AI models.
	</p>
	<p>
		The AI doesn't make decisions about you or your contacts: what it produces is a suggestion you
		can accept, change or ignore.
	</p>

	<h2>6. Who we share it with</h2>
	<p>
		We don't sell your data or share it with advertisers. We only use these service providers, each
		bound by a data processing agreement to use it solely on our behalf:
	</p>
	<ul>
		<li>
			<strong>Supabase</strong> (database and sign-in). The database is hosted in the EU (Frankfurt, Germany).
		</li>
		<li>
			<strong>Vercel</strong> (website hosting). The server code runs in the EU (Frankfurt, Germany).
		</li>
		<li>
			<strong>Resend</strong> (sending emails). Resend handles your email address and the content of your
			reminders, which includes your contacts' names, birthdays and interests.
		</li>
		<li>
			<strong>OpenRouter</strong> (AI features). It routes AI requests to AI providers in Europe that
			don't store them, as described in section 5.
		</li>
	</ul>
	<p>
		If you choose "Continue with Google", Google signs you in and acts as an independent controller
		for your Google account, under
		<a href="https://policies.google.com/privacy" rel="noopener noreferrer"
			>Google's privacy policy</a
		>.
	</p>
	<p>We may also disclose data where the law requires it.</p>

	<h2>7. Transfers outside the EU</h2>
	<p>
		Supabase, Vercel, Resend and OpenRouter are US companies, so data may be accessed from outside
		the European Economic Area even where it's stored or processed in the EU, for example by their
		support teams. For AI features, the content of requests is processed in Europe, while OpenRouter
		may handle technical data about the requests (not their content) in the US. These transfers rely
		on the European Commission's Standard Contractual Clauses included in each provider's data
		processing agreement, or on the EU-US Data Privacy Framework for providers certified under it.
		You can ask us for more details.
	</p>

	<h2>8. How long we keep it</h2>
	<ul>
		<li>
			<strong>Text, images and details sent to AI</strong>: not kept. They're processed only for the
			time needed to produce the answer.
		</li>
		<li><strong>AI usage counts</strong>: until the end of the day.</li>
		<li>
			<strong>Account, settings, contacts and reminder history</strong>: until you delete them.
			Deleting a contact also deletes its reminder history. Deleting your account (in Settings)
			deletes all of it straight away.
		</li>
		<li>
			<strong>Backups</strong>: deleted data can remain in our providers' backups for a limited
			time, until they're overwritten.
		</li>
		<li>
			<strong>Technical logs and email delivery logs</strong>: kept by our providers for the limited
			periods they set.
		</li>
	</ul>

	<h2>9. Your rights</h2>
	<p>You have the right to:</p>
	<ul>
		<li>
			<strong>access</strong> your data and <strong>take it with you</strong>: use "Download my
			data" in <a href={resolve('/(app)/settings')}>Settings</a> for a copy in JSON format;
		</li>
		<li><strong>correct</strong> it: you can edit everything in the app;</li>
		<li><strong>delete</strong> it: delete contacts, or your whole account, at any time;</li>
		<li>
			<strong>restrict</strong> or <strong>object to</strong> processing based on legitimate interests;
		</li>
		<li>
			<strong>complain</strong> to the Italian data protection authority, the
			<a href="https://www.garanteprivacy.it" rel="noopener noreferrer"
				>Garante per la protezione dei dati personali</a
			>, or to the authority in the EU country where you live.
		</li>
	</ul>
	<p>
		For anything you can't do in the app, email <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a
		>. We reply within one month.
	</p>

	<h2>10. Cookies</h2>
	<p>
		Birthday Reminder only uses cookies that are strictly necessary: sign-in cookies that keep you
		signed in. They're set when you sign in and removed when you sign out or they expire. If you
		pick a light or dark theme instead of following your device, a cookie remembers that choice for
		a year; it holds nothing else. Likewise, once you pick a language or sign in, a cookie remembers
		your language for a year. There are no analytics, advertising or third-party cookies on this
		site, which is why there's no cookie banner. If you sign in with Google, Google sets its own
		cookies on its own site.
	</p>

	<h2>11. Security</h2>
	<p>
		All traffic is encrypted (HTTPS). The database only lets each account reach its own data, and
		secret keys never leave the server. No system is perfectly secure. If a data breach is likely to
		put your rights at risk, we'll tell you and the Garante as the law requires.
	</p>

	<h2>12. Children</h2>
	<p>
		Birthday Reminder is not for people under {MIN_AGE}. If you think someone younger has created an
		account, email us and we'll delete it.
	</p>

	<h2>13. Automated decisions</h2>
	<p>
		AI suggests gift ideas from the interests entered for a contact, and picks out contacts from
		text or images you provide. These are only suggestions for you to accept or ignore. We don't
		make decisions based solely on automated processing that have legal or similarly significant
		effects on anyone (art. 22 GDPR), and we don't build profiles of you for any other purpose.
	</p>

	<h2>14. Changes to this policy</h2>
	<p>
		When we change this policy, we'll update the date at the top. If a change is significant, we'll
		email you before it takes effect.
	</p>
</LegalPage>
