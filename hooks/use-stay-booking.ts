'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import type {
	BillingAddress,
	CartResponse,
	CheckoutStartResponse,
	MarketingConsentInput,
	ProductListVariant,
} from '@opencals/storefront-sdk';
import { nightsBetween } from '@/lib/stay';
import { useCart } from '@/contexts/cart-context';
import { useBookingAddOns } from '@/hooks/use-booking-add-ons';
import { buildAnswerPayload, questionsComplete, useCheckoutQuestions } from '@/hooks/use-checkout-questions';
import { useCartExpiry } from '@/hooks/use-cart-expiry';
import { useFileUploads } from '@/hooks/use-file-upload';
import { usePaymentProviders } from '@/hooks/use-payment-providers';

export interface StayBookingInput {
	/** The villa product: `id` books, `slug` keys questions, `variant` keys add-ons. */
	villa: { id: string; slug: string; variant: ProductListVariant | null } | null;
	/**
	 * Local check-in/check-out dates (YYYY-MM-DD, store timezone); null until both
	 * are picked. `/api/reserve` turns them into the UTC slot with `toStaySlot`
	 * and the villa's own check-in/out times. Nights (the base units per-night
	 * add-ons are multiplied by) are derived from them.
	 */
	stay: { checkin: string; checkout: string } | null;
	/** The villa's location (loc-sidemen in the seed). */
	locationId: string | null;
	/**
	 * Guests and arrival details keyed by `siteConfig.customAttributeKeys` values
	 * (adults, children, infants, arrival_time, flight_number, occasion). Empty
	 * values are dropped; `/api/reserve` drops any other key.
	 */
	customAttributes: Record<string, string>;
	/** Called when the server says the dates were taken in the meantime. */
	onSlotUnavailable?: () => void;
	/** Billing address (company / VAT included), sent with checkout start and submit. Omit when the store hides it. */
	billingAddress?: BillingAddress | null;
	/** Marketing opt-ins, only for the channels the store's checkout settings show. */
	marketingConsent?: MarketingConsentInput | null;
}

interface Reservation {
	cart: CartResponse;
	itemId: string | null;
	/** Snapshot of everything sent; a mismatch means the hold is out of date. */
	signature: string;
	/** True when file answers were linked to this booking (re-creating it needs fresh uploads). */
	linkedFiles: boolean;
}

type FieldErrors = Record<string, string[]>;

async function readJson<T>(res: Response): Promise<T | null> {
	return (await res.json().catch(() => null)) as T | null;
}

/**
 * Single-page villa reservation (`/reserve/[slug]`).
 *
 * Owns add-ons, checkout questions (+ uploads), guest details, the cart hold
 * and checkout. `reserve()` puts the stay in a cart via `/api/reserve`; any
 * later change to dates, add-ons, answers or details marks the hold `stale`,
 * and the next `reserve()` replaces it (`replaceItemId`) so the old hold never
 * blocks the new dates. Payment uses the hold's own cart id and expiry,
 * independent of the cart context. Checkout submits with
 * `appointmentsSettings.markAsScheduled: true`, then routes to
 * `/reserve/confirmed/{orderId}`.
 */
export function useStayBooking(input: StayBookingInput) {
	const { villa, stay, locationId, customAttributes, onSlotUnavailable, billingAddress, marketingConsent } = input;
	const nights = stay ? nightsBetween(stay.checkin, stay.checkout) : 0;
	const router = useRouter();
	const { data: session } = useSession();
	const { cartId: contextCartId, setCart, clearCart } = useCart();

	// Details
	const [email, setEmail] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [phone, setPhone] = useState('');
	const [customerId, setCustomerId] = useState<string | null>(null);
	const prefilledRef = useRef(false);

	useEffect(() => {
		if (prefilledRef.current || !session?.customer) return;
		prefilledRef.current = true;
		const c = session.customer;
		if (c.id) setCustomerId(c.id);
		if (c.email) setEmail(c.email);
		if (c.firstName) setFirstName(c.firstName);
		if (c.lastName) setLastName(c.lastName);
	}, [session]);

	// Add-ons, questions, uploads
	const addOns = useBookingAddOns({
		activeVariant: villa?.variant ?? null,
		locationId,
		staffMemberId: null,
		bookedDurationUnits: Math.max(nights, 1),
	});
	const questions = useCheckoutQuestions(villa?.slug ?? null);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const uploads = useFileUploads();

	// Hold + payment
	const [reservation, setReservation] = useState<Reservation | null>(null);
	const [provider, setProvider] = useState<string | null>(null);
	const [paymentData, setPaymentData] = useState<CheckoutStartResponse | null>(null);
	const [reserving, setReserving] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [slotTaken, setSlotTaken] = useState(false);

	const timeRemaining = useCartExpiry(reservation?.cart.expiresAt);
	const isExpired = timeRemaining !== null && timeRemaining <= 0;
	const providerState = usePaymentProviders(reservation?.cart.id ?? null, reservation?.cart.total ?? null);
	const providers = providerState.providers;
	/** The last selectProvider call failed; the UI offers a retry instead of a spinner. */
	const [providerFailed, setProviderFailed] = useState(false);

	const addOnPayload = useMemo(
		() =>
			Array.from(addOns.selectedAddOns.entries())
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([addOnId, quantity]) => {
					const addOn = addOns.availableAddOns.find((a) => a.id === addOnId);
					return addOn?.durationMultiplied ? { addOnId } : { addOnId, quantity };
				}),
		[addOns.selectedAddOns, addOns.availableAddOns],
	);

	const customer = useMemo(
		() =>
			customerId
				? {
						kind: 'existing' as const,
						customerId,
						firstName: firstName.trim() || undefined,
						lastName: lastName.trim() || undefined,
						phone: phone.trim() || undefined,
					}
				: {
						kind: 'new' as const,
						email: email.trim(),
						firstName: firstName.trim() || undefined,
						lastName: lastName.trim() || undefined,
						phone: phone.trim() || undefined,
					},
		[customerId, email, firstName, lastName, phone],
	);

	const attributes = useMemo(() => {
		const out: Record<string, string> = {};
		for (const [k, v] of Object.entries(customAttributes)) if (v.trim()) out[k] = v.trim();
		return out;
	}, [customAttributes]);

	// Upload keys (not file ids, which change on re-upload) stand in for file answers.
	const uploadSig = useMemo(
		() =>
			Object.entries(uploads.uploads)
				.map(([q, list]) => `${q}:${list.filter((u) => u.status === 'done').map((u) => u.key).join(',')}`)
				.sort()
				.join('|'),
		[uploads.uploads],
	);

	const signature = useMemo(
		() =>
			JSON.stringify({
				villa: villa?.id ?? null,
				stay,
				locationId,
				addOnPayload,
				attributes,
				customer,
				answers: Object.entries(answers).filter(([, v]) => v.trim()).sort(([a], [b]) => a.localeCompare(b)),
				uploadSig,
			}),
		[villa?.id, stay, locationId, addOnPayload, attributes, customer, answers, uploadSig],
	);

	const stale = reservation !== null && reservation.signature !== signature;
	const held = reservation !== null && !stale && !isExpired;

	// A new hold invalidates any started payment (amounts may differ).
	useEffect(() => {
		if (!held) {
			setProvider(null);
			setPaymentData(null);
		}
	}, [held]);

	useEffect(() => {
		setSlotTaken(false);
	}, [stay?.checkin, stay?.checkout, villa?.id]);

	const questionsValid = questionsComplete(questions, answers, uploads.fileIdsFor);
	const emailValid = customerId !== null || /^\S+@\S+\.\S+$/.test(email.trim());
	const detailsValid = emailValid && firstName.trim().length > 0 && lastName.trim().length > 0 && phone.trim().length >= 6;
	const canReserve = !!villa && !!stay && nights > 0 && detailsValid && questionsValid && !uploads.busy && !reserving;

	const reserve = useCallback(async (): Promise<boolean> => {
		if (!villa || !stay) return false;
		setReserving(true);
		setError(null);
		setFieldErrors({});
		try {
			// Re-creating a booking whose files were already linked needs fresh file records.
			let files: { fileIdsFor: (id: string) => string[]; filenamesFor: (id: string) => string[] } = uploads;
			if (reservation?.linkedFiles) {
				const fresh = await uploads.reuploadAll();
				files = {
					fileIdsFor: (id) => fresh[id]?.fileIds ?? [],
					filenamesFor: (id) => fresh[id]?.filenames ?? [],
				};
			}
			const answerPayload = buildAnswerPayload(questions, answers, files);
			const cartIdForRequest = reservation?.cart.id ?? contextCartId;

			const res = await fetch('/api/reserve', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(cartIdForRequest ? { 'X-Cart-Id': cartIdForRequest } : {}),
				},
				body: JSON.stringify({
					villa: { productId: villa.id, slug: villa.slug },
					stay: { checkin: stay.checkin, checkout: stay.checkout },
					locationId,
					numberOfAttendees: 1,
					addOns: addOnPayload,
					customer,
					checkoutQuestionAnswers: answerPayload,
					customAttributes: attributes,
					replaceItemId: reservation?.itemId ?? null,
				}),
			});
			const data = await readJson<{
				cart?: CartResponse;
				itemId?: string | null;
				error?: string;
				code?: string;
				errors?: FieldErrors;
			}>(res);

			if (!res.ok) {
				if (data?.code === 'slot_unavailable') {
					setSlotTaken(true);
					setReservation(null);
					onSlotUnavailable?.();
				} else if (data?.cart) {
					// Held, but answers didn't save: keep the hold so a retry replaces it.
					setReservation({ cart: data.cart, itemId: data.itemId ?? null, signature: '', linkedFiles: false });
				}
				if (data?.errors) setFieldErrors(data.errors);
				setError(data?.error || 'Could not hold this villa. Try again.');
				return false;
			}
			if (!data?.cart) throw new Error('Could not hold this villa. Try again.');

			setCart(data.cart);
			setReservation({
				cart: data.cart,
				itemId: data.itemId ?? null,
				signature,
				linkedFiles: answerPayload.some((a) => (a.fileIds?.length ?? 0) > 0),
			});
			return true;
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not hold this villa. Try again.');
			return false;
		} finally {
			setReserving(false);
		}
	}, [
		villa,
		stay,
		uploads,
		reservation,
		questions,
		answers,
		contextCartId,
		locationId,
		addOnPayload,
		customer,
		attributes,
		onSlotUnavailable,
		setCart,
		signature,
	]);

	/**
	 * Swap in a cart the server returned for the held cart (e.g. after a promo
	 * code). Keeps the hold (same item and signature) and re-keys the providers.
	 * When the total changes, any started payment is dropped (its amount is
	 * stale), so the caller picks a provider again from the refreshed list.
	 */
	const updateHeldCart = useCallback(
		(next: CartResponse) => {
			if (!reservation || reservation.cart.id !== next.id) return;
			if (reservation.cart.total !== next.total) {
				setProvider(null);
				setPaymentData(null);
				setProviderFailed(false);
			}
			setReservation({ ...reservation, cart: next });
			setCart(next);
		},
		[reservation, setCart],
	);

	const cartHeaders = useCallback(
		(): Record<string, string> => ({
			'Content-Type': 'application/json',
			...(reservation ? { 'X-Cart-Id': reservation.cart.id } : {}),
		}),
		[reservation],
	);

	const checkoutCustomer = useMemo(() => {
		const extra = {
			...(billingAddress ? { billingAddress } : {}),
			...(marketingConsent ? { marketingConsent } : {}),
		};
		return {
			customer: customerId
				? // The server forwards customerId only when it matches the session; otherwise it
					// falls back to the email, so that's always sent.
					{ customerId, email: customer.email, firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone, ...extra }
				: { email: customer.email, firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone, ...extra },
		};
	}, [customerId, customer, billingAddress, marketingConsent]);

	const submitCheckout = useCallback(
		async (stripePaymentIntentId?: string) => {
			setSubmitting(true);
			setError(null);
			try {
				const res = await fetch('/api/checkout/submit', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify({
						...checkoutCustomer,
						...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
					}),
				});
				const data = await readJson<{
					error?: string;
					order?: { id?: string };
					customer?: { id?: string; email?: string; firstName?: string; lastName?: string };
					auth?: { accessToken?: string; refreshToken?: string };
				}>(res);
				if (!res.ok) throw new Error(data?.error || 'Checkout failed');
				const orderId = data?.order?.id;
				if (!orderId) {
					throw new Error(
						'We couldn’t confirm your reservation. Please check your email before trying again, or message us.',
					);
				}
				if (data?.auth?.accessToken) {
					// The provider verifies the token and builds the session from the API profile.
					await signIn('checkout-token', {
						accessToken: data.auth.accessToken,
						refreshToken: data.auth.refreshToken ?? '',
						redirect: false,
					});
				}
				clearCart();
				router.push(`/reserve/confirmed/${encodeURIComponent(orderId)}`);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Checkout failed');
				setSubmitting(false);
			}
		},
		[cartHeaders, checkoutCustomer, clearCart, router],
	);

	const selectProvider = useCallback(
		async (providerName: string) => {
			if (!held) return;
			setProvider(providerName);
			setPaymentData(null);
			setError(null);
			setProviderFailed(false);
			setSubmitting(true);
			try {
				const res = await fetch('/api/checkout/start', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify({ provider: providerName, ...checkoutCustomer }),
				});
				const data = await readJson<CheckoutStartResponse & { error?: string }>(res);
				if (!res.ok || !data) throw new Error(data?.error || 'Could not start checkout');
				if (data.redirectUrl) {
					window.location.href = data.redirectUrl;
					return;
				}
				setPaymentData(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Could not start checkout');
				setProvider(null);
				setProviderFailed(true);
			} finally {
				setSubmitting(false);
			}
		},
		[held, cartHeaders, checkoutCustomer],
	);

	const clearProviderFailed = useCallback(() => setProviderFailed(false), []);

	return {
		// extras
		availableAddOns: addOns.availableAddOns,
		addOnsLoading: addOns.addOnsLoading,
		selectedAddOns: addOns.selectedAddOns,
		addOnsTotal: addOns.addOnsTotal,
		updateAddOnQuantity: addOns.updateQuantity,
		// documents
		questions,
		answers,
		setAnswers,
		uploads,
		questionsValid,
		// details
		email,
		setEmail,
		firstName,
		setFirstName,
		lastName,
		setLastName,
		phone,
		setPhone,
		customerId,
		detailsValid,
		fieldErrors,
		// hold
		canReserve,
		reserve,
		reserving,
		reservation,
		updateHeldCart,
		held,
		stale,
		slotTaken,
		nights,
		timeRemaining,
		isExpired,
		// payment
		providers,
		providersLoaded: providerState.loaded,
		providersFailed: providerState.failed,
		retryProviders: providerState.retry,
		providerFailed,
		clearProviderFailed,
		provider,
		paymentData,
		selectProvider,
		submitCheckout,
		submitting,
		error,
		setError,
	};
}

export type StayBooking = ReturnType<typeof useStayBooking>;
