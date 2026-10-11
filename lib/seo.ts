import type { StorePublicSettings } from '@opencals/storefront-sdk';
import type { Villa } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';
import { villaContent } from '@/lib/villa-content';

/**
 * schema.org JSON-LD builders. Pure functions (no SDK calls), so they are safe in
 * any Server Component. Render the result with `<JsonLd data={...} />`
 * (components/marketing/json-ld.tsx), which escapes `<`.
 *
 * Only facts we actually have go in here: siteConfig, villaContent and the
 * store's product data. No invented ratings or review counts.
 */

type Json = Record<string, unknown>;

export const SCHEMA_CONTEXT = 'https://schema.org';
export const PRICE_RANGE = '$140–$520';
export const OG_IMAGE_PATH = '/images/og.jpg';

/** Absolute URL for a site path or an already-absolute URL. */
export function absoluteUrl(pathOrUrl: string): string {
	if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
	return `${siteConfig.url}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Serialises JSON-LD for a <script> tag. `<` is escaped so no string can close the tag. */
export function jsonLdString(data: Json | Json[]): string {
	return JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

function postalAddress(): Json {
	const a = siteConfig.contact.address;
	return {
		'@type': 'PostalAddress',
		streetAddress: a.line1,
		addressLocality: a.city,
		addressRegion: a.region,
		postalCode: a.postalCode,
		addressCountry: 'ID',
	};
}

function geo(): Json {
	return { '@type': 'GeoCoordinates', latitude: siteConfig.contact.geo.lat, longitude: siteConfig.contact.geo.lng };
}

function feature(name: string): Json {
	return { '@type': 'LocationFeatureSpecification', name, value: true };
}

/** Resort-wide amenities (true of every villa or of the grounds). */
const RESORT_AMENITIES = [
	...siteConfig.priceIncludes,
	'Rice-field views',
	'Private and shared pools',
	'Airport transfer on request',
	'On-site warung',
];

const bookingAction = (): Json => ({
	'@type': 'ReserveAction',
	target: { '@type': 'EntryPoint', urlTemplate: absoluteUrl('/villas'), actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'] },
	result: { '@type': 'LodgingReservation', name: `A stay at ${siteConfig.name}` },
});

/** The resort as a whole. Put it in the root layout. */
export function lodgingBusinessJsonLd(settings?: StorePublicSettings | null): Json {
	const sf = settings?.storefrontSettings;
	const logo = sf?.logoImage?.url ?? null;
	const banner = sf?.bannerImage?.url ?? null;
	return {
		'@context': SCHEMA_CONTEXT,
		'@type': 'LodgingBusiness',
		'@id': `${siteConfig.url}/#lodging`,
		name: siteConfig.name,
		alternateName: siteConfig.shortName,
		slogan: siteConfig.tagline,
		description: siteConfig.description,
		url: siteConfig.url,
		image: banner ?? absoluteUrl(OG_IMAGE_PATH),
		...(logo ? { logo } : {}),
		telephone: siteConfig.contact.phone,
		email: siteConfig.contact.email,
		currenciesAccepted: settings?.currency ?? siteConfig.currency,
		priceRange: PRICE_RANGE,
		checkinTime: `${siteConfig.stay.checkIn}:00`,
		checkoutTime: `${siteConfig.stay.checkOut}:00`,
		numberOfRooms: Object.keys(villaContent).length,
		address: postalAddress(),
		geo: geo(),
		hasMap: `https://www.google.com/maps/search/?api=1&query=${siteConfig.contact.geo.lat},${siteConfig.contact.geo.lng}`,
		amenityFeature: RESORT_AMENITIES.map(feature),
		availableLanguage: ['English', 'Indonesian'],
		sameAs: [siteConfig.contact.instagram],
		potentialAction: bookingAction(),
	};
}

const BED_TYPE_RE = /(king|queen|twin|single|double|day ?bed|bunk)/i;

/**
 * One villa as a VacationRental (Google's preferred shape) that contains an
 * Accommodation with the occupancy, rooms, floor size and amenities, plus an
 * Offer of the nightly price. Use on `/villas/[slug]`.
 */
export function accommodationJsonLd(villa: Villa): Json {
	const c = villa.content;
	const url = absoluteUrl(`/villas/${villa.slug}`);
	const images = [villa.image, ...villa.gallery].filter((x): x is string => Boolean(x));
	const uniqueImages = [...new Set(images)].slice(0, 12).map(absoluteUrl);
	const bedType = c?.beds.match(BED_TYPE_RE)?.[1];

	const accommodation: Json = {
		'@type': 'Accommodation',
		additionalType: 'EntirePlace',
		name: villa.title,
		...(c
			? {
					description: c.type,
					occupancy: { '@type': 'QuantitativeValue', minValue: 1, maxValue: c.maxGuests },
					numberOfRooms: c.rooms.length,
					numberOfBedrooms: c.bedrooms,
					numberOfBathroomsTotal: c.bathrooms,
					floorSize: { '@type': 'QuantitativeValue', value: c.sizeM2, unitCode: 'MTK', unitText: 'm²' },
					bed: { '@type': 'BedDetails', typeOfBed: bedType ? bedType.toLowerCase() : c.beds, numberOfBeds: c.bedrooms },
					amenityFeature: c.amenities.map(feature),
					tourBookingPage: url,
				}
			: {}),
	};

	return {
		'@context': SCHEMA_CONTEXT,
		'@type': 'VacationRental',
		'@id': `${url}#rental`,
		identifier: villa.slug,
		name: villa.title,
		description: c?.tagline ?? (villa.description || siteConfig.description),
		url,
		...(uniqueImages.length ? { image: uniqueImages } : {}),
		address: postalAddress(),
		geo: geo(),
		latitude: siteConfig.contact.geo.lat,
		longitude: siteConfig.contact.geo.lng,
		checkinTime: `${villa.stayTimes.checkIn}:00`.slice(0, 8),
		checkoutTime: `${villa.stayTimes.checkOut}:00`.slice(0, 8),
		containedInPlace: { '@type': 'LodgingBusiness', '@id': `${siteConfig.url}/#lodging`, name: siteConfig.name },
		containsPlace: accommodation,
		makesOffer: {
			'@type': 'Offer',
			url,
			price: villa.price,
			priceCurrency: villa.currency,
			priceSpecification: {
				'@type': 'UnitPriceSpecification',
				price: villa.price,
				priceCurrency: villa.currency,
				unitCode: 'DAY',
				unitText: 'night',
				referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'DAY' },
			},
			eligibleDuration: { '@type': 'QuantitativeValue', minValue: villa.minNights, maxValue: villa.maxNights, unitCode: 'DAY' },
			availability: 'https://schema.org/InStock',
		},
	};
}

export interface FaqEntry {
	question: string;
	/** Plain text (no markup). */
	answer: string;
}

export function faqJsonLd(items: readonly FaqEntry[]): Json {
	return {
		'@context': SCHEMA_CONTEXT,
		'@type': 'FAQPage',
		mainEntity: items.map((i) => ({
			'@type': 'Question',
			name: i.question,
			acceptedAnswer: { '@type': 'Answer', text: i.answer },
		})),
	};
}

export interface ArticleInput {
	slug: string;
	title: string;
	description: string;
	/** ISO date. */
	date: string;
	author: string;
	/** Site path or absolute URL. */
	image: string;
	wordCount?: number;
}

export function articleJsonLd(post: ArticleInput): Json {
	const url = absoluteUrl(`/journal/${post.slug}`);
	return {
		'@context': SCHEMA_CONTEXT,
		'@type': 'BlogPosting',
		'@id': `${url}#article`,
		mainEntityOfPage: url,
		headline: post.title,
		description: post.description,
		image: [absoluteUrl(post.image)],
		datePublished: post.date,
		dateModified: post.date,
		inLanguage: 'en',
		...(post.wordCount ? { wordCount: post.wordCount } : {}),
		author: { '@type': 'Person', name: post.author },
		publisher: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url, logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.svg') } },
		isPartOf: { '@type': 'Blog', name: `${siteConfig.name} journal`, url: absoluteUrl('/journal') },
	};
}

/** Breadcrumbs: `[['Journal', '/journal'], ['The harvest', '/journal/harvest']]`. */
export function breadcrumbJsonLd(trail: ReadonlyArray<readonly [string, string]>): Json {
	return {
		'@context': SCHEMA_CONTEXT,
		'@type': 'BreadcrumbList',
		itemListElement: [['Home', '/'] as const, ...trail].map(([name, path], i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name,
			item: absoluteUrl(path),
		})),
	};
}
