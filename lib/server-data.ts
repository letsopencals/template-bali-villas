import '@/lib/opencals';
import { cache } from 'react';
import {
	StoreService,
	ProductService,
	ProductCollectionService,
	type AddOnListItemResponse,
	type StorePublicSettings,
	type ProductListItemResponse,
	type ProductListVariant,
	type ProductCollectionResponse,
} from '@opencals/storefront-sdk';
import { publicPayload } from '@/lib/public-payload';
import { siteConfig } from '@/lib/site-config';
import { VILLA_ORDER, villaContent, type VillaCollection, type VillaContent } from '@/lib/villa-content';
import { stayTimesFor, type StayTimes } from '@/lib/stay';
import { getListItemGallery } from '@/lib/format';
import { defaultVillaImage, orderedGallery } from '@/lib/villa-images';

/**
 * Server-only data readers. Each is wrapped in React.cache() so repeated calls
 * within a single request are deduped. RSCs call these directly instead of
 * going through the template's own /api/* routes. Never import this module from
 * a 'use client' file; the /api/* routes stay the client/SWR data source.
 * Catalog reads pass through `publicPayload`, so staff contact fields never reach
 * RSC props.
 */

export const getStoreSettings = cache(async (): Promise<StorePublicSettings | null> => {
	try {
		const { data } = await StoreService.getStorePublicSettings();
		return data ?? null;
	} catch {
		return null;
	}
});

/**
 * The store's logo and banner (cover), as set under Storefront customisation in
 * the dashboard. Null when not set or the settings can't be loaded.
 */
export function storeImages(settings: StorePublicSettings | null): { logo: string | null; banner: string | null } {
	const s = settings?.storefrontSettings;
	return { logo: s?.logoImage?.url ?? null, banner: s?.bannerImage?.url ?? null };
}

/** The store currency (ISO code), falling back to siteConfig.currency. */
export async function getCurrency(): Promise<string> {
	const settings = await getStoreSettings();
	return settings?.currency ?? siteConfig.currency;
}

export const getProducts = cache(async (): Promise<ProductListItemResponse[]> => {
	try {
		const { data } = await ProductService.list({ query: { take: 100 } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

/** All visible collections (with their product references). Empty on failure. */
export const getCollections = cache(async (): Promise<ProductCollectionResponse[]> => {
	try {
		const { data } = await ProductCollectionService.list({ query: { take: 50 } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

/** A single collection with its products, by slug. Null if it can't be loaded. */
export const getCollection = cache(async (slug: string): Promise<ProductCollectionResponse | null> => {
	try {
		const { data } = await ProductCollectionService.getBySlug({ path: { slug } });
		return data ? publicPayload(data) : null;
	} catch {
		return null;
	}
});

/** Add-ons offered with a villa (breakfast, transfers, experiences). Empty on failure. */
export const getVillaAddOns = cache(async (slug: string, locationId?: string): Promise<AddOnListItemResponse[]> => {
	try {
		const { data } = await ProductService.listAddOnsBySlug({
			path: { slug },
			query: locationId ? { locationId } : {},
		});
		return publicPayload(Array.isArray(data) ? data : []);
	} catch {
		return [];
	}
});

/* ------------------------------------------------------------------ Villas */

const DAY_SECONDS = 86400;

/** A villa = a store product merged with its editorial `villaContent`. */
export interface Villa {
	id: string;
	slug: string;
	title: string;
	description: string;
	/** Nightly rate in major units of `currency`. */
	price: number;
	currency: string;
	/** Base duration in seconds (86400: one night). */
	duration: number;
	/** Longest stay in nights (from product.maxDuration, else siteConfig.stay.maxNights). */
	maxNights: number;
	/** Shortest stay in nights (from villaContent, else 1). */
	minNights: number;
	/** Check-in/out times from the product's fixed times (15:00 / 11:00 by default). */
	stayTimes: StayTimes;
	/** Free-cancellation gap in seconds before check-in (product.cancelGap). */
	cancelGap: number;
	allowCustomerCancel: boolean;
	allowCustomerReschedule: boolean;
	/** The location to book at (the villa's first physical location), or null. */
	locationId: string | null;
	/** Collection slugs the villa is in (API collections merged with villaContent). */
	collections: VillaCollection[];
	/** Editorial content; null when the slug has no entry in `villaContent`. */
	content: VillaContent | null;
	/** The default image: the day exterior `<slug>`, else the product's own default. */
	image: string | null;
	/** Every product image in editorial order (see `orderedGallery`). */
	gallery: string[];
	/** The bookable variant (the product's own) for add-on lookups. */
	variant: ProductListVariant | null;
	/** The raw list item for anything else the booking flow needs. */
	product: ProductListItemResponse;
}

/** Same as `Villa` plus its add-ons (only loaded by `getVilla`). */
export interface VillaDetail extends Villa {
	addOns: AddOnListItemResponse[];
}

const KNOWN_COLLECTIONS = Object.keys(siteConfig.collections) as VillaCollection[];

function ownVariant(product: ProductListItemResponse): ProductListVariant | null {
	return product.variants?.find((v) => v.id === product.id) ?? product.variants?.[0] ?? null;
}

/**
 * The product's own default image: the variant's `image`, else its `imageId`
 * entry. NEVER `images[0]` (the list returns images in no fixed order).
 */
function productDefaultImage(product: ProductListItemResponse, variant: ProductListVariant | null): string | null {
	const direct = variant?.image?.url ?? product.image?.url;
	if (direct) return direct;
	const id = variant?.imageId ?? product.imageId;
	return (id ? variant?.images?.find((i) => i.id === id)?.url : null) ?? null;
}

/**
 * Longest stay in nights. `maxDuration` is seconds (21 nights = 1814400); a
 * value smaller than one night is read as a count of nights, so a store set up
 * either way works. Falls back to siteConfig.stay.maxNights.
 */
export function maxNightsFor(maxDuration: number | null | undefined, base: number, allowCustom: boolean): number {
	if (!allowCustom) return 1;
	if (!maxDuration || maxDuration <= 0) return siteConfig.stay.maxNights;
	const nights = maxDuration >= base ? Math.floor(maxDuration / base) : Math.floor(maxDuration);
	return Math.max(1, nights);
}

function toVilla(product: ProductListItemResponse, currency: string): Villa {
	const content = villaContent[product.slug] ?? null;
	const variant = ownVariant(product);
	const raw = getListItemGallery(product);
	const gallery = orderedGallery(raw, content);
	const apiCollections = (variant?.collections ?? [])
		.map((c) => c.slug)
		.filter((s): s is VillaCollection => (KNOWN_COLLECTIONS as string[]).includes(s));
	const collections = [...new Set([...apiCollections, ...(content?.collections ?? [])])];
	const location = variant?.locations?.find((l) => l.type === 'physical') ?? variant?.locations?.[0] ?? null;
	const base = product.duration > 0 ? product.duration : DAY_SECONDS;
	const maxNights = maxNightsFor(product.maxDuration, base, product.allowCustomDuration);

	return {
		id: product.id,
		slug: product.slug,
		title: product.title,
		description: product.description ?? '',
		price: product.price,
		currency,
		duration: base,
		maxNights,
		minNights: Math.max(1, content?.minNights ?? 1),
		stayTimes: stayTimesFor(product),
		cancelGap: product.cancelGap ?? 0,
		allowCustomerCancel: product.allowCustomerCancel,
		allowCustomerReschedule: product.allowCustomerReschedule,
		locationId: location?.id ?? null,
		collections,
		content,
		image: defaultVillaImage(raw, product.slug, productDefaultImage(product, variant)),
		gallery,
		variant,
		product,
	};
}

/**
 * Every villa in the store, merged with `villaContent`. Villas in `VILLA_ORDER`
 * come first in that order; any other day-priced product follows by price.
 */
export const getVillas = cache(async (): Promise<Villa[]> => {
	const [products, currency] = await Promise.all([getProducts(), getCurrency()]);
	const villas = products
		.filter((p) => villaContent[p.slug] || p.duration >= DAY_SECONDS)
		.map((p) => toVilla(p, currency));
	const rank = (slug: string) => {
		const i = (VILLA_ORDER as readonly string[]).indexOf(slug);
		return i === -1 ? Number.MAX_SAFE_INTEGER : i;
	};
	return villas.sort((a, b) => rank(a.slug) - rank(b.slug) || a.price - b.price);
});

/** One villa by slug (or a variant slug) with its add-ons, or null. */
export const getVilla = cache(async (slug: string): Promise<VillaDetail | null> => {
	const villas = await getVillas();
	const villa = villas.find((v) => v.slug === slug || v.product.variants?.some((x) => x.slug === slug)) ?? null;
	if (!villa) return null;
	const addOns = await getVillaAddOns(villa.slug, villa.locationId ?? undefined);
	return { ...villa, addOns };
});

/** Villas in a collection slug (from the API membership or villaContent). */
export async function getVillasIn(collection: VillaCollection): Promise<Villa[]> {
	return (await getVillas()).filter((v) => v.collections.includes(collection));
}
