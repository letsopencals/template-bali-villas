'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import type { StayValue } from '@/components/stay/stay-calendar';
import { DEFAULT_GUESTS, clampGuests, guestsFromParams, type GuestCounts } from '@/components/stay/guest-picker';
import { useVillaRanges } from '@/hooks/use-villa-ranges';
import { siteConfig } from '@/lib/site-config';
import { firstFreeStay, fitsStay, localAt, nightsBetween, stayEstimate, todayIn, type AvailabilityRange } from '@/lib/stay';
import { lastFreeDay } from '@/components/account/trip-policy';
import { isIsoDate, stayQuery } from '@/components/villas/villa-summary';
import type { BookingVilla } from '@/components/villa/villa-page-data';

export type StayStatus =
	/** No dates yet. */
	| 'empty'
	/** Check-in picked, waiting for check-out. */
	| 'partial'
	| 'loading'
	| 'short'
	| 'long'
	| 'unavailable'
	| 'ok';

export interface VillaBookingValue {
	villa: BookingVilla;
	stay: StayValue;
	setStay(v: StayValue): void;
	guests: GuestCounts;
	setGuests(g: GuestCounts): void;
	ranges: readonly AvailabilityRange[];
	rangesLoading: boolean;
	rangesError: boolean;
	nights: number;
	status: StayStatus;
	/** nights × rate (preview; the cart is the source of truth). */
	estimate: number;
	/** Last free-cancellation date for the chosen check-in, or null. */
	freeCancelUntil: string | null;
	/** The next free stay of the same length, when the chosen one isn't free. */
	nextFree: { checkin: string; checkout: string } | null;
	/** `/reserve/<slug>?…` when the stay is bookable, else null. */
	reserveHref: string | null;
}

const BookingContext = createContext<VillaBookingValue | null>(null);

export function useVillaBooking(): VillaBookingValue {
	const ctx = useContext(BookingContext);
	if (!ctx) throw new Error('useVillaBooking must be used inside <VillaBookingProvider>');
	return ctx;
}

const EMPTY_STAY: StayValue = { checkin: null, checkout: null };

function mirrorToUrl(stay: StayValue, guests: GuestCounts) {
	const qs = stayQuery(stay, guests);
	window.history.replaceState(window.history.state, '', `${window.location.pathname}?${qs}${window.location.hash}`);
}

/**
 * Stay + guest state for one villa page, shared by the sticky card, the mobile
 * bar/sheet and the cancellation timeline. Starts empty (the page is static);
 * `<UrlStaySync />` seeds it from `?checkin&checkout&adults&children&infants`.
 */
export function VillaBookingProvider({ villa, children }: { villa: BookingVilla; children: ReactNode }) {
	const [stay, setStayState] = useState<StayValue>(EMPTY_STAY);
	const [guests, setGuestsState] = useState<GuestCounts>(() => clampGuests(DEFAULT_GUESTS, villa.maxGuests, villa.maxAdults));
	const { ranges, isLoading, error } = useVillaRanges(villa.slug, { locationId: villa.locationId });

	const setStay = useCallback(
		(v: StayValue) => {
			setStayState(v);
			if (!v.checkin || v.checkout) mirrorToUrl(v, guests);
		},
		[guests],
	);
	const setGuests = useCallback(
		(g: GuestCounts) => {
			setGuestsState(g);
			mirrorToUrl(stay, g);
		},
		[stay],
	);

	const seed = useCallback(
		(s: StayValue, g: GuestCounts) => {
			setStayState(s);
			setGuestsState(clampGuests(g, villa.maxGuests, villa.maxAdults));
		},
		[villa.maxGuests, villa.maxAdults],
	);

	const value = useMemo<VillaBookingValue>(() => {
		const tz = siteConfig.timezone;
		const { checkin, checkout } = stay;
		const nights = checkin && checkout ? nightsBetween(checkin, checkout) : 0;
		let status: StayStatus = 'empty';
		let nextFree: VillaBookingValue['nextFree'] = null;
		if (checkin && !checkout) status = 'partial';
		else if (checkin && checkout) {
			if (isLoading && ranges.length === 0) status = 'loading';
			else if (nights < villa.minNights) status = 'short';
			else if (nights > villa.maxNights) status = 'long';
			else if (!fitsStay(ranges, checkin, checkout, tz, villa.stayTimes)) status = 'unavailable';
			else status = 'ok';
			if (status === 'unavailable' || status === 'short') {
				const want = Math.min(Math.max(nights, villa.minNights), villa.maxNights);
				const from = checkin < todayIn(tz) ? todayIn(tz) : checkin;
				nextFree = firstFreeStay(ranges, from, want, tz, villa.stayTimes);
			}
		}
		const freeCancelUntil = checkin && villa.allowCustomerCancel ? lastFreeDay(localAt(checkin, villa.stayTimes.checkIn, tz), villa.cancelGap, tz) : null;
		return {
			villa,
			stay,
			setStay,
			guests,
			setGuests,
			ranges,
			rangesLoading: isLoading,
			rangesError: !!error,
			nights,
			status,
			estimate: stayEstimate(villa.price, nights).base,
			freeCancelUntil,
			nextFree,
			reserveHref: status === 'ok' ? `/reserve/${villa.slug}?${stayQuery(stay, guests)}` : null,
		};
	}, [villa, stay, setStay, guests, setGuests, ranges, isLoading, error]);

	return (
		<BookingContext.Provider value={value}>
			<SeedContext.Provider value={seed}>{children}</SeedContext.Provider>
		</BookingContext.Provider>
	);
}

const SeedContext = createContext<((s: StayValue, g: GuestCounts) => void) | null>(null);

/**
 * Reads the URL once and seeds the booking state. Render it inside a
 * `<Suspense fallback={null}>`: `useSearchParams` on a static page only
 * resolves on the client, and the rest of the page stays prerendered.
 */
export function UrlStaySync() {
	const params = useSearchParams();
	const seed = useContext(SeedContext);
	const done = useRef(false);
	useEffect(() => {
		if (done.current || !seed) return;
		done.current = true;
		const checkin = params.get('checkin');
		const checkout = params.get('checkout');
		const valid = isIsoDate(checkin) && isIsoDate(checkout) && checkout > checkin && checkin >= todayIn(siteConfig.timezone);
		const hasGuests = params.get('adults') !== null || params.get('guests') !== null;
		const guests = guestsFromParams(params);
		if (params.get('adults') === null && params.get('guests') !== null) guests.adults = Math.max(1, Number(params.get('guests')) || DEFAULT_GUESTS.adults);
		if (!valid && !hasGuests) return;
		seed(valid ? { checkin, checkout } : EMPTY_STAY, guests);
	}, [params, seed]);
	return null;
}
