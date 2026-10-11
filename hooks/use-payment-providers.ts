'use client';

import useSWR from 'swr';
import type { CustomerProviderCatalogItem } from '@opencals/storefront-sdk';

export interface PaymentProvidersState {
	providers: CustomerProviderCatalogItem[];
	/** True once a response (or a failure) has come back for the current key. */
	loaded: boolean;
	/** The request failed (network or non-2xx), as opposed to an empty list. */
	failed: boolean;
	retry(): void;
}

async function fetchProviders([url, id]: readonly [string, string | null, number | null]): Promise<CustomerProviderCatalogItem[]> {
	const res = await fetch(url, id ? { headers: { 'X-Cart-Id': id } } : undefined);
	if (!res.ok) throw new Error('Could not load payment options');
	const data: unknown = await res.json();
	return Array.isArray(data) ? (data as CustomerProviderCatalogItem[]) : [];
}

/**
 * Payment providers for the current cart. Cart-aware: a fully discounted /
 * sub-minimum cart comes back as a single `no_payment_required` provider, so
 * the key includes the cart id and revalidates once the cart exists. The cart
 * total is in the key too, so a promo code that changes the amount (e.g. to
 * $0) re-fetches the list. A failed request is reported as `failed`, not as
 * an empty list, so the UI can offer a retry.
 */
export function usePaymentProviders(cartId: string | null, total?: number | null): PaymentProvidersState {
	const { data, error, mutate } = useSWR(['/api/payment/providers', cartId, total ?? null] as const, fetchProviders, {
		revalidateOnFocus: false,
		shouldRetryOnError: false,
	});
	return {
		providers: Array.isArray(data) ? data : [],
		loaded: data !== undefined || error !== undefined,
		failed: error !== undefined,
		retry: () => void mutate(),
	};
}
