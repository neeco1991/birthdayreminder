import { Constants, type Enums } from './database.types.ts';
import type { Locale } from './i18n.ts';

export type Pill = Enums<'pill'>;

export const PILL_SLUGS = Constants.public.Enums.pill;

// Typed as a Record so adding a value to the `pill` enum fails type-checking until it gets a label here.
export const PILLS: Record<Pill, { label: string; emoji: string }> = {
	nerd: { label: 'Nerd', emoji: '🤓' },
	gamer: { label: 'Gamer', emoji: '🎮' },
	tech: { label: 'Tech', emoji: '💻' },
	bookworm: { label: 'Bookworm', emoji: '📚' },
	fitness: { label: 'Fitness', emoji: '💪' },
	sports: { label: 'Sports', emoji: '⚽' },
	outdoors: { label: 'Outdoors', emoji: '🏕️' },
	traveler: { label: 'Traveler', emoji: '✈️' },
	foodie: { label: 'Foodie', emoji: '🍜' },
	coffee: { label: 'Coffee', emoji: '☕' },
	wine: { label: 'Wine', emoji: '🍷' },
	music: { label: 'Music', emoji: '🎵' },
	movies: { label: 'Movies', emoji: '🎬' },
	art: { label: 'Art', emoji: '🎨' },
	fashion: { label: 'Fashion', emoji: '👗' },
	beauty: { label: 'Beauty', emoji: '💄' },
	pets: { label: 'Pets', emoji: '🐾' },
	gardening: { label: 'Gardening', emoji: '🌱' },
	diy: { label: 'DIY', emoji: '🔧' },
	wellness: { label: 'Wellness', emoji: '🧘' }
};

// The labels above are English, and are also what the AI gets for gift ideas. These are the other languages'.
const TRANSLATED_LABELS: Record<Exclude<Locale, 'en'>, Record<Pill, string>> = {
	it: {
		nerd: 'Nerd',
		gamer: 'Videogiochi',
		tech: 'Tecnologia',
		bookworm: 'Libri',
		fitness: 'Fitness',
		sports: 'Sport',
		outdoors: 'Natura',
		traveler: 'Viaggi',
		foodie: 'Buona tavola',
		coffee: 'Caffè',
		wine: 'Vino',
		music: 'Musica',
		movies: 'Cinema',
		art: 'Arte',
		fashion: 'Moda',
		beauty: 'Bellezza',
		pets: 'Animali',
		gardening: 'Giardinaggio',
		diy: 'Fai da te',
		wellness: 'Benessere'
	}
};

/** The label alone, e.g. "Coffee". */
export function pillName(pill: Pill, locale: Locale = 'en'): string {
	return locale === 'en' ? PILLS[pill].label : TRANSLATED_LABELS[locale][pill];
}

/** Emoji and label, e.g. "☕ Coffee". */
export function pillLabel(pill: Pill, locale: Locale = 'en'): string {
	return `${PILLS[pill].emoji} ${pillName(pill, locale)}`;
}

// Free-text pills a user adds themselves; the database enforces the same limits.
export const MAX_CUSTOM_PILLS = 10;
export const MAX_CUSTOM_PILL_LENGTH = 30;

/** Tidies whitespace and drops empty custom pills and repeats (ignoring case), keeping the first. */
export function normalizeCustomPills(pills: string[]): string[] {
	const seen = new Set<string>();
	return pills
		.map((pill) => pill.trim().replace(/\s+/g, ' '))
		.filter((pill) => {
			const key = pill.toLowerCase();
			if (!pill || seen.has(key)) return false;
			seen.add(key);
			return true;
		});
}
