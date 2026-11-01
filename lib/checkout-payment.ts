import type { CustomerProviderCatalogItem, PaymentInstructions } from '@opencals/storefront-sdk';

/**
 * Checkout helpers for `/reserve/[slug]` and `/reserve/confirmed/[id]`: how a
 * payment method is paid, the error shape of `/api/checkout/*`, and the
 * payment instructions handed from checkout to the confirmation page.
 */

export type CheckoutMode = CustomerProviderCatalogItem['checkoutMode'];
export type ProviderName = CustomerProviderCatalogItem['name'];

const PAY_LATER = new Set<ProviderName>(['cash', 'bank_transfer', 'stripe_invoice']);

/**
 * `internal` mounts a card form, `redirect` leaves for the provider, `manual`
 * (cash, bank transfer, invoice) and `none` (nothing to pay) just confirm.
 * Falls back on the name for catalog entries without a mode.
 */
export function checkoutModeOf(
	provider: (Pick<CustomerProviderCatalogItem, 'name'> & { checkoutMode?: CheckoutMode | null }) | null | undefined,
): CheckoutMode {
	if (provider?.checkoutMode) return provider.checkoutMode;
	if (provider?.name === 'no_payment_required') return 'none';
	if (provider && PAY_LATER.has(provider.name)) return 'manual';
	return 'internal';
}

export function confirmsOnly(mode: CheckoutMode | null): boolean {
	return mode === 'manual' || mode === 'none';
}

/** The store's display name, or "bank_transfer" → "Bank transfer". */
export function providerName(provider: Pick<CustomerProviderCatalogItem, 'name'> & Partial<Pick<CustomerProviderCatalogItem, 'displayName'>>): string {
	const display = provider.displayName?.trim();
	if (display) return display;
	const words = provider.name.replace(/[_-]+/g, ' ').trim();
	return words ? words[0]!.toUpperCase() + words.slice(1) : 'Pay';
}

export interface CheckoutProblem {
	status: number;
	message: string;
	code?: string;
	orderId?: string;
	paymentStatus?: string;
}

/** `{ error, code, orderId, paymentStatus }` from a failed `/api/checkout/*` response. */
export async function readCheckoutProblem(res: Response, fallback: string): Promise<CheckoutProblem> {
	const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
	const text = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
	return {
		status: res.status,
		message: text(body?.error) ?? fallback,
		code: text(body?.code),
		orderId: text(body?.orderId),
		paymentStatus: text(body?.paymentStatus),
	};
}

/* ------------------------------------------------------ payment instructions */

const storageKey = (orderId: string) => `lumbung:pay:${orderId}`;

/** Keeps the submit response's instructions for the confirmation page (this tab only). */
export function keepPaymentInstructions(orderId: string, instructions: PaymentInstructions | null | undefined): void {
	if (!instructions) return;
	try {
		sessionStorage.setItem(storageKey(orderId), JSON.stringify(instructions));
	} catch {
		// Storage blocked: the confirmation page points to the email instead.
	}
}

export function readPaymentInstructions(orderId: string): PaymentInstructions | null {
	try {
		const raw = sessionStorage.getItem(storageKey(orderId));
		const value = raw ? (JSON.parse(raw) as PaymentInstructions) : null;
		return value && typeof value.provider === 'string' ? value : null;
	} catch {
		return null;
	}
}
