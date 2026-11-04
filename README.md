# Birthday Reminder

Birthday reminders as a service. Users sign in (magic link or Google), add contacts with a birthday (or import them from a JSON file), mark the ones they buy gifts for with interest pills (nerd, fitness, …, or their own), and get emails:

- **on the day** for every contact
- **N days before** for contacts marked 🎁 gift, where N is a per-user setting, with AI gift ideas based on the pills

Contacts can also be imported from pasted text or a screenshot: AI finds the names and birthdays, and the user reviews them before saving.

The site and every email come in English and Italian.

Stack: SvelteKit 3 (Svelte 5) · Supabase (Auth, Postgres + RLS) · Resend · Vercel · OpenRouter (EU) for AI.

## Development

Everything runs in a container; you only need Docker and make.

```sh
cp .env.example .env   # fill in your Supabase dev project + secrets
make db-push           # apply supabase/migrations to the dev project
make dev               # http://localhost:5173, hot reload
```

| Target             | What it does                                             |
| ------------------ | -------------------------------------------------------- |
| `make dev`         | Build the dev image and start the server with hot reload |
| `make down`        | Stop the containers                                      |
| `make shell`       | Shell into the running dev container                     |
| `make install`     | `pnpm install`                                           |
| `make test`        | Unit tests (Vitest)                                      |
| `make check`       | Type-check (svelte-check)                                |
| `make lint`        | Prettier + ESLint (`make format` to fix formatting)      |
| `make build`       | Production build (needs the env vars set)                |
| `make db-push`     | Apply migrations to `SUPABASE_PROJECT_REF`               |
| `make db-types`    | Regenerate `src/lib/database.types.ts` from the database |
| `make auth-emails` | Upload the sign-in emails to `SUPABASE_PROJECT_REF`      |
| `make cron`        | Trigger the reminder job on the running dev server       |

Every email (sign-in, confirm signup, reminders) can be previewed with made-up data at `http://localhost:5173/dev/emails` (add `?locale=it` for Italian) while `make dev` runs; the route 404s in production. With `RESEND_API_KEY` empty, reminder emails are printed in the `make dev` output instead of sent. With `OPENROUTER_API_KEY` empty, the AI features say they're unavailable and everything else works. To try the job: add a contact whose birthday is today (and a gift contact whose birthday is _lead days_ from today), then `make cron`. Running it again sends nothing: each reminder is logged once in `reminder_log`.

`src/lib/database.types.ts` was written by hand to match the first migration; run `make db-types` once the dev project exists, and again after every schema change.

## Supabase setup

Create two projects, **dev** and **prod**, in the **Frankfurt (eu-central-1)** region (the privacy policy says data is stored in the EU, and Vercel functions run in `fra1` next to it), and for each:

1. **Schema:** set `SUPABASE_PROJECT_REF` / `SUPABASE_DB_PASSWORD` for that project and run `make db-push`.
2. **Keys** (Project Settings → API Keys): the publishable key → `SUPABASE_PUBLISHABLE_KEY`, a secret key → `SUPABASE_SECRET_KEY`. Legacy `anon` / `service_role` keys work too.
3. **URLs** (Authentication → URL Configuration): Site URL = the app URL (`http://localhost:5173` on dev). Add `<app url>/auth/callback**` to Redirect URLs.
4. **Google** (Authentication → Sign In / Providers → Google): create an OAuth client in Google Cloud Console (type "Web application") with the authorized redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`, then paste its client ID and secret.
5. **SMTP** (Authentication → Emails → SMTP Settings): use Resend (`smtp.resend.com`, port 465, user `resend`, password = a Resend API key, sender on your verified domain, sender name `Birthday Reminder` like `EMAIL_FROM`). Supabase's built-in mailer only allows a few emails per hour, too few for magic links.
6. **Email templates:** run `make auth-emails`. It uploads the **Magic Link** and **Confirm signup** emails from `src/lib/server/auth-emails.ts` (same layout as the reminder emails), and sets the code length and expiry they mention (6 digits, 1 hour). Their link goes to `/auth/confirm`, which works even when it's opened in another browser, and the code can be typed on the sign-in page, for when the email is read on another device. The `SUPABASE_ACCESS_TOKEN` needs the `auth_config_write` and `project_admin_write` permissions. Run it again whenever you change the templates or their text in `src/lib/messages/`; edits made in the dashboard are overwritten. Supabase has one template per project, so each one holds every language and picks one from `locale` in the user's metadata (see Languages).

7. **Hourly job** (prod, plus dev if you want it there): edit the two placeholders in `supabase/setup/cron.sql` and run it in the SQL editor. It uses `pg_cron` + `pg_net` to call `GET /api/cron/reminders` every hour with `CRON_SECRET`. (Vercel Hobby cron can only run daily; on Vercel Pro you could use a `vercel.json` cron instead.)

## OpenRouter setup

The AI features call OpenRouter's EU endpoint with Mistral Small 3.2 (`AI_MODEL` in `src/lib/server/ai.ts`).

1. Create an account and switch to the **Business** plan: EU routing needs it (8% fee on credit purchases, no minimum).
2. **Privacy settings:** enforce zero data retention for every model group, and don't allow providers that may train on inputs.
3. **Credits:** buy a few euros of credit and keep **auto top-up off**. When the balance runs out, requests fail, the app says AI is unavailable, and nothing is billed.
4. Create an API key → `OPENROUTER_API_KEY`.

To switch model, pick one that's listed both at `https://eu.openrouter.ai/api/v1/models` and at `https://eu.openrouter.ai/api/v1/endpoints/zdr` with `structured_outputs` (and image input, for contact import).

## Deploying to Vercel

Import the repo and set the variables from `.env.example` with prod values (`APP_URL` = the production URL; the `SUPABASE_PROJECT_REF` / `ACCESS_TOKEN` / `DB_PASSWORD` ones are only for the CLI and aren't needed). They must exist at build time too, because SvelteKit validates them (`src/env.ts`) while analysing the app.

## Legal and privacy

The privacy policy (`/privacy`) and terms (`/terms`) are written for GDPR and Italian law, and describe the setup above. The details they show live in `src/lib/legal.ts`. Before going live:

- `CONTROLLER_NAME` in `src/lib/legal.ts` is the name GDPR requires on the policy. It appears only on `/privacy`, which is `noindex` and disallowed in `robots.txt`; keep it off every other page.
- Make `privacy@birthdayreminder.eu` actually receive mail (Resend only sends), e.g. by forwarding it to your inbox with Cloudflare Email Routing or ImprovMX.
- Accept the data processing agreements: Supabase (organization settings in the dashboard), Vercel ([vercel.com/legal/dpa](https://vercel.com/legal/dpa)), Resend ([resend.com/legal/dpa](https://resend.com/legal/dpa)) and OpenRouter. Keep a copy of each.
- Google Cloud Console → Google Auth Platform → Branding: set the app home page, privacy policy (`<app url>/privacy`) and terms (`<app url>/terms`) links, and add the domain to authorized domains.
- Vercel's Hobby plan is for non-commercial use only. Move to Pro before earning money from the app (e.g. affiliate links in gift ideas).

Update the policy (and `LEGAL_LAST_UPDATED`), and email users about significant changes, whenever you:

- add a provider that sees user data, or change how the AI provider is set up: update "How we use AI" and "Who we share it with";
- collect a new kind of data, or use it for something new;
- add analytics or any non-essential cookie: that also needs a consent banner;
- add affiliate links: disclose them where they appear;
- send any marketing email: that needs separate opt-in consent.

### AI features

The policy (section 5, "How we use AI") and terms (section 5) describe the two AI features. Their promises are kept by the OpenRouter account (see OpenRouter setup above) and by the code. Keep these rules when changing it:

- **Every request** goes through `completeJson` in `src/lib/server/ai.ts`: EU endpoint, and `provider: { zdr: true, data_collection: 'deny' }` on each request, so a settings change can't silently break the promise. It never logs the messages or the answer, and drops OpenRouter's error metadata, which can quote the input.
- **Contact import** (`contact-extract.ts`, `/contacts/import`): the pasted text or image is sent once and never stored, logged or echoed back. The model returns names and birthdays only, the review step is labelled "Found by AI", and only what the user confirms is saved.
- **Gift ideas** (`gift-ideas.ts`): the AI gets only interests, gender and an age range (`GiftProfile`), plus the language to write in, never a name, email or ID. Ideas are cached for 90 days under a SHA-256 of that profile (language included), and labelled "AI gift ideas" on the contact page and in emails.
- **Limits:** `claim_ai_call` caps each user per day (`AI_DAILY_LIMITS`), and keeps only today's counts. When OpenRouter refuses (no credit, rate limit, timeout), the page says AI is unavailable and emails go out without ideas.

## Languages

English and Italian. All text lives in `src/lib/messages/en.ts` and `it.ts`; `it.ts` is typed against `en.ts`, so a missing translation fails `make check`. Components read `messages(page.data.locale)`, server code `messages(locals.locale)`. Pill labels are in `src/lib/pills.ts`, and the legal pages are whole files per language (`src/routes/privacy/en.svelte`, `it.svelte`, same for terms).

Which language a request gets (`src/lib/server/locale.ts`):

1. the `lang` cookie, set by the switcher in the footer and in Settings (it works without JavaScript too, through `POST /language`);
2. else, when signed in, the account's language, which is then saved in the cookie;
3. else Italian if Vercel's `x-vercel-ip-country` header says `IT`, otherwise English. Locally there's no header, so you get English until you switch.

Whenever a signed-in user's language differs from their profile's, the `(app)` layout saves it to `profiles.locale` (reminder emails and gift ideas use it) and to `locale` in their Supabase user metadata (the sign-in emails branch on it). New sign-ups get it in their metadata from the login form, so their first email is already in their language. Users with no language saved get English emails.

To add a language: add it to the `locale` enum (new migration) and `LOCALES`, then translate `messages/`, the pills, both legal pages and the gift ideas prompt; `make check` points at each place. Then run `make auth-emails`.

## How reminders work

- `/api/cron/reminders` runs hourly. A user is due once their local time (profile `timezone`, detected from the browser on first visit) has reached their `send_hour`. Using "at or after" means a missed run catches up later the same day.
- For each due user, every contact whose birthday is today gets a day-of reminder; gift contacts whose birthday is `gift_lead_days` away get an advance one. Feb 29 birthdays fall on Feb 28 in non-leap years.
- Reminders are claimed in `reminder_log` (unique per contact, kind, and birthday) **before** sending, so overlapping runs can't double-send. If sending fails, the claim is released and the next run retries.
- Advance reminders for gift contacts with pills get AI gift ideas: from the cache, else from the AI for at most 25 seconds per run, so a slow AI can't hold up emails that are already claimed. Those without ideas go out without them.
- Each user gets one digest email per run, in their language (`profiles.locale`), sent through Resend's batch API. Replies go to `CONTACT_EMAIL`.
- Every reminder links to `/unsubscribe` (also sent as a `List-Unsubscribe` header), signed with `CRON_SECRET`, so turning emails off needs no sign-in. Opening the link only asks, and the button turns them off, so link scanners can't do it by accident. There's no one-click `List-Unsubscribe-Post`: SvelteKit's CSRF check rejects form POSTs without an `Origin` header, and those requests don't send one.

## Layout

```
src/env.ts                       env var definitions (validated at startup)
src/hooks.server.ts              Supabase session from cookies, language, route guard
src/lib/i18n.ts                  languages, messages(), localized dates
src/lib/messages/                all text, one file per language
src/lib/server/locale.ts         which language a request gets
src/lib/dates.ts                 calendar/timezone helpers (shared)
src/lib/pills.ts                 pill labels and emoji (keep in sync with the `pill` enum)
src/lib/server/reminders.ts      which reminders are due (pure)
src/lib/server/reminder-job.ts   the hourly job: load, claim, send, release
src/lib/server/email-layout.ts   shared email shell: logo, card, button, dark mode
src/lib/server/email.ts          digest email template
src/lib/server/auth-emails.ts    Supabase sign-in emails (uploaded by `make auth-emails`)
src/lib/server/unsubscribe.ts    signed unsubscribe links for reminder emails
src/lib/server/ai.ts             OpenRouter client (EU, zero retention), daily AI limits
src/lib/server/gift-ideas.ts     AI gift ideas from pills, gender and age range, cached
src/lib/server/contact-extract.ts AI: pasted text or screenshot → prefilled contacts
src/lib/server/contact-import.ts JSON import file → prefilled contacts
src/lib/legal.ts                 controller name, contact email and date shown on the legal pages
src/routes/(app)/                signed-in pages: contacts, settings (incl. data export)
src/routes/privacy/, terms/      privacy policy and terms of service, one file per language
src/routes/language/             the language switcher without JavaScript
src/routes/auth/                 OAuth callback, magic-link confirm, logout
src/routes/unsubscribe/          turn off reminder emails from the link in them
src/routes/dev/emails/           previews of every email (dev only)
static/email/logo.png            logo for emails (they can't show SVG)
supabase/migrations/             schema, RLS, signup trigger, AI limits, gift ideas cache, language
supabase/setup/cron.sql          hourly schedule (run once per environment)
supabase/setup/auth-emails.ts    uploads the sign-in emails through the Management API
```
