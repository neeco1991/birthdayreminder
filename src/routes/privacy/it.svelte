<script lang="ts">
	import { resolve } from '$app/paths';
	import LegalPage from '#lib/components/LegalPage.svelte';
	import { CONTACT_EMAIL, CONTROLLER_NAME, MIN_AGE } from '#lib/legal.ts';
</script>

<LegalPage title="Informativa sulla privacy">
	<p>
		Questa informativa spiega quali dati personali raccoglie Birthday Reminder, perché, con chi li
		condivide e quali diritti hai secondo il Regolamento generale sulla protezione dei dati dell'UE
		(GDPR) e la normativa italiana sulla protezione dei dati. Riguarda sia te, come utente, sia le
		persone che aggiungi come contatti.
	</p>

	<h2>1. Chi è responsabile dei tuoi dati</h2>
	<p>
		Birthday Reminder è gestito da <strong>{CONTROLLER_NAME}</strong>, persona fisica residente in
		Italia, che è il titolare del trattamento. Per qualsiasi questione sui tuoi dati, scrivi a
		<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.
	</p>

	<h2>2. Quali dati raccogliamo</h2>
	<h3>Il tuo account</h3>
	<ul>
		<li>
			<strong>Indirizzo email</strong>, per farti accedere e inviarti i promemoria. Se accedi con
			Google, Google condivide anche il tuo nome e la tua immagine del profilo; il nostro fornitore
			di autenticazione li conserva con il tuo account, ma Birthday Reminder non li usa.
		</li>
		<li>
			<strong>Impostazioni</strong>: il tuo fuso orario (rilevato dal browser alla prima visita),
			l'ora in cui ricevi i promemoria, con quanti giorni di anticipo arrivano i promemoria regalo,
			se le email di promemoria sono attive, e la lingua in cui usi il sito (italiano o inglese),
			così i promemoria ti arrivano in quella lingua.
		</li>
	</ul>
	<h3>Le persone che aggiungi</h3>
	<ul>
		<li>Nome e compleanno (giorno e mese; l'anno è facoltativo).</li>
		<li>Se farai loro un regalo.</li>
		<li>
			Per i contatti regalo, facoltativamente genere e interessi, scelti da un elenco o scritti con
			parole tue.
		</li>
	</ul>
	<p>
		Se importi i contatti da un file, lo leggiamo solo per compilare il modulo che poi controlli. Il
		file in sé non viene conservato.
	</p>
	<h3>Testi e immagini che dai all'importazione con l'IA</h3>
	<p>
		Se aggiungi contatti incollando un testo o caricando uno screenshot, il contenuto viene inviato
		a un modello di intelligenza artificiale (IA) per individuare nomi e compleanni. Né noi né il
		fornitore di IA lo conserviamo: vengono salvati solo i contatti che controlli e confermi. Vedi
		la sezione 5.
	</p>
	<h3>Uso dell'IA</h3>
	<p>
		Quante volte hai usato oggi ciascuna funzione di IA, per applicare i limiti giornalieri. I
		conteggi dei giorni precedenti vengono cancellati automaticamente.
	</p>
	<h3>Storico dei promemoria</h3>
	<p>
		Un registro di quale promemoria è stato inviato per quale contatto e compleanno, così nessuno
		viene inviato due volte.
	</p>
	<h3>Dati tecnici</h3>
	<p>
		I nostri fornitori di hosting registrano automaticamente le richieste al sito, inclusi indirizzo
		IP e dati del browser, per sicurezza e per risolvere i problemi.
	</p>
	<p>
		Finché non scegli una lingua, mostriamo il sito in italiano se ti colleghi dall'Italia e in
		inglese altrimenti. Il nostro fornitore di hosting ricava il paese dal tuo indirizzo IP; lo
		usiamo solo per questo e non lo conserviamo.
	</p>
	<p>
		Non usiamo strumenti di analisi o tracciamento pubblicitario, non raccogliamo dati di pagamento
		e non acquistiamo dati su di te da nessuno.
	</p>
	<p>
		Serve solo il tuo indirizzo email: senza, non possiamo creare il tuo account, farti accedere o
		inviarti i promemoria. Tutto il resto dipende da te: le impostazioni partono da valori
		predefiniti che puoi cambiare, e sei tu a decidere quali contatti e dettagli aggiungere.
	</p>

	<h2>3. Perché li usiamo e su quale base giuridica</h2>
	<ul>
		<li>
			<strong>Per gestire il tuo account e inviarti i promemoria che hai impostato</strong>: è
			necessario per fornirti il servizio per cui hai creato l'account (art. 6, par. 1, lett. b)
			GDPR).
		</li>
		<li>
			<strong
				>Per individuare contatti in testi o immagini che fornisci, e per suggerire idee regalo,
				usando l'IA</strong
			>: funzioni del servizio che scegli di usare (art. 6, par. 1, lett. b) GDPR). Per le persone
			che aggiungi, vedi la sezione 4.
		</li>
		<li>
			<strong>Per mantenere il servizio sicuro, prevenire abusi e risolvere problemi</strong>: il
			nostro legittimo interesse a gestire un servizio sicuro e funzionante (art. 6, par. 1, lett.
			f) GDPR).
		</li>
		<li>
			<strong>Per adempiere a obblighi di legge</strong>, ad esempio quando un'autorità pubblica fa
			una richiesta legittima (art. 6, par. 1, lett. c) GDPR).
		</li>
	</ul>
	<p>
		Le uniche email che inviamo sono i promemoria che hai impostato e i link di accesso. Non inviamo
		email di marketing.
	</p>

	<h2>4. Se qualcuno ti ha aggiunto come contatto</h2>
	<p>
		Gli utenti aggiungono nomi e compleanni di persone che conoscono per non dimenticarli. Trattiamo
		questi dati sulla base del legittimo interesse (art. 6, par. 1, lett. f) GDPR): quello
		dell'utente, e il nostro nel fornire il servizio, a ricordare i compleanni. L'impatto su di te è
		minimo. I tuoi dati sono visibili solo a chi ti ha aggiunto, non li usiamo mai per contattarti e
		non li condividiamo né li vendiamo.
	</p>
	<p>
		Non abbiamo i recapiti delle persone che gli utenti aggiungono, quindi non possiamo informarle
		una per una (art. 14, par. 5, lett. b) GDPR). Questa sezione serve a informarti.
	</p>
	<p>
		Se pensi che qualcuno ti abbia aggiunto e vuoi che i tuoi dati siano cancellati, o ti opponi a
		questo trattamento, scrivi a <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a> indicando il tuo
		nome e il tuo compleanno. Cercheremo le voci corrispondenti e le cancelleremo.
	</p>
	<p>
		Se un utente ti aggiunge da un testo o uno screenshot, quel contenuto passa una volta da un
		modello di IA, senza essere conservato. Se ti segna come persona a cui fa regali, i tuoi
		interessi possono essere usati per le idee regalo, ma il tuo nome non viene mai inviato all'IA
		(vedi la sezione 5).
	</p>

	<h2>5. Come usiamo l'IA</h2>
	<p>
		Birthday Reminder ha due funzioni di IA facoltative. Puoi sempre aggiungere i contatti e
		scegliere i regali per conto tuo.
	</p>
	<ul>
		<li>
			<strong>Aggiungere contatti da testi o immagini.</strong> Il testo o lo screenshot che fornisci
			viene inviato a un modello di IA, che individua nomi e compleanni. Controlli il risultato prima
			che venga salvato qualcosa, e il testo o l'immagine originale vengono scartati.
		</li>
		<li>
			<strong>Idee regalo.</strong> Per i contatti regalo, inviamo all'IA solo i loro interessi, il genere
			e la fascia d'età, e la lingua in cui scrivere le idee: mai il loro nome, il tuo nome o il tuo indirizzo
			email. I suggerimenti sono indicati come generati dall'IA. Li conserviamo fino a 90 giorni sotto
			un'impronta di quella combinazione, senza nomi né account associati, così chiunque abbia la stessa
			combinazione li riceve senza un'altra richiesta all'IA.
		</li>
	</ul>
	<p>
		Le richieste all'IA passano da <strong>OpenRouter</strong>, con il suo instradamento UE: vengono
		elaborate solo da fornitori di IA situati in Europa (UE/SEE, Regno Unito o Svizzera), e solo da
		fornitori che non conservano richieste e risposte. L'unica eccezione sono i contenuti che un
		fornitore deve conservare perché segnalati come illeciti. Nulla di ciò che invii viene usato per
		addestrare modelli di IA.
	</p>
	<p>
		L'IA non prende decisioni su di te o sui tuoi contatti: ciò che produce è un suggerimento che
		puoi accettare, modificare o ignorare.
	</p>

	<h2>6. Con chi li condividiamo</h2>
	<p>
		Non vendiamo i tuoi dati e non li condividiamo con inserzionisti. Ci avvaliamo solo di questi
		fornitori, ciascuno vincolato da un accordo sul trattamento dei dati a usarli esclusivamente per
		nostro conto, come responsabile del trattamento:
	</p>
	<ul>
		<li>
			<strong>Supabase</strong> (database e accesso). Il database si trova nell'UE (Irlanda).
		</li>
		<li>
			<strong>Resend</strong> (invio delle email). Resend tratta il tuo indirizzo email e il contenuto
			dei promemoria, che comprende nomi, compleanni e interessi dei tuoi contatti.
		</li>
		<li>
			<strong>OpenRouter</strong> (funzioni di IA). Instrada le richieste all'IA verso fornitori in Europa
			che non le conservano, come descritto nella sezione 5.
		</li>
		<li>
			<strong>Namecheap</strong> (inoltro delle email del nostro dominio). Le email che scrivi a
			<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>, comprese le risposte alle email di
			promemoria, passano da Namecheap prima di arrivare alla casella in cui le leggiamo.
		</li>
	</ul>
	<p>
		<strong>Vercel</strong> ospita il sito, e il codice del server viene eseguito nell'UE (Irlanda).
		Ogni richiesta al sito passa da Vercel, che quindi tratta ciò che invii e vedi sul sito. Con il
		piano gratuito che usiamo, Vercel non offre un accordo sul trattamento dei dati: tratta questi
		dati secondo la propria
		<a href="https://vercel.com/legal/privacy-policy" rel="noopener noreferrer"
			>informativa sulla privacy</a
		>.
	</p>
	<p>
		Se scegli "Continua con Google", è Google a farti accedere e agisce come titolare autonomo per
		il tuo account Google, secondo
		<a href="https://policies.google.com/privacy?hl=it" rel="noopener noreferrer"
			>l'informativa sulla privacy di Google</a
		>.
	</p>
	<p>
		La casella in cui leggiamo le tue email è un account Gmail, quindi anche Google le tratta,
		secondo la stessa informativa.
	</p>
	<p>Possiamo inoltre comunicare dati quando la legge lo richiede.</p>

	<h2>7. Trasferimenti fuori dall'UE</h2>
	<p>
		Supabase, Vercel, Resend, OpenRouter, Namecheap e Google sono società statunitensi, quindi i
		dati possono essere consultati da fuori dello Spazio economico europeo anche quando sono
		conservati o elaborati nell'UE, ad esempio dai loro team di assistenza. Per le funzioni di IA,
		il contenuto delle richieste viene elaborato in Europa, mentre OpenRouter può trattare negli
		Stati Uniti dati tecnici sulle richieste (non il loro contenuto). Questi trasferimenti si basano
		sulle clausole contrattuali standard della Commissione europea incluse nell'accordo sul
		trattamento dei dati di ciascun fornitore, o sull'EU-US Data Privacy Framework per i fornitori
		certificati. Puoi chiederci maggiori dettagli.
	</p>

	<h2>8. Per quanto tempo li conserviamo</h2>
	<ul>
		<li>
			<strong>Testi, immagini e dati inviati all'IA</strong>: non vengono conservati. Sono elaborati
			solo per il tempo necessario a produrre la risposta.
		</li>
		<li><strong>Conteggi d'uso dell'IA</strong>: fino alla fine della giornata.</li>
		<li>
			<strong>Account, impostazioni, contatti e storico dei promemoria</strong>: finché non li
			cancelli. Eliminare un contatto ne elimina anche lo storico dei promemoria. Eliminare il tuo
			account (nelle Impostazioni) cancella subito tutto.
		</li>
		<li>
			<strong>Backup</strong>: i dati cancellati possono restare nei backup dei nostri fornitori per
			un periodo limitato, finché non vengono sovrascritti.
		</li>
		<li>
			<strong>Log tecnici e log di consegna delle email</strong>: conservati dai nostri fornitori
			per i periodi limitati che stabiliscono.
		</li>
	</ul>

	<h2>9. I tuoi diritti</h2>
	<p>Hai il diritto di:</p>
	<ul>
		<li>
			<strong>accedere</strong> ai tuoi dati e <strong>portarli con te</strong> (portabilità): usa
			"Scarica i miei dati" nelle <a href={resolve('/(app)/settings')}>Impostazioni</a> per averne una
			copia in formato JSON;
		</li>
		<li><strong>rettificarli</strong>: puoi modificare tutto nell'app;</li>
		<li>
			<strong>cancellarli</strong>: puoi eliminare i contatti, o l'intero account, in qualsiasi
			momento;
		</li>
		<li>
			chiedere la <strong>limitazione</strong> del trattamento od <strong>opporti</strong> al trattamento
			basato sul legittimo interesse;
		</li>
		<li>
			<strong>proporre reclamo</strong> all'autorità italiana per la protezione dei dati, il
			<a href="https://www.garanteprivacy.it" rel="noopener noreferrer"
				>Garante per la protezione dei dati personali</a
			>, o all'autorità del paese dell'UE in cui vivi.
		</li>
	</ul>
	<p>
		Per tutto ciò che non puoi fare nell'app, scrivi a <a href="mailto:{CONTACT_EMAIL}"
			>{CONTACT_EMAIL}</a
		>. Rispondiamo entro un mese.
	</p>

	<h2>10. Cookie</h2>
	<p>
		Birthday Reminder usa solo cookie strettamente necessari: i cookie di accesso, che mantengono
		attiva la tua sessione. Vengono impostati quando accedi e rimossi quando esci o quando scadono.
		Se scegli un tema chiaro o scuro invece di seguire il dispositivo, un cookie ricorda la scelta
		per un anno; non contiene nient'altro. Allo stesso modo, quando scegli una lingua o accedi, un
		cookie ricorda la tua lingua per un anno. Su questo sito non ci sono cookie di analisi,
		pubblicitari o di terze parti, ed è per questo che non c'è un banner dei cookie. Se accedi con
		Google, Google imposta i propri cookie sul proprio sito.
	</p>

	<h2>11. Sicurezza</h2>
	<p>
		Tutto il traffico è cifrato (HTTPS). Il database consente a ciascun account di accedere solo ai
		propri dati, e le chiavi segrete non lasciano mai il server. Nessun sistema è perfettamente
		sicuro. Se è probabile che una violazione dei dati metta a rischio i tuoi diritti, informeremo
		te e il Garante come previsto dalla legge.
	</p>

	<h2>12. Minori</h2>
	<p>
		Birthday Reminder non è destinato a chi ha meno di {MIN_AGE} anni. Se pensi che una persona più giovane
		abbia creato un account, scrivici e lo elimineremo.
	</p>

	<h2>13. Decisioni automatizzate</h2>
	<p>
		L'IA suggerisce idee regalo in base agli interessi indicati per un contatto, e individua
		contatti in testi o immagini che fornisci. Sono solo suggerimenti che puoi accettare o ignorare.
		Non prendiamo decisioni basate unicamente su un trattamento automatizzato che producano effetti
		giuridici o effetti analogamente significativi su qualcuno (art. 22 GDPR), e non creiamo profili
		su di te per nessun altro scopo.
	</p>

	<h2>14. Modifiche a questa informativa</h2>
	<p>
		Quando modifichiamo questa informativa, aggiorniamo la data in alto. Se una modifica è
		significativa, ti scriveremo prima che entri in vigore.
	</p>
</LegalPage>
