// The site's English text. Other languages implement the same `Messages` shape (it.ts), so a missing
// translation fails type-checking. Sentences that need a value are functions, so each language can put
// it where its grammar wants. Sentences wrapped around markup (a link, bold text) are split into the
// parts before, between and after it.
import type { Enums } from '../database.types.ts';

const days = (n: number) => (n === 1 ? '1 day' : `${n} days`);
const hours = (n: number) => (n === 1 ? '1 hour' : `${n} hours`);
const birthdays = (n: number) => (n === 1 ? '1 birthday' : `${n} birthdays`);
const emailWhen = (n: number) => (n === 0 ? 'today' : n === 1 ? 'tomorrow' : `in ${n} days`);

export const en = {
	months: [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	],
	/** From Sunday. */
	weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	days,
	cancel: 'Cancel',
	language: 'Language',

	nav: {
		contacts: 'Contacts',
		settings: 'Settings',
		signIn: 'Sign in',
		signOut: 'Sign out',
		privacy: 'Privacy',
		terms: 'Terms',
		contact: 'Contact'
	},

	theme: { label: 'Theme', light: 'Light', system: 'System', dark: 'Dark' },

	when: {
		today: 'Today 🎉',
		tomorrow: 'Tomorrow',
		inDays: (n: number) => `In ${n} days`,
		turns: (age: number) => `Turns ${age}`
	},

	home: {
		title: 'An email for every birthday you want to remember',
		lead: "Birthday Reminder is a free, simple service for anyone. Add the people whose birthdays you don't want to forget, and you'll get an email on the day.",
		goToContacts: 'Go to your contacts',
		signInHint: 'Signing in creates your account.',
		howTitle: 'How it works',
		steps: [
			'Sign in with your email or Google account. No password needed.',
			'Add people and their birthdays: one by one, or all at once from a group chat, a screenshot or a JSON file.',
			'On each birthday you get an email, at the hour you pick and in your timezone.',
			"For the people you buy presents for, you can also get a heads-up a few days earlier, with gift ideas based on what they're into."
		],
		freeTitle: 'Free, for everyone',
		freeText:
			"There's nothing to pay. No tracking and no newsletters: the only emails you get are your reminders and sign-in links. Your contacts are stored in the EU and never sold, and you can download them or delete your account whenever you like.",
		privacyNote: ['The details are in the ', 'privacy policy', '.'] as [string, string, string]
	},

	contacts: {
		title: 'Contacts',
		import: 'Import',
		add: 'Add contact',
		intro: [
			"You'll get an email on each birthday. Gift contacts 🎁 also get a reminder ",
			' before.'
		] as [string, string],
		change: 'Change',
		emailsOff: 'Reminder emails are turned off.',
		turnOn: 'Turn them on',
		emptyTitle: 'No contacts yet',
		emptyText: "Add someone and we'll remind you before their birthday.",
		addFirst: 'Add your first contact',
		importPrompt: 'Birthdays in a group chat, a screenshot or a JSON file?',
		importLink: 'Import them',
		giftContact: 'Gift contact',
		loadFailed: 'Could not load contacts'
	},

	contactForm: {
		name: 'Name',
		birthday: 'Birthday',
		month: 'Month',
		day: 'Day',
		yearOptional: 'Year (optional)',
		yearHint: "Add the year to see how old they're turning.",
		gift: "🎁 I'll get them a gift",
		giftHint: (n: number) => `You'll get an extra reminder ${days(n)} before their birthday.`,
		giftDetails: 'Gift details',
		gender: 'Gender',
		optional: '(optional)',
		genders: { male: 'Male', female: 'Female' } satisfies Record<Enums<'gender'>, string>,
		genderNotSet: 'Not set',
		interests: 'What are they into?',
		interestsHint: (maxCustom: number) =>
			`Pick up to 10 and add up to ${maxCustom} of your own. These will help with gift ideas. Keep it to hobbies and tastes: no health, religion or other sensitive details.`,
		removePill: (pill: string) => `Remove ${pill}`,
		customPlaceholder: 'Something else? e.g. Lego',
		addYourOwn: 'Add your own',
		add: 'Add',
		saveFailed: 'Could not save the contact. Try again.',
		errors: {
			nameRequired: 'Name is required',
			nameTooLong: 'Keep it under 100 characters',
			pickDay: 'Pick a day',
			pickMonth: 'Pick a month',
			yearFormat: 'Enter a year like 1990',
			yearTooEarly: 'Enter a year after 1900',
			yearInFuture: "The year can't be in the future",
			pickGender: 'Pick male or female',
			tooManyPills: 'Pick at most 10',
			customPillTooLong: (max: number) => `Keep each under ${max} characters`,
			tooManyCustomPills: (max: number) => `Add at most ${max}`,
			noSuchDate: "That date doesn't exist"
		}
	},

	editContact: {
		title: (name: string) => `Edit ${name}`,
		save: 'Save changes',
		notFound: 'Contact not found',
		ideasTitle: '✨ AI gift ideas',
		ideasHint:
			"Suggestions from their saved interests, gender and age range. Their name isn't shared.",
		thinking: 'Thinking…',
		suggest: 'Suggest gift ideas',
		ideasDisclaimer: 'AI-generated: check they suit them.',
		noIdeas: 'No ideas this time. Try adding more interests.',
		ideasUnavailable: "AI gift ideas aren't available right now.",
		ideasNeedDetails: 'Tick "I\'ll get them a gift", add what they\'re into, and save first.',
		ideasLimit: (n: number) => `You've asked for gift ideas ${n} times today. Try again tomorrow.`,
		confirmDelete: (name: string) => `Delete ${name}? This can't be undone.`,
		delete: 'Delete contact',
		deleteFailed: 'Could not delete the contact. Try again.'
	},

	importContacts: {
		title: 'Import contacts',
		reviewFirst: "You'll review and can change every contact before anything is saved.",
		aiTitle: '✨ From text or a screenshot',
		aiHint: 'AI finds the names and birthdays in a group chat, a list, a calendar and so on.',
		pasteText: 'Paste text',
		textPlaceholder: "Anna 29/02/1992\nMarco's birthday is on 3 June",
		chooseScreenshot: 'Or choose a screenshot',
		aiPrivacy: (dailyLimit: number) =>
			`Crop the screenshot, or paste only the part with names and birthdays. It's read by an AI model in the EU that keeps nothing, and isn't stored here either. Up to ${dailyLimit} a day.`,
		privacyLink: 'Privacy',
		finding: 'Looking for birthdays…',
		find: 'Find contacts',
		aiUnavailable: "AI import isn't available right now.",
		fileTitle: 'JSON import',
		fileHint: 'Upload a JSON file with names and birthdays.',
		fileLabel: 'JSON file',
		fileFormat: [
			'A list like ',
			'. Dates are day/month/year, and the year can be left out (',
			').'
		] as [string, string, string],
		continue: 'Continue',
		foundByAi: 'Found by AI.',
		checkAi: [
			' Check every name and date before importing: AI can misread them. Mark the people you buy gifts for 🎁 to be reminded ',
			' before.'
		] as [string, string],
		checkFile: [
			'Check the contacts below and change anything you like. Anyone with a ',
			' in the file is a gift contact 🎁, reminded ',
			' before.'
		] as [string, string, string],
		needFix: (n: number) =>
			n === 1
				? '1 contact needs a fix before importing (marked in red). Fix or remove it.'
				: `${n} contacts need a fix before importing (marked in red). Fix or remove them.`,
		remove: 'Remove',
		importCount: (n: number) => (n === 1 ? 'Import 1 contact' : `Import ${n} contacts`),
		saveFailed: 'Could not import the contacts. Try again.',
		errors: {
			noInput: 'Paste some text or choose a screenshot.',
			tooMuchText: (max: string) => `That's too much text: paste at most ${max} characters.`,
			imageType: 'Choose a PNG, JPEG, WebP or GIF image.',
			imageTooBig: 'That image is too big: crop it, or choose one under 4 MB.',
			aiLimit: (n: number) =>
				`You've used today's ${n} AI imports. Try again tomorrow, or add contacts yourself.`,
			nothingFound:
				"The AI didn't find any birthdays. Try a clearer screenshot, or paste the text.",
			noBirthdayFound: 'No birthday found, pick one',
			noFile: 'Choose a JSON file to import.',
			fileTooBig: 'That file is too big.',
			invalidJson: "That file isn't valid JSON.",
			wrongShape: (example: string) => `Expected a list like ${example}.`,
			noContacts: 'That file has no contacts.',
			tooManyContacts: (count: number, max: number) =>
				`That file has ${count} contacts; import at most ${max} at a time.`,
			unreadableDate: (date: string) => `Couldn't read "${date}", pick the date`,
			noDateInFile: 'No birthday in the file, pick one'
		}
	},

	settings: {
		title: 'Settings',
		emails: 'Reminder emails',
		sentTo: (email: string) => `Sent to ${email}`,
		enable: 'Send me reminder emails',
		sendAt: 'Send at',
		timezone: 'Timezone',
		leadDays: '🎁 Gift reminder: days before the birthday',
		leadDaysHint: 'For contacts marked as gift contacts. Everyone else gets a reminder on the day.',
		save: 'Save',
		saved: 'Saved ✓',
		saveFailed: 'Could not save your settings. Try again.',
		languageHint: 'For the site and your reminder emails.',
		dataTitle: 'Your data',
		dataText:
			'Download everything Birthday Reminder stores about you and your contacts, as a JSON file.',
		download: 'Download my data',
		exportFailed: 'Could not export your data. Try again.',
		deleteTitle: 'Delete account',
		deleteText: "Permanently deletes your account and all your contacts. This can't be undone.",
		deleteConfirm: 'Delete your account and all your contacts? This cannot be undone.',
		deleteButton: 'Delete my account',
		deleteFailed: 'Could not delete your account. Try again.',
		errors: {
			timezone: 'Pick a valid timezone',
			leadDaysNumber: 'Enter a number of days',
			leadDaysWhole: 'Enter a whole number of days',
			leadDaysMin: 'At least 1 day',
			leadDaysMax: 'At most 60 days'
		}
	},

	profile: {
		loadFailed: 'Could not load your profile',
		createFailed: 'Could not create your profile'
	},

	legal: {
		privacy: 'Privacy Policy',
		terms: 'Terms of Service',
		lastUpdated: (date: string) => `Last updated: ${date}`
	},

	login: {
		newHere: 'New here? Signing in creates your account.',
		linkFailed: "That sign-in link didn't work or has expired. Try again.",
		checkInbox: 'Check your inbox',
		resent: 'New email sent',
		sentTo: [
			'We sent a sign-in link to ',
			'. Click it, or enter the code from the email here.'
		] as [string, string],
		code: 'Sign-in code',
		differentEmail: 'Use a different email',
		sendNew: 'Send a new email',
		google: 'Continue with Google',
		or: 'or',
		email: 'Email',
		emailMe: 'Email me a sign-in link',
		consent: {
			start: (age: number) => `By continuing, you confirm you're at least ${age} and agree to the `,
			terms: 'Terms of Service',
			middle: '. The ',
			privacy: 'Privacy Policy',
			end: ' explains how we handle your data.'
		},
		errors: {
			invalidEmail: 'Enter a valid email address.',
			tooManyAttempts: 'Too many attempts. Wait a minute and try again.',
			sendFailed: 'Could not send the sign-in link. Try again.',
			googleFailed: 'Could not start Google sign-in. Try again.',
			codeFormat: (digits: number) => `Enter the ${digits}-digit code from the email.`,
			codeFailed: "That code didn't work. It may have expired, or a newer email replaced it."
		}
	},

	unsubscribe: {
		title: 'Reminder emails',
		doneTitle: 'Reminder emails are off',
		doneText:
			"You won't get birthday reminders anymore. Your contacts are still saved, and you can turn emails back on in Settings any time.",
		confirmTitle: 'Turn off reminder emails?',
		confirmText:
			"You'll stop getting birthday reminders by email. Your contacts stay saved, and you can turn emails back on in Settings.",
		turnOff: 'Turn off reminder emails',
		invalidTitle: "This link doesn't work",
		invalidText:
			'It may have been cut off when it was copied. You can also turn off reminder emails in Settings.',
		openSettings: 'Open settings',
		invalid: "This link doesn't work.",
		failed: 'Could not turn off reminder emails. Try again.'
	},

	// The reminder digest (src/lib/server/email.ts). `days` is how far off the birthday is: 0 is today.
	email: {
		sentence: (name: string, age: number | null, days: number) => {
			const when = emailWhen(days);
			return age === null ? `${name}'s birthday is ${when}` : `${name} turns ${age} ${when}`;
		},
		birthdayToday: (name: string) => `It's ${name}'s birthday today`,
		giftSubject: (name: string, days: number) =>
			`${name}'s birthday is ${emailWhen(days)}: time to find a gift`,
		birthdaysToday: (names: string) => `Birthdays today: ${names}`,
		reminders: (names: string) => `Birthday reminders: ${names}`,
		nameList: (names: string[]) =>
			names.length > 3
				? `${names.slice(0, 3).join(', ')} and ${names.length - 3} more`
				: `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`,
		todayCount: (n: number) => `${birthdays(n)} today`,
		comingUpCount: (n: number) => `${birthdays(n)} coming up`,
		bothCount: (today: number, comingUp: number) =>
			`${birthdays(today)} today, ${comingUp} coming up`,
		introBoth: 'Send your wishes, and get a head start on the gifts.',
		introToday: "Don't forget to wish them a happy birthday.",
		introComingUp: "There's still time to find something they'll love.",
		ideasInside: 'AI gift ideas inside.',
		andMore: (n: number) => `And ${n} more.`,
		today: 'Today',
		comingUp: 'Coming up',
		addInterests: ["Add what they're into", ' to get AI gift ideas.'] as [string, string],
		into: 'Into',
		giftIdeasText: 'AI gift ideas (AI-generated: check they suit them)',
		open: 'Open Birthday Reminder',
		why: "You're getting this because reminder emails are on for your Birthday Reminder account.",
		changeWhen: 'Change when they arrive',
		turnOff: 'Turn off reminder emails'
	},

	// The sign-in emails Supabase sends (src/lib/server/auth-emails.ts). `code` and `email` are
	// template placeholders that Supabase fills in.
	authEmails: {
		codeLabel: 'Or enter this code on the sign-in page:',
		expiry: (hoursValid: number) =>
			`The link and the code work once and expire in ${hours(hoursValid)}.`,
		buttonFallback: 'Button not working? Paste this link into your browser:',
		magicLink: {
			subject: 'Sign in to Birthday Reminder',
			preheader: (code: string, hoursValid: number) =>
				`Your sign-in code is ${code}. It expires in ${hours(hoursValid)}.`,
			heading: 'Sign in to Birthday Reminder',
			intro: (email: string) => `Click the button to sign in as ${email}.`,
			action: 'Sign in',
			ignore:
				"Didn't try to sign in? You can ignore this email: nobody can get into your account without the link or the code."
		},
		confirmation: {
			subject: 'Confirm your email for Birthday Reminder',
			preheader: (code: string) =>
				`Your code is ${code}. Confirm your email to finish creating your account.`,
			heading: 'Welcome to Birthday Reminder',
			intro: (email: string) =>
				`Confirm ${email} to finish creating your account. Then add the people you care about, and we'll email you before their birthdays.`,
			action: 'Confirm and sign in',
			ignore:
				"Didn't sign up? You can ignore this email: nothing happens unless someone uses the link or the code."
		}
	},

	ai: {
		unavailable: 'AI is unavailable right now. Try again later.'
	}
};

export type Messages = typeof en;
