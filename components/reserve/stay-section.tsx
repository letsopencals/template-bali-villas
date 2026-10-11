'use client';

import type { AvailabilityRange } from '@/lib/stay';
import { siteConfig } from '@/lib/site-config';
import { Button } from '@/components/ui/button';
import { StayCalendar, type StayValue } from '@/components/stay/stay-calendar';
import { GuestPicker, type GuestCounts } from '@/components/stay/guest-picker';
import { SectionError } from './reserve-section';
import { fmtDay, plural, type ReserveVilla } from './reserve-model';

interface StaySectionProps {
	villa: ReserveVilla;
	ranges: readonly AvailabilityRange[];
	rangesLoading: boolean;
	stay: StayValue;
	onStayChange(v: StayValue): void;
	guests: GuestCounts;
	onGuestsChange(g: GuestCounts): void;
	/** Client-side problem with the picked dates (null when they look fine). */
	problem: string | null;
	/** Server message from the last hold attempt made from this step. */
	error: string | null;
	slotTaken: boolean;
	busy: boolean;
	continueLabel: string;
	onContinue(): void;
}

/** Step 1: the villa's own calendar (its ranges, min/max nights) and guests. */
export function StaySection({
	villa,
	ranges,
	rangesLoading,
	stay,
	onStayChange,
	guests,
	onGuestsChange,
	problem,
	error,
	slotTaken,
	busy,
	continueLabel,
	onContinue,
}: StaySectionProps) {
	const { checkIn, checkOut } = villa.stayTimes;
	return (
		<div className="flex flex-col gap-8">
			<div className="rounded-[24px] border border-line bg-cream p-4 sm:p-6">
				<StayCalendar
					ranges={ranges}
					value={stay}
					onChange={onStayChange}
					timezone={siteConfig.timezone}
					stayTimes={villa.stayTimes}
					minNights={villa.minNights}
					maxNights={villa.maxNights}
					months={2}
					loading={rangesLoading}
					showLegend
				/>
				<p className="mt-4 text-[0.85rem] text-ink-muted">
					Check in from {checkIn}, check out by {checkOut} (Bali time).
					{villa.minNights > 1 ? ` ${villa.title} has a ${villa.minNights}-night minimum.` : ''} Stays of up to {villa.maxNights} nights.
				</p>
			</div>

			<div>
				<p className="label">Who is coming</p>
				<GuestPicker value={guests} onChange={onGuestsChange} maxGuests={villa.maxGuests} maxAdults={villa.maxAdults} className="mt-2" />
				<p className="text-[0.85rem] text-ink-muted">{villa.title} sleeps up to {plural(villa.maxGuests, 'guest', 'guests')}.</p>
			</div>

			{slotTaken ? (
				<SectionError>
					Someone booked those nights a moment ago. The calendar is up to date now, so pick another stay and we&rsquo;ll hold it for you.
				</SectionError>
			) : error ? (
				<SectionError>{error}</SectionError>
			) : problem && stay.checkin && stay.checkout ? (
				<SectionError>{problem}</SectionError>
			) : null}

			<div className="flex flex-wrap items-center gap-4">
				<Button variant="primary" size="lg" pill onClick={onContinue} disabled={busy || !!problem}>
					{busy ? 'Holding your dates…' : continueLabel}
				</Button>
				{stay.checkin && stay.checkout && !problem ? (
					<p className="tabular text-[0.9rem] text-ink-muted">
						{fmtDay(stay.checkin)} to {fmtDay(stay.checkout)}
					</p>
				) : null}
			</div>
		</div>
	);
}
