import type { AppointmentDetailResponse, AppointmentListItemResponse } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';
import { fromStaySlot, stayTimesFor, todayIn, type StayTimes } from '@/lib/stay';

/**
 * Pure view-model helpers for "My trips". Safe on the server and the client
 * (no 'use client' imports), so RSCs can call them directly.
 *
 * A trip is one appointment on a villa product. Dates come from `fromStaySlot`
 * on the appointment's UTC from/to, in the store timezone (Asia/Makassar).
 */

export type TripPhase = 'upcoming' | 'current' | 'past' | 'cancelled';

export interface TripVilla {
	slug: string;
	title: string;
	/** Short type line from villaContent ("Teak joglo with a private pool"). */
	type: string | null;
	image: string | null;
}

export interface TripGuests {
	adults: number;
	children: number;
	infants: number;
}

export interface Trip {
	id: string;
	/** Booking reference shown to the guest ("1042"). */
	reference: string;
	status: AppointmentListItemResponse['status'];
	phase: TripPhase;
	checkin: string;
	checkout: string;
	nights: number;
	stayTimes: StayTimes;
	/** Whole days from today (store timezone) to check-in; negative once started. */
	daysUntil: number;
	villa: TripVilla;
	guests: TripGuests | null;
	arrivalTime: string | null;
	flightNumber: string | null;
	occasion: string | null;
	/** Epoch ms of check-in and check-out. */
	startsAt: number;
	endsAt: number;
}

type AnyAppointment = AppointmentListItemResponse | AppointmentDetailResponse;

const TZ = siteConfig.timezone;

/** Backend timestamps can arrive without a zone ("2026-11-14 07:00:00"); they are UTC. */
export function parseUtc(value: string): number {
	if (!value) return NaN;
	const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value.replace(' ', 'T')}Z`;
	return Date.parse(iso);
}

function isoUtc(value: string): string {
	const ms = parseUtc(value);
	return Number.isFinite(ms) ? new Date(ms).toISOString() : value;
}

/** Signed whole days from today (store timezone) to `date`. */
export function daysFromToday(date: string): number {
	const diff = Date.parse(`${date}T12:00:00Z`) - Date.parse(`${todayIn(TZ)}T12:00:00Z`);
	return Number.isFinite(diff) ? Math.round(diff / 86_400_000) : 0;
}

function attr(a: AnyAppointment, key: string): string | null {
	const v = a.customAttributes?.[key];
	return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function guestsOf(a: AnyAppointment): TripGuests | null {
	const k = siteConfig.customAttributeKeys;
	const n = (key: string) => {
		const v = Number(attr(a, key));
		return Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
	};
	const adults = n(k.adults);
	if (adults <= 0) {
		return a.numberOfAttendees > 0 ? { adults: a.numberOfAttendees, children: 0, infants: 0 } : null;
	}
	return { adults, children: n(k.children), infants: n(k.infants) };
}

/** "2 adults, 1 child" (infants appended when present). Server-safe copy of the guest-picker helper. */
export function formatTripGuests(g: TripGuests): string {
	const parts = [`${g.adults} ${g.adults === 1 ? 'adult' : 'adults'}`];
	if (g.children > 0) parts.push(`${g.children} ${g.children === 1 ? 'child' : 'children'}`);
	if (g.infants > 0) parts.push(`${g.infants} ${g.infants === 1 ? 'infant' : 'infants'}`);
	return parts.join(', ');
}

export function toTrip(a: AnyAppointment, villa: TripVilla, now: number = Date.now()): Trip {
	const from = isoUtc(a.from);
	const to = isoUtc(a.to);
	const { checkin, checkout, nights } = fromStaySlot(from, to, TZ);
	const startsAt = parseUtc(a.from);
	const endsAt = parseUtc(a.to);
	const k = siteConfig.customAttributeKeys;

	let phase: TripPhase;
	if (a.status === 'canceled') phase = 'cancelled';
	else if (a.status === 'completed' || endsAt <= now) phase = 'past';
	else if (startsAt <= now) phase = 'current';
	else phase = 'upcoming';

	return {
		id: a.id,
		reference: a.name,
		status: a.status,
		phase,
		checkin,
		checkout,
		nights: Math.max(1, nights),
		stayTimes: stayTimesFor(a.product),
		daysUntil: daysFromToday(checkin),
		villa,
		guests: guestsOf(a),
		arrivalTime: attr(a, k.arrivalTime),
		flightNumber: attr(a, k.flightNumber),
		occasion: attr(a, k.occasion),
		startsAt,
		endsAt,
	};
}

/**
 * Pending appointments without an order are cart holds (abandoned or in
 * progress), not trips. Everything else is shown.
 */
export function isRealTrip(a: AppointmentListItemResponse): boolean {
	return !(a.status === 'pending' && !a.orderLineItem);
}

export interface GroupedTrips {
	next: Trip | null;
	upcoming: Trip[];
	past: Trip[];
	cancelled: Trip[];
}

/** Current stay first, then upcoming by check-in; past newest first. */
export function groupTrips(trips: Trip[]): GroupedTrips {
	const ahead = trips.filter((t) => t.phase === 'current' || t.phase === 'upcoming').sort((a, b) => a.startsAt - b.startsAt);
	const past = trips.filter((t) => t.phase === 'past').sort((a, b) => b.startsAt - a.startsAt);
	const cancelled = trips.filter((t) => t.phase === 'cancelled').sort((a, b) => b.startsAt - a.startsAt);
	const current = ahead.find((t) => t.phase === 'current') ?? null;
	const next = current ?? ahead[0] ?? null;
	return { next, upcoming: ahead.filter((t) => t !== next), past, cancelled };
}

/* ------------------------------------------------------------ formatting */

const at = (date: string) => new Date(`${date}T12:00:00Z`);
const WD = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' });
const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone: 'UTC' });
const MON = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' });
const YEAR = new Intl.DateTimeFormat('en-GB', { year: 'numeric', timeZone: 'UTC' });
const LONG = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const SHORT = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const DAY_MONTH = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** "Fri 14 → Mon 17 Nov", "Fri 31 Oct → Mon 3 Nov", years added when they differ from each other. */
export function formatStayRange(checkin: string, checkout: string): string {
	const a = at(checkin);
	const b = at(checkout);
	const sameYear = YEAR.format(a) === YEAR.format(b);
	const sameMonth = sameYear && MON.format(a) === MON.format(b);
	const left = `${WD.format(a)} ${DAY.format(a)}${sameMonth ? '' : ` ${MON.format(a)}`}${sameYear ? '' : ` ${YEAR.format(a)}`}`;
	const right = `${WD.format(b)} ${DAY.format(b)} ${MON.format(b)}${sameYear ? '' : ` ${YEAR.format(b)}`}`;
	return `${left} → ${right}`;
}

/** "Friday 14 November 2026". */
export const formatLongDate = (date: string) => LONG.format(at(date));
/** "Fri 14 Nov". */
export const formatShortDate = (date: string) => SHORT.format(at(date));
/** "31 Oct". */
export const formatDayMonth = (date: string) => DAY_MONTH.format(at(date));

/** "in 23 days", "tomorrow", "today", "staying now". */
export function countdownLabel(trip: Pick<Trip, 'phase' | 'daysUntil'>): string {
	if (trip.phase === 'current') return 'staying now';
	if (trip.daysUntil <= 0) return 'today';
	if (trip.daysUntil === 1) return 'tomorrow';
	return `in ${trip.daysUntil} days`;
}

export const nightsLabel = (n: number) => `${n} ${n === 1 ? 'night' : 'nights'}`;

/** Money in the order currency ("$720", "$28.50"). */
export function formatMoney(amount: number, currency: string): string {
	const cents = Math.round(amount * 100) % 100 !== 0;
	try {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
			currencyDisplay: 'narrowSymbol',
			minimumFractionDigits: cents ? 2 : 0,
			maximumFractionDigits: 2,
		}).format(amount);
	} catch {
		return `${currency} ${amount.toFixed(2)}`;
	}
}

/* ---------------------------------------------------------------- status */

export type TripTone = 'moss' | 'terracotta' | 'jungle' | 'neutral' | 'danger';

export function tripStatus(trip: Pick<Trip, 'phase' | 'status'>): { label: string; tone: TripTone } {
	if (trip.phase === 'cancelled') return { label: 'Cancelled', tone: 'danger' };
	if (trip.phase === 'current') return { label: 'Staying now', tone: 'jungle' };
	if (trip.phase === 'past') return { label: 'Stayed', tone: 'neutral' };
	if (trip.status === 'pending') return { label: 'Awaiting confirmation', tone: 'terracotta' };
	return { label: 'Confirmed', tone: 'moss' };
}

/* ------------------------------------------------------------- add-ons */

/** The airport transfer add-on is recognised by slug or title ("airport-transfer", "Airport pickup"). */
export function isTransferAddOn(addOn: { slug?: string | null; title?: string | null } | null | undefined): boolean {
	const text = `${addOn?.slug ?? ''} ${addOn?.title ?? ''}`.toLowerCase();
	return /transfer|airport|pick-?up/.test(text);
}

/** Store questions answered on this appointment (a stay "has a review" once any answer exists). */
export function hasFeedback(a: Pick<AppointmentDetailResponse, 'feedbackQuestionAnswers'>): boolean {
	return (a.feedbackQuestionAnswers ?? []).some((f) => f.answer != null && f.answer !== '');
}
