import { describe, expect, it } from 'vitest';
import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { localAt } from '@/lib/stay';
import type { Trip } from '@/components/account/trip-model';
import { lastFreeDay, tripPolicy } from './trip-policy';

const TZ = 'Asia/Makassar'; // UTC+8, no DST
const DAY = 86400;

describe('lastFreeDay', () => {
	it('is the day before the cutoff date', () => {
		const startsAt = localAt('2026-11-07', '15:00', TZ);
		// 7 days before 7 Nov 15:00 is 31 Oct 15:00 → whole days through 30 Oct.
		expect(lastFreeDay(startsAt, 7 * DAY, TZ)).toBe('2026-10-30');
		// 15 h before 7 Nov 15:00 is 7 Nov 00:00 → through 6 Nov.
		expect(lastFreeDay(startsAt, 15 * 3600, TZ)).toBe('2026-11-06');
	});
	it('is null without a gap', () => {
		expect(lastFreeDay(Date.now(), 0, TZ)).toBeNull();
		expect(lastFreeDay(Date.now(), null, TZ)).toBeNull();
	});
});

describe('tripPolicy', () => {
	const startsAt = localAt('2026-11-07', '15:00', TZ);
	const trip = { phase: 'upcoming', startsAt, checkin: '2026-11-07' } as Trip;
	const appt = {
		product: { allowCustomerCancel: true, cancelGap: 7 * DAY, allowCustomerReschedule: true, rescheduleGap: 7 * DAY },
	} as unknown as AppointmentDetailResponse;

	it('allows cancelling through the whole "until" day', () => {
		const lateOnUntilDay = localAt('2026-10-30', '23:30', TZ);
		const p = tripPolicy(appt, trip, lateOnUntilDay, TZ);
		expect(p.cancelUntil).toBe('2026-10-30');
		expect(p.canCancel).toBe(true);
		expect(p.canReschedule).toBe(true);
	});
	it('closes the day after, even before the exact backend cutoff', () => {
		const morningOfCutoff = localAt('2026-10-31', '09:00', TZ);
		const p = tripPolicy(appt, trip, morningOfCutoff, TZ);
		expect(p.canCancel).toBe(false);
		expect(p.cancelReason).toMatch(/7 days/);
		expect(p.canReschedule).toBe(false);
	});
	it('without a gap stays open until check-in', () => {
		const noGap = { product: { allowCustomerCancel: true, cancelGap: 0 } } as unknown as AppointmentDetailResponse;
		expect(tripPolicy(noGap, trip, startsAt - 1000, TZ).canCancel).toBe(true);
		expect(tripPolicy(noGap, trip, startsAt - 1000, TZ).cancelUntil).toBeNull();
	});
});
