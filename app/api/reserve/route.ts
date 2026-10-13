import '@/lib/opencals';
import { AppointmentService, CartService, CheckoutService, OpencalsApiError } from '@opencals/storefront-sdk';
import type { CartResponse, NewAppointmentCustomer } from '@opencals/storefront-sdk';
import { getAccessToken, getSessionCustomerId } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { siteConfig } from '@/lib/site-config';
import { nightsBetween, todayIn, toStaySlot } from '@/lib/stay';
import { getVillas } from '@/lib/server-data';
import { sanitizeStayAttributes } from '@/lib/reserve-attributes';
import { publicPayload } from '@/lib/public-payload';
import { guestLimitError, isRealDate, sanitizeAddOns } from '../_lib/guards';
import { EMAIL_RE } from '../checkout/customer-payload';

interface QuestionAnswerInput {
	questionId: string;
	question: string;
	answer: string;
	/** Ids from /api/uploads/presign, for file-upload questions. */
	fileIds?: string[];
}

interface CustomerInput {
	kind: 'new' | 'existing';
	customerId?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
}

interface ReserveInput {
	/** The villa: `slug` looks up its check-in/out times and limits, `productId` must match it. */
	villa: { productId: string; slug: string };
	/** Local dates (YYYY-MM-DD) in the store timezone. */
	stay: { checkin: string; checkout: string };
	/** Ignored: the villa's own location is always used. */
	locationId?: string | null;
	/** `{ addOnId, quantity? }[]`; ids are coerced to strings, quantity to an integer 1–20. */
	addOns?: unknown;
	customer?: CustomerInput;
	checkoutQuestionAnswers?: QuestionAnswerInput[];
	/** Guest counts and arrival details; see `sanitizeStayAttributes`. */
	customAttributes?: Record<string, unknown>;
	/**
	 * Cart item from an earlier attempt in the same flow (the guest changed dates
	 * or add-ons after reserving). Removed first so its pending hold doesn't block
	 * the new dates.
	 */
	replaceItemId?: string | null;
}


/**
 * A new customer is only attached once the email is usable. Before that the
 * hold goes in without one (customer is optional on create) and the checkout
 * sets the customer later, so guests can be held from the first step.
 */
const DEFAULT_MAX_GUESTS = 10;

function str(v: unknown): string | undefined {
	return typeof v === 'string' && v.trim() ? v.trim().slice(0, 255) : undefined;
}

function isEmail(v: unknown): v is string {
	return typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v.trim());
}

function sanitizeAnswers(input: unknown): QuestionAnswerInput[] {
	if (!Array.isArray(input)) return [];
	return input
		.filter((a): a is QuestionAnswerInput => !!a && typeof a.questionId === 'string' && typeof a.answer === 'string')
		.map((a) => ({
			questionId: a.questionId,
			question: typeof a.question === 'string' ? a.question : '',
			answer: a.answer,
			...(Array.isArray(a.fileIds) && a.fileIds.length > 0
				? { fileIds: a.fileIds.filter((id): id is string => typeof id === 'string') }
				: {}),
		}));
}

/** Slot conflicts read better as one plain sentence than the backend's wording. */
function friendlySlotError(err: unknown): NextResponse | null {
	if (!(err instanceof OpencalsApiError)) return null;
	const msg = err.message.toLowerCase();
	const isSlotConflict =
		err.status === 409 ||
		msg.includes('not available') ||
		msg.includes('availability') ||
		msg.includes('already booked') ||
		msg.includes('maximum attendees') ||
		msg.includes('continuous');
	if (!isSlotConflict) return null;
	return NextResponse.json(
		{ error: 'These dates are no longer free. Choose different dates and try again.', code: 'slot_unavailable' },
		{ status: 409 },
	);
}

/**
 * Hold one villa stay in the cart.
 *
 * POST { villa: { productId, slug }, stay: { checkin, checkout }, locationId?, addOns?,
 *        customer?, checkoutQuestionAnswers?, customAttributes?, replaceItemId? }
 *
 *   1. look up the villa (check-in/out times, min/max nights) and validate the dates
 *   2. build the UTC slot with `toStaySlot` (check-in day 15:00 → check-out day 11:00)
 *   3. create/get the cart and drop the item from an earlier attempt (`replaceItemId`)
 *   4. create the appointment (slot, add-ons, customer, sanitised custom attributes)
 *   5. save checkout answers with `CheckoutService.saveAnswers`, which stores
 *      the questionId and links uploaded `fileIds` (create-time answers do neither)
 *
 * The appointment is marked as scheduled at checkout submit
 * (`appointmentsSettings.markAsScheduled: true`, sent by `useStayBooking`):
 * the appointment create endpoint has no such flag.
 *
 * Guest counts are checked against the villa's limits, add-ons are coerced, and
 * the villa's own location is used. A `customer.customerId` is only attached when
 * it's the signed-in customer's own id; otherwise a guest with a usable email is
 * attached as a new customer (no externalId), else the hold has no customer yet.
 *
 * Response: { cart, itemId } (cart scrubbed with `publicPayload`). If step 5 fails the stay is already
 * in the cart, so the error response still carries { cart, itemId } and the
 * client passes `replaceItemId` on retry.
 */
export async function POST(request: NextRequest) {
	const cartIdHeader = request.headers.get('X-Cart-Id') ?? '';

	let body: ReserveInput;
	try {
		body = (await request.json()) as ReserveInput;
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { villa: villaRef, stay, customer, replaceItemId } = body;
	if (!villaRef?.productId || !villaRef?.slug || !stay || !isRealDate(stay.checkin) || !isRealDate(stay.checkout)) {
		return NextResponse.json({ error: 'Choose a villa, a check-in date and a check-out date.' }, { status: 400 });
	}

	const villa = (await getVillas()).find((v) => v.slug === villaRef.slug);
	if (!villa || villa.id !== villaRef.productId) {
		return NextResponse.json({ error: 'This villa could not be found.' }, { status: 404 });
	}

	const nights = nightsBetween(stay.checkin, stay.checkout);
	if (stay.checkin < todayIn(siteConfig.timezone)) {
		return NextResponse.json({ error: 'Check-in can’t be in the past.', code: 'invalid_stay' }, { status: 400 });
	}
	if (nights < villa.minNights) {
		return NextResponse.json(
			{ error: `${villa.title} has a minimum stay of ${villa.minNights} night${villa.minNights === 1 ? '' : 's'}.`, code: 'invalid_stay' },
			{ status: 400 },
		);
	}
	if (nights > villa.maxNights) {
		return NextResponse.json({ error: `Stays are up to ${villa.maxNights} nights.`, code: 'invalid_stay' }, { status: 400 });
	}

	const keys = siteConfig.customAttributeKeys;
	const rawAttributes = (body.customAttributes && typeof body.customAttributes === 'object' ? body.customAttributes : {}) as Record<string, unknown>;
	const guestError = guestLimitError(
		{ adults: rawAttributes[keys.adults], children: rawAttributes[keys.children], infants: rawAttributes[keys.infants] },
		{ maxGuests: villa.content?.maxGuests ?? DEFAULT_MAX_GUESTS, maxAdults: villa.content?.maxAdults ?? null },
	);
	if (guestError) {
		return NextResponse.json({ error: guestError, code: 'invalid_stay' }, { status: 400 });
	}

	const slot = { productId: villa.id, ...toStaySlot(stay.checkin, stay.checkout, siteConfig.timezone, villa.stayTimes) };
	// Always the villa's own location; a client-sent locationId is ignored.
	const locationId = villa.locationId;
	const customAttributes = sanitizeStayAttributes(rawAttributes);
	const addOns = sanitizeAddOns(body.addOns);

	const token = await getAccessToken();
	// customerId is only trusted when it's the signed-in customer's own id.
	const sessionCustomerId = await getSessionCustomerId();
	const authHeaders = { Authorization: `Bearer ${token ?? ''}` };
	const answers = sanitizeAnswers(body.checkoutQuestionAnswers);

	let cart: CartResponse;
	try {
		const res = await CartService.createOrGet({
			headers: { ...authHeaders, 'X-Cart-Id': cartIdHeader },
			throwOnError: true,
		});
		cart = res.data;
	} catch (err) {
		return handleApiError(err);
	}

	if (replaceItemId && cart.items?.some((i) => i.id === replaceItemId)) {
		try {
			await CartService.removeItem({ path: { itemId: replaceItemId }, headers: authHeaders, throwOnError: true });
		} catch {
			// Already gone (expired hold) — carry on with the new booking.
		}
	}

	let appointmentId: string;
	try {
		const res = await AppointmentService.create({
			body: {
				slot: {
					productId: slot.productId,
					fromDate: slot.fromDate,
					fromTime: slot.fromTime,
					toDate: slot.toDate,
					toTime: slot.toTime,
					staffMemberId: null,
					locationId: locationId ?? null,
				},
				numberOfAttendees: 1,
				cartId: cart.id,
				addOns,
				...(customer && customer.kind === 'existing' && sessionCustomerId && customer.customerId === sessionCustomerId
					? { customer: { customerId: sessionCustomerId } }
					: customer && isEmail(customer.email)
						? {
								// Cast: `externalId` is optional in the backend DTO but required in the SDK
								// types. It isn't sent; the backend matches the customer by email.
								customer: {
									email: customer.email.trim(),
									...(str(customer.firstName) ? { firstName: str(customer.firstName) } : {}),
									...(str(customer.lastName) ? { lastName: str(customer.lastName) } : {}),
									...(str(customer.phone) ? { phone: str(customer.phone) } : {}),
								} as NewAppointmentCustomer,
							}
						: {}),
				...(Object.keys(customAttributes).length > 0 ? { customAttributes } : {}),
			},
			headers: authHeaders,
			throwOnError: true,
		});
		appointmentId = res.data.id;
	} catch (err) {
		return friendlySlotError(err) ?? handleApiError(err);
	}

	const loadCart = async () =>
		(await CartService.get({ headers: { ...authHeaders, 'X-Cart-Id': cart.id }, throwOnError: true })).data;

	if (answers.length > 0) {
		try {
			await CheckoutService.saveAnswers({
				body: { answers },
				headers: { ...authHeaders, 'X-Cart-Id': cart.id },
				throwOnError: true,
			});
		} catch (err) {
			const errorResponse = handleApiError(err, 'Could not save your answers');
			const errorBody = (await errorResponse.json()) as Record<string, unknown>;
			const finalCart = await loadCart().catch(() => cart);
			const itemId = finalCart.items?.find((i) => i.appointmentId === appointmentId)?.id ?? null;
			return NextResponse.json(
				{ ...errorBody, error: `Your villa is held, but your answers didn't save: ${String(errorBody.error)}`, cart: publicPayload(finalCart), itemId },
				{ status: errorResponse.status },
			);
		}
	}

	try {
		const finalCart = await loadCart();
		const itemId = finalCart.items?.find((i) => i.appointmentId === appointmentId)?.id ?? null;
		return NextResponse.json({ cart: publicPayload(finalCart), itemId });
	} catch (err) {
		return handleApiError(err);
	}
}
