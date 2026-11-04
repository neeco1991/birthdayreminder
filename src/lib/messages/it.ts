// The site's Italian text: see en.ts for how it's organized.
import type { Messages } from './en.ts';

const days = (n: number) => (n === 1 ? '1 giorno' : `${n} giorni`);
const hours = (n: number) => (n === 1 ? '1 ora' : `${n} ore`);
const birthdays = (n: number) => (n === 1 ? '1 compleanno' : `${n} compleanni`);
const emailWhen = (n: number) => (n === 0 ? 'oggi' : n === 1 ? 'domani' : `tra ${n} giorni`);

export const it: Messages = {
	months: [
		'gennaio',
		'febbraio',
		'marzo',
		'aprile',
		'maggio',
		'giugno',
		'luglio',
		'agosto',
		'settembre',
		'ottobre',
		'novembre',
		'dicembre'
	],
	/** From Sunday. */
	weekdays: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
	days,
	cancel: 'Annulla',
	language: 'Lingua',

	nav: {
		contacts: 'Contatti',
		settings: 'Impostazioni',
		signIn: 'Accedi',
		signOut: 'Esci',
		privacy: 'Privacy',
		terms: 'Termini',
		contact: 'Scrivici'
	},

	theme: { label: 'Tema', light: 'Chiaro', system: 'Sistema', dark: 'Scuro' },

	when: {
		today: 'Oggi 🎉',
		tomorrow: 'Domani',
		inDays: (n: number) => `Tra ${n} giorni`,
		turns: (age: number) => `Compie ${age} anni`
	},

	home: {
		title: "Un'email per ogni compleanno che vuoi ricordare",
		lead: "Birthday Reminder è un servizio gratuito e semplice, per chiunque. Aggiungi le persone di cui non vuoi dimenticare il compleanno e riceverai un'email il giorno stesso.",
		goToContacts: 'Vai ai tuoi contatti',
		signInHint: 'Accedendo crei il tuo account.',
		howTitle: 'Come funziona',
		steps: [
			'Accedi con la tua email o con Google. Non serve una password.',
			'Aggiungi le persone e i loro compleanni: una alla volta, o tutte insieme da una chat di gruppo, uno screenshot o un file JSON.',
			"Il giorno del compleanno ricevi un'email, all'ora che scegli e nel tuo fuso orario.",
			'Per le persone a cui fai un regalo puoi ricevere anche un avviso qualche giorno prima, con qualche idea regalo in base alle loro passioni.'
		],
		freeTitle: 'Gratis, per tutti',
		freeText:
			"Non c'è niente da pagare. Niente tracciamento e niente newsletter: le uniche email che ricevi sono i tuoi promemoria e i link per accedere. I tuoi contatti sono conservati nell'UE e non vengono mai venduti, e puoi scaricarli o eliminare il tuo account quando vuoi.",
		privacyNote: ['Trovi i dettagli nell’', 'informativa sulla privacy', '.']
	},

	contacts: {
		title: 'Contatti',
		import: 'Importa',
		add: 'Aggiungi contatto',
		intro: [
			"Riceverai un'email a ogni compleanno e, per i contatti regalo 🎁, anche un promemoria ",
			' prima.'
		],
		change: 'Modifica',
		emailsOff: 'Le email di promemoria sono disattivate.',
		turnOn: 'Attivale',
		emptyTitle: 'Ancora nessun contatto',
		emptyText: 'Aggiungi qualcuno e ti ricorderemo il suo compleanno.',
		addFirst: 'Aggiungi il tuo primo contatto',
		importPrompt: 'Hai dei compleanni in una chat di gruppo, in uno screenshot o in un file JSON?',
		importLink: 'Importali',
		giftContact: 'Contatto regalo',
		loadFailed: 'Impossibile caricare i contatti'
	},

	contactForm: {
		name: 'Nome',
		birthday: 'Compleanno',
		month: 'Mese',
		day: 'Giorno',
		yearOptional: 'Anno (facoltativo)',
		yearHint: "Aggiungi l'anno per vedere quanti anni compie.",
		gift: '🎁 Farò un regalo a questa persona',
		giftHint: (n: number) => `Riceverai un promemoria in più ${days(n)} prima del compleanno.`,
		giftDetails: 'Dettagli per il regalo',
		gender: 'Genere',
		optional: '(facoltativo)',
		genders: { male: 'Maschio', female: 'Femmina' },
		genderNotSet: 'Non indicato',
		interests: 'Quali sono le sue passioni?',
		interestsHint: (maxCustom: number) =>
			`Scegline fino a 10 e aggiungine fino a ${maxCustom} tue. Serviranno per le idee regalo. Limitati a hobby e gusti: niente salute, religione o altri dati sensibili.`,
		removePill: (pill: string) => `Rimuovi ${pill}`,
		customPlaceholder: 'Altro? Es. Lego',
		addYourOwn: 'Aggiungine una tua',
		add: 'Aggiungi',
		saveFailed: 'Impossibile salvare il contatto. Riprova.',
		errors: {
			nameRequired: 'Il nome è obbligatorio',
			nameTooLong: 'Usa meno di 100 caratteri',
			pickDay: 'Scegli un giorno',
			pickMonth: 'Scegli un mese',
			yearFormat: 'Inserisci un anno, ad esempio 1990',
			yearTooEarly: 'Inserisci un anno successivo al 1900',
			yearInFuture: "L'anno non può essere nel futuro",
			pickGender: 'Scegli maschio o femmina',
			tooManyPills: 'Scegline al massimo 10',
			customPillTooLong: (max: number) => `Usa meno di ${max} caratteri per ciascuna`,
			tooManyCustomPills: (max: number) => `Aggiungine al massimo ${max}`,
			noSuchDate: 'Questa data non esiste'
		}
	},

	editContact: {
		title: (name: string) => `Modifica ${name}`,
		save: 'Salva modifiche',
		notFound: 'Contatto non trovato',
		ideasTitle: "✨ Idee regalo dall'IA",
		ideasHint:
			"Suggerimenti in base agli interessi, al genere e alla fascia d'età salvati. Il nome non viene condiviso.",
		thinking: 'Ci penso…',
		suggest: 'Suggerisci idee regalo',
		ideasDisclaimer: "Generate dall'IA: verifica che siano adatte.",
		noIdeas: 'Nessuna idea questa volta. Prova ad aggiungere altri interessi.',
		ideasUnavailable: "Le idee regalo dall'IA non sono disponibili al momento.",
		ideasNeedDetails:
			'Spunta "Farò un regalo a questa persona", aggiungi le sue passioni e salva, poi riprova.',
		ideasLimit: (n: number) => `Oggi hai già chiesto idee regalo ${n} volte. Riprova domani.`,
		confirmDelete: (name: string) => `Eliminare ${name}? L'operazione non si può annullare.`,
		delete: 'Elimina contatto',
		deleteFailed: 'Impossibile eliminare il contatto. Riprova.'
	},

	importContacts: {
		title: 'Importa contatti',
		reviewFirst: 'Potrai controllare e modificare ogni contatto prima che venga salvato.',
		aiTitle: '✨ Da un testo o uno screenshot',
		aiHint:
			"L'IA trova nomi e compleanni in una chat di gruppo, un elenco, un calendario e così via.",
		pasteText: 'Incolla il testo',
		textPlaceholder: 'Anna 29/02/1992\nIl compleanno di Marco è il 3 giugno',
		chooseScreenshot: 'Oppure scegli uno screenshot',
		aiPrivacy: (dailyLimit: number) =>
			`Ritaglia lo screenshot, o incolla solo la parte con nomi e compleanni. Lo legge un modello di IA nell'UE che non conserva nulla, e non viene salvato nemmeno qui. Fino a ${dailyLimit} volte al giorno.`,
		privacyLink: 'Privacy',
		finding: 'Cerco i compleanni…',
		find: 'Trova contatti',
		aiUnavailable: "L'importazione con l'IA non è disponibile al momento.",
		fileTitle: 'Importazione JSON',
		fileHint: 'Carica un file JSON con nomi e compleanni.',
		fileLabel: 'File JSON',
		fileFormat: [
			'Un elenco come ',
			". Le date sono nel formato giorno/mese/anno, e l'anno si può omettere (",
			').'
		],
		continue: 'Continua',
		foundByAi: "Trovati dall'IA.",
		checkAi: [
			" Controlla ogni nome e data prima di importare: l'IA può leggerli male. Segna le persone a cui fai un regalo 🎁 per ricevere un promemoria ",
			' prima.'
		],
		checkFile: [
			'Controlla i contatti qui sotto e modifica quello che vuoi. Chi nel file ha un ',
			' è un contatto regalo 🎁, con un promemoria ',
			' prima.'
		],
		needFix: (n: number) =>
			n === 1
				? '1 contatto va corretto prima di importare (è segnato in rosso). Correggilo o rimuovilo.'
				: `${n} contatti vanno corretti prima di importare (sono segnati in rosso). Correggili o rimuovili.`,
		remove: 'Rimuovi',
		importCount: (n: number) => (n === 1 ? 'Importa 1 contatto' : `Importa ${n} contatti`),
		saveFailed: 'Impossibile importare i contatti. Riprova.',
		errors: {
			noInput: 'Incolla un testo o scegli uno screenshot.',
			tooMuchText: (max: string) =>
				`Il testo è troppo lungo: incollane al massimo ${max} caratteri.`,
			imageType: "Scegli un'immagine PNG, JPEG, WebP o GIF.",
			imageTooBig: "L'immagine è troppo grande: ritagliala o scegline una sotto i 4 MB.",
			aiLimit: (n: number) =>
				`Hai già usato le ${n} importazioni con l'IA di oggi. Riprova domani o aggiungi i contatti a mano.`,
			nothingFound:
				"L'IA non ha trovato compleanni. Prova con uno screenshot più nitido o incolla il testo.",
			noBirthdayFound: 'Nessun compleanno trovato, scegline uno',
			noFile: 'Scegli un file JSON da importare.',
			fileTooBig: 'Il file è troppo grande.',
			invalidJson: 'Il file non è un JSON valido.',
			wrongShape: (example: string) => `Serve un elenco come ${example}.`,
			noContacts: 'Il file non contiene contatti.',
			tooManyContacts: (count: number, max: number) =>
				`Il file contiene ${count} contatti: importane al massimo ${max} alla volta.`,
			unreadableDate: (date: string) => `Impossibile leggere "${date}", scegli la data`,
			noDateInFile: 'Nel file non c’è il compleanno, scegline uno'
		}
	},

	settings: {
		title: 'Impostazioni',
		emails: 'Email di promemoria',
		sentTo: (email: string) => `Inviate a ${email}`,
		enable: 'Inviami le email di promemoria',
		sendAt: 'Orario di invio',
		timezone: 'Fuso orario',
		leadDays: '🎁 Promemoria regalo: giorni prima del compleanno',
		leadDaysHint:
			'Per i contatti regalo. Per tutti gli altri ricevi un promemoria il giorno stesso.',
		save: 'Salva',
		saved: 'Salvato ✓',
		saveFailed: 'Impossibile salvare le impostazioni. Riprova.',
		languageHint: 'Per il sito e le email di promemoria.',
		dataTitle: 'I tuoi dati',
		dataText:
			'Scarica tutto ciò che Birthday Reminder conserva su di te e sui tuoi contatti, in un file JSON.',
		download: 'Scarica i miei dati',
		exportFailed: 'Impossibile esportare i tuoi dati. Riprova.',
		deleteTitle: 'Elimina account',
		deleteText:
			"Elimina definitivamente il tuo account e tutti i tuoi contatti. L'operazione non si può annullare.",
		deleteConfirm:
			"Eliminare il tuo account e tutti i tuoi contatti? L'operazione non si può annullare.",
		deleteButton: 'Elimina il mio account',
		deleteFailed: "Impossibile eliminare l'account. Riprova.",
		errors: {
			timezone: 'Scegli un fuso orario valido',
			leadDaysNumber: 'Inserisci un numero di giorni',
			leadDaysWhole: 'Inserisci un numero intero di giorni',
			leadDaysMin: 'Almeno 1 giorno',
			leadDaysMax: 'Al massimo 60 giorni'
		}
	},

	profile: {
		loadFailed: 'Impossibile caricare il tuo profilo',
		createFailed: 'Impossibile creare il tuo profilo'
	},

	legal: {
		privacy: 'Informativa sulla privacy',
		terms: 'Termini di servizio',
		lastUpdated: (date: string) => `Ultimo aggiornamento: ${date}`
	},

	login: {
		newHere: 'Prima volta qui? Accedendo crei il tuo account.',
		linkFailed: 'Il link di accesso non ha funzionato o è scaduto. Riprova.',
		checkInbox: 'Controlla la tua casella di posta',
		resent: 'Nuova email inviata',
		sentTo: [
			'Abbiamo inviato un link di accesso a ',
			". Aprilo, oppure inserisci qui il codice che trovi nell'email."
		],
		code: 'Codice di accesso',
		differentEmail: "Usa un'altra email",
		sendNew: 'Invia una nuova email',
		google: 'Continua con Google',
		or: 'oppure',
		email: 'Email',
		emailMe: 'Inviami un link di accesso',
		consent: {
			start: (age: number) => `Continuando, confermi di avere almeno ${age} anni e accetti i `,
			terms: 'Termini di servizio',
			middle: ". L'",
			privacy: 'Informativa sulla privacy',
			end: ' spiega come trattiamo i tuoi dati.'
		},
		errors: {
			invalidEmail: 'Inserisci un indirizzo email valido.',
			tooManyAttempts: 'Troppi tentativi. Aspetta un minuto e riprova.',
			sendFailed: 'Impossibile inviare il link di accesso. Riprova.',
			googleFailed: "Impossibile avviare l'accesso con Google. Riprova.",
			codeFormat: (digits: number) =>
				`Inserisci il codice di ${digits} cifre che trovi nell'email.`,
			codeFailed:
				"Il codice non ha funzionato. Potrebbe essere scaduto, o essere stato sostituito da un'email più recente."
		}
	},

	unsubscribe: {
		title: 'Email di promemoria',
		doneTitle: 'Le email di promemoria sono disattivate',
		doneText:
			'Non riceverai più promemoria di compleanno. I tuoi contatti restano salvati, e puoi riattivare le email nelle Impostazioni quando vuoi.',
		confirmTitle: 'Disattivare le email di promemoria?',
		confirmText:
			'Smetterai di ricevere i promemoria di compleanno via email. I tuoi contatti restano salvati, e puoi riattivare le email nelle Impostazioni.',
		turnOff: 'Disattiva le email di promemoria',
		invalidTitle: 'Questo link non funziona',
		invalidText:
			'Forse è stato tagliato durante la copia. Puoi disattivare le email di promemoria anche nelle Impostazioni.',
		openSettings: 'Apri le impostazioni',
		invalid: 'Questo link non funziona.',
		failed: 'Impossibile disattivare le email di promemoria. Riprova.'
	},

	email: {
		sentence: (name: string, age: number | null, days: number) => {
			if (age !== null) return `${name} compie ${age} anni ${emailWhen(days)}`;
			return days === 0
				? `Oggi è il compleanno di ${name}`
				: `Il compleanno di ${name} è ${emailWhen(days)}`;
		},
		birthdayToday: (name: string) => `Oggi è il compleanno di ${name}`,
		giftSubject: (name: string, days: number) =>
			`Il compleanno di ${name} è ${emailWhen(days)}: è ora di trovare un regalo`,
		birthdaysToday: (names: string) => `Compleanni di oggi: ${names}`,
		reminders: (names: string) => `Promemoria compleanni: ${names}`,
		nameList: (names: string[]) => {
			if (names.length <= 3) return `${names.slice(0, -1).join(', ')} e ${names.at(-1)}`;
			const more = names.length - 3;
			return `${names.slice(0, 3).join(', ')} e ${more === 1 ? "un'altra persona" : `altre ${more} persone`}`;
		},
		todayCount: (n: number) => `${birthdays(n)} oggi`,
		comingUpCount: (n: number) => `${birthdays(n)} in arrivo`,
		bothCount: (today: number, comingUp: number) =>
			`${birthdays(today)} oggi, ${comingUp} in arrivo`,
		introBoth: 'Fai gli auguri, e portati avanti con i regali.',
		introToday: 'Non dimenticare di fare gli auguri.',
		introComingUp: "C'è ancora tempo per trovare il regalo giusto.",
		ideasInside: "Dentro trovi idee regalo dall'IA.",
		andMore: (n: number) => (n === 1 ? 'E un altro compleanno.' : `E altri ${n} compleanni.`),
		today: 'Oggi',
		comingUp: 'In arrivo',
		addInterests: ['Aggiungi le sue passioni', " per ricevere idee regalo dall'IA."],
		into: 'Interessi',
		giftIdeasText: "Idee regalo dall'IA (generate dall'IA: verifica che siano adatte)",
		open: 'Apri Birthday Reminder',
		why: 'Ricevi questa email perché nel tuo account Birthday Reminder le email di promemoria sono attive.',
		changeWhen: 'Cambia quando arrivano',
		turnOff: 'Disattiva le email di promemoria'
	},

	authEmails: {
		codeLabel: 'Oppure inserisci questo codice nella pagina di accesso:',
		expiry: (hoursValid: number) =>
			`Il link e il codice si possono usare una sola volta e scadono tra ${hours(hoursValid)}.`,
		buttonFallback: 'Il pulsante non funziona? Incolla questo link nel browser:',
		magicLink: {
			subject: 'Accedi a Birthday Reminder',
			preheader: (code: string, hoursValid: number) =>
				`Il tuo codice di accesso è ${code}. Scade tra ${hours(hoursValid)}.`,
			heading: 'Accedi a Birthday Reminder',
			intro: (email: string) => `Fai clic sul pulsante per accedere come ${email}.`,
			action: 'Accedi',
			ignore:
				'Non hai provato ad accedere? Puoi ignorare questa email: nessuno può entrare nel tuo account senza il link o il codice.'
		},
		confirmation: {
			subject: 'Conferma la tua email per Birthday Reminder',
			preheader: (code: string) =>
				`Il tuo codice è ${code}. Conferma la tua email per completare la creazione dell'account.`,
			heading: 'Ti diamo il benvenuto in Birthday Reminder',
			intro: (email: string) =>
				`Conferma ${email} per completare la creazione del tuo account. Poi aggiungi le persone a cui tieni, e ti scriveremo prima dei loro compleanni.`,
			action: 'Conferma e accedi',
			ignore:
				"Non hai creato tu l'account? Puoi ignorare questa email: non succede nulla finché qualcuno non usa il link o il codice."
		}
	},

	ai: {
		unavailable: "L'IA non è disponibile al momento. Riprova più tardi."
	}
};
