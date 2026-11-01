import { describe, expect, it } from 'vitest';
import { fieldKey, mapFieldErrors, phoneProblem, readFieldErrors } from './field-errors';

describe('fieldKey', () => {
	it('keys address fields by their group and plain fields by the last segment', () => {
		expect(fieldKey('customer.phone')).toBe('phone');
		expect(fieldKey('phone')).toBe('phone');
		expect(fieldKey('customer.billingAddress.postalCode')).toBe('billingAddress.postalCode');
		expect(fieldKey('billingAddress.phone')).toBe('billingAddress.phone');
		expect(fieldKey('customer.deliveryAddress.city')).toBe('deliveryAddress.city');
	});
});

describe('mapFieldErrors', () => {
	it('puts messages under known fields and keeps the rest', () => {
		const { byField, unmapped } = mapFieldErrors(
			[
				{ property: 'customer.phone', messages: ['Enter the phone number with its country code, e.g. +44 7911 123456'] },
				{ property: 'customer.billingAddress.phone', messages: ['Billing phone'] },
				{ property: 'answers.0.answer', messages: ['Answer this'] },
			],
			['phone', 'email'],
		);
		expect(byField).toEqual({ phone: ['Enter the phone number with its country code, e.g. +44 7911 123456'] });
		expect(unmapped).toEqual(['Billing phone', 'Answer this']);
	});
});

describe('readFieldErrors / phoneProblem', () => {
	it('reads only well-formed entries', () => {
		expect(readFieldErrors({ fieldErrors: [{ property: 'phone', messages: ['x'] }, { property: 1 }] })).toEqual([{ property: 'phone', messages: ['x'] }]);
		expect(readFieldErrors(null)).toEqual([]);
	});
	it('asks for a country code only when a number was typed without one', () => {
		expect(phoneProblem('')).toBeNull();
		expect(phoneProblem('+62 812 3456 7890')).toBeNull();
		expect(phoneProblem('0812 3456 7890')).toMatch(/country code/);
	});
});
