'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_EXPO } from '@/components/motion/easing';

/**
 * Candi bentar, the Balinese split gate (DESIGN.md §5.1).
 *
 * - `mode="gate"`: hero reveal. Two jungle halves sit together over the
 *   positioned parent (the hero) and slide out left and right over 1.4s, once
 *   per session (sessionStorage `GATE_STORAGE_KEY`). `children` (the wordmark)
 *   rise through the gap. Reduced motion or a returning visitor: it starts open.
 *   Put `<GateScript />` in <head> so returning visitors never see a frame of it.
 * - `mode="curtain"`: the quick 0.6s full-viewport page curtain with half-height
 *   towers (app/template.tsx).
 * - `mode="divider"`: a 28px cream/terracotta glyph between sections.
 */

export const GATE_STORAGE_KEY = 'lumbung:gate-seen';
const GATE_ATTR = 'data-gate-seen';

/** Inline <head> script: marks <html> before paint when the gate already played. */
export function GateScript() {
	const js = `try{if(sessionStorage.getItem('${GATE_STORAGE_KEY}'))document.documentElement.setAttribute('${GATE_ATTR}','')}catch(e){}`;
	return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

/**
 * One tower half, drawn for the LEFT side (the split face is the right edge).
 * viewBox 0 0 100 300; stepped tiers climb toward the split.
 */
const TOWER =
	'M0 300V196h10v-22h12v-20h10v-22h10v-18h10v-18h9v-16h8v-15h7v-14h6v-12h5v-11h4V0h9v300Z';
const TIERS = [196, 174, 154, 132, 114, 96, 80, 65, 51, 39, 28];

function TowerHalf({ side, towerHeight = '100%', className }: { side: 'left' | 'right'; towerHeight?: string; className?: string }) {
	return (
		<div className={clsx('relative h-full w-full overflow-hidden', className)}>
			<div className="absolute inset-x-0 bottom-0 bg-jungle" style={{ top: `calc(100% - ${towerHeight})` }}>
				<svg
					aria-hidden
					viewBox="0 0 100 300"
					preserveAspectRatio="none"
					className={clsx('absolute bottom-full left-0 h-[42%] w-full max-h-[60vh]', side === 'right' && '-scale-x-100')}
				>
					<path d={TOWER} transform="translate(0 0)" className="fill-jungle" />
				</svg>
				<svg aria-hidden viewBox="0 0 100 300" preserveAspectRatio="none" className={clsx('absolute inset-0 h-full w-full', side === 'right' && '-scale-x-100')}>
					{TIERS.map((y, i) => (
						<line key={y} x1={100 - (TIERS.length - i) * 6} x2="100" y1={y} y2={y} stroke="rgba(251,248,242,0.16)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
					))}
					<line x1="99.5" x2="99.5" y1="0" y2="300" stroke="rgba(251,248,242,0.22)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
				</svg>
			</div>
		</div>
	);
}

const GATE_TRANSITION: Transition = { duration: DURATION.gate, ease: EASE_EXPO, delay: 0.25 };
const CURTAIN_TRANSITION: Transition = { duration: DURATION.curtain, ease: EASE_EXPO, delay: 0.05 };
const LEFT_OPEN = { x: '-101%' } as const;
const RIGHT_OPEN = { x: '101%' } as const;
const SHUT = { x: '0%' } as const;
const RISE_FROM = { y: 40, opacity: 0 } as const;
const RISE_TO = { y: 0, opacity: 1 } as const;
const RISE_TRANSITION: Transition = { duration: DURATION.gate, ease: EASE_EXPO, delay: 0.45 };
const INSTANT: Transition = { duration: 0 };

export interface CandiBentarProps {
	mode: 'gate' | 'curtain' | 'divider';
	/** Gate only: content that rises through the gap (e.g. the wordmark). Rendered either way. */
	children?: ReactNode;
	/** Gate only: called once the gate has opened (or immediately when skipped). */
	onOpened?(): void;
	className?: string;
}

export function CandiBentar({ mode, children, onOpened, className }: CandiBentarProps) {
	if (mode === 'divider') return <CandiDivider className={className} />;
	if (mode === 'curtain') return <CandiCurtain className={className} />;
	return (
		<CandiGate onOpened={onOpened} className={className}>
			{children}
		</CandiGate>
	);
}

function CandiGate({ children, onOpened, className }: { children?: ReactNode; onOpened?(): void; className?: string }) {
	const reduce = useReducedMotion();
	// 'pending' on the server and first client render (closed, CSS hides it for returning visitors).
	const [phase, setPhase] = useState<'pending' | 'opening' | 'done'>('pending');

	useEffect(() => {
		if (reduce === null) return;
		let seen = false;
		try {
			seen = !!sessionStorage.getItem(GATE_STORAGE_KEY);
			sessionStorage.setItem(GATE_STORAGE_KEY, '1');
		} catch {
			seen = false;
		}
		const skip = seen || reduce;
		const id = window.requestAnimationFrame(() => {
			setPhase(skip ? 'done' : 'opening');
			if (skip) onOpened?.();
		});
		return () => window.cancelAnimationFrame(id);
		// onOpened is a one-shot callback; re-running for a new identity would replay the gate.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reduce]);

	const animate = phase === 'opening';
	return (
		<>
			{phase !== 'done' ? (
				<div aria-hidden data-candi-gate className={clsx('pointer-events-none absolute inset-0 z-[70] flex overflow-hidden', className)}>
					<motion.div className="h-full w-1/2" initial={SHUT} animate={animate ? LEFT_OPEN : SHUT} transition={GATE_TRANSITION}>
						<TowerHalf side="left" towerHeight="72%" />
					</motion.div>
					<motion.div
						className="h-full w-1/2"
						initial={SHUT}
						animate={animate ? RIGHT_OPEN : SHUT}
						transition={GATE_TRANSITION}
						onAnimationComplete={() => {
							if (animate) {
								setPhase('done');
								onOpened?.();
							}
						}}
					>
						<TowerHalf side="right" towerHeight="72%" />
					</motion.div>
				</div>
			) : null}
			{children ? (
				<motion.div data-gate-rise initial={RISE_FROM} animate={phase === 'pending' ? RISE_FROM : RISE_TO} transition={animate ? RISE_TRANSITION : INSTANT}>
					{children}
				</motion.div>
			) : null}
		</>
	);
}

function CandiCurtain({ className }: { className?: string }) {
	const reduce = useReducedMotion();
	return (
		<div aria-hidden data-candi-curtain className={clsx('pointer-events-none fixed inset-0 z-[70] flex overflow-hidden', className)}>
			<motion.div className="h-full w-1/2" initial={reduce ? false : SHUT} animate={LEFT_OPEN} transition={CURTAIN_TRANSITION}>
				<TowerHalf side="left" towerHeight="50%" />
			</motion.div>
			<motion.div className="h-full w-1/2" initial={reduce ? false : SHUT} animate={RIGHT_OPEN} transition={CURTAIN_TRANSITION}>
				<TowerHalf side="right" towerHeight="50%" />
			</motion.div>
		</div>
	);
}

/** Small split-gate glyph between sections (28px high). */
export function CandiDivider({ className, onDark }: { className?: string; onDark?: boolean }) {
	return (
		<div role="presentation" className={clsx('flex items-center justify-center gap-4', className)}>
			<span className={clsx('h-px w-16', onDark ? 'bg-line-on-dark' : 'bg-line-strong')} />
			<svg aria-hidden viewBox="0 0 48 28" className="h-7 w-12">
				<path d="M2 28V20h3v-4h3v-4h3V9h3V6h2V3h3v25Z" className={onDark ? 'fill-cream' : 'fill-terracotta'} />
				<path d="M46 28V20h-3v-4h-3v-4h-3V9h-3V6h-2V3h-3v25Z" className={onDark ? 'fill-cream' : 'fill-terracotta'} />
				<circle cx="24" cy="22" r="1.6" className="fill-ochre" />
			</svg>
			<span className={clsx('h-px w-16', onDark ? 'bg-line-on-dark' : 'bg-line-strong')} />
		</div>
	);
}
