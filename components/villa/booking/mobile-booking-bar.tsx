'use client';

import { useState } from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PriceTag, formatStayPrice } from '@/components/ui/price-tag';
import { useVillaBooking } from '@/components/villa/booking/booking-context';
import { ReservationCard, ReserveAction } from '@/components/villa/booking/reservation-card';
import { formatStayRange } from '@/components/villas/villa-summary';

/**
 * Phones and tablets: a bar pinned to the bottom (price, dates, Reserve) that
 * opens a Sheet holding the reservation card. The sheet card uses an inline
 * calendar, because DateGuestField would open a second Sheet on touch.
 */
export function MobileBookingBar() {
	const b = useVillaBooking();
	const [open, setOpen] = useState(false);
	const { villa, stay } = b;
	const dates = stay.checkin && stay.checkout ? formatStayRange(stay.checkin, stay.checkout) : null;

	return (
		<>
			{/* Keeps the footer clear of the bar. */}
			<div aria-hidden className="h-24 lg:hidden" />
			<div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
				<div className="container-x flex items-center justify-between gap-4 py-3">
					<button type="button" onClick={() => setOpen(true)} className="flex min-w-0 flex-col items-start text-left" aria-haspopup="dialog">
						{b.status === 'ok' ? (
							<span className="block font-display text-[1.2rem] tabular">
								{formatStayPrice(b.estimate, villa.currency)} <span className="text-[0.85rem] text-ink-muted">est.</span>
							</span>
						) : (
							<PriceTag amount={villa.price} currency={villa.currency} size="sm" />
						)}
						<span className="link-underline tabular max-w-full truncate text-[0.85rem] text-ink-muted">
							{dates ? `${dates} · ${b.nights} ${b.nights === 1 ? 'night' : 'nights'}` : 'Add your dates'}
						</span>
					</button>
					{b.reserveHref ? (
						<ReserveAction booking={b} className="shrink-0" />
					) : (
						<Button className="shrink-0" onClick={() => setOpen(true)}>
							{dates ? 'Review stay' : 'Check dates'}
						</Button>
					)}
				</div>
			</div>
			<Sheet open={open} onClose={() => setOpen(false)} title={`Stay at ${villa.title}`} footer={<ReserveAction booking={b} />}>
				<ReservationCard variant="sheet" />
			</Sheet>
		</>
	);
}
