import type { VillaContent, VillaRoom } from '@/lib/villa-content';
import { villaImageNames } from '@/lib/villa-content';

/**
 * Image lookup by file name. The store's product gallery holds URLs like
 * `https://media.opencals.com/products/seeding-datasets/bali-villa-rental/joglo-jati-pool.jpg?v=2`;
 * `lib/villa-content.ts` refers to images by name (`joglo-jati-pool`). These
 * helpers match the two, ignoring the query string, hash and extension case.
 * Missing images resolve to null and are skipped by the list helpers.
 */

const EXT_RE = /\.(jpe?g|png|webp|avif)$/i;

/** The file name (no extension) at the end of a URL path, lower-cased. */
export function imageNameOf(url: string): string | null {
	const path = url.split(/[?#]/)[0] ?? '';
	const last = path.split('/').pop() ?? '';
	if (!EXT_RE.test(last)) return null;
	try {
		return decodeURIComponent(last.replace(EXT_RE, '')).toLowerCase();
	} catch {
		return last.replace(EXT_RE, '').toLowerCase();
	}
}

/** The gallery URL whose file is `<name>.jpg` (or .jpeg/.png/.webp/.avif), or null. */
export function resolveImage(gallery: readonly string[], name: string): string | null {
	const want = name.toLowerCase();
	return gallery.find((url) => imageNameOf(url) === want) ?? null;
}

/** Resolve many names, dropping the missing ones (order kept, deduped). */
export function resolveImages(gallery: readonly string[], names: readonly string[]): string[] {
	const out: string[] = [];
	for (const name of names) {
		const url = resolveImage(gallery, name);
		if (url && !out.includes(url)) out.push(url);
	}
	return out;
}

/** A room's images (lead image first). Empty when none are in the gallery. */
export function roomImages(gallery: readonly string[], room: Pick<VillaRoom, 'images'>): string[] {
	return resolveImages(gallery, room.images);
}

/** The room's lead image, or null. */
export function roomImage(gallery: readonly string[], room: Pick<VillaRoom, 'images'>): string | null {
	return roomImages(gallery, room)[0] ?? null;
}

/**
 * The villa's default image: the day exterior `<slug>`, else `fallback` (the
 * product's own default image from the API), else the first gallery image.
 */
export function defaultVillaImage(gallery: readonly string[], slug: string, fallback?: string | null): string | null {
	return resolveImage(gallery, slug) ?? fallback ?? gallery[0] ?? null;
}

/**
 * Images for the Day/Dusk toggle. `day` is the content's `dayImage` (falling
 * back to the default image); `dusk` lists the resolved dusk shots. `pairs`
 * zips day framing with dusk framing where both exist.
 */
export function dayDuskImages(
	gallery: readonly string[],
	content: Pick<VillaContent, 'slug' | 'dayImage' | 'duskImages'>,
): { day: string | null; dusk: string[]; hasDusk: boolean } {
	const day = resolveImage(gallery, content.dayImage) ?? resolveImage(gallery, content.slug);
	const dusk = resolveImages(gallery, content.duskImages);
	return { day, dusk, hasDusk: dusk.length > 0 };
}

/**
 * The full gallery in editorial order: the names from `villaImageNames`
 * (default, rooms, dusk) first, then anything else the merchant uploaded.
 */
export function orderedGallery(gallery: readonly string[], content: VillaContent | null): string[] {
	if (!content) return [...gallery];
	const known = resolveImages(gallery, villaImageNames(content));
	return [...known, ...gallery.filter((u) => !known.includes(u))];
}

/** Template (non-product) images in /public/images, by manifest path. */
export const templateImage = (path: string): string => `/images/${path.replace(/^\/+/, '').replace(EXT_RE, '')}.jpg`;
