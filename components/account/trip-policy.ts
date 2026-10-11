import moment from 'moment-timezone';
import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { addDays } from '@/lib/stay';
import { siteConfig } from '@/lib/site-config';
import type { Trip } from '@/components/account/trip-model';

/**
 * Last local date on which the guest can act online for the whole day, given
 * check-in at `startsAt` (UTC ms) and a gap in seconds before it. The backend
 * closes at the exact instant `startsAt - gap`; showing "until <that date>"
 * would promise the rest of that day, so the copy (and the button) use the day
 * before the cutoff. Conservative by under a day, and both always agree.
 * Null when there's no gap.
 */
export function lastFreeDay(startsAt: number, gapSeconds: number | null | undefined, tz: string = siteConfig.timezone): string | null {
	if (!gapSeconds || gapSeconds <= 0 || !Number.isFinite(startsAt)) return null;
	const cutoffDate = moment.tz(startsAt - gapSeconds * 1000, tz).format('YYYY-MM-DD');
	return addDays(cutoffDate, -1);
}

/** Today in `tz` at `now`. */
function localDay(now: number, tz: string): string {
	return moment.tz(now, tz).format('YYYY-MM-DD');
}

/**
 * What the guest may do with a trip online. Mirrors the backend's own checks
 * (allowCustomerCancel / allowCustomerReschedule, cancelGap / rescheduleGap
 * before check-in) so we can explain a "no" instead of showing a button that
 * fails. The backend re-checks on every request.
 */
export interface TripPolicy {
	canCancel: boolean;
	/** Why cancelling online isn't possible (null when it is). */
	cancelReason: string | null;
	/**
	 * Last local date to cancel online, all day (see `lastFreeDay`). `canCancel`
	 * is true exactly while today is on or before it. Null without a gap.
	 */
	cancelUntil: string | null;
	canReschedule: boolean;
	rescheduleReason: string | null;
	/** Same rule as `cancelUntil`, for the reschedule gap. */
	rescheduleUntil: string | null;
}

export function tripPolicy(appointment: AppointmentDetailResponse, trip: Trip, now: number = Date.now(), tz: string = siteConfig.timezone): TripPolicy {
	const p = appointment.product;
	const active = trip.phase === 'upcoming';
	const cancelGap = Math.max(0, p?.cancelGap ?? 0);
	const rescheduleGap = Math.max(0, p?.rescheduleGap ?? 0);
	const cancelUntil = lastFreeDay(trip.startsAt, cancelGap, tz);
	const rescheduleUntil = lastFreeDay(trip.startsAt, rescheduleGap, tz);
	const today = localDay(now, tz);
	// Open while today is on or before the "until" date; without a gap, until check-in.
	const open = (until: string | null) => (until ? today <= until : trip.startsAt > now);

	const closed = trip.phase === 'cancelled' ? 'This stay is cancelled.' : trip.phase === 'past' ? 'This stay is over.' : 'Your stay has already started.';

	let cancelReason: string | null = null;
	if (!active) cancelReason = closed;
	else if (!p?.allowCustomerCancel) cancelReason = 'This villa can’t be cancelled online. Message us and we’ll sort it out together.';
	else if (!open(cancelUntil))
		cancelReason = `Online cancellation closed ${cancelGap >= 86400 ? `${Math.ceil(cancelGap / 86400)} days` : 'shortly'} before check-in. Message us and we’ll see what we can do.`;

	let rescheduleReason: string | null = null;
	if (!active) rescheduleReason = closed;
	else if (!p?.allowCustomerReschedule) rescheduleReason = 'Date changes for this villa are arranged with us directly.';
	else if (!open(rescheduleUntil)) rescheduleReason = 'It’s too close to check-in to change dates online. Message us instead.';

	return {
		canCancel: cancelReason === null,
		cancelReason,
		cancelUntil,
		canReschedule: rescheduleReason === null,
		rescheduleReason,
		rescheduleUntil,
	};
}
