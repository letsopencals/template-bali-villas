/** A journal post as a typed object (no MDX, no extra dependencies). */

export type JournalBlock =
	| { type: 'p'; text: string }
	| { type: 'h2'; text: string }
	| { type: 'quote'; text: string; cite?: string }
	| { type: 'list'; items: string[] }
	/** A short Indonesian word or phrase with its meaning, shown as an aside. */
	| { type: 'term'; term: string; meaning: string };

export interface JournalPost {
	slug: string;
	title: string;
	/** Italic second half of the title, rendered in `.italic-soft`. */
	titleItalic?: string;
	/** One or two sentences for cards and meta descriptions. */
	excerpt: string;
	/** ISO date (YYYY-MM-DD). */
	date: string;
	author: string;
	category: string;
	/** templateImage path, e.g. `journal/harvest`. */
	image: string;
	imageAlt: string;
	/** Villa slugs to show under the post. */
	relatedVillas: string[];
	body: JournalBlock[];
}
