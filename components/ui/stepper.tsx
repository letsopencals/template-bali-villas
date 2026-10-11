'use client';

import { clsx } from 'clsx';

export interface StepperProps {
	value: number;
	onChange(value: number): void;
	min?: number;
	max?: number;
	/** Accessible name, e.g. "Adults". */
	label: string;
	/** Optional visible value formatter (defaults to the number). */
	format?(value: number): string;
	size?: 'sm' | 'md';
	className?: string;
	disabled?: boolean;
}

function Glyph({ plus }: { plus?: boolean }) {
	return (
		<svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
			<path d="M2 6h8" />
			{plus ? <path d="M6 2v8" /> : null}
		</svg>
	);
}

/** −/n/+ counter (guests, add-on quantities). Buttons disable at min/max. */
export function Stepper({ value, onChange, min = 0, max = Infinity, label, format, size = 'md', className, disabled }: StepperProps) {
	const btn = clsx(
		'flex shrink-0 items-center justify-center rounded-full border border-line-strong text-ink transition-colors duration-200 hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line-strong',
		size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
	);
	return (
		<div role="group" aria-label={label} className={clsx('inline-flex items-center gap-3', className)}>
			<button type="button" className={btn} aria-label={`Fewer ${label.toLowerCase()}`} disabled={disabled || value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
				<Glyph />
			</button>
			<output aria-live="polite" className="tabular min-w-6 text-center text-[1rem] font-semibold text-ink">
				{format ? format(value) : value}
			</output>
			<button type="button" className={btn} aria-label={`More ${label.toLowerCase()}`} disabled={disabled || value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
				<Glyph plus />
			</button>
		</div>
	);
}
