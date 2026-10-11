import moment from 'moment-timezone';

/**
 * Pure helpers for nightly villa stays.
 *
 * Model (see CLAUDE.md "Stays"): a villa is one product with a 1-day base
 * duration (86400 s), `allowCustomDuration`, and fixed check-in/check-out
 * times (`fixedTimes`, e.g. 15:00 and 11:00 in the store timezone) on a
 * continuous schedule. A stay of N nights runs from check-in day at 15:00 to
 * check-out day at 11:00, which is (N−1)·24h + 20h. The backend prices it as
 * ceil(booked / 24h) × rate = N × the nightly rate, and same-day turnover never
 * overlaps (out 11:00, in 15:00).
 *
 * Dates named `*Date` / `checkin` / `checkout` are local calendar dates
 * `YYYY-MM-DD` in the store timezone. Availability ranges are the SDK's
 * merged `CurrentAvailabilitySlot`s (UTC `fromDate`/`fromTime`/`toDate`/`toTime`).
 *
 * CONTRACT FILE: owned by the lead. The signatures are stable; agents call them.
 */

export interface AvailabilityRange {
	fromDate: string;
	fromTime: string;
	toDate: string;
	toTime: string;
}

/** Time part of the appointment slot (all UTC), spread into `/api/reserve`. */
export interface StaySlotTimes {
	fromDate: string;
	fromTime: string;
	toDate: string;
	toTime: string;
}

/** Check-in/out times as 'HH:mm' or 'HH:mm:ss' (from product.fixedStartTime/fixedEndTime). */
export interface StayTimes {
	checkIn: string;
	checkOut: string;
}

export const DEFAULT_STAY_TIMES: StayTimes = { checkIn: '15:00', checkOut: '11:00' };

const DAY_MS = 86_400_000;
const SEAM_TOLERANCE_MS = 1_000;
const DATE_FORMAT = 'YYYY-MM-DD';

interface Interval {
	start: number;
	end: number;
}

/** Product fixed times → StayTimes, falling back to 15:00 / 11:00. */
export function stayTimesFor(product: { fixedTimes?: boolean | null; fixedStartTime?: string | null; fixedEndTime?: string | null } | null | undefined): StayTimes {
	if (product?.fixedTimes && product.fixedStartTime && product.fixedEndTime) {
		return { checkIn: product.fixedStartTime.slice(0, 5), checkOut: product.fixedEndTime.slice(0, 5) };
	}
	return DEFAULT_STAY_TIMES;
}

/** Epoch ms of `date` at local `time` ('HH:mm[:ss]') in `tz`. */
export function localAt(date: string, time: string, tz: string): number {
	return moment.tz(`${date} ${time.length === 5 ? `${time}:00` : time}`, `${DATE_FORMAT} HH:mm:ss`, true, tz).valueOf();
}

// The calendar calls the helpers once per day cell with the same ranges array, so merges
// are cached by array identity. Callers must not mutate a ranges array after passing it in.
const mergeCache = new WeakMap<readonly AvailabilityRange[], Interval[]>();

/** Sorted, seam-merged intervals (epoch ms) from raw ranges. Treat the result as read-only. */
export function mergeRanges(ranges: readonly AvailabilityRange[]): Interval[] {
	const cached = mergeCache.get(ranges);
	if (cached) return cached;
	const sorted = ranges
		.map((r) => ({ start: Date.parse(`${r.fromDate}T${r.fromTime}Z`), end: Date.parse(`${r.toDate}T${r.toTime}Z`) }))
		.filter((r) => Number.isFinite(r.start) && Number.isFinite(r.end) && r.end > r.start)
		.sort((a, b) => a.start - b.start);
	const out: Interval[] = [];
	for (const r of sorted) {
		const last = out[out.length - 1];
		if (last && r.start <= last.end + SEAM_TOLERANCE_MS) last.end = Math.max(last.end, r.end);
		else out.push({ ...r });
	}
	mergeCache.set(ranges, out);
	return out;
}

function fits(merged: readonly Interval[], start: number, end: number): boolean {
	return Number.isFinite(start) && Number.isFinite(end) && end > start && merged.some((r) => r.start <= start && r.end >= end);
}

/** `date` plus `n` days (calendar maths, timezone-free). */
export function addDays(date: string, n: number): string {
	return moment.utc(date, DATE_FORMAT, true).add(n, 'day').format(DATE_FORMAT);
}

/** Nights between check-in and check-out dates (0 if not after). */
export function nightsBetween(checkin: string, checkout: string): number {
	const a = Date.parse(`${checkin}T12:00:00Z`);
	const b = Date.parse(`${checkout}T12:00:00Z`);
	if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
	return Math.max(0, Math.round((b - a) / DAY_MS));
}

/** UTC start/end of a stay (check-in day at checkIn → check-out day at checkOut). */
export function stayBounds(checkin: string, checkout: string, tz: string, times: StayTimes = DEFAULT_STAY_TIMES): Interval {
	return { start: localAt(checkin, times.checkIn, tz), end: localAt(checkout, times.checkOut, tz) };
}

/** True when the night starting on `date` (date checkIn → date+1 checkOut) is free. */
export function isNightAvailable(ranges: readonly AvailabilityRange[], date: string, tz: string, times: StayTimes = DEFAULT_STAY_TIMES): boolean {
	const { start, end } = stayBounds(date, addDays(date, 1), tz, times);
	return fits(mergeRanges(ranges), start, end);
}

/** True when the whole stay fits inside ONE merged range (client mirror; the server re-validates). */
export function fitsStay(ranges: readonly AvailabilityRange[], checkin: string, checkout: string, tz: string, times: StayTimes = DEFAULT_STAY_TIMES): boolean {
	if (nightsBetween(checkin, checkout) < 1) return false;
	const { start, end } = stayBounds(checkin, checkout, tz, times);
	return fits(mergeRanges(ranges), start, end);
}

/**
 * Latest check-out date reachable from `checkin` without crossing a booking,
 * capped at `maxNights`. Null if the first night isn't free. Use it to grey out
 * check-out dates in the calendar.
 */
export function latestCheckout(
	ranges: readonly AvailabilityRange[],
	checkin: string,
	tz: string,
	times: StayTimes = DEFAULT_STAY_TIMES,
	maxNights = 21,
): string | null {
	const merged = mergeRanges(ranges);
	let nights = 0;
	while (nights < maxNights) {
		const { start, end } = stayBounds(checkin, addDays(checkin, nights + 1), tz, times);
		if (!fits(merged, start, end)) break;
		nights += 1;
	}
	return nights >= 1 ? addDays(checkin, nights) : null;
}

/**
 * First stay of `nights` nights starting on or after `fromDate` (within `horizonDays`),
 * e.g. for "Next free: 14–17 Nov". Null if none.
 */
export function firstFreeStay(
	ranges: readonly AvailabilityRange[],
	fromDate: string,
	nights: number,
	tz: string,
	times: StayTimes = DEFAULT_STAY_TIMES,
	horizonDays = 120,
): { checkin: string; checkout: string } | null {
	const merged = mergeRanges(ranges);
	for (let i = 0; i <= horizonDays; i += 1) {
		const checkin = addDays(fromDate, i);
		const checkout = addDays(checkin, nights);
		const { start, end } = stayBounds(checkin, checkout, tz, times);
		if (fits(merged, start, end)) return { checkin, checkout };
	}
	return null;
}

/**
 * The time part of the appointment slot in UTC. Spread it into the slot:
 * `{ productId, ...toStaySlot(checkin, checkout, tz, times), staffMemberId: null, locationId }`.
 *
 * @example toStaySlot('2026-11-14', '2026-11-17', 'Asia/Makassar')
 * // { fromDate: '2026-11-14', fromTime: '07:00:00', toDate: '2026-11-17', toTime: '03:00:00' }
 */
export function toStaySlot(checkin: string, checkout: string, tz: string, times: StayTimes = DEFAULT_STAY_TIMES): StaySlotTimes {
	const { start, end } = stayBounds(checkin, checkout, tz, times);
	const from = moment.utc(start);
	const to = moment.utc(end);
	return {
		fromDate: from.format(DATE_FORMAT),
		fromTime: from.format('HH:mm:ss'),
		toDate: to.format(DATE_FORMAT),
		toTime: to.format('HH:mm:ss'),
	};
}

/** Inverse of toStaySlot for display: appointment UTC from/to → local check-in/check-out dates. */
export function fromStaySlot(fromIso: string, toIso: string, tz: string): { checkin: string; checkout: string; nights: number } {
	const checkin = moment.tz(fromIso, tz).format(DATE_FORMAT);
	const checkout = moment.tz(toIso, tz).format(DATE_FORMAT);
	return { checkin, checkout, nights: nightsBetween(checkin, checkout) };
}

/** Preview only: nights × rate. The cart total from the API is the source of truth. */
export function stayEstimate(nightlyRate: number, nights: number): { nights: number; base: number } {
	const n = Math.max(0, Math.floor(nights));
	return { nights: n, base: nightlyRate * n };
}

/** Last date a stay can be cancelled for free (check-in date minus the cancel gap). */
export function freeCancellationUntil(checkin: string, cancelGapSeconds: number | null | undefined): string | null {
	if (!cancelGapSeconds || cancelGapSeconds <= 0) return null;
	return addDays(checkin, -Math.ceil(cancelGapSeconds / 86400));
}

/** Today's date in `tz`. */
export function todayIn(tz: string): string {
	return moment.tz(tz).format(DATE_FORMAT);
}
