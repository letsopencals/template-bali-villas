import { describe, expect, it } from 'vitest';
import { clampInt, guestLimitError, isRealDate, nonNegativeInt, parsePaging, safeCallback, sanitizeAddOns, shortString } from './guards';

describe('isRealDate', () => {
	it('accepts real dates', () => {
		expect(isRealDate('2026-02-28')).toBe(true);
		expect(isRealDate('2028-02-29')).toBe(true);
	});
	it('rejects impossible or malformed dates', () => {
		expect(isRealDate('2026-02-30')).toBe(false);
		expect(isRealDate('2026-02-29')).toBe(false);
		expect(isRealDate('2026-13-01')).toBe(false);
		expect(isRealDate('2026-1-01')).toBe(false);
		expect(isRealDate(20260101)).toBe(false);
	});
});

describe('clampInt / parsePaging', () => {
	it('clamps and falls back on NaN', () => {
		expect(clampInt('5', 1, 10, 3)).toBe(5);
		expect(clampInt('500', 1, 10, 3)).toBe(10);
		expect(clampInt('-2', 1, 10, 3)).toBe(1);
		expect(clampInt('abc', 1, 10, 3)).toBe(3);
		expect(clampInt(null, 1, 10, 3)).toBe(3);
		expect(clampInt('2.9', 1, 10, 3)).toBe(2);
	});
	it('defaults take and page', () => {
		expect(parsePaging(new URLSearchParams(''))).toEqual({ take: 20, page: 1 });
		expect(parsePaging(new URLSearchParams('take=9999&page=0'))).toEqual({ take: 50, page: 1 });
		expect(parsePaging(new URLSearchParams('take=NaN&page=x'))).toEqual({ take: 20, page: 1 });
	});
});

describe('nonNegativeInt', () => {
	it('accepts integers and digit strings only', () => {
		expect(nonNegativeInt(2)).toBe(2);
		expect(nonNegativeInt('3')).toBe(3);
		expect(nonNegativeInt(-1)).toBeNull();
		expect(nonNegativeInt(1.5)).toBeNull();
		expect(nonNegativeInt('1.5')).toBeNull();
		expect(nonNegativeInt('1e2')).toBeNull();
	});
});

describe('guestLimitError', () => {
	const villa = { maxGuests: 4, maxAdults: 2 };
	it('passes a party that fits', () => {
		expect(guestLimitError({ adults: '2', children: '2', infants: '1' }, villa)).toBeNull();
		expect(guestLimitError({}, villa)).toBeNull();
	});
	it('rejects over-limit parties', () => {
		expect(guestLimitError({ adults: '3' }, villa)).toMatch(/2 adults/);
		expect(guestLimitError({ adults: '2', children: '3' }, villa)).toMatch(/4 guests/);
		expect(guestLimitError({ adults: '1', infants: '3' }, villa)).toMatch(/cots/);
	});
	it('rejects non-integers and zero adults', () => {
		expect(guestLimitError({ adults: '1.5' }, villa)).toMatch(/whole numbers/);
		expect(guestLimitError({ adults: '-1' }, villa)).toMatch(/whole numbers/);
		expect(guestLimitError({ adults: '0' }, villa)).toMatch(/one adult/);
	});
});

describe('sanitizeAddOns', () => {
	it('coerces ids, clamps quantity, dedupes', () => {
		expect(
			sanitizeAddOns([{ addOnId: 'a', quantity: 99 }, { addOnId: 7, quantity: 0 }, { addOnId: 'a' }, { addOnId: '' }, null, { addOnId: 'b' }]),
		).toEqual([{ addOnId: 'a', quantity: 20 }, { addOnId: '7', quantity: 1 }, { addOnId: 'b' }]);
		expect(sanitizeAddOns('nope')).toEqual([]);
	});
});

describe('shortString', () => {
	it('keeps short strings only', () => {
		expect(shortString('abc')).toBe('abc');
		expect(shortString('x'.repeat(300))).toBeUndefined();
		expect(shortString({})).toBeUndefined();
	});
});

describe('safeCallback', () => {
	it('keeps same-site paths', () => {
		expect(safeCallback('/account/trips/1?x=1#y')).toBe('/account/trips/1?x=1#y');
	});
	it('rejects other origins and tricks', () => {
		expect(safeCallback('//evil.com')).toBe('/account');
		expect(safeCallback('/\\evil.com')).toBe('/account');
		expect(safeCallback('https://evil.com')).toBe('/account');
		expect(safeCallback('/%5C%5Cevil.com')).toBe('/%5C%5Cevil.com');
		expect(safeCallback(undefined)).toBe('/account');
		expect(safeCallback('account')).toBe('/account');
	});
});
