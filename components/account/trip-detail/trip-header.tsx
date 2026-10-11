import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { SafeImage } from '@/components/ui/safe-image';
import { countdownLabel, formatStayRange, nightsLabel, tripStatus, type Trip } from '@/components/account/trip-model';

/** Arched villa portrait beside the name, status, dates and booking reference. */
export function TripHeader({ trip }: { trip: Trip }) {
	const status = tripStatus(trip);
	return (
		<header className="grid items-end gap-8 md:grid-cols-[minmax(0,320px)_1fr] lg:gap-14">
			<div className="arch image-placeholder relative aspect-[4/5] w-full max-w-[320px]">
				<SafeImage src={trip.villa.image} alt={trip.villa.title} fill priority sizes="320px" className="object-cover" />
			</div>
			<div>
				<Link href="/account" className="link-underline text-sm text-ink-muted">
					← My trips
				</Link>
				<div className="mt-6 flex flex-wrap items-center gap-3">
					<Badge tone={status.tone} dot>
						{status.label}
					</Badge>
					{trip.phase === 'upcoming' ? <span className="tabular text-sm text-terracotta-deep">Check-in {countdownLabel(trip)}</span> : null}
				</div>
				<h1 className="display-lg mt-4">{trip.villa.title}</h1>
				{trip.villa.type ? <p className="italic-soft mt-2 text-xl text-ink-muted">{trip.villa.type}</p> : null}
				<p className="tabular mt-6 text-2xl">{formatStayRange(trip.checkin, trip.checkout)}</p>
				<p className="mt-1 text-ink-muted">
					{nightsLabel(trip.nights)} · Booking ref. <span className="tabular text-ink">{trip.reference}</span>
				</p>
			</div>
		</header>
	);
}
