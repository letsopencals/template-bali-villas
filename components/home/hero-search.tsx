'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DateGuestField } from '@/components/stay/date-guest-field';
import { DEFAULT_GUESTS, type GuestCounts } from '@/components/stay/guest-picker';
import type { StayValue } from '@/components/stay/stay-calendar';

const EMPTY_STAY: StayValue = { checkin: null, checkout: null };

/** `/villas?checkin=&checkout=&adults=&children=&infants=` (dates only when both are set). */
export function searchHref(stay: StayValue, guests: GuestCounts): string {
	const q = new URLSearchParams();
	if (stay.checkin && stay.checkout) {
		q.set('checkin', stay.checkin);
		q.set('checkout', stay.checkout);
	}
	q.set('adults', String(guests.adults));
	q.set('children', String(guests.children));
	q.set('infants', String(guests.infants));
	return `/villas?${q.toString()}`;
}

function SearchIcon() {
	return (
		<svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
			<circle cx="9" cy="9" r="5.5" />
			<path d="m13.2 13.2 3.8 3.8" />
		</svg>
	);
}

/**
 * The glass search capsule over the hero. No villa is chosen yet, so every
 * night from today is selectable; the villas list checks real availability.
 * Two layouts share one state: a one-row capsule from `md`, stacked below it
 * (CSS-switched, so there is no layout flash after hydration).
 */
export function HeroSearch() {
	const router = useRouter();
	const [stay, setStay] = useState<StayValue>(EMPTY_STAY);
	const [guests, setGuests] = useState<GuestCounts>(DEFAULT_GUESTS);
	const go = useCallback(() => router.push(searchHref(stay, guests)), [router, stay, guests]);

	return (
		<form
			role="search"
			aria-label="Find a villa"
			onSubmit={(e) => {
				e.preventDefault();
				go();
			}}
			className="w-full"
		>
			<div className="max-md:hidden">
				<DateGuestField
					glass
					layout="capsule"
					stay={stay}
					onStayChange={setStay}
					guests={guests}
					onGuestsChange={setGuests}
					className="shadow-[0_24px_60px_-24px_rgba(21,41,32,.55)] ring-1 ring-cream/40"
					action={
						<Button type="submit" size="lg">
							<SearchIcon />
							Search
						</Button>
					}
				/>
			</div>
			<div className="md:hidden">
				<DateGuestField
					glass
					layout="stacked"
					stay={stay}
					onStayChange={setStay}
					guests={guests}
					onGuestsChange={setGuests}
					className="ring-1 ring-cream/40"
					action={
						<Button type="submit" size="lg" fullWidth>
							<SearchIcon />
							Search villas
						</Button>
					}
				/>
			</div>
		</form>
	);
}
