import type { Villa } from '@/lib/server-data';
import type { VillaCollection, VillaContent } from '@/lib/villa-content';
import type { StayTimes } from '@/lib/stay';
import { siteConfig } from '@/lib/site-config';
import type { GuestCounts } from '@/components/stay/guest-picker';

/**
 * Client-safe shapes and pure helpers for the villa list and villa pages.
 * Server pages map the heavy `Villa` (raw product included) down to these
 * before handing data to client components, so RSC props stay small.
 * No 'use client' and no server imports: both sides can use this module.
 */

export interface VillaSummary {
	slug: string;
	title: string;
	price: number;
	currency: string;
	image: string | null;
	minNights: number;
	maxNights: number;
	stayTimes: StayTimes;
	locationId: string | null;
	collections: VillaCollection[];
	content: Pick<VillaContent, 'type' | 'maxGuests' | 'maxAdults' | 'bedrooms' | 'pool' | 'beds' | 'view'> | null;
}

export function toVillaSummary(v: Villa): VillaSummary {
	const c = v.content;
	return {
		slug: v.slug,
		title: v.title,
		price: v.price,
		currency: v.currency,
		image: v.image,
		minNights: v.minNights,
		maxNights: v.maxNights,
		stayTimes: v.stayTimes,
		locationId: v.locationId,
		collections: v.collections,
		content: c ? { type: c.type, maxGuests: c.maxGuests, maxAdults: c.maxAdults, bedrooms: c.bedrooms, pool: c.pool, beds: c.beds, view: c.view } : null,
	};
}

/**
 * Hotspot positions (x%/y%) on `/images/masterplan/masterplan-16x9.jpg`.
 * TODO(lead): these could live next to `sitePlan` in villa-content.ts
 * (`sitePlan` is for the illustrated SVG plan; these match the painted masterplan).
 */
export const MASTERPLAN_POSITIONS: Record<string, { x: number; y: number }> = {
	'lumbung-padi': { x: 33, y: 49 },
	'lumbung-kembar': { x: 43, y: 40 },
	'joglo-jati': { x: 57, y: 43 },
	'joglo-agung': { x: 59, y: 30 },
	'griya-kopi': { x: 75, y: 33 },
	'rumah-batu': { x: 87, y: 52 },
	'bale-air': { x: 72, y: 61 },
	'rumah-sawah': { x: 53, y: 70 },
	'pondok-bambu': { x: 17, y: 60 },
	'puri-sidemen': { x: 28, y: 78 },
};

export const MASTERPLAN_IMAGE = '/images/masterplan/masterplan-16x9.jpg';

/* ------------------------------------------------------------ date labels */

const SHORT_FMT = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const DAY_MONTH_FMT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const DAY_FMT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone: 'UTC' });
const LONG_FMT = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

const utc = (d: string) => new Date(`${d}T00:00:00Z`);

/** "Fri 14 Nov" */
export const formatShortDate = (d: string) => SHORT_FMT.format(utc(d));
/** "14 Nov" */
export const formatDayMonth = (d: string) => DAY_MONTH_FMT.format(utc(d));
/** "Friday 14 November" */
export const formatLongDate = (d: string) => LONG_FMT.format(utc(d));

/** "14–17 Nov", or "30 Nov – 3 Dec" across months. */
export function formatStayRange(checkin: string, checkout: string): string {
	if (checkin.slice(0, 7) === checkout.slice(0, 7)) return `${DAY_FMT.format(utc(checkin))}–${DAY_MONTH_FMT.format(utc(checkout))}`;
	return `${DAY_MONTH_FMT.format(utc(checkin))} – ${DAY_MONTH_FMT.format(utc(checkout))}`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const isIsoDate = (v: string | null | undefined): v is string => !!v && DATE_RE.test(v);

/** `?checkin=&checkout=&adults=&children=&infants=` for villa and reserve links. */
export function stayQuery(stay: { checkin: string | null; checkout: string | null }, guests: GuestCounts): string {
	const p = new URLSearchParams();
	if (stay.checkin && stay.checkout) {
		p.set('checkin', stay.checkin);
		p.set('checkout', stay.checkout);
	}
	p.set('adults', String(guests.adults));
	if (guests.children > 0) p.set('children', String(guests.children));
	if (guests.infants > 0) p.set('infants', String(guests.infants));
	return p.toString();
}

/* -------------------------------------------------------------- filtering */

export type PoolFilter = 'private' | 'plunge' | 'shared';
export type PriceBand = 'under-200' | '200-350' | '350-up';
export type ExplorerView = 'grid' | 'map';

export const POOL_OPTIONS: Array<{ value: PoolFilter; label: string }> = [
	{ value: 'private', label: 'Private pool' },
	{ value: 'plunge', label: 'Plunge pool' },
	{ value: 'shared', label: 'Shared pool' },
];

export const PRICE_OPTIONS: Array<{ value: PriceBand; label: string; min: number; max: number }> = [
	{ value: 'under-200', label: 'Under $200', min: 0, max: 199.99 },
	{ value: '200-350', label: '$200–$350', min: 200, max: 350 },
	{ value: '350-up', label: '$350 and up', min: 350.01, max: Number.POSITIVE_INFINITY },
];

export const BEDROOM_OPTIONS = [1, 2, 3] as const;

export const COLLECTION_OPTIONS = Object.entries(siteConfig.collections).map(([value, c]) => ({
	value: value as VillaCollection,
	label: c.label,
	blurb: c.blurb,
}));

export interface ExplorerFilters {
	collection: VillaCollection | null;
	/** Minimum bedrooms (3 means 3+). */
	bedrooms: number | null;
	pool: PoolFilter | null;
	price: PriceBand | null;
}

export interface ExplorerState extends ExplorerFilters {
	checkin: string | null;
	checkout: string | null;
	guests: GuestCounts;
	view: ExplorerView;
}

export const EMPTY_FILTERS: ExplorerFilters = { collection: null, bedrooms: null, pool: null, price: null };

type ParamReader = { get(name: string): string | null };

const intParam = (p: ParamReader, key: string): number | null => {
	const raw = p.get(key);
	if (raw === null || raw === '') return null;
	const n = Number(raw);
	return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
};

/** URL → explorer state. Accepts `guests` (from the home search) as adults. */
export function parseExplorerQuery(p: ParamReader): ExplorerState {
	const checkin = p.get('checkin');
	const checkout = p.get('checkout');
	const validStay = isIsoDate(checkin) && isIsoDate(checkout) && checkout > checkin;
	const adults = intParam(p, 'adults') ?? intParam(p, 'guests') ?? 2;
	const collection = p.get('collection');
	const pool = p.get('pool');
	const price = p.get('price');
	const bedrooms = intParam(p, 'bedrooms');
	return {
		checkin: validStay ? checkin : null,
		checkout: validStay ? checkout : null,
		guests: { adults: Math.max(1, Math.min(adults, 12)), children: Math.min(intParam(p, 'children') ?? 0, 10), infants: Math.min(intParam(p, 'infants') ?? 0, 2) },
		collection: collection && collection in siteConfig.collections ? (collection as VillaCollection) : null,
		bedrooms: bedrooms && bedrooms > 0 ? Math.min(bedrooms, 3) : null,
		pool: POOL_OPTIONS.some((o) => o.value === pool) ? (pool as PoolFilter) : null,
		price: PRICE_OPTIONS.some((o) => o.value === price) ? (price as PriceBand) : null,
		view: p.get('view') === 'map' ? 'map' : 'grid',
	};
}

/** Explorer state → query string (defaults omitted). */
export function explorerQuery(s: ExplorerState): string {
	const p = new URLSearchParams();
	if (s.checkin && s.checkout) {
		p.set('checkin', s.checkin);
		p.set('checkout', s.checkout);
	}
	if (s.guests.adults !== 2) p.set('adults', String(s.guests.adults));
	if (s.guests.children > 0) p.set('children', String(s.guests.children));
	if (s.guests.infants > 0) p.set('infants', String(s.guests.infants));
	if (s.collection) p.set('collection', s.collection);
	if (s.bedrooms) p.set('bedrooms', String(s.bedrooms));
	if (s.pool) p.set('pool', s.pool);
	if (s.price) p.set('price', s.price);
	if (s.view === 'map') p.set('view', 'map');
	return p.toString();
}

/** True when the villa passes the guest count and the filters. */
export function matchesFilters(v: VillaSummary, s: ExplorerState): boolean {
	const c = v.content;
	const party = s.guests.adults + s.guests.children;
	if (c && (party > c.maxGuests || s.guests.adults > c.maxAdults)) return false;
	if (s.collection && !v.collections.includes(s.collection)) return false;
	if (s.bedrooms && (c?.bedrooms ?? 0) < s.bedrooms) return false;
	if (s.pool && c?.pool !== s.pool) return false;
	if (s.price) {
		const band = PRICE_OPTIONS.find((o) => o.value === s.price);
		if (band && (v.price < band.min || v.price > band.max)) return false;
	}
	return true;
}

export function activeFilterCount(s: ExplorerFilters): number {
	return [s.collection, s.bedrooms, s.pool, s.price].filter((x) => x !== null).length;
}

/* ---------------------------------------------------------------- similar */

/** Three villas that share a collection with `v`, closest in price first. */
export function pickSimilar<T extends Pick<VillaSummary, 'slug' | 'price' | 'collections'>>(v: T, all: readonly T[], n = 3): T[] {
	return all
		.filter((o) => o.slug !== v.slug)
		.map((o) => ({ o, shared: o.collections.filter((c) => v.collections.includes(c)).length, gap: Math.abs(o.price - v.price) }))
		.sort((a, b) => b.shared - a.shared || a.gap - b.gap)
		.slice(0, n)
		.map((x) => x.o);
}
