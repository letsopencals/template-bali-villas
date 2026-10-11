'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatShortDate, type Trip } from '@/components/account/trip-model';
import type { TripPolicy } from '@/components/account/trip-policy';
import { accountRequest } from '@/components/account/trip-detail/account-fetch';
import { ContactUs } from '@/components/account/trip-detail/contact-us';

export interface CancelDialogProps {
	open: boolean;
	onClose(): void;
	trip: Trip;
	policy: TripPolicy;
	/** Local YYYY-MM-DD the trip was booked. */
	bookedOn: string | null;
}

interface Step {
	label: string;
	date: string | null;
	state: 'done' | 'now' | 'later';
}

function Timeline({ steps }: { steps: Step[] }) {
	return (
		<ol className="relative ml-1 space-y-6 border-l border-line-strong pl-6">
			{steps.map((s) => (
				<li key={s.label} className="relative">
					<span
						aria-hidden
						className={clsx(
							'absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-paper',
							s.state === 'done' ? 'bg-moss' : s.state === 'now' ? 'bg-terracotta' : 'bg-sand-strong',
						)}
					/>
					<p className={clsx('text-[0.95rem]', s.state === 'now' ? 'font-semibold text-ink' : 'text-ink')}>{s.label}</p>
					{s.date ? <p className="tabular text-sm text-ink-muted">{formatShortDate(s.date)}</p> : null}
				</li>
			))}
		</ol>
	);
}

/**
 * Cancel a stay: a booked → free-cancellation → check-in timeline, then a
 * confirmation. When online cancellation isn't possible, explains why and how
 * to reach the team instead.
 */
export function CancelDialog({ open, onClose, trip, policy, bookedOn }: CancelDialogProps) {
	const router = useRouter();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const steps: Step[] = [
		{ label: 'Booked', date: bookedOn, state: 'done' },
		...(policy.cancelUntil
			? [{ label: policy.canCancel ? 'Free cancellation until' : 'Online cancellation closed', date: policy.cancelUntil, state: policy.canCancel ? ('now' as const) : ('done' as const) }]
			: []),
		{ label: `Check-in from ${trip.stayTimes.checkIn}`, date: trip.checkin, state: 'later' },
	];

	const close = () => {
		if (saving) return;
		setError(null);
		onClose();
	};

	const confirm = async () => {
		setSaving(true);
		setError(null);
		try {
			await accountRequest(`/api/account/appointments/${encodeURIComponent(trip.id)}/cancel`, 'PUT');
			setSaving(false);
			onClose();
			router.refresh();
		} catch (e) {
			setSaving(false);
			setError(e instanceof Error ? e.message : 'Could not cancel your stay.');
		}
	};

	return (
		<Dialog
			open={open}
			onClose={close}
			title={policy.canCancel ? 'Cancel this stay?' : 'Cancelling this stay'}
			description={`${trip.villa.title} · booking ref. ${trip.reference}`}
			footer={
				policy.canCancel ? (
					<div className="flex w-full flex-wrap justify-end gap-2">
						<Button variant="ghost" onClick={close} disabled={saving}>
							Keep my stay
						</Button>
						<button
							type="button"
							onClick={confirm}
							disabled={saving}
							className="inline-flex h-11 items-center justify-center rounded-full bg-danger px-6 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
						>
							{saving ? 'Cancelling…' : 'Yes, cancel my stay'}
						</button>
					</div>
				) : (
					<div className="flex w-full justify-end">
						<Button variant="outline" onClick={close}>
							Close
						</Button>
					</div>
				)
			}
		>
			<Timeline steps={steps} />
			{policy.canCancel ? (
				<p className="mt-6 text-[0.95rem] text-ink-muted">
					You’re within the free cancellation window. We’ll email you a confirmation, and our team will be in touch about any refund. Sedih melihat Anda pergi; we hope to welcome you another time.
				</p>
			) : (
				<>
					<p className="mt-6 text-[0.95rem] text-ink">{policy.cancelReason}</p>
					<ContactUs />
				</>
			)}
			{error ? (
				<p role="alert" className="mt-4 rounded-[20px] bg-danger/10 p-4 text-sm text-danger">
					{error}
				</p>
			) : null}
		</Dialog>
	);
}
