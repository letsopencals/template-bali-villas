'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { CheckoutSetting } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';
import { fitsStay, localAt, nightsBetween } from '@/lib/stay';
import { lastFreeDay } from '@/components/account/trip-policy';
import { useVillaRanges } from '@/hooks/use-villa-ranges';
import { useStayBooking } from '@/hooks/use-stay-booking';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';
import { formatGuests, guestsToAttributes, type GuestCounts } from '@/components/stay/guest-picker';
import type { StayValue } from '@/components/stay/stay-calendar';
import { ReserveSection, type SectionStatus } from './reserve-section';
import { StaySection } from './stay-section';
import { AddOnsSection } from './add-ons-section';
import { EMPTY_ARRIVAL, GuestSection, type ArrivalDraft } from './guest-section';
import { NO_PAYMENT, PaymentSection } from './payment-section';
import { SummaryPanel } from './summary-panel';
import { MobileSummary, StickyPayBar } from './mobile-summary';
import { HoldBar } from './hold-bar';
import {
	EMPTY_BILLING,
	EMPTY_CONSENT,
	billingPayload,
	billingValid,
	consentPayload,
	checkoutAsks,
	fmtDay,
	money,
	plural,
	rangeFromIso,
	type BillingDraft,
	type ConsentDraft,
	type ReserveVilla,
} from './reserve-model';

type Step = 1 | 2 | 3 | 4;

const STEPS: readonly Step[] = [1, 2, 3, 4];
const stepId = (s: Step) => `reserve-step-${s}`;

interface ReserveViewProps {
	villa: ReserveVilla;
	initialStay: StayValue;
	initialGuests: GuestCounts;
	checkoutSettings: CheckoutSetting | null;
}

/**
 * `/reserve/[slug]`: four numbered steps on paper (stay, extras, guest and
 * arrival, payment) beside a sticky jungle summary priced from the cart.
 *
 * Holding: signed-in guests are held as soon as the stay fits; everyone else
 * once their details are in (the hold needs a customer). After that, every
 * Continue re-holds if something changed, so the summary always shows the
 * server's numbers. Clients never compute totals.
 */
export function ReserveView({ villa, initialStay, initialGuests, checkoutSettings }: ReserveViewProps) {
	const tz = siteConfig.timezone;
	const keys = siteConfig.customAttributeKeys;
	const { data: session, status: sessionStatus } = useSession();
	const reduce = useReducedMotion();
	const lenis = useSmoothScroll();

	const [stayValue, setStayValue] = useState<StayValue>(initialStay);
	const [guests, setGuests] = useState<GuestCounts>(initialGuests);
	const [arrival, setArrival] = useState<ArrivalDraft>(EMPTY_ARRIVAL);
	const [billing, setBilling] = useState<BillingDraft>(EMPTY_BILLING);
	const [consent, setConsent] = useState<ConsentDraft>(EMPTY_CONSENT);
	const [policyAccepted, setPolicyAccepted] = useState(false);
	const [open, setOpen] = useState<Step>(1);
	const [done, setDone] = useState<ReadonlySet<Step>>(() => new Set());
	const [errorStep, setErrorStep] = useState<Step | null>(null);
	const [showGuestErrors, setShowGuestErrors] = useState(false);
	const [payAction, setPayAction] = useState<(() => void) | null>(null);
	const registerPay = useCallback((fn: (() => void) | null) => setPayAction(() => fn), []);

	const { ranges: apiRanges, isLoading: rangesLoading, refresh: refreshRanges } = useVillaRanges(villa.slug, { locationId: villa.locationId });

	const stay = useMemo(
		() => (stayValue.checkin && stayValue.checkout ? { checkin: stayValue.checkin, checkout: stayValue.checkout } : null),
		[stayValue.checkin, stayValue.checkout],
	);
	const villaRef = useMemo(() => ({ id: villa.id, slug: villa.slug, variant: villa.variant }), [villa.id, villa.slug, villa.variant]);
	const customAttributes = useMemo(
		() => ({
			...guestsToAttributes(guests),
			[keys.arrivalTime]: arrival.arrivalTime,
			[keys.flightNumber]: arrival.flightNumber.trim(),
			[keys.occasion]: arrival.occasion,
		}),
		[guests, arrival, keys.arrivalTime, keys.flightNumber, keys.occasion],
	);
	const onSlotUnavailable = useCallback(() => {
		void refreshRanges();
		setOpen(1);
		setDone((d) => {
			const next = new Set(d);
			next.delete(1);
			return next;
		});
	}, [refreshRanges]);

	const asks = useMemo(() => checkoutAsks(checkoutSettings), [checkoutSettings]);
	const billingAddress = useMemo(() => (asks.billing === 'hidden' && asks.company === 'hidden' && asks.vat === 'hidden' ? null : (billingPayload(billing) ?? null)), [asks, billing]);
	const marketingConsent = useMemo(() => consentPayload(consent, asks), [consent, asks]);

	const booking = useStayBooking({
		villa: villaRef,
		stay,
		locationId: villa.locationId,
		customAttributes,
		onSlotUnavailable,
		billingAddress,
		marketingConsent,
	});
	const { reservation, held, isExpired, reserving, customerId } = booking;

	// The guest's own hold blocks those nights in the API ranges; add it back so they stay pickable.
	const heldAppointment = reservation && !isExpired ? (reservation.cart.items.find((i) => i.id === reservation.itemId)?.appointment ?? null) : null;
	const heldFrom = heldAppointment?.from ?? null;
	const heldTo = heldAppointment?.to ?? null;
	const ranges = useMemo(() => {
		const own = heldFrom && heldTo ? rangeFromIso(heldFrom, heldTo) : null;
		return own ? [...apiRanges, own] : apiRanges;
	}, [apiRanges, heldFrom, heldTo]);

	const cart = reservation?.cart ?? null;
	const nights = stay ? nightsBetween(stay.checkin, stay.checkout) : 0;
	// Same rule as the trip page (components/account/trip-policy), so both quote the same date.
	const freeCancelUntil = stay ? lastFreeDay(localAt(stay.checkin, villa.stayTimes.checkIn, tz), villa.cancelGap, tz) : null;
	// `/api/reserve` only attaches a customer once it is usable, so everyone can be held from step 1.
	const canHoldEarly = true;

	const stayProblem = !stay
		? 'Choose your check-in and check-out dates.'
		: nights < villa.minNights
			? `${villa.title} has a minimum stay of ${plural(villa.minNights, 'night', 'nights')}.`
			: nights > villa.maxNights
				? `Stays are up to ${villa.maxNights} nights. Write to us for anything longer.`
				: !rangesLoading && !fitsStay(ranges, stay.checkin, stay.checkout, tz, villa.stayTimes)
					? 'Some of those nights are already taken. Pick dates where every night is free.'
					: null;

	/* ------------------------------------------------------------- step flow */

	const advance = useCallback(
		(from: Step) => {
			const next = new Set(done).add(from);
			setDone(next);
			setOpen(STEPS.find((s) => s > from && !next.has(s)) ?? 4);
		},
		[done],
	);

	const edit = useCallback((s: Step) => {
		setOpen(s);
		setDone((d) => {
			const next = new Set(d);
			next.delete(s);
			return next;
		});
	}, []);

	const hold = useCallback(
		async (from: Step): Promise<boolean> => {
			setErrorStep(from);
			const ok = await booking.reserve();
			if (ok) setErrorStep(null);
			return ok;
		},
		[booking],
	);

	const continueStay = useCallback(async () => {
		if (stayProblem) return;
		if (canHoldEarly && !held && !(await hold(1))) return;
		advance(1);
	}, [stayProblem, canHoldEarly, held, hold, advance]);

	const continueExtras = useCallback(async () => {
		if (canHoldEarly && !held && !(await hold(2))) return;
		advance(2);
	}, [canHoldEarly, held, hold, advance]);

	const continueGuest = useCallback(async () => {
		setShowGuestErrors(true);
		if (!booking.detailsValid || !booking.questionsValid || booking.uploads.busy || !billingValid(billing, asks)) {
			setErrorStep(null);
			return;
		}
		if (!held && !(await hold(3))) return;
		advance(3);
	}, [booking.detailsValid, booking.questionsValid, booking.uploads.busy, billing, asks, held, hold, advance]);

	const rehold = useCallback(() => void hold(open), [hold, open]);

	// Dates from the villa page: skip step 1 once the ranges confirm they fit (holding first when signed in).
	const autoRef = useRef(false);
	useEffect(() => {
		if (autoRef.current || !initialStay.checkin || !initialStay.checkout || rangesLoading || sessionStatus === 'loading') return;
		if (sessionStatus === 'authenticated' && session?.customer?.id && !customerId) return; // wait for the prefill
		autoRef.current = true;
		if (!stayProblem) void continueStay();
	}, [initialStay.checkin, initialStay.checkout, rangesLoading, sessionStatus, session, customerId, stayProblem, continueStay]);

	// Payment: start the only provider automatically, once per hold. A failed
	// start isn't retried on its own; Retry clears the ref and the flag so this
	// effect picks it again.
	const pickedForRef = useRef<unknown>(null);
	useEffect(() => {
		const only = booking.providers.length === 1 ? booking.providers[0] : undefined;
		if (open !== 4 || !held || booking.provider || booking.submitting || booking.providerFailed || !only) return;
		if (pickedForRef.current === reservation) return;
		pickedForRef.current = reservation;
		void booking.selectProvider(only.name);
	}, [open, held, booking, reservation]);

	const { clearProviderFailed, retryProviders, setError: setBookingError } = booking;
	const retryPayment = useCallback(() => {
		pickedForRef.current = null;
		setBookingError(null);
		clearProviderFailed();
		retryProviders();
	}, [clearProviderFailed, retryProviders, setBookingError]);

	// A promo swaps the held cart; when the total moves the hook drops the started
	// payment and the auto-pick above (or the provider list) starts a fresh one.
	const onPromoCart = booking.updateHeldCart;

	// Scroll the newly opened step into view (not on first paint).
	const prevOpen = useRef<Step>(open);
	useEffect(() => {
		if (prevOpen.current === open) return;
		prevOpen.current = open;
		const el = document.getElementById(stepId(open));
		if (!el) return;
		if (lenis) lenis.scrollTo(el, { offset: -104 });
		else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
	}, [open, lenis, reduce]);

	/* ----------------------------------------------------------------- view */

	const statusOf = (s: Step): SectionStatus => (open === s ? 'open' : done.has(s) ? 'done' : 'locked');
	const errorFor = (s: Step) => (booking.error && (errorStep ?? open) === s ? booking.error : null);
	const currency = cart?.paymentCurrencyCode ?? villa.currency;
	const totalLabel = cart ? `Total ${money(cart.total, currency)}` : `${money(villa.price, villa.currency)} / night`;
	const noPayment = (booking.paymentData?.provider as string | undefined) === NO_PAYMENT;
	const payLabel = cart ? `Pay ${money(cart.total, currency)}` : 'Pay';
	const needsRehold = open === 4 && !held;
	const continueLabel = canHoldEarly && !held ? 'Save and continue' : 'Continue';

	const selectedExtras = booking.availableAddOns.filter((a) => (booking.selectedAddOns.get(a.id) ?? 0) > 0);
	const summaries: Record<Step, React.ReactNode> = {
		1: stay ? (
			<span className="tabular">
				{fmtDay(stay.checkin)} → {fmtDay(stay.checkout)} · {plural(nights, 'night', 'nights')} · {formatGuests(guests)}
			</span>
		) : null,
		2: selectedExtras.length > 0 ? selectedExtras.map((a) => a.title).join(', ') : 'No extras, just the house',
		3: (
			<span>
				{booking.firstName} {booking.lastName} · {booking.email}
				{arrival.arrivalTime ? ` · arriving ${arrival.arrivalTime}` : ''}
			</span>
		),
		4: null,
	};

	const mobileAction: { label: string; run: (() => void) | null } =
		open === 4
			? { label: noPayment ? 'Confirm booking' : payLabel, run: needsRehold ? rehold : payAction }
			: { label: 'Continue', run: open === 1 ? () => void continueStay() : open === 2 ? () => void continueExtras() : () => void continueGuest() };

	const summary = (compact: boolean) => (
		<SummaryPanel
			villa={villa}
			checkin={stayValue.checkin}
			checkout={stayValue.checkout}
			guests={guests}
			cart={cart}
			pending={booking.stale}
			freeCancelUntil={freeCancelUntil}
			compact={compact}
		/>
	);

	return (
		<div className="container-x pb-32 pt-28 lg:pb-24 lg:pt-32">
			<HoldBar
				villaSlug={villa.slug}
				villaTitle={villa.title}
				timeRemaining={reservation ? booking.timeRemaining : null}
				expired={reservation !== null && isExpired}
				onRehold={rehold}
				reholdBusy={reserving}
			/>

			<div className="mt-6 lg:hidden">
				<MobileSummary label={totalLabel}>{summary(true)}</MobileSummary>
			</div>

			<div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] xl:gap-16">
				<div className="min-w-0">
					<p className="label">Reserve</p>
					<h1 className="display-md mt-3">
						A few quiet steps to <span className="italic-soft">{villa.title}</span>
					</h1>

					<div className="mt-8">
						<ReserveSection
							id={stepId(1)}
							index={1}
							title="Your stay"
							lede="Pick the nights and who is coming."
							status={statusOf(1)}
							summary={summaries[1]}
							onEdit={() => edit(1)}
						>
							<StaySection
								villa={villa}
								ranges={ranges}
								rangesLoading={rangesLoading}
								stay={stayValue}
								onStayChange={setStayValue}
								guests={guests}
								onGuestsChange={setGuests}
								problem={stayProblem}
								error={errorFor(1)}
								slotTaken={booking.slotTaken}
								busy={reserving}
								continueLabel={continueLabel}
								onContinue={() => void continueStay()}
							/>
						</ReserveSection>

						<ReserveSection
							id={stepId(2)}
							index={2}
							title="Make it yours"
							lede="Breakfast in the pool, a driver from the airport, a morning on the volcano."
							status={statusOf(2)}
							summary={summaries[2]}
							onEdit={() => edit(2)}
						>
							<AddOnsSection
								addOns={booking.availableAddOns}
								loading={booking.addOnsLoading}
								selected={booking.selectedAddOns}
								onChange={booking.updateAddOnQuantity}
								currency={villa.currency}
								villaImage={villa.image}
								maxGuests={villa.maxGuests}
								nights={nights}
								error={errorFor(2)}
								busy={reserving}
								continueLabel={continueLabel}
								onContinue={() => void continueExtras()}
							/>
						</ReserveSection>

						<ReserveSection
							id={stepId(3)}
							index={3}
							title="Guest and arrival"
							lede="So our hosts know who to expect, and when."
							status={statusOf(3)}
							summary={summaries[3]}
							onEdit={() => edit(3)}
						>
							<GuestSection
								booking={booking}
								arrival={arrival}
								onArrival={setArrival}
								asks={asks}
								billing={billing}
								onBilling={setBilling}
								consent={consent}
								onConsent={setConsent}
								showErrors={showGuestErrors}
								error={errorFor(3)}
								busy={reserving}
								continueLabel={held ? 'Continue to payment' : 'Hold the villa and continue'}
								onContinue={() => void continueGuest()}
							/>
						</ReserveSection>

						<ReserveSection id={stepId(4)} index={4} title="Payment" lede="Nothing is charged until you press pay." status={statusOf(4)}>
							<PaymentSection
								villa={villa}
								booking={booking}
								cart={cart}
								onCart={onPromoCart}
								freeCancelUntil={freeCancelUntil}
								policyAccepted={policyAccepted}
								onPolicy={setPolicyAccepted}
								payLabel={payLabel}
								registerPay={registerPay}
								onRehold={rehold}
								onRetryPayment={retryPayment}
								rehold={needsRehold ? { busy: reserving, label: isExpired ? 'Hold the villa again' : 'Update my hold' } : null}
								error={errorFor(4)}
							/>
						</ReserveSection>
					</div>
				</div>

				<aside aria-label="Booking summary" className="max-lg:hidden">
					<div className="sticky top-28">{summary(false)}</div>
				</aside>
			</div>

			<StickyPayBar totalLabel={totalLabel} actionLabel={mobileAction.label} onAction={mobileAction.run} busy={reserving || booking.submitting} />
		</div>
	);
}
