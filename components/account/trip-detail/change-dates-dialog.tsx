'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StayCalendar, type StayValue } from '@/components/stay/stay-calendar';
import { CanangSari } from '@/components/motifs/canang-sari';
import { useVillaRanges } from '@/hooks/use-villa-ranges';
import { siteConfig } from '@/lib/site-config';
import { addDays, fitsStay, todayIn, type AvailabilityRange } from '@/lib/stay';
import { formatStayRange, nightsLabel, type Trip } from '@/components/account/trip-model';
import { accountRequest } from '@/components/account/trip-detail/account-fetch';

const TZ = siteConfig.timezone;

function utcParts(ms: number): { date: string; time: string } {
	const iso = new Date(ms).toISOString();
	return { date: iso.slice(0, 10), time: iso.slice(11, 19) };
}

export interface ChangeDatesDialogProps {
	open: boolean;
	onClose(): void;
	trip: Trip;
	locationId: string | null;
	/** Reschedule gap in seconds: the new check-in must be at least this far away. */
	rescheduleGap: number;
}

/**
 * Move a stay to new dates of the same length. The ranges endpoint can't
 * exclude this booking, so its own nights are added back on the client
 * (`mergeRanges` joins touching intervals). The server builds the slot and
 * the backend re-validates availability without this booking.
 */
export function ChangeDatesDialog({ open, onClose, trip, locationId, rescheduleGap }: ChangeDatesDialogProps) {
	const router = useRouter();
	const { ranges, isLoading, error: rangesError } = useVillaRanges(open ? trip.villa.slug : null, { locationId });
	const [value, setValue] = useState<StayValue>({ checkin: null, checkout: null });
	const [hint, setHint] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const withOwn = useMemo<AvailabilityRange[]>(() => {
		const from = utcParts(trip.startsAt);
		const to = utcParts(trip.endsAt);
		return [...ranges, { fromDate: from.date, fromTime: from.time, toDate: to.date, toTime: to.time }];
	}, [ranges, trip.startsAt, trip.endsAt]);

	const minDate = addDays(todayIn(TZ), Math.ceil(Math.max(0, rescheduleGap) / 86400));

	const onChange = (v: StayValue) => {
		setError(null);
		if (!v.checkin) {
			setValue({ checkin: null, checkout: null });
			setHint(null);
			return;
		}
		const checkout = addDays(v.checkin, trip.nights);
		if (fitsStay(withOwn, v.checkin, checkout, TZ, trip.stayTimes)) {
			setValue({ checkin: v.checkin, checkout });
			setHint(null);
		} else {
			setValue({ checkin: null, checkout: null });
			setHint(`The villa isn’t free for ${nightsLabel(trip.nights)} from that day. Try another check-in.`);
		}
	};

	const unchanged = value.checkin === trip.checkin;
	const ready = Boolean(value.checkin && value.checkout) && !unchanged;

	const close = () => {
		if (saving) return;
		setValue({ checkin: null, checkout: null });
		setHint(null);
		setError(null);
		onClose();
	};

	const submit = async () => {
		if (!value.checkin || !value.checkout) return;
		setSaving(true);
		setError(null);
		try {
			await accountRequest(`/api/account/appointments/${encodeURIComponent(trip.id)}/change-dates`, 'PUT', {
				checkin: value.checkin,
				checkout: value.checkout,
			});
			setSaving(false);
			setValue({ checkin: null, checkout: null });
			onClose();
			router.refresh();
		} catch (e) {
			setSaving(false);
			setError(e instanceof Error ? e.message : 'Could not change your dates.');
		}
	};

	return (
		<Dialog
			open={open}
			onClose={close}
			size="lg"
			title="Change dates · Ganti tanggal"
			description={`Pick a new check-in. Your stay keeps its ${nightsLabel(trip.nights)}; to shorten or extend it, message us.`}
			footer={
				<div className="flex w-full flex-wrap items-center justify-between gap-3">
					<p className="tabular text-sm text-ink-muted" aria-live="polite">
						{ready && value.checkin && value.checkout ? (
							<>
								<span className="line-through decoration-ink-dim/60">{formatStayRange(trip.checkin, trip.checkout)}</span>
								{' → '}
								<span className="text-ink">{formatStayRange(value.checkin, value.checkout)}</span>
							</>
						) : (
							`Now: ${formatStayRange(trip.checkin, trip.checkout)}`
						)}
					</p>
					<div className="flex gap-2">
						<Button variant="ghost" onClick={close} disabled={saving}>
							Keep my dates
						</Button>
						<Button onClick={submit} disabled={!ready || saving}>
							{saving ? 'Moving your stay…' : 'Confirm new dates'}
						</Button>
					</div>
				</div>
			}
		>
			{rangesError ? (
				<p className="rounded-[20px] bg-danger/10 p-4 text-sm text-danger">We couldn’t load availability. Please try again in a moment.</p>
			) : isLoading && ranges.length === 0 ? (
				<div className="flex justify-center py-16">
					<CanangSari size={56} spinning label="Loading availability" />
				</div>
			) : (
				<StayCalendar
					ranges={withOwn}
					value={value}
					onChange={onChange}
					timezone={TZ}
					stayTimes={trip.stayTimes}
					minNights={trip.nights}
					maxNights={trip.nights}
					minDate={minDate}
				/>
			)}
			{hint ? <p className="mt-4 text-sm text-terracotta-deep">{hint}</p> : null}
			{unchanged ? <p className="mt-4 text-sm text-ink-muted">Those are your current dates.</p> : null}
			{error ? (
				<p role="alert" className="mt-4 rounded-[20px] bg-danger/10 p-4 text-sm text-danger">
					{error}
				</p>
			) : null}
		</Dialog>
	);
}
