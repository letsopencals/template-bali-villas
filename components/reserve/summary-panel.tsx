'use client';

import { memo } from 'react';
import { clsx } from 'clsx';
import type { CartResponse } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';
import { SafeImage } from '@/components/ui/safe-image';
import { formatGuests, type GuestCounts } from '@/components/stay/guest-picker';
import { fmtDay, money, plural, type ReserveVilla } from './reserve-model';

interface SummaryPanelProps {
	villa: ReserveVilla;
	checkin: string | null;
	checkout: string | null;
	guests: GuestCounts;
	/** The held cart (promo override first). Line items come only from here. */
	cart: CartResponse | null;
	/** True while the summary reflects an out-of-date hold (edits not saved yet). */
	pending: boolean;
	freeCancelUntil: string | null;
	/** Drop the photo (mobile disclosure). */
	compact?: boolean;
}

function Line({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
	return (
		<div className={clsx('flex items-baseline gap-3', strong ? 'text-[1.05rem]' : 'text-[0.92rem]', muted && 'text-cream/70')}>
			<span className="shrink-0">{label}</span>
			<span aria-hidden className="min-w-6 flex-1 -translate-y-1 self-end border-b border-dotted border-cream/30" />
			<span className={clsx('tabular shrink-0', strong && 'font-display text-[1.5rem] leading-none')}>{value}</span>
		</div>
	);
}

function Lines({ cart }: { cart: CartResponse }) {
	const currency = cart.paymentCurrencyCode;
	return (
		<div className="flex flex-col gap-2.5">
			{cart.items.map((item) => {
				const nights = item.quantity;
				return (
					<div key={item.id} className="flex flex-col gap-2.5">
						<Line label={`${plural(nights, 'night', 'nights')} × ${money(item.originalUnitPrice, currency)}`} value={money(item.originalSubtotal, currency)} />
						{item.addOnItems.map((a) => (
							<Line key={a.id} label={a.quantity > 1 && !a.addOn.durationMultiplied ? `${a.addOn.title} × ${a.quantity}` : a.addOn.title} value={money(a.originalSubtotal, currency)} />
						))}
					</div>
				);
			})}
			{cart.appliedDiscounts.length > 0
				? cart.appliedDiscounts.map((d) => <Line key={d.id} label={d.code ? `${d.title} (${d.code})` : d.title} value={`−${money(d.totalAmount, currency)}`} />)
				: null}
			{cart.totalTax > 0 ? <Line label={cart.taxesIncluded ? 'Includes taxes' : 'Taxes'} value={money(cart.totalTax, currency)} muted={cart.taxesIncluded} /> : null}
			<div className="my-2 h-px bg-line-on-dark" />
			<Line label={`Total (${currency})`} value={money(cart.total, currency)} strong />
		</div>
	);
}

/** Jungle summary: villa in an arch, the stay, line items from the cart response, the cancellation date and the price promise. */
export const SummaryPanel = memo(function SummaryPanel({ villa, checkin, checkout, guests, cart, pending, freeCancelUntil, compact }: SummaryPanelProps) {
	const { checkIn, checkOut } = villa.stayTimes;
	return (
		<div className={clsx('on-dark flex flex-col gap-6 bg-jungle text-cream', compact ? 'p-5' : 'rounded-[24px] p-6 lg:p-7')}>
			{compact ? null : (
				<div className="image-placeholder arch relative mx-auto aspect-[4/5] w-full max-w-[16rem]">
					<SafeImage src={villa.image} alt={villa.title} fill sizes="16rem" className="object-cover" priority />
				</div>
			)}
			<div className={compact ? '' : 'text-center'}>
				<p className="display-sm">{villa.title}</p>
				{villa.type ? <p className="mt-1 text-[0.9rem] text-cream/70">{villa.type}</p> : null}
			</div>

			<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[0.92rem]">
				<dt className="label">Check in</dt>
				<dd className="tabular">{checkin ? `${fmtDay(checkin)} · from ${checkIn}` : 'Choose a date'}</dd>
				<dt className="label">Check out</dt>
				<dd className="tabular">{checkout ? `${fmtDay(checkout)} · by ${checkOut}` : 'Choose a date'}</dd>
				<dt className="label">Guests</dt>
				<dd>{formatGuests(guests)}</dd>
			</dl>

			<div className="h-px bg-line-on-dark" />

			{cart ? (
				<div className={clsx('transition-opacity duration-300', pending && 'opacity-60')} aria-busy={pending}>
					<Lines cart={cart} />
					{pending ? <p className="mt-3 text-[0.8rem] text-cream/70">Your changes show here once the hold is updated.</p> : null}
				</div>
			) : (
				<div className="flex flex-col gap-2 text-[0.92rem]">
					<Line label="Nightly rate" value={`${money(villa.price, villa.currency)} / night`} />
					<p className="text-[0.82rem] text-cream/70">The itemised total, with any taxes, appears as soon as we hold the villa for you.</p>
				</div>
			)}

			{freeCancelUntil && villa.allowCustomerCancel ? (
				<p className="flex items-center gap-2.5 rounded-full border border-line-on-dark px-4 py-2.5 text-[0.88rem]">
					<ClockGlyph />
					Free cancellation until <span className="tabular font-medium">{fmtDay(freeCancelUntil)}</span>
				</p>
			) : null}

			{compact ? null : (
				<div>
					<p className="label">Our price promise</p>
					<ul className="mt-3 flex flex-col gap-1.5 text-[0.86rem] text-cream/80">
						{siteConfig.priceIncludes.slice(0, 4).map((p) => (
							<li key={p} className="flex gap-2.5">
								<span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ochre" />
								{p}
							</li>
						))}
						<li className="flex gap-2.5">
							<span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ochre" />
							{siteConfig.stay.taxNote}
						</li>
					</ul>
				</div>
			)}
		</div>
	);
});

function ClockGlyph() {
	return (
		<svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-ochre" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
			<circle cx="8" cy="8" r="6" />
			<path d="M8 4.8V8l2.2 1.4" />
		</svg>
	);
}
