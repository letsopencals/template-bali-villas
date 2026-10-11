'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatShortDate, type Trip } from '@/components/account/trip-model';
import type { TripPolicy } from '@/components/account/trip-policy';
import { ChangeDatesDialog } from '@/components/account/trip-detail/change-dates-dialog';
import { CancelDialog } from '@/components/account/trip-detail/cancel-dialog';
import { RescheduleUnavailableDialog } from '@/components/account/trip-detail/reschedule-unavailable-dialog';

type Action = 'cancel' | 'reschedule' | null;

export interface TripActionsProps {
	trip: Trip;
	policy: TripPolicy;
	locationId: string | null;
	rescheduleGap: number;
	bookedOn: string | null;
	/** From `?action=` (magic links from emails): opens that dialog on load. */
	initialAction: Action;
}

/**
 * "Change dates" and "Cancel" for an upcoming stay. Both buttons always show
 * (the dialogs explain when it can't be done online), with the deadlines under them.
 */
export function TripActions({ trip, policy, locationId, rescheduleGap, bookedOn, initialAction }: TripActionsProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [open, setOpen] = useState<Action>(initialAction);

	const close = () => {
		setOpen(null);
		if (initialAction) router.replace(pathname, { scroll: false });
	};

	return (
		<section aria-label="Manage this stay" className="rounded-[24px] bg-sand/60 p-6 md:p-8">
			<p className="label">Atur perjalanan · Manage</p>
			<div className="mt-4 flex flex-wrap gap-3">
				<Button variant="secondary" onClick={() => setOpen('reschedule')}>
					Change dates
				</Button>
				<Button variant="outline" onClick={() => setOpen('cancel')}>
					Cancel stay
				</Button>
			</div>
			<ul className="mt-4 space-y-1 text-sm text-ink-muted">
				<li>
					{policy.canReschedule
						? policy.rescheduleUntil
							? `Change dates online until ${formatShortDate(policy.rescheduleUntil)}.`
							: 'You can change dates online.'
						: policy.rescheduleReason}
				</li>
				<li>
					{policy.canCancel
						? policy.cancelUntil
							? `Free cancellation until ${formatShortDate(policy.cancelUntil)}.`
							: 'You can cancel online.'
						: policy.cancelReason}
				</li>
			</ul>

			{policy.canReschedule ? (
				<ChangeDatesDialog open={open === 'reschedule'} onClose={close} trip={trip} locationId={locationId} rescheduleGap={rescheduleGap} />
			) : (
				<RescheduleUnavailableDialog open={open === 'reschedule'} onClose={close} reason={policy.rescheduleReason} />
			)}
			<CancelDialog open={open === 'cancel'} onClose={close} trip={trip} policy={policy} bookedOn={bookedOn} />
		</section>
	);
}
