import { describe, expect, it } from 'vitest';
import moment from 'moment-timezone';
import {
	addDays,
	firstFreeStay,
	fitsStay,
	freeCancellationUntil,
	fromStaySlot,
	isNightAvailable,
	latestCheckout,
	mergeRanges,
	nightsBetween,
	stayEstimate,
	stayTimesFor,
	toStaySlot,
	type AvailabilityRange,
} from '@/lib/stay';

const BALI = 'Asia/Makassar'; // UTC+8, no DST
const LONDON = 'Europe/London'; // BST → GMT on 2026-10-25

/** A merged availability range from local wall times in `tz`. */
function range(from: string, to: string, tz = BALI): AvailabilityRange {
	const a = moment.tz(from, 'YYYY-MM-DD HH:mm', true, tz).utc();
	const b = moment.tz(to, 'YYYY-MM-DD HH:mm', true, tz).utc();
	return { fromDate: a.format('YYYY-MM-DD'), fromTime: a.format('HH:mm:ss'), toDate: b.format('YYYY-MM-DD'), toTime: b.format('HH:mm:ss') };
}

/** UTC-day pieces covering [from, to), as the availability procedure returns them. */
function utcDayPieces(fromIso: string, toIso: string, endStyle: 'midnight' | 'last-second' = 'midnight'): AvailabilityRange[] {
	const out: AvailabilityRange[] = [];
	let cur = moment.utc(fromIso);
	const end = moment.utc(toIso);
	while (cur.isBefore(end)) {
		const dayEnd = moment.min(cur.clone().add(1, 'day').startOf('day'), end);
		const to = endStyle === 'last-second' && dayEnd.isBefore(end) ? dayEnd.clone().subtract(1, 'second') : dayEnd;
		out.push({ fromDate: cur.format('YYYY-MM-DD'), fromTime: cur.format('HH:mm:ss'), toDate: to.format('YYYY-MM-DD'), toTime: to.format('HH:mm:ss') });
		cur = dayEnd;
	}
	return out;
}

/** November 2026 in Bali with one other booking: 16 Nov 15:00 → 18 Nov 11:00. */
const NOV_WITH_BOOKING: AvailabilityRange[] = [range('2026-11-01 00:00', '2026-11-16 15:00'), range('2026-11-18 11:00', '2026-12-31 00:00')];

describe('toStaySlot', () => {
	it('matches the docstring example (Asia/Makassar, 15:00 → 11:00)', () => {
		expect(toStaySlot('2026-11-14', '2026-11-17', BALI)).toEqual({ fromDate: '2026-11-14', fromTime: '07:00:00', toDate: '2026-11-17', toTime: '03:00:00' });
	});

	it('handles the London clock change inside a stay', () => {
		// Check in 24 Oct 15:00 BST (14:00Z), check out 26 Oct 11:00 GMT (11:00Z).
		expect(toStaySlot('2026-10-24', '2026-10-26', LONDON)).toEqual({ fromDate: '2026-10-24', fromTime: '14:00:00', toDate: '2026-10-26', toTime: '11:00:00' });
	});

	it('honours custom stay times (HH:mm:ss from the product)', () => {
		const times = stayTimesFor({ fixedTimes: true, fixedStartTime: '14:00:00', fixedEndTime: '12:00:00' });
		expect(times).toEqual({ checkIn: '14:00', checkOut: '12:00' });
		expect(toStaySlot('2026-11-14', '2026-11-15', BALI, times)).toEqual({ fromDate: '2026-11-14', fromTime: '06:00:00', toDate: '2026-11-15', toTime: '04:00:00' });
	});

	it('round-trips through fromStaySlot', () => {
		const s = toStaySlot('2026-11-14', '2026-11-17', BALI);
		expect(fromStaySlot(`${s.fromDate}T${s.fromTime}Z`, `${s.toDate}T${s.toTime}Z`, BALI)).toEqual({ checkin: '2026-11-14', checkout: '2026-11-17', nights: 3 });
	});
});

describe('stayTimesFor / nightsBetween / addDays', () => {
	it('falls back to 15:00 / 11:00 without fixed times', () => {
		expect(stayTimesFor(null)).toEqual({ checkIn: '15:00', checkOut: '11:00' });
		expect(stayTimesFor({ fixedTimes: false, fixedStartTime: '14:00:00', fixedEndTime: '12:00:00' })).toEqual({ checkIn: '15:00', checkOut: '11:00' });
	});

	it('counts nights across month ends and DST', () => {
		expect(nightsBetween('2026-11-14', '2026-11-17')).toBe(3);
		expect(nightsBetween('2026-10-24', '2026-10-26')).toBe(2);
		expect(nightsBetween('2026-12-30', '2027-01-02')).toBe(3);
		expect(nightsBetween('2026-11-17', '2026-11-14')).toBe(0);
		expect(nightsBetween('nope', '2026-11-14')).toBe(0);
		expect(addDays('2026-02-27', 2)).toBe('2026-03-01');
	});

	it('estimates nights × rate', () => {
		expect(stayEstimate(240, 3)).toEqual({ nights: 3, base: 720 });
	});
});

describe('isNightAvailable', () => {
	it('marks nights free or booked around another booking', () => {
		expect(isNightAvailable(NOV_WITH_BOOKING, '2026-11-15', BALI)).toBe(true); // out 16th 11:00, before they arrive at 15:00
		expect(isNightAvailable(NOV_WITH_BOOKING, '2026-11-16', BALI)).toBe(false);
		expect(isNightAvailable(NOV_WITH_BOOKING, '2026-11-17', BALI)).toBe(false);
		expect(isNightAvailable(NOV_WITH_BOOKING, '2026-11-18', BALI)).toBe(true); // they leave 18th 11:00
	});

	it('joins UTC-day pieces that abut at midnight', () => {
		const pieces = utcDayPieces('2026-11-01T00:00:00Z', '2026-11-30T00:00:00Z');
		expect(pieces.length).toBe(29);
		// 14 Nov 15:00 WITA = 07:00Z → 15 Nov 03:00Z crosses the 15 Nov 00:00Z seam.
		expect(isNightAvailable(pieces, '2026-11-14', BALI)).toBe(true);
		expect(mergeRanges(pieces)).toHaveLength(1);
	});

	it('joins pieces that end at 23:59:59 (1 s seam tolerance)', () => {
		const pieces = utcDayPieces('2026-11-01T00:00:00Z', '2026-11-30T00:00:00Z', 'last-second');
		expect(pieces[0]?.toTime).toBe('23:59:59');
		expect(isNightAvailable(pieces, '2026-11-14', BALI)).toBe(true);
		expect(mergeRanges(pieces)).toHaveLength(1);
	});

	it('does not bridge a real gap at a seam', () => {
		const gap: AvailabilityRange[] = [
			{ fromDate: '2026-11-14', fromTime: '00:00:00', toDate: '2026-11-14', toTime: '23:59:58' },
			{ fromDate: '2026-11-15', fromTime: '00:00:00', toDate: '2026-11-16', toTime: '00:00:00' },
		];
		expect(isNightAvailable(gap, '2026-11-14', BALI)).toBe(false);
	});

	it('applies the store timezone (London, across BST → GMT)', () => {
		const exact = [range('2026-10-24 15:00', '2026-10-26 11:00', LONDON)];
		expect(isNightAvailable(exact, '2026-10-24', LONDON)).toBe(true);
		expect(isNightAvailable(exact, '2026-10-25', LONDON)).toBe(true);
		expect(fitsStay(exact, '2026-10-24', '2026-10-26', LONDON)).toBe(true);
		// The same UTC range read in Bali time doesn't cover a 15:00 → 11:00 night.
		expect(isNightAvailable(exact, '2026-10-24', BALI)).toBe(false);
		// Starting an hour late (16:00 BST) misses the 15:00 check-in.
		const late = [range('2026-10-24 16:00', '2026-10-26 11:00', LONDON)];
		expect(isNightAvailable(late, '2026-10-24', LONDON)).toBe(false);
	});
});

describe('fitsStay', () => {
	it('allows same-day turnover on both ends', () => {
		expect(fitsStay(NOV_WITH_BOOKING, '2026-11-13', '2026-11-16', BALI)).toBe(true);
		expect(fitsStay(NOV_WITH_BOOKING, '2026-11-18', '2026-11-21', BALI)).toBe(true);
	});

	it('rejects stays that cross a booking or have no nights', () => {
		expect(fitsStay(NOV_WITH_BOOKING, '2026-11-14', '2026-11-17', BALI)).toBe(false);
		expect(fitsStay(NOV_WITH_BOOKING, '2026-11-14', '2026-11-14', BALI)).toBe(false);
	});
});

describe('latestCheckout', () => {
	it('stops at the next booking (check-out on their arrival day)', () => {
		expect(latestCheckout(NOV_WITH_BOOKING, '2026-11-12', BALI)).toBe('2026-11-16');
		expect(latestCheckout(NOV_WITH_BOOKING, '2026-11-15', BALI)).toBe('2026-11-16');
	});

	it('is null when the first night is booked', () => {
		expect(latestCheckout(NOV_WITH_BOOKING, '2026-11-16', BALI)).toBeNull();
	});

	it('is capped at maxNights', () => {
		expect(latestCheckout(NOV_WITH_BOOKING, '2026-11-18', BALI, undefined, 5)).toBe('2026-11-23');
		expect(latestCheckout(NOV_WITH_BOOKING, '2026-11-01', BALI, undefined, 3)).toBe('2026-11-04');
	});

	it('walks across UTC-day seams', () => {
		const pieces = utcDayPieces('2026-11-01T00:00:00Z', '2026-11-10T07:00:00Z'); // ends 10 Nov 15:00 WITA
		expect(latestCheckout(pieces, '2026-11-03', BALI)).toBe('2026-11-10');
	});
});

describe('firstFreeStay', () => {
	it('finds the first stay of N nights on or after a date', () => {
		expect(firstFreeStay(NOV_WITH_BOOKING, '2026-11-15', 1, BALI)).toEqual({ checkin: '2026-11-15', checkout: '2026-11-16' });
		expect(firstFreeStay(NOV_WITH_BOOKING, '2026-11-15', 2, BALI)).toEqual({ checkin: '2026-11-18', checkout: '2026-11-20' });
		expect(firstFreeStay(NOV_WITH_BOOKING, '2026-11-13', 3, BALI)).toEqual({ checkin: '2026-11-13', checkout: '2026-11-16' });
	});

	it('returns null beyond the horizon or with no availability', () => {
		expect(firstFreeStay([], '2026-11-01', 2, BALI)).toBeNull();
		expect(firstFreeStay(NOV_WITH_BOOKING, '2026-11-15', 2, BALI, undefined, 2)).toBeNull();
	});
});

describe('freeCancellationUntil', () => {
	it('subtracts the cancel gap in whole days', () => {
		expect(freeCancellationUntil('2026-11-14', 14 * 86400)).toBe('2026-10-31');
		expect(freeCancellationUntil('2026-11-14', 36 * 3600)).toBe('2026-11-12');
		expect(freeCancellationUntil('2026-11-14', 0)).toBeNull();
		expect(freeCancellationUntil('2026-11-14', null)).toBeNull();
	});
});
