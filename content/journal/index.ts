import { harvest } from './harvest';
import { joglo } from './joglo';
import { offerings } from './offerings';
import type { JournalBlock, JournalPost } from './types';

export type { JournalBlock, JournalPost } from './types';

/** Every post, newest first. */
export const journalPosts: JournalPost[] = [offerings, harvest, joglo].sort((a, b) => b.date.localeCompare(a.date));

export function getJournalPost(slug: string): JournalPost | null {
	return journalPosts.find((p) => p.slug === slug) ?? null;
}

function blockText(b: JournalBlock): string {
	switch (b.type) {
		case 'list':
			return b.items.join(' ');
		case 'term':
			return `${b.term} ${b.meaning}`;
		default:
			return b.text;
	}
}

export function wordCount(post: JournalPost): number {
	return post.body.map(blockText).join(' ').split(/\s+/).filter(Boolean).length;
}

/** Minutes to read at about 220 words a minute, at least 1. */
export function readingMinutes(post: JournalPost): number {
	return Math.max(1, Math.round(wordCount(post) / 220));
}

/** The other posts, for "keep reading". */
export function otherPosts(slug: string, count = 2): JournalPost[] {
	return journalPosts.filter((p) => p.slug !== slug).slice(0, count);
}

/** "18 September 2026" (the date is a calendar date, so format it in UTC). */
export function formatPostDate(iso: string): string {
	return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
