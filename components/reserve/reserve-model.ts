import moment from 'moment-timezone';
import type { AddOnListItemResponse, CheckoutSetting, ProductListVariant } from '@opencals/storefront-sdk';
import type { Villa } from '@/lib/server-data';
import type { AvailabilityRange, StayTimes } from '@/lib/stay';
import { addDays, nightsBetween, todayIn } from '@/lib/stay';
import { siteConfig } from '@/lib/site-config';
import { templateImage } from '@/lib/villa-images';
import { formatStayPrice } from '@/lib/format';
import { DEFAULT_GUESTS, clampGuests, type GuestCounts } from '@/lib/guests';

/**
 * Pure helpers and the serializable villa shape for `/reserve/[slug]`.
 * No 'use client' and no server-only imports (only a type from server-data),
 * so both the RSC page and the client view can use it.
 */

/** Everything the client checkout needs about a villa (no raw product). */
export interface ReserveVilla {
	id: string;
	slug: string;
	title: string;
	type: string | null;
	image: string | null;
	price: number;
	currency: string;
	minNights: number;
	maxNights: number;
	stayTimes: StayTimes;
	cancelGap: number;
	allowCustomerCancel: boolean;
	locationId: string | null;
	variant: ProductListVariant | null;
	maxGuests: number;
	maxAdults: number;
	houseRules: string[];
}

export function toReserveVilla(v: Villa): ReserveVilla {
	const c = v.content;
	return {
		id: v.id,
		slug: v.slug,
		title: v.title,
		type: c?.type ?? null,
		image: v.image,
		price: v.price,
		currency: v.currency,
		minNights: v.minNights,
		maxNights: v.maxNights,
		stayTimes: v.stayTimes,
		cancelGap: v.cancelGap,
		allowCustomerCancel: v.allowCustomerCancel,
		locationId: v.locationId,
		variant: v.variant,
		maxGuests: c?.maxGuests ?? 10,
		maxAdults: c?.maxAdults ?? c?.maxGuests ?? 10,
		houseRules: c?.houseRules ?? [],
	};
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Params = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | null {
	const s = Array.isArray(v) ? v[0] : v;
	return typeof s === 'string' ? s : null;
}

/** Stay + guests from `?checkin&checkout&adults&children&infants`. Invalid or past dates are dropped. */
export function parseReserveParams(sp: Params, villa: Pick<ReserveVilla, 'maxGuests' | 'maxAdults' | 'maxNights'>) {
	const today = todayIn(siteConfig.timezone);
	let checkin = first(sp.checkin);
	let checkout = first(sp.checkout);
	if (!checkin || !DATE_RE.test(checkin) || checkin < today) checkin = null;
	if (!checkout || !DATE_RE.test(checkout) || !checkin || checkout <= checkin) checkout = null;
	if (checkin && checkout && nightsBetween(checkin, checkout) > villa.maxNights) checkout = addDays(checkin, villa.maxNights);
	const n = (key: string, fallback: number) => {
		const raw = first(sp[key]);
		const v = raw === null ? NaN : Number(raw);
		return Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback;
	};
	const guests: GuestCounts = clampGuests(
		{ adults: Math.max(1, n('adults', DEFAULT_GUESTS.adults)), children: n('children', 0), infants: n('infants', 0) },
		villa.maxGuests,
		villa.maxAdults,
	);
	return { stay: { checkin, checkout }, guests };
}

/* ------------------------------------------------------------- formatting */

/** "Fri 14 Nov" for a local YYYY-MM-DD date. */
export function fmtDay(date: string): string {
	return moment.utc(date, 'YYYY-MM-DD', true).format('ddd D MMM');
}

/** "Friday 14 November 2026". */
export function fmtLongDay(date: string): string {
	return moment.utc(date, 'YYYY-MM-DD', true).format('dddd D MMMM YYYY');
}

/** "$1,240" or "$1,240.50" (cents only when there are cents). */
export function money(amount: number, currency: string): string {
	const rounded = Math.round(amount * 100) / 100;
	return formatStayPrice(rounded, currency, !Number.isInteger(rounded));
}

export function plural(n: number, one: string, many: string): string {
	return `${n} ${n === 1 ? one : many}`;
}

/* ----------------------------------------------------------------- add-ons */

export type AddOnControl = 'toggle' | 'stepper';

const TOGGLE_WORDS = ['early', 'late', 'romance', 'setup', 'for two'];

/**
 * Per-night add-ons (durationMultiplied) and single-use ones are on/off;
 * the rest (transfers, treks, classes) take a count.
 */
export function addOnControl(a: Pick<AddOnListItemResponse, 'durationMultiplied' | 'maxQuantity' | 'title'>): AddOnControl {
	if (a.durationMultiplied || a.maxQuantity === 1) return 'toggle';
	const t = a.title.toLowerCase();
	return TOGGLE_WORDS.some((w) => t.includes(w)) ? 'toggle' : 'stepper';
}

export function addOnMax(a: Pick<AddOnListItemResponse, 'maxQuantity'>, maxGuests: number): number {
	return a.maxQuantity && a.maxQuantity > 0 ? a.maxQuantity : Math.max(2, maxGuests);
}

const IMAGE_BY_KEYWORD: ReadonlyArray<[readonly string[], string | null]> = [
	[['transfer', 'airport', 'driver'], 'getting-there/arrival'],
	[['breakfast'], 'experiences/warung'],
	[['massage', 'spa'], 'experiences/spa'],
	[['trek', 'sunrise', 'agung'], 'experiences/sunrise-trek'],
	[['cooking', 'kitchen'], 'experiences/cooking-class'],
	[['weav', 'ikat'], 'experiences/weaving'],
	[['romance', 'temple', 'ceremony'], 'experiences/temple'],
	// Early / late requests are about the house itself.
	[['check-in', 'check-out', 'checkout', 'checkin'], null],
];

/** Editorial photo for an add-on by title keyword, else its own image, else the villa photo. */
export function addOnImage(a: Pick<AddOnListItemResponse, 'title' | 'image'>, villaImage: string | null): string | null {
	const t = a.title.toLowerCase();
	for (const [words, path] of IMAGE_BY_KEYWORD) {
		if (words.some((w) => t.includes(w))) return path ? templateImage(path) : villaImage;
	}
	return a.image?.url ?? villaImage;
}

/** First sentence of the description, for the card. */
export function shortLine(text: string | null | undefined): string {
	const s = (text ?? '').trim();
	if (!s) return '';
	const m = s.match(/^.+?[.!?](\s|$)/);
	return (m ? m[0] : s).trim();
}

/* ------------------------------------------------------------- checkout settings */

export type Requirement = 'hidden' | 'optional' | 'required';

export interface CheckoutAsks {
	billing: Requirement;
	company: Requirement;
	vat: Requirement;
	phone: Requirement;
	consent: { email: boolean; sms: boolean; whatsapp: boolean };
}

const shown = (v: string | null | undefined) => v === 'checkout_only' || v === 'checkout_and_account';

export function checkoutAsks(s: CheckoutSetting | null | undefined): CheckoutAsks {
	return {
		billing: (s?.customerBillingAddressRequirement as Requirement | undefined) ?? 'hidden',
		company: (s?.customerCompanyNameRequirement as Requirement | undefined) ?? 'hidden',
		vat: (s?.customerCompanyVatNumberRequirement as Requirement | undefined) ?? 'hidden',
		phone: (s?.customerPhoneRequirement as Requirement | undefined) ?? 'required',
		consent: {
			email: shown(s?.emailMarketingOptIn),
			sms: shown(s?.smsMarketingOptIn),
			whatsapp: shown(s?.whatsappMarketingOptIn),
		},
	};
}

/** Billing address in the SDK's `BillingAddress` shape. */
export interface BillingDraft {
	firstName: string;
	lastName: string;
	companyName: string;
	taxRegistrationId: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
}

export const EMPTY_BILLING: BillingDraft = {
	firstName: '',
	lastName: '',
	companyName: '',
	taxRegistrationId: '',
	addressLine1: '',
	addressLine2: '',
	city: '',
	state: '',
	postalCode: '',
	country: '',
};

export interface ConsentDraft {
	email: boolean;
	sms: boolean;
	whatsapp: boolean;
}

export const EMPTY_CONSENT: ConsentDraft = { email: false, sms: false, whatsapp: false };

/** True when the billing block satisfies the store's requirements. */
export function billingValid(b: BillingDraft, asks: CheckoutAsks): boolean {
	if (asks.company === 'required' && !b.companyName.trim()) return false;
	if (asks.vat === 'required' && !b.taxRegistrationId.trim()) return false;
	if (asks.billing !== 'required') return true;
	return !!(b.addressLine1.trim() && b.city.trim() && b.postalCode.trim() && /^[A-Z]{2}$/.test(b.country));
}

/** The SDK `BillingAddress` payload, or undefined when nothing was entered. */
export function billingPayload(b: BillingDraft, guest?: { firstName?: string; lastName?: string; email?: string; phone?: string }) {
	const filled = Object.values(b).some((v) => v.trim());
	if (!filled) return undefined;
	const v = (s: string | undefined) => s?.trim() || undefined;
	return {
		firstName: v(b.firstName) ?? v(guest?.firstName),
		lastName: v(b.lastName) ?? v(guest?.lastName),
		companyName: v(b.companyName),
		taxRegistrationId: v(b.taxRegistrationId),
		addressLine1: v(b.addressLine1),
		addressLine2: v(b.addressLine2),
		city: v(b.city),
		state: v(b.state),
		postalCode: v(b.postalCode),
		country: v(b.country),
		email: v(guest?.email),
		phone: v(guest?.phone),
	};
}

/** Marketing opt-ins for only the channels the store shows at checkout; null when none are shown. */
export function consentPayload(c: ConsentDraft, asks: CheckoutAsks): Partial<ConsentDraft> | null {
	const out: Partial<ConsentDraft> = {};
	if (asks.consent.email) out.email = c.email;
	if (asks.consent.sms) out.sms = c.sms;
	if (asks.consent.whatsapp) out.whatsapp = c.whatsapp;
	return Object.keys(out).length > 0 ? out : null;
}

/** ISO 3166-1 alpha-2 codes for the billing country select. */
const ISO_CODES =
	'AD AE AF AG AI AL AM AO AR AT AU AW AZ BA BB BD BE BF BG BH BI BJ BM BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GI GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NC NE NG NI NL NO NP NR NZ OM PA PE PF PG PH PK PL PR PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VN VU WS YE ZA ZM ZW'.split(' ');

let countryCache: Array<{ code: string; name: string }> | null = null;

export function countryOptions(): Array<{ code: string; name: string }> {
	if (countryCache) return countryCache;
	let names: Intl.DisplayNames | null = null;
	try {
		names = new Intl.DisplayNames(['en'], { type: 'region' });
	} catch {
		names = null;
	}
	countryCache = ISO_CODES.map((code) => ({ code, name: names?.of(code) ?? code })).sort((a, b) => a.name.localeCompare(b.name));
	return countryCache;
}

/* ------------------------------------------------------------- availability */

/**
 * A UTC availability range covering a held appointment. Pending cart holds
 * block availability, so without this the guest's own nights show as booked
 * on the calendar once held. Client-only: the server re-validates every hold.
 */
export function rangeFromIso(fromIso: string, toIso: string): AvailabilityRange | null {
	const from = new Date(fromIso);
	const to = new Date(toIso);
	if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || to <= from) return null;
	const f = from.toISOString();
	const t = to.toISOString();
	return { fromDate: f.slice(0, 10), fromTime: f.slice(11, 19), toDate: t.slice(0, 10), toTime: t.slice(11, 19) };
}
