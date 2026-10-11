'use client';

import { useId, useState, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';

interface MobileSummaryProps {
	/** "Total $1,240" or "From $240 / night". */
	label: string;
	children: ReactNode;
}

/** Below lg: the summary folds into a "Total $X ▾" disclosure at the top of the form. */
export function MobileSummary({ label, children }: MobileSummaryProps) {
	const id = useId();
	const [open, setOpen] = useState(false);
	return (
		<div className="overflow-hidden rounded-[24px] bg-jungle text-cream lg:hidden">
			<button
				type="button"
				aria-expanded={open}
				aria-controls={id}
				onClick={() => setOpen((v) => !v)}
				className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
			>
				<span className="label on-dark">Your stay</span>
				<span className="tabular flex items-center gap-2 font-medium">
					{label}
					<svg aria-hidden viewBox="0 0 12 12" className={clsx('h-3 w-3 transition-transform duration-300', open && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
						<path d="M2.5 4.5L6 8l3.5-3.5" />
					</svg>
				</span>
			</button>
			<div id={id} hidden={!open} className="border-t border-line-on-dark">
				{children}
			</div>
		</div>
	);
}

interface StickyPayBarProps {
	totalLabel: string;
	actionLabel: string;
	onAction: (() => void) | null;
	busy: boolean;
}

/** Below lg: a sticky bottom bar with the total and the next action (Pay once payment is ready). */
export function StickyPayBar({ totalLabel, actionLabel, onAction, busy }: StickyPayBarProps) {
	return (
		<div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
			<div className="flex items-center justify-between gap-4">
				<p className="tabular min-w-0 truncate text-[0.95rem] font-medium">{totalLabel}</p>
				<Button variant="primary" size="md" pill onClick={onAction ?? undefined} disabled={!onAction || busy}>
					{busy ? 'One moment…' : actionLabel}
				</Button>
			</div>
		</div>
	);
}
