'use client';

import { clsx } from 'clsx';
import { useVillaBooking } from '@/components/villa/booking/booking-context';
import { formatDayMonth } from '@/components/villas/villa-summary';

/**
 * Three points on a line: booked today, the last free-cancellation day, and
 * check-in. With dates chosen it shows real dates; without, it explains the gap.
 * Only states what the product says (cancelGap, allowCustomerCancel).
 */
export function CancellationTimeline() {
	const { villa, stay, freeCancelUntil } = useVillaBooking();
	const gapDays = Math.ceil(villa.cancelGap / 86400);
	const checkin = stay.checkin;

	if (!villa.allowCustomerCancel) {
		return (
			<Shell>
				<p className="mt-6 max-w-xl text-ink-muted">
					Bookings for {villa.title} can’t be cancelled online. The full cancellation terms are shown before you pay, and if your plans change, write to us and we’ll do what we can.
				</p>
			</Shell>
		);
	}

	const points: Array<{ label: string; date: string; tone: 'moss' | 'terracotta' | 'ink' }> = [
		{ label: 'You book', date: 'Today', tone: 'moss' },
		...(gapDays > 0
			? [{ label: 'Free cancellation ends', date: freeCancelUntil ? formatDayMonth(freeCancelUntil) : `${gapDays} days before`, tone: 'terracotta' as const }]
			: []),
		{ label: 'Check in', date: checkin ? formatDayMonth(checkin) : 'Arrival day', tone: 'ink' },
	];

	return (
		<Shell>
			<ol className="relative mt-10 grid gap-8 sm:grid-cols-3 sm:gap-4">
				<span aria-hidden className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-line-strong sm:left-0 sm:top-[7px] sm:h-px sm:w-full" />
				{points.map((p, i) => (
					<li key={p.label} className="relative pl-8 sm:pl-0 sm:pt-8">
						<span
							aria-hidden
							className={clsx(
								'absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 border-paper sm:top-0',
								p.tone === 'moss' ? 'bg-moss' : p.tone === 'terracotta' ? 'bg-terracotta' : 'bg-ink',
							)}
						/>
						<p className="label">{p.label}</p>
						<p className="tabular mt-1 font-display text-[1.3rem]">{p.date}</p>
						{i === 0 ? <p className="mt-1 text-[0.88rem] text-ink-muted">Cancel free of charge until the next point.</p> : null}
						{p.tone === 'terracotta' ? <p className="mt-1 text-[0.88rem] text-ink-muted">After this, the stay can no longer be cancelled online.</p> : null}
					</li>
				))}
			</ol>
			{!checkin ? <p className="mt-6 text-[0.9rem] text-ink-muted">Choose your dates and the exact days appear here.</p> : null}
		</Shell>
	);
}

function Shell({ children }: { children: React.ReactNode }) {
	return (
		<section aria-labelledby="cancellation-title">
			<p className="label">If plans change</p>
			<h2 id="cancellation-title" className="display-sm mt-3">
				Cancellation
			</h2>
			{children}
		</section>
	);
}
