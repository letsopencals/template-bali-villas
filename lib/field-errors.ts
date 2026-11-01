import type { OpencalsApiError } from '@opencals/storefront-sdk';

/**
 * Field validation errors from the API, shown under each form field.
 *
 * A 400 carries `[{ property: 'customer.phone', messages }]` with the full dotted path of the field; our routes
 * pass it on as `fieldErrors`. `mapFieldErrors` keys each entry by the form's own field names: an address field
 * as `billingAddress.<field>` / `deliveryAddress.<field>`, anything else by its last segment (`phone`, `email`,
 * `firstName`). Whatever has no field on the form stays in `unmapped` for the form's general error line.
 */

/** The API's validation errors, as the SDK types them. */
export type ApiFieldErrors = NonNullable<OpencalsApiError['errors']>;

/** Messages by form field key. */
export type FieldErrorMap = Record<string, string[]>;

/** Hint under every phone input, and the client check's message. */
export const PHONE_HINT = 'Include your country code, e.g. +62 812 3456 7890';
export const PHONE_PLACEHOLDER = '+62 812 3456 7890';

/** The client-side phone check: empty is fine (the field may be optional), otherwise it starts with `+`. */
export function phoneProblem(phone: string): string | null {
	const v = phone.trim();
	return v && !v.startsWith('+') ? PHONE_HINT : null;
}

const ADDRESS_GROUPS = new Set(['billingAddress', 'deliveryAddress']);

/** The form key for an API path: `customer.billingAddress.city` → `billingAddress.city`, `customer.phone` → `phone`. */
export function fieldKey(property: string): string {
	const parts = property.split('.');
	for (let i = parts.length - 2; i >= 0; i--) {
		if (ADDRESS_GROUPS.has(parts[i]!)) return parts.slice(i).join('.');
	}
	return parts[parts.length - 1] ?? property;
}

/** Reads `fieldErrors` from a route's JSON error body; anything malformed is dropped. */
export function readFieldErrors(body: unknown): ApiFieldErrors {
	const list = (body as { fieldErrors?: unknown } | null)?.fieldErrors;
	if (!Array.isArray(list)) return [];
	return list.filter(
		(e): e is ApiFieldErrors[number] =>
			!!e && typeof e === 'object' && typeof (e as { property?: unknown }).property === 'string' && Array.isArray((e as { messages?: unknown }).messages),
	);
}

/** Splits the API's errors into those the form shows under a field (`fields`) and the rest. */
export function mapFieldErrors(list: ApiFieldErrors, fields: readonly string[]): { byField: FieldErrorMap; unmapped: string[] } {
	const byField: FieldErrorMap = {};
	const unmapped: string[] = [];
	for (const { property, messages } of list) {
		const key = fieldKey(property);
		const text = messages.filter((m) => typeof m === 'string' && m.trim());
		if (fields.includes(key)) byField[key] = [...(byField[key] ?? []), ...text];
		else unmapped.push(...text);
	}
	return { byField, unmapped };
}

/** A copy of `map` without `key` (the same object when there was nothing to clear). */
export function withoutField(map: FieldErrorMap, key: string): FieldErrorMap {
	if (!(key in map)) return map;
	const next = { ...map };
	delete next[key];
	return next;
}
