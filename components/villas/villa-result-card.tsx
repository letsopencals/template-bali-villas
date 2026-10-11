'use client';

import { memo, useMemo } from 'react';
import { VillaCard } from '@/components/villas/villa-card';
import { Badge } from '@/components/ui/badge';
import { formatStayPrice } from '@/components/ui/price-tag';
import type { GuestCounts } from '@/components/stay/guest-picker';
import { useVillaRanges } from '@/hooks/use-villa-ranges';
import { siteConfig } from '@/lib/site-config';
import { addDays, firstFreeStay, fitsStay, nightsBetween, stayEstimate } from '@/lib/stay';
import { formatDayMonth, formatStayRange, stayQuery, type VillaSummary } from '@/components/villas/villa-summary';

export interface VillaResultCardProps {
	villa: VillaSummary;
	checkin: string | null;
	checkout: string | null;
	guests: GuestCounts;
	priority?: boolean;
}

type Status =
	| { kind: 'idle' }
	| { kind: 'loading' }
	| { kind: 'error' }
	| { kind: 'free'; nights: number; total: number }
	| { kind: 'next'; checkin: string; checkout: string; short: boolean }
	| { kind: 'none'; short: boolean };

/**
 * A villa card on /villas. With dates in the URL it checks this villa's own
 * ranges (one SWR request per card, so the whole grid fans out in parallel)
 * and shows "Available · $X total for N nights" or "Next free: 14–17 Nov".
 */
export const VillaResultCard = memo(function VillaResultCard({ villa, checkin, checkout, guests, priority }: VillaResultCardProps) {
	const searching = !!checkin && !!checkout;
	const { ranges, isLoading, error } = useVillaRanges(searching ? villa.slug : null, { from: checkin, locationId: villa.locationId });

	const status = useMemo<Status>(() => {
		if (!checkin || !checkout) return { kind: 'idle' };
		if (error) return { kind: 'error' };
		if (isLoading && ranges.length === 0) return { kind: 'loading' };
		const tz = siteConfig.timezone;
		const nights = nightsBetween(checkin, checkout);
		const short = nights < villa.minNights;
		const tooLong = nights > villa.maxNights;
		if (!short && !tooLong && fitsStay(ranges, checkin, checkout, tz, villa.stayTimes)) {
			return { kind: 'free', nights, total: stayEstimate(villa.price, nights).base };
		}
		const want = Math.min(Math.max(nights, villa.minNights), villa.maxNights);
		const next = firstFreeStay(ranges, checkin, want, tz, villa.stayTimes);
		return next ? { kind: 'next', ...next, short } : { kind: 'none', short };
	}, [checkin, checkout, error, isLoading, ranges, villa.minNights, villa.maxNights, villa.price, villa.stayTimes]);

	const nextStay = status.kind === 'next' ? { checkin: status.checkin, checkout: status.checkout } : { checkin, checkout };
	const href = `/villas/${villa.slug}?${stayQuery(nextStay, guests)}`;

	return <VillaCard villa={villa} href={href} priority={priority} availability={<StatusBadge status={status} villa={villa} checkin={checkin} />} />;
});

function StatusBadge({ status, villa, checkin }: { status: Status; villa: VillaSummary; checkin: string | null }) {
	switch (status.kind) {
		case 'idle':
			return villa.minNights > 1 ? <p className="text-[0.82rem] text-ink-muted">Minimum {villa.minNights} nights</p> : null;
		case 'loading':
			return (
				<Badge tone="neutral" className="animate-pulse">
					Checking your dates
				</Badge>
			);
		case 'error':
			return <p className="text-[0.82rem] text-ink-muted">We couldn’t check these dates. Open the villa to try again.</p>;
		case 'free':
			return (
				<Badge tone="moss" dot className="tabular normal-case tracking-normal">
					Available · {formatStayPrice(status.total, villa.currency)} total for {status.nights} {status.nights === 1 ? 'night' : 'nights'}
				</Badge>
			);
		case 'next':
			return (
				<div className="flex flex-wrap items-center gap-2">
					{status.short ? <span className="text-[0.82rem] text-ink-muted">Minimum {villa.minNights} nights.</span> : null}
					<Badge tone="terracotta" className="tabular normal-case tracking-normal">
						{status.checkin === checkin ? 'Free' : 'Next free'}: {formatStayRange(status.checkin, status.checkout)}
					</Badge>
				</div>
			);
		case 'none':
			return (
				<p className="text-[0.82rem] text-ink-muted">
					{status.short ? `Minimum ${villa.minNights} nights. ` : ''}No free stay of that length before {checkin ? formatDayMonth(addDays(checkin, 120)) : 'the end of the season'}.
				</p>
			);
	}
}
