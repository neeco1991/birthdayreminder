<script lang="ts">
	import { resolve } from '$app/paths';
	import LegalPage from '#lib/components/LegalPage.svelte';
	import { CONTACT_EMAIL, MIN_AGE } from '#lib/legal.ts';
</script>

<LegalPage title="Termini di servizio">
	<p>
		Questi termini sono l'accordo tra te e la persona fisica residente in Italia che gestisce
		Birthday Reminder ("noi"), indicata nell'<a href={resolve('/privacy')}
			>Informativa sulla privacy</a
		>. Creando un account o usando Birthday Reminder, li accetti. Domande? Scrivi a
		<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.
	</p>

	<h2>1. Il servizio</h2>
	<p>
		Birthday Reminder ti invia promemoria via email dei compleanni che aggiungi. È gratuito. Nel
		tempo possiamo aggiungere, modificare o rimuovere funzioni.
	</p>

	<h2>2. Chi può usarlo</h2>
	<p>
		Devi avere almeno {MIN_AGE} anni e usare un indirizzo email che controlli. Birthday Reminder è per
		uso personale e non commerciale.
	</p>

	<h2>3. Il tuo account</h2>
	<p>
		Accedi con un link inviato alla tua email o con Google, quindi tieni al sicuro l'accesso al tuo
		account email. Sei responsabile di ciò che accade nel tuo account Birthday Reminder.
	</p>

	<h2>4. Le persone che aggiungi</h2>
	<ul>
		<li>Aggiungi solo persone che conosci personalmente, per ricordarne il compleanno.</li>
		<li>
			Non aggiungere informazioni sensibili su nessuno, come salute, religione, opinioni politiche,
			origine etnica o orientamento sessuale, nemmeno negli interessi che scrivi tu.
		</li>
		<li>
			Le informazioni che aggiungi restano tue. Ci consenti di conservarle e trattarle solo per
			fornire Birthday Reminder, come descritto nell'<a href={resolve('/privacy')}
				>Informativa sulla privacy</a
			>.
		</li>
	</ul>

	<h2>5. Funzioni di intelligenza artificiale (IA)</h2>
	<ul>
		<li>
			Le funzioni di IA sono facoltative e possono sbagliare. Controlla i contatti trovati dall'IA
			prima di salvarli: sei responsabile di ciò che salvi.
		</li>
		<li>
			Le idee regalo sono suggerimenti generati dall'IA, non raccomandazioni di cui ci facciamo
			garanti. Un prodotto suggerito potrebbe non esistere, non essere disponibile o non essere
			adatto alla persona: usa il tuo giudizio.
		</li>
		<li>
			Incolla solo testi o carica solo immagini che hai il diritto di condividere, e solo ciò che
			serve: escludi tutto ciò che non sono nomi e compleanni, come i messaggi privati.
		</li>
		<li>
			Le funzioni di IA hanno limiti d'uso, e possiamo sospenderle in qualsiasi momento, ad esempio
			se il nostro budget per l'IA si esaurisce. Puoi sempre aggiungere i contatti e scegliere i
			regali per conto tuo.
		</li>
	</ul>

	<h2>6. Uso consentito</h2>
	<p>Non:</p>
	<ul>
		<li>
			usare Birthday Reminder per inviare spam o per scopi di marketing o altri scopi commerciali;
		</li>
		<li>
			usare le funzioni di IA per scopi diversi dall'aggiunta di contatti e dalle idee regalo, o
			cercare di aggirarne i limiti;
		</li>
		<li>
			tentare di accedere ad account o dati altrui, o sondare o compromettere il funzionamento del
			servizio;
		</li>
		<li>creare account in modo automatico o in massa, o estrarre dati dal sito (scraping).</li>
	</ul>

	<h2>7. Nessuna garanzia</h2>
	<p>
		Birthday Reminder è un servizio gratuito fornito così com'è. Facciamo del nostro meglio, ma i
		promemoria possono arrivare in ritardo, finire nello spam o non arrivare affatto, i risultati
		dell'IA possono essere sbagliati e il servizio può essere a volte non disponibile. Non usarlo
		come unico promemoria per qualcosa di importante.
	</p>

	<h2>8. Responsabilità</h2>
	<p>
		Nei limiti consentiti dalla legge, non siamo responsabili per danni causati da un promemoria
		mancato, in ritardo o errato, da risultati errati dell'IA o dall'indisponibilità del servizio.
		Nulla in questi termini limita la nostra responsabilità per dolo o colpa grave, o qualsiasi
		responsabilità che la legge non consente di limitare, e nulla pregiudica i tuoi diritti di
		consumatore.
	</p>

	<h2>9. Smettere di usare il servizio</h2>
	<ul>
		<li>
			Puoi smettere in qualsiasi momento eliminando il tuo account nelle
			<a href={resolve('/(app)/settings')}>Impostazioni</a>, il che cancella tutti i tuoi dati.
		</li>
		<li>
			Possiamo sospendere o chiudere un account che viola questi termini in modo grave o ripetuto.
			Quando possibile, ti avviseremo prima.
		</li>
		<li>
			Se chiudiamo Birthday Reminder, te lo comunicheremo via email con almeno 30 giorni di
			anticipo, così potrai scaricare i tuoi dati.
		</li>
	</ul>

	<h2>10. Modifiche a questi termini</h2>
	<p>
		Se apportiamo modifiche significative, ti scriveremo almeno 30 giorni prima che entrino in
		vigore. Se non sei d'accordo, puoi eliminare il tuo account entro quella data. Continuare a
		usare Birthday Reminder dopo quella data significa accettare i nuovi termini.
	</p>

	<h2>11. Legge applicabile</h2>
	<p>
		Questi termini sono regolati dalla legge italiana. Se sei un consumatore, mantieni la tutela
		delle norme inderogabili del paese in cui vivi, e puoi rivolgerti ai giudici del luogo in cui
		vivi per qualsiasi controversia.
	</p>
</LegalPage>
