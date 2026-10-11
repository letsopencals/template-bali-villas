import type { BillingAddress, ExistingOrderCustomer, MarketingConsentInput, NewOrderCustomer } from '@opencals/storefront-sdk';

/**
 * Delivery address on the checkout customer. The backend (`AddressDto`) accepts
 * it on start/submit, but the pinned SDK 0.3.14 types predate the field, hence
 * the widened type and the cast at the call site.
 */
export interface DeliveryAddressInput {
	firstName?: string;
	lastName?: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	/** ISO 3166-1 alpha-2, uppercase. */
	country?: string;
	phone?: string;
	email?: string;
}

export type CheckoutCustomer = (ExistingOrderCustomer | NewOrderCustomer) & {
	deliveryAddress?: DeliveryAddressInput;
};

const ADDRESS_KEYS = [
	'firstName',
	'lastName',
	'addressLine1',
	'addressLine2',
	'city',
	'state',
	'postalCode',
	'country',
	'phone',
	'email',
] as const;

function str(v: unknown): string | undefined {
	return typeof v === 'string' && v.trim() ? v.trim().slice(0, 255) : undefined;
}

function sanitizeAddress(input: unknown): DeliveryAddressInput | null {
	if (!input || typeof input !== 'object') return null;
	const src = input as Record<string, unknown>;
	const out: DeliveryAddressInput = {};
	for (const key of ADDRESS_KEYS) {
		const v = str(src[key]);
		if (v) out[key] = v;
	}
	if (out.country) out.country = out.country.toUpperCase();
	return out.addressLine1 || out.city ? out : null;
}

const BILLING_KEYS = [
	'firstName',
	'lastName',
	'companyName',
	'taxRegistrationId',
	'addressLine1',
	'addressLine2',
	'city',
	'state',
	'postalCode',
	'country',
	'phone',
	'email',
] as const;

/** Billing address (and company / VAT): known string keys only; null when nothing useful was entered. */
function sanitizeBilling(input: unknown): BillingAddress | null {
	if (!input || typeof input !== 'object') return null;
	const src = input as Record<string, unknown>;
	const out: BillingAddress = {};
	for (const key of BILLING_KEYS) {
		const v = str(src[key]);
		if (v) out[key] = v;
	}
	if (out.country) {
		out.country = out.country.toUpperCase();
		if (!/^[A-Z]{2}$/.test(out.country)) delete out.country;
	}
	return out.addressLine1 || out.city || out.companyName || out.taxRegistrationId ? out : null;
}

/**
 * Marketing opt-ins: booleans only, for the channels the client sent. The
 * client only sends channels the store's checkout settings show, so an absent
 * channel leaves the customer's existing consent untouched.
 */
function sanitizeConsent(input: unknown): MarketingConsentInput | null {
	if (!input || typeof input !== 'object') return null;
	const src = input as Record<string, unknown>;
	const out: MarketingConsentInput = {};
	for (const key of ['email', 'sms', 'whatsapp'] as const) {
		if (typeof src[key] === 'boolean') out[key] = src[key];
	}
	return Object.keys(out).length > 0 ? out : null;
}

/**
 * Normalises the template's client payload into the SDK customer union:
 *   { customerId, email?, phone? } | { email, firstName?, lastName?, phone? }
 * plus an optional top-level `deliveryAddress`, which is nested into the customer,
 * and optional `customer.billingAddress` / `customer.marketingConsent` (sanitised).
 *
 * `customerId` is forwarded only when it equals the signed-in session's customer
 * id (`sessionCustomerId`). Anything else is treated as a new guest by email, so a
 * client can't attach a booking to, or get tokens for, someone else's account.
 * Returns undefined when there's nothing to send (the cart already has its customer).
 */
export function toCheckoutCustomer(
	customer: unknown,
	deliveryAddress: unknown,
	sessionCustomerId: string | null | undefined,
): CheckoutCustomer | undefined {
	const address = sanitizeAddress(deliveryAddress);
	const c = (customer && typeof customer === 'object' ? customer : null) as Record<string, unknown> | null;
	if (!c) return undefined;

	const phone = str(c.phone);
	const billingAddress = sanitizeBilling(c.billingAddress);
	const marketingConsent = sanitizeConsent(c.marketingConsent);
	const names = {
		...(str(c.firstName) ? { firstName: str(c.firstName) } : {}),
		...(str(c.lastName) ? { lastName: str(c.lastName) } : {}),
	};
	const extra = {
		...(phone ? { phone } : {}),
		...(address ? { deliveryAddress: address } : {}),
		...(billingAddress ? { billingAddress } : {}),
		...(marketingConsent ? { marketingConsent } : {}),
	};

	const customerId = str(c.customerId);
	if (customerId && sessionCustomerId && customerId === sessionCustomerId) {
		return { customerId, ...names, ...extra };
	}
	const email = str(c.email);
	if (!email || !EMAIL_RE.test(email)) return undefined;
	// Cast: the backend DTO has `externalId` optional (@IsOptional), but the SDK
	// types mark it required. No externalId is sent: the backend matches by email.
	return { email, ...names, ...extra } as NewOrderCustomer & { deliveryAddress?: DeliveryAddressInput };
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
