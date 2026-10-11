'use client';

import { motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_SOFT } from '@/components/motion/easing';

export type Light = 'day' | 'dusk';

export interface DayDuskToggleProps {
	value: Light;
	onChange(v: Light): void;
	/** Fired on first hover/focus, so the dusk photos can start loading early. */
	onIntent?(): void;
	className?: string;
}

const SPIN: Transition = { duration: DURATION.crossfade, ease: EASE_SOFT };

/** Glass pill "Day ◐ Dusk" over the gallery. The glyph turns from sun to moon. */
export function DayDuskToggle({ value, onChange, onIntent, className }: DayDuskToggleProps) {
	const reduce = useReducedMotion();
	const dusk = value === 'dusk';
	return (
		<div role="group" aria-label="Light" className={clsx('glass inline-flex items-center gap-1 rounded-full p-1 text-[0.85rem] text-ink', className)} onPointerEnter={onIntent} onFocus={onIntent}>
			<ToggleButton pressed={!dusk} onClick={() => onChange('day')}>
				Day
			</ToggleButton>
			<motion.span aria-hidden className="grid h-7 w-7 place-items-center" animate={{ rotate: reduce ? 0 : dusk ? 180 : 0 }} transition={SPIN}>
				<SunMoonGlyph />
			</motion.span>
			<ToggleButton pressed={dusk} onClick={() => onChange('dusk')}>
				Dusk
			</ToggleButton>
		</div>
	);
}

function ToggleButton({ pressed, onClick, children }: { pressed: boolean; onClick(): void; children: React.ReactNode }) {
	return (
		<button
			type="button"
			aria-pressed={pressed}
			onClick={onClick}
			className={clsx('rounded-full px-3.5 py-1.5 font-medium transition-colors duration-300', pressed ? 'bg-jungle text-cream' : 'text-ink-muted hover:text-ink')}
		>
			{children}
		</button>
	);
}

/** Half sun, half moon: rotating 180° swaps which half faces up. */
function SunMoonGlyph() {
	return (
		<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
			<circle cx="12" cy="12" r="4.5" />
			<path d="M12 7.5a4.5 4.5 0 0 1 0 9z" fill="currentColor" stroke="none" />
			<path d="M12 2.5v2M4.5 12h-2M21.5 12h-2M5.6 5.6l1.4 1.4M18.4 5.6 17 7" />
			<path d="M7.5 19.5c1.2.8 2.8 1.5 4.5 1.5s3.3-.7 4.5-1.5" opacity="0.6" />
		</svg>
	);
}
