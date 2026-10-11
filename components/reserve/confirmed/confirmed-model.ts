import type { OrderDetailResponse } from '@opencals/storefront-sdk';
import { fromStaySlot } from '@/lib/stay';
import { siteConfig } from '@/lib/site-config';
import type { GuestCounts } from '@/components/stay/guest-picker';

/** One confirmed villa stay, flattened from an order line item. */
export interface ConfirmedStay {
	appointmentId: string;
	villaTitle: string;
	villaSlug: string;
	villaImage: string | null;
	/** Local YYYY-MM-DD in the store timezone. */
	checkin: string;
	checkout: string;
	nights: number;
	/** UTC instants of the slot (check-in and check-out times). */
	from: string;
	to: string;
	checkInTime: string;
	checkOutTime: string;
	guests: GuestCounts;
	arrivalTime: string | null;
	flightNumber: string | null;
	occasion: string | null;
	addOns: Array<{ id: string; title: string; quantity: number; amount: number }>;
}

const hhmm = (t: string | null | undefined, fallback: string) => (t && /^\d{2}:\d{2}/.test(t) ? t.slice(0, 5) : fallback);

function count(v: unknown, fallback: number): number {
	const n = typeof v === 'string' ? Number(v) : NaN;
	return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

function text(v: unknown): string | null {
	return typeof v === 'string' && v.trim() ? v.trim() : null;
}

export function toConfirmedStays(order: OrderDetailResponse): ConfirmedStay[] {
	const keys = siteConfig.customAttributeKeys;
	const out: ConfirmedStay[] = [];
	for (const li of order.lineItems ?? []) {
		const a = li.appointment;
		if (!a) continue;
		const attrs = (a.customAttributes ?? {}) as Record<string, unknown>;
		const { checkin, checkout, nights } = fromStaySlot(a.from, a.to, siteConfig.timezone);
		out.push({
			appointmentId: a.id,
			villaTitle: a.product?.title ?? a.name,
			villaSlug: a.product?.slug ?? '',
			villaImage: a.product?.image?.url ?? null,
			checkin,
			checkout,
			nights,
			from: a.from,
			to: a.to,
			checkInTime: hhmm(a.product?.fixedTimes ? a.product.fixedStartTime : null, siteConfig.stay.checkIn),
			checkOutTime: hhmm(a.product?.fixedTimes ? a.product.fixedEndTime : null, siteConfig.stay.checkOut),
			guests: {
				adults: count(attrs[keys.adults], Math.max(1, a.numberOfAttendees ?? 1)),
				children: count(attrs[keys.children], 0),
				infants: count(attrs[keys.infants], 0),
			},
			arrivalTime: text(attrs[keys.arrivalTime]),
			flightNumber: text(attrs[keys.flightNumber]),
			occasion: text(attrs[keys.occasion]),
			addOns: (li.addOnLineItems ?? []).map((x) => ({ id: x.id, title: x.addOn?.title ?? 'Extra', quantity: x.quantity, amount: x.originalSubtotal })),
		});
	}
	return out;
}

/** True when any add-on on the order looks like the airport transfer. */
export function hasTransfer(stays: readonly ConfirmedStay[]): boolean {
	return stays.some((s) => s.addOns.some((a) => /transfer|airport|pick-?up/i.test(a.title)));
}
