import Link from 'next/link';
import { clsx } from 'clsx';
import { Badge } from '@/components/ui/badge';
import { SafeImage } from '@/components/ui/safe-image';
import { buttonClasses } from '@/components/ui/button';
import { countdownLabel, formatStayRange, formatTripGuests, nightsLabel, tripStatus, type Trip } from '@/components/account/trip-model';

/**
 * One trip on the overview. Upcoming shows the countdown; past stays offer
 * "Leave a review" (when no feedback yet) and "Book again".
 */
export function TripCard({ trip, needsReview = false }: { trip: Trip; needsReview?: boolean }) {
	const status = tripStatus(trip);
	const muted = trip.phase === 'cancelled';
	const href = `/account/trips/${trip.id}`;
	return (
		<article className={clsx('group flex flex-col overflow-hidden rounded-[24px] bg-cream shadow-[0_1px_0_var(--color-line)]', muted && 'opacity-80')}>
			<Link href={href} className="relative block aspect-[4/3] overflow-hidden rounded-[20px] image-placeholder m-2 mb-0" aria-label={`${trip.villa.title}, ${formatStayRange(trip.checkin, trip.checkout)}`}>
				<SafeImage
					src={trip.villa.image}
					alt=""
					fill
					sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
					className={clsx('object-cover transition-transform duration-700 group-hover:scale-[1.03]', muted && 'grayscale-[60%]')}
				/>
				<span className="absolute left-3 top-3">
					<Badge tone={trip.phase === 'upcoming' || trip.phase === 'current' ? 'glass' : status.tone} dot>
						{status.label}
					</Badge>
				</span>
			</Link>
			<div className="flex flex-1 flex-col p-5 pt-4">
				<div className="flex items-baseline justify-between gap-3">
					<h3 className="font-display text-xl leading-tight">
						<Link href={href} className="link-underline">
							{trip.villa.title}
						</Link>
					</h3>
					{trip.phase === 'upcoming' ? <span className="tabular shrink-0 text-sm text-terracotta-deep">{countdownLabel(trip)}</span> : null}
				</div>
				<p className={clsx('tabular mt-1.5 text-[0.95rem]', muted ? 'text-ink-muted line-through decoration-ink-dim/60' : 'text-ink')}>
					{formatStayRange(trip.checkin, trip.checkout)}
				</p>
				<p className="mt-1 text-sm text-ink-muted">
					{nightsLabel(trip.nights)}
					{trip.guests ? ` · ${formatTripGuests(trip.guests)}` : ''}
				</p>
				<p className="mt-1 text-xs text-ink-dim">Ref. {trip.reference}</p>

				<div className="mt-auto flex flex-wrap gap-2 pt-5">
					{trip.phase === 'past' && needsReview ? (
						<Link href={`${href}#review`} className={buttonClasses('primary', 'sm')}>
							Leave a review
						</Link>
					) : null}
					{trip.phase === 'past' || trip.phase === 'cancelled' ? (
						trip.villa.slug ? (
							<Link href={`/villas/${trip.villa.slug}`} className={buttonClasses('outline', 'sm')}>
								Book again
							</Link>
						) : null
					) : (
						<Link href={href} className={buttonClasses('outline', 'sm')}>
							View trip
						</Link>
					)}
				</div>
			</div>
		</article>
	);
}
