import { siteConfig } from '@/lib/site-config';

/*
 * Guest counts: pure helpers shared by the server (reserve page, /api/reserve) and
 * the client picker. Keep this file free of 'use client' so server code can call it;
 * components/stay/guest-picker.tsx re-exports everything here.
 */

export interface GuestCounts {
	adults: number;
	children: number;
	infants: number;
}

export const DEFAULT_GUESTS: GuestCounts = { adults: 2, children: 0, infants: 0 };

/** Infants (under 2) sleep in a cot and don't count toward maxGuests. */
export const MAX_INFANTS = 2;

/** "2 adults, 1 child" (infants appended when present). */
export function formatGuests(g: GuestCounts): string {
	const parts = [`${g.adults} ${g.adults === 1 ? 'adult' : 'adults'}`];
	if (g.children > 0) parts.push(`${g.children} ${g.children === 1 ? 'child' : 'children'}`);
	if (g.infants > 0) parts.push(`${g.infants} ${g.infants === 1 ? 'infant' : 'infants'}`);
	return parts.join(', ');
}

/** Clamp counts to a villa's limits (e.g. after switching villa). */
export function clampGuests(g: GuestCounts, maxGuests: number, maxAdults = maxGuests): GuestCounts {
	const adults = Math.max(1, Math.min(g.adults, maxAdults, maxGuests));
	const children = Math.max(0, Math.min(g.children, maxGuests - adults));
	const infants = Math.max(0, Math.min(g.infants, MAX_INFANTS));
	return { adults, children, infants };
}

/** Guest counts as appointment custom attributes (strings, siteConfig.customAttributeKeys). */
export function guestsToAttributes(g: GuestCounts): Record<string, string> {
	const k = siteConfig.customAttributeKeys;
	return { [k.adults]: String(g.adults), [k.children]: String(g.children), [k.infants]: String(g.infants) };
}

/** Parse ?adults=&children=&infants= (falls back to DEFAULT_GUESTS). */
export function guestsFromParams(params: { get(name: string): string | null } | URLSearchParams): GuestCounts {
	const n = (key: string, fallback: number) => {
		const v = Number(params.get(key));
		return Number.isFinite(v) && v >= 0 && params.get(key) !== null ? Math.floor(v) : fallback;
	};
	return { adults: Math.max(1, n('adults', DEFAULT_GUESTS.adults)), children: n('children', 0), infants: n('infants', 0) };
}
