<script lang="ts">
	import { resolve } from '$app/paths';
	import LegalPage from '#lib/components/LegalPage.svelte';
	import { CONTACT_EMAIL, MIN_AGE } from '#lib/legal.ts';
</script>

<LegalPage title="Terms of Service">
	<p>
		These terms are the agreement between you and the private individual based in Italy who runs
		Birthday Reminder ("we"), named in the <a href={resolve('/privacy')}>Privacy Policy</a>. By
		creating an account or using Birthday Reminder, you accept them. Questions? Write to
		<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.
	</p>

	<h2>1. The service</h2>
	<p>
		Birthday Reminder sends you email reminders of the birthdays you add. It's free. We may add,
		change or remove features over time.
	</p>

	<h2>2. Who can use it</h2>
	<p>
		You must be at least {MIN_AGE} years old and use an email address you control. Birthday Reminder is
		for personal, non-commercial use.
	</p>

	<h2>3. Your account</h2>
	<p>
		You sign in with a link sent to your email or with Google, so keep access to your email account
		secure. You're responsible for what happens in your Birthday Reminder account.
	</p>

	<h2>4. The people you add</h2>
	<ul>
		<li>Only add people you know personally, to remember their birthdays.</li>
		<li>
			Don't add sensitive information about anyone, such as health, religion, political opinions,
			ethnicity or sexual orientation, including in interests you write yourself.
		</li>
		<li>
			The information you add stays yours. You allow us to store and process it only to provide
			Birthday Reminder, as described in the <a href={resolve('/privacy')}>Privacy Policy</a>.
		</li>
	</ul>

	<h2>5. AI features</h2>
	<ul>
		<li>
			AI features are optional and can make mistakes. Check the contacts the AI finds before you
			save them: you're responsible for what you save.
		</li>
		<li>
			Gift ideas are AI-generated suggestions, not recommendations we stand behind. A suggested
			product may not exist, may not be available, or may not suit the person, so use your own
			judgement.
		</li>
		<li>
			Only paste text or upload images you're allowed to share, and only what's needed: crop out
			anything that isn't names and birthdays, such as private messages.
		</li>
		<li>
			AI features have usage limits, and we may pause them at any time, for example if our AI budget
			runs out. You can always add contacts and choose gifts yourself.
		</li>
	</ul>

	<h2>6. Acceptable use</h2>
	<p>Don't:</p>
	<ul>
		<li>use Birthday Reminder to send spam or for marketing or other commercial purposes;</li>
		<li>
			use the AI features for anything other than adding contacts and getting gift ideas, or try to
			get around their limits;
		</li>
		<li>try to access other people's accounts or data, or probe or disrupt the service;</li>
		<li>create accounts automatically or in bulk, or scrape the site.</li>
	</ul>

	<h2>7. No guarantees</h2>
	<p>
		Birthday Reminder is a free service provided as it is. We do our best, but reminders may arrive
		late, end up in spam, or not arrive at all, AI output may be wrong, and the service may be
		unavailable at times. Don't rely on it as your only reminder for anything important.
	</p>

	<h2>8. Liability</h2>
	<p>
		To the extent permitted by law, we aren't liable for losses caused by a missed, late or
		incorrect reminder, by incorrect AI output, or by the service being unavailable. Nothing in
		these terms limits our liability for intent or gross negligence, or any liability that can't be
		limited by law, and nothing affects your rights as a consumer.
	</p>

	<h2>9. Ending your use</h2>
	<ul>
		<li>
			You can stop at any time by deleting your account in
			<a href={resolve('/(app)/settings')}>Settings</a>, which deletes all your data.
		</li>
		<li>
			We may suspend or close an account that seriously or repeatedly breaks these terms. Where we
			can, we'll warn you first.
		</li>
		<li>
			If we shut Birthday Reminder down, we'll email you at least 30 days in advance so you can
			download your data.
		</li>
	</ul>

	<h2>10. Changes to these terms</h2>
	<p>
		If we make significant changes, we'll email you at least 30 days before they take effect. If you
		don't agree with them, you can delete your account before then. Continuing to use Birthday
		Reminder after that means you accept the new terms.
	</p>

	<h2>11. Applicable law</h2>
	<p>
		These terms are governed by Italian law. If you're a consumer, you keep the protection of the
		mandatory laws of the country where you live, and you can bring any dispute before the courts of
		the place where you live.
	</p>
</LegalPage>
