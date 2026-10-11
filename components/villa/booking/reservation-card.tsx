'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { DateGuestField } from '@/components/stay/date-guest-field';
import { StayCalendar } from '@/components/stay/stay-calendar';
import { GuestPicker } from '@/components/stay/guest-picker';
import { PriceTag, formatStayPrice } from '@/components/ui/price-tag';
import { Button, buttonClasses } from '@/components/ui/button';
import { useVillaBooking, type VillaBookingValue } from '@/components/villa/booking/booking-context';
import { formatDayMonth, formatStayRange } from '@/components/villas/villa-summary';

export interface ReservationCardProps {
	/** `aside`: the sticky desktop card (pickers open in a panel). `sheet`: inline calendar and guests for the mobile sheet. */
	variant?: 'aside' | 'sheet';
	className?: string;
}

/** `$rate / night`, dates, guests, the nights × rate estimate, Reserve and the policy lines. */
export function ReservationCard({ variant = 'aside', className }: ReservationCardProps) {
	const b = useVillaBooking();
	const { villa } = b;
	const inSheet = variant === 'sheet';

	return (
		<div className={clsx(!inSheet && 'float-surface rounded-[24px] p-6 ring-1 ring-line xl:p-7', className)}>
			{!inSheet ? (
				<div className="flex items-baseline justify-between gap-4">
					<PriceTag amount={villa.price} currency={villa.currency} size="lg" />
					{villa.minNights > 1 ? <span className="label">Min {villa.minNights} nights</span> : null}
				</div>
			) : null}

			{inSheet ? (
				<div className="flex flex-col gap-6">
					<StayCalendar
						ranges={b.ranges}
						loading={b.rangesLoading && b.ranges.length === 0}
						value={b.stay}
						onChange={b.setStay}
						minNights={villa.minNights}
						maxNights={villa.maxNights}
						stayTimes={villa.stayTimes}
						months={1}
					/>
					<div>
						<p className="label">Who is coming</p>
						<GuestPicker value={b.guests} onChange={b.setGuests} maxGuests={villa.maxGuests} maxAdults={villa.maxAdults} />
					</div>
				</div>
			) : (
				<DateGuestField
					layout="stacked"
					className="mt-5"
					ranges={b.ranges}
					rangesLoading={b.rangesLoading && b.ranges.length === 0}
					stay={b.stay}
					onStayChange={b.setStay}
					guests={b.guests}
					onGuestsChange={b.setGuests}
					minNights={villa.minNights}
					maxNights={villa.maxNights}
					maxGuests={villa.maxGuests}
					maxAdults={villa.maxAdults}
					stayTimes={villa.stayTimes}
				/>
			)}

			<StayNotice booking={b} />
			<StayBreakdown booking={b} />
			{!inSheet ? <ReserveAction booking={b} className="mt-5" /> : null}
			<PolicyLines booking={b} />
		</div>
	);
}

/** Reserve link when the stay is bookable, a disabled button otherwise. */
export function ReserveAction({ booking: b, className }: { booking: VillaBookingValue; className?: string }) {
	if (b.reserveHref) {
		return (
			<Link href={b.reserveHref} className={buttonClasses('primary', 'lg', { fullWidth: true, className })}>
				Reserve {b.villa.title}
			</Link>
		);
	}
	const label = b.status === 'empty' || b.status === 'partial' ? 'Choose your dates' : b.status === 'loading' ? 'Checking the dates' : 'Reserve';
	return (
		<Button size="lg" fullWidth disabled className={className}>
			{label}
		</Button>
	);
}

function StayNotice({ booking: b }: { booking: VillaBookingValue }) {
	const { villa } = b;
	let text: string | null = null;
	if (b.rangesError) text = 'We couldn’t load the calendar just now. Try again in a moment, or message us.';
	else if (b.status === 'short') text = `${villa.title} has a minimum stay of ${villa.minNights} nights.`;
	else if (b.status === 'long') text = `Stays here are up to ${villa.maxNights} nights. For longer, write to us.`;
	else if (b.status === 'unavailable') text = 'Someone has some of those nights.';
	if (!text) return null;
	return (
		<div role="status" className="mt-4 rounded-2xl bg-terracotta/10 px-4 py-3 text-[0.88rem] text-terracotta-deep">
			<p>{text}</p>
			{b.nextFree ? (
				<button type="button" onClick={() => b.setStay(b.nextFree!)} className="link-underline tabular mt-1 font-semibold">
					Try {formatStayRange(b.nextFree.checkin, b.nextFree.checkout)} instead
				</button>
			) : null}
		</div>
	);
}

function StayBreakdown({ booking: b }: { booking: VillaBookingValue }) {
	if (b.nights < 1 || (b.status !== 'ok' && b.status !== 'loading')) return null;
	const { villa } = b;
	return (
		<dl className="mt-5 flex flex-col gap-2 text-[0.95rem]">
			<div className="flex items-baseline">
				<dt className="tabular text-ink-muted">
					{formatStayPrice(villa.price, villa.currency)} × {b.nights} {b.nights === 1 ? 'night' : 'nights'}
				</dt>
				<span aria-hidden className="leader-line" />
				<dd className="tabular font-medium">{formatStayPrice(b.estimate, villa.currency)}</dd>
			</div>
			<div className="flex items-baseline">
				<dt className="text-ink-muted">Taxes</dt>
				<span aria-hidden className="leader-line" />
				<dd className="text-[0.85rem] text-ink-muted">Calculated at checkout</dd>
			</div>
			<div className="mt-1 flex items-baseline justify-between border-t border-line pt-3">
				<dt className="font-medium">
					Estimated stay <span className="label ml-1">before taxes</span>
				</dt>
				<dd className="tabular font-display text-[1.35rem] text-terracotta">{formatStayPrice(b.estimate, villa.currency)}</dd>
			</div>
		</dl>
	);
}

function PolicyLines({ booking: b }: { booking: VillaBookingValue }) {
	const { villa } = b;
	const gapDays = Math.ceil(villa.cancelGap / 86400);
	const cancel = !villa.allowCustomerCancel
		? 'Cancellation terms are shown before you pay'
		: b.freeCancelUntil
			? `Free cancellation until ${formatDayMonth(b.freeCancelUntil)}`
			: gapDays > 0
				? `Free cancellation up to ${gapDays} days before check-in`
				: 'Free cancellation until check-in';
	const parts = [cancel, villa.minNights > 1 ? `min ${villa.minNights} nights` : null].filter(Boolean);
	return (
		<div className="mt-4 flex flex-col gap-1 text-center text-[0.82rem] text-ink-muted">
			<p className="tabular">{parts.join(' · ')}</p>
			<p>You won’t be charged yet. Taxes are calculated at checkout.</p>
		</div>
	);
}
