'use client';

import { useCallback, useId, useRef, useState, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { FloatingPanel } from '@/components/ui/floating-panel';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { StayCalendar, type StayValue } from '@/components/stay/stay-calendar';
import { GuestPicker, formatGuests, type GuestCounts } from '@/components/stay/guest-picker';
import { COARSE_POINTER, useMediaQuery } from '@/hooks/use-media-query';
import { siteConfig } from '@/lib/site-config';
import { DEFAULT_STAY_TIMES, type AvailabilityRange, type StayTimes } from '@/lib/stay';

const SHORT_FMT = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const fmt = (d: string | null) => (d ? SHORT_FMT.format(new Date(`${d}T00:00:00Z`)) : null);

type Panel = 'dates' | 'guests' | null;

export interface DateGuestFieldProps {
	/** Merged availability for one villa (useVillaRanges). Omit on multi-villa search: every night is shown free. */
	ranges?: readonly AvailabilityRange[];
	rangesLoading?: boolean;
	stay: StayValue;
	onStayChange(v: StayValue): void;
	guests?: GuestCounts;
	onGuestsChange?(g: GuestCounts): void;
	minNights?: number;
	maxNights?: number;
	maxGuests?: number;
	maxAdults?: number;
	stayTimes?: StayTimes;
	timezone?: string;
	/**
	 * `capsule`: one row (Check in | Check out | Guests), for the glass hero
	 * search and wide bars. `stacked`: the reservation card (dates side by side,
	 * guests below).
	 */
	layout?: 'capsule' | 'stacked';
	/** Trailing slot inside the capsule (e.g. the Search button). */
	action?: ReactNode;
	/** Glass surface (over video/photos). Default: sand fill. */
	glass?: boolean;
	className?: string;
}

/** A free-everything range for search without a villa (every night shown free). */
const OPEN_RANGES: AvailabilityRange[] = [{ fromDate: '2000-01-01', fromTime: '00:00:00', toDate: '2100-01-01', toTime: '00:00:00' }];

/**
 * Trigger for the stay calendar and guest picker. Pointer-fine devices get a
 * FloatingPanel (z-62); touch devices get a bottom Sheet (z-66). All triggers
 * carry `data-panel-for` so switching Check in → Check out doesn't close the panel.
 */
export function DateGuestField({
	ranges,
	rangesLoading,
	stay,
	onStayChange,
	guests,
	onGuestsChange,
	minNights = 1,
	maxNights = siteConfig.stay.maxNights,
	maxGuests,
	maxAdults,
	stayTimes = DEFAULT_STAY_TIMES,
	timezone = siteConfig.timezone,
	layout = 'capsule',
	action,
	glass,
	className,
}: DateGuestFieldProps) {
	const coarse = useMediaQuery(COARSE_POINTER);
	const [panel, setPanel] = useState<Panel>(null);
	const anchorRef = useRef<HTMLDivElement>(null);
	const panelId = useId();
	const close = useCallback(() => setPanel(null), []);
	const showGuests = guests !== undefined && onGuestsChange !== undefined;

	const onCalendarChange = useCallback(
		(v: StayValue) => {
			onStayChange(v);
			// Desktop: jump to guests once the range is complete.
			if (v.checkin && v.checkout && !coarse) setPanel(showGuests ? 'guests' : null);
		},
		[onStayChange, coarse, showGuests],
	);

	const segment = (key: Exclude<Panel, null>, label: string, valueText: string | null, placeholder: string, extra?: string) => (
		<button
			type="button"
			data-panel-for={panelId}
			aria-haspopup="dialog"
			aria-expanded={panel === key}
			aria-controls={panel === key ? panelId : undefined}
			onClick={() => setPanel((p) => (p === key ? null : key))}
			className={clsx(
				'group flex min-w-0 flex-1 flex-col items-start justify-center rounded-full px-5 py-2.5 text-left transition-colors duration-200',
				panel === key ? 'bg-cream shadow-sm' : 'hover:bg-cream/60',
				extra,
			)}
		>
			<span className="label">{label}</span>
			<span className={clsx('tabular mt-0.5 truncate text-[0.95rem]', valueText ? 'font-medium text-ink' : 'text-ink-dim')}>{valueText ?? placeholder}</span>
		</button>
	);

	const calendar = (
		<StayCalendar
			ranges={ranges ?? OPEN_RANGES}
			loading={rangesLoading}
			value={stay}
			onChange={onCalendarChange}
			minNights={minNights}
			maxNights={maxNights}
			stayTimes={stayTimes}
			timezone={timezone}
			months={coarse ? 1 : 2}
		/>
	);
	const guestPicker = showGuests ? <GuestPicker value={guests} onChange={onGuestsChange} maxGuests={maxGuests} maxAdults={maxAdults} /> : null;

	return (
		<>
			<div
				ref={anchorRef}
				className={clsx(
					'flex gap-1 p-1.5',
					layout === 'capsule' ? 'items-center rounded-full' : 'flex-col rounded-[24px]',
					glass ? 'glass' : 'bg-sand',
					className,
				)}
			>
				<div className={clsx('flex min-w-0 flex-1 gap-1', layout === 'capsule' ? 'items-center' : '')}>
					{segment('dates', 'Check in', fmt(stay.checkin), 'Add date')}
					<span aria-hidden className="h-8 w-px shrink-0 self-center bg-line-strong" />
					{segment('dates', 'Check out', fmt(stay.checkout), 'Add date')}
				</div>
				{showGuests ? (
					<>
						{layout === 'capsule' ? <span aria-hidden className="h-8 w-px shrink-0 bg-line-strong" /> : null}
						{segment('guests', 'Guests', formatGuests(guests), 'Add guests', layout === 'capsule' ? 'max-w-[15rem]' : undefined)}
					</>
				) : null}
				{action ? <div className="shrink-0">{action}</div> : null}
			</div>

			{coarse ? (
				<Sheet
					open={panel !== null}
					onClose={close}
					title={panel === 'guests' ? 'Who is coming' : 'Your stay'}
					footer={
						<Button fullWidth onClick={() => (panel === 'dates' && showGuests && stay.checkout ? setPanel('guests') : close())}>
							{panel === 'dates' && showGuests && stay.checkout ? 'Next: guests' : 'Done'}
						</Button>
					}
				>
					{panel === 'guests' ? guestPicker : calendar}
				</Sheet>
			) : (
				<FloatingPanel
					open={panel !== null}
					anchorRef={anchorRef}
					onClose={close}
					id={panelId}
					role="dialog"
					aria-label={panel === 'guests' ? 'Guests' : 'Choose your dates'}
					width={panel === 'guests' ? 380 : 720}
					align={panel === 'guests' ? 'end' : 'start'}
					className="p-6"
				>
					{panel === 'guests' ? guestPicker : calendar}
				</FloatingPanel>
			)}
		</>
	);
}
