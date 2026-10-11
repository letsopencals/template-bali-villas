import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { SafeImage } from '@/components/ui/safe-image';
import { buttonClasses } from '@/components/ui/button';
import { mapsHref } from '@/lib/contact';
import { countdownLabel, formatStayRange, formatTripGuests, nightsLabel, tripStatus, type Trip } from '@/components/account/trip-model';

/**
 * The next (or current) stay as a full-bleed photo card with a jungle scrim:
 * villa, countdown, dates, guests and arrival details, plus the three actions
 * a guest needs before travelling.
 */
export function NextTripHero({ trip, hasTransfer }: { trip: Trip; hasTransfer: boolean }) {
	const status = tripStatus(trip);
	const href = `/account/trips/${trip.id}`;
	const current = trip.phase === 'current';
	const details = [
		trip.guests ? formatTripGuests(trip.guests) : null,
		trip.arrivalTime ? `Arriving ${trip.arrivalTime}` : null,
		trip.flightNumber ? `Flight ${trip.flightNumber}` : null,
		trip.occasion && trip.occasion !== 'Just a holiday' ? trip.occasion : null,
	].filter((d): d is string => Boolean(d));

	return (
		<section aria-label={current ? 'Your current stay' : 'Your next trip'} className="relative isolate overflow-hidden rounded-[24px] bg-jungle text-cream">
			<div className="image-placeholder absolute inset-0 -z-10">
				<SafeImage src={trip.villa.image} alt="" fill priority sizes="(min-width: 1440px) 1360px, 100vw" className="object-cover" />
			</div>
			<div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-jungle-deep/90 via-jungle-deep/45 to-jungle-deep/10" />
			<div aria-hidden className="scrim-top absolute inset-x-0 top-0 -z-10 h-32" />

			<div className="flex min-h-[460px] flex-col justify-between gap-10 p-6 md:min-h-[520px] md:p-10 lg:p-14">
				<div className="flex flex-wrap items-center gap-3">
					<Badge tone="glass" dot>
						{current ? 'Staying now' : 'Your next trip'}
					</Badge>
					{status.tone === 'terracotta' ? <Badge tone="glass">{status.label}</Badge> : null}
				</div>

				<div>
					<p className="tabular text-[0.95rem] text-cream/80">
						{current ? 'Selamat menikmati. Enjoy every minute.' : `Check-in ${countdownLabel(trip)}`}
					</p>
					<h2 className="display-lg mt-2 max-w-3xl text-cream">{trip.villa.title}</h2>
					{trip.villa.type ? <p className="italic-soft mt-2 text-lg text-cream/80">{trip.villa.type}</p> : null}

					<dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[0.95rem]">
						<div>
							<dt className="sr-only">Dates</dt>
							<dd className="tabular text-xl text-cream md:text-2xl">{formatStayRange(trip.checkin, trip.checkout)}</dd>
						</div>
						<div className="self-end">
							<dt className="sr-only">Length</dt>
							<dd className="text-cream/80">{nightsLabel(trip.nights)}</dd>
						</div>
						{details.length > 0 ? (
							<div className="self-end">
								<dt className="sr-only">Guests and arrival</dt>
								<dd className="text-cream/80">{details.join(' · ')}</dd>
							</div>
						) : null}
					</dl>

					<div className="mt-8 flex flex-wrap gap-3">
						<Link href={href} className={buttonClasses('primary', 'lg')}>
							View trip
						</Link>
						{!current ? (
							<Link href={`${href}#transfer`} className={buttonClasses('glass', 'lg')}>
								{hasTransfer ? 'Your airport transfer' : 'Add airport transfer'}
							</Link>
						) : null}
						<a href={mapsHref} target="_blank" rel="noreferrer" className={buttonClasses('glass', 'lg')}>
							Directions
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
