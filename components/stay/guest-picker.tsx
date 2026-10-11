'use client';

import { clsx } from 'clsx';
import { Stepper } from '@/components/ui/stepper';
import { MAX_INFANTS, type GuestCounts } from '@/lib/guests';

export {
	DEFAULT_GUESTS,
	MAX_INFANTS,
	clampGuests,
	formatGuests,
	guestsFromParams,
	guestsToAttributes,
	type GuestCounts,
} from '@/lib/guests';

export interface GuestPickerProps {
	value: GuestCounts;
	onChange(value: GuestCounts): void;
	/** Villa limit for adults + children. Default 10 (the biggest house). */
	maxGuests?: number;
	/** Adults cap (the rest of maxGuests may be children). Default maxGuests. */
	maxAdults?: number;
	onDark?: boolean;
	className?: string;
}

const ROWS = [
	{ key: 'adults', label: 'Adults', hint: '13 and over' },
	{ key: 'children', label: 'Children', hint: '2 to 12' },
	{ key: 'infants', label: 'Infants', hint: 'Under 2, cot provided' },
] as const;

/** Adults / children / infants steppers, capped by the villa's maxGuests and maxAdults. */
export function GuestPicker({ value, onChange, maxGuests = 10, maxAdults = maxGuests, onDark, className }: GuestPickerProps) {
	const total = value.adults + value.children;
	const max = {
		adults: Math.min(maxAdults, maxGuests - value.children),
		children: maxGuests - value.adults,
		infants: MAX_INFANTS,
	};
	const min = { adults: 1, children: 0, infants: 0 };
	return (
		<div className={clsx('flex flex-col', className)}>
			{ROWS.map((row, i) => (
				<div key={row.key} className={clsx('flex items-center justify-between gap-6 py-4', i > 0 && (onDark ? 'border-t border-line-on-dark' : 'border-t border-line'))}>
					<div>
						<p className={clsx('font-medium', onDark ? 'text-cream' : 'text-ink')}>{row.label}</p>
						<p className={clsx('text-[0.82rem]', onDark ? 'text-cream/60' : 'text-ink-muted')}>{row.hint}</p>
					</div>
					<Stepper label={row.label} value={value[row.key]} min={min[row.key]} max={Math.max(min[row.key], max[row.key])} onChange={(v) => onChange({ ...value, [row.key]: v })} />
				</div>
			))}
			<p className={clsx('pt-2 text-[0.8rem]', onDark ? 'text-cream/60' : 'text-ink-muted')} aria-live="polite">
				{total >= maxGuests ? `This house sleeps up to ${maxGuests}.` : `Sleeps up to ${maxGuests}${maxAdults < maxGuests ? `, of whom ${maxAdults} adults` : ''}.`}
			</p>
		</div>
	);
}
