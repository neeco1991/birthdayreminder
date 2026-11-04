// Details shown on the privacy policy, terms and footer.
// GDPR (art. 13) requires the policy to name the data controller: the person running the service.
import type { CalendarDate } from './dates.ts';

/**
 * Name of the person running Birthday Reminder: first name and surname identify the controller, which is all
 * art. 13 asks for. Shown only on /privacy, which is noindex and disallowed in robots.txt.
 */
export const CONTROLLER_NAME = 'Nicola Scionti';

/** Public address for privacy requests and questions. Must actually receive mail. */
export const CONTACT_EMAIL = 'privacy@birthdayreminder.eu';

/** Shown on both legal pages. Bump it (and tell users by email if the change matters) on every edit. */
export const LEGAL_LAST_UPDATED: CalendarDate = { year: 2026, month: 11, day: 4 };

/** Minimum age to sign up: 16 is the highest age of digital consent in the EU. */
export const MIN_AGE = 16;
