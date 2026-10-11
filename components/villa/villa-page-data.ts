import type { Villa } from '@/lib/server-data';
import type { RoomKind, VillaContent } from '@/lib/villa-content';
import type { StayTimes } from '@/lib/stay';
import { dayDuskImages, imageNameOf, resolveImage, roomImage, roomImages } from '@/lib/villa-images';

/**
 * Pure builders for the villa page. The server page runs them once and hands
 * the small results to client components (gallery, tour, booking), so the raw
 * product never crosses into client props. No 'use client', no server imports.
 */

/** What the booking card, mobile bar and cancellation timeline need. */
export interface BookingVilla {
	slug: string;
	title: string;
	price: number;
	currency: string;
	image: string | null;
	minNights: number;
	maxNights: number;
	stayTimes: StayTimes;
	/** Seconds before check-in (product.cancelGap). */
	cancelGap: number;
	allowCustomerCancel: boolean;
	locationId: string | null;
	maxGuests: number;
	maxAdults: number;
}

export interface TourRoom {
	key: string;
	kind: RoomKind;
	name: string;
	bedSetup?: string;
	features: [string, string, string];
	/** Lead image, falling back to the exterior so no frame renders empty. */
	image: string | null;
	/** True when `image` is the exterior stand-in (the room photo isn't uploaded yet). */
	fallback: boolean;
}

export interface MosaicTile {
	day: string | null;
	/** Same framing at dusk, when the store has it. */
	dusk: string | null;
	alt: string;
	/** Index into the lightbox items. */
	index: number;
}

export interface LightboxItem {
	url: string;
	group: string;
	caption: string;
}

export interface LightboxGroup {
	id: string;
	label: string;
	start: number;
	count: number;
}

/** Editorial content, or a thin stand-in built from the product for villas without an entry. */
export function contentFor(villa: Villa): VillaContent {
	if (villa.content) return villa.content;
	const plain = villa.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
	return {
		slug: villa.slug,
		type: 'Private villa',
		tagline: plain.slice(0, 140),
		story: [plain, ''],
		pullQuote: '',
		collections: [],
		sizeM2: 0,
		maxGuests: 2,
		maxAdults: 2,
		bedrooms: 1,
		beds: '',
		bathrooms: 1,
		pool: 'none',
		view: '',
		minNights: villa.minNights,
		rooms: [],
		amenities: [],
		houseRules: [],
		sitePlan: { x: 50, y: 50, terrace: 0 },
		dayImage: villa.slug,
		duskImages: [],
		video: '',
		houseManual: { wifi: '', tips: [] },
		floorPlan: [],
	};
}

export function toBookingVilla(villa: Villa, content: VillaContent): BookingVilla {
	return {
		slug: villa.slug,
		title: villa.title,
		price: villa.price,
		currency: villa.currency,
		image: villa.image,
		minNights: villa.minNights,
		maxNights: villa.maxNights,
		stayTimes: villa.stayTimes,
		cancelGap: villa.cancelGap,
		allowCustomerCancel: villa.allowCustomerCancel,
		locationId: villa.locationId,
		maxGuests: content.maxGuests,
		maxAdults: content.maxAdults,
	};
}

export function buildTourRooms(villa: Villa, content: VillaContent): TourRoom[] {
	return content.rooms.map((r) => {
		const own = roomImage(villa.gallery, r);
		return { key: r.key, kind: r.kind, name: r.name, bedSetup: r.bedSetup, features: r.features, image: own ?? villa.image, fallback: !own };
	});
}

/** Lightbox items grouped by room: outside, each room, dusk, then anything else. */
export function buildLightbox(villa: Villa, content: VillaContent): { items: LightboxItem[]; groups: LightboxGroup[] } {
	const items: LightboxItem[] = [];
	const groups: LightboxGroup[] = [];
	const used = new Set<string>();
	const push = (id: string, label: string, urls: Array<string | null>, caption: (i: number) => string) => {
		const fresh = urls.filter((u): u is string => !!u && !used.has(u));
		if (fresh.length === 0) return;
		groups.push({ id, label, start: items.length, count: fresh.length });
		fresh.forEach((url, i) => {
			used.add(url);
			items.push({ url, group: id, caption: caption(i) });
		});
	};

	const exterior = dayDuskImages(villa.gallery, content).day ?? villa.image;
	const approach = content.rooms.filter((r) => r.kind === 'approach');
	push('outside', 'Outside', [exterior, ...approach.flatMap((r) => roomImages(villa.gallery, r))], (i) => (i === 0 ? `${villa.title} by day` : (approach[i - 1]?.name ?? 'Outside')));
	for (const r of content.rooms) {
		if (r.kind === 'approach') continue;
		push(r.key, r.name, roomImages(villa.gallery, r), () => r.name);
	}
	push('dusk', 'At dusk', dayDuskImages(villa.gallery, content).dusk, () => `${villa.title} at dusk`);
	push('more', 'More', villa.gallery, () => villa.title);
	return { items, groups };
}

const KIND_RANK: Record<RoomKind, number> = { pool: 0, living: 1, bedroom: 2, view: 3, terrace: 4, bathroom: 5, kitchen: 6, approach: 7, detail: 8 };

/** The dusk twin of an image: `<name>-dusk` in the gallery, or null. */
function duskTwin(gallery: readonly string[], url: string | null): string | null {
	const name = url ? imageNameOf(url) : null;
	return name ? resolveImage(gallery, `${name}-dusk`) : null;
}

/** One big exterior plus four room tiles, each with its dusk twin when there is one. */
export function buildMosaic(villa: Villa, content: VillaContent, items: readonly LightboxItem[]): { tiles: MosaicTile[]; hasDusk: boolean } {
	const indexOf = (url: string | null) => Math.max(0, url ? items.findIndex((i) => i.url === url) : 0);
	const { day, dusk } = dayDuskImages(villa.gallery, content);
	const exterior = day ?? villa.image;
	const big: MosaicTile = { day: exterior, dusk: duskTwin(villa.gallery, exterior) ?? dusk[0] ?? null, alt: `${villa.title}, ${content.type.toLowerCase()}`, index: indexOf(exterior) };

	const rooms = content.rooms
		.map((r) => ({ r, url: roomImage(villa.gallery, r) }))
		.filter((x): x is { r: (typeof content.rooms)[number]; url: string } => !!x.url && x.url !== exterior)
		.map((x) => ({ ...x, twin: duskTwin(villa.gallery, x.url) }))
		.sort((a, b) => Number(!!b.twin) - Number(!!a.twin) || KIND_RANK[a.r.kind] - KIND_RANK[b.r.kind])
		.slice(0, 4);
	const small: MosaicTile[] = rooms.map((x) => ({ day: x.url, dusk: x.twin, alt: `${villa.title}: ${x.r.name}`, index: indexOf(x.url) }));

	// Top up from the rest of the gallery (merchant uploads) if rooms are missing.
	for (const url of villa.gallery) {
		if (small.length >= 4) break;
		if (url === exterior || small.some((t) => t.day === url) || dusk.includes(url)) continue;
		small.push({ day: url, dusk: null, alt: villa.title, index: indexOf(url) });
	}
	return { tiles: [big, ...small], hasDusk: dusk.length > 0 };
}
