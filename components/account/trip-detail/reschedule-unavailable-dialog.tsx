'use client';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ContactUs } from '@/components/account/trip-detail/contact-us';

/** Shown instead of the calendar when dates can't be changed online. */
export function RescheduleUnavailableDialog({ open, onClose, reason }: { open: boolean; onClose(): void; reason: string | null }) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			title="Changing your dates"
			footer={
				<div className="flex w-full justify-end">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</div>
			}
		>
			<p className="text-[0.95rem] text-ink">{reason ?? 'Date changes for this stay are arranged with us directly.'}</p>
			<p className="mt-2 text-sm text-ink-muted">Tell us the dates you have in mind and we’ll check the villa for you. Tidak masalah.</p>
			<ContactUs />
		</Dialog>
	);
}
