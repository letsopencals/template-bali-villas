'use client';

import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_SOFT } from '@/components/motion/easing';

export type SectionStatus = 'open' | 'done' | 'locked';

interface ReserveSectionProps {
	id: string;
	index: number;
	title: string;
	/** One-line italic aside under the title while open. */
	lede?: string;
	status: SectionStatus;
	/** Shown when `done` (collapsed). */
	summary?: ReactNode;
	onEdit?: () => void;
	children: ReactNode;
}

const BODY_INITIAL = { opacity: 0, height: 0 };
const BODY_ANIMATE = { opacity: 1, height: 'auto' };
const BODY_EXIT = { opacity: 0, height: 0 };
const BODY_TRANSITION = { duration: 0.45, ease: EASE_SOFT };
const NO_TRANSITION = { duration: 0 };

function Tick() {
	return (
		<svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M3.5 8.5l3 3 6-7" />
		</svg>
	);
}

/**
 * Numbered checkout step. Open: title + body. Done: a check, the summary and
 * an Edit link. Locked: just the dimmed title (reached by finishing the step before).
 */
export function ReserveSection({ id, index, title, lede, status, summary, onEdit, children }: ReserveSectionProps) {
	const reduce = useReducedMotion();
	const open = status === 'open';
	return (
		<section id={id} aria-labelledby={`${id}-title`} className={clsx('scroll-mt-28 border-t border-line py-8 first:border-t-0 sm:py-10', status === 'locked' && 'opacity-55')}>
			<header className="flex items-start gap-4 sm:gap-5">
				<span
					aria-hidden
					className={clsx(
						'tabular mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[0.9rem] font-medium transition-colors duration-300',
						status === 'done' ? 'border-moss bg-moss text-cream' : open ? 'border-terracotta bg-terracotta text-cream' : 'border-line-strong text-ink-muted',
					)}
				>
					{status === 'done' ? <Tick /> : index}
				</span>
				<div className="min-w-0 flex-1">
					<div className="flex items-baseline justify-between gap-4">
						<h2 id={`${id}-title`} className="display-sm">
							<span className="sr-only">Step {index}: </span>
							{title}
							{status === 'done' ? <span className="sr-only"> (done)</span> : null}
						</h2>
						{status === 'done' && onEdit ? (
							<button type="button" onClick={onEdit} className="link-underline shrink-0 text-[0.88rem] font-medium text-terracotta-deep" aria-label={`Edit ${title.toLowerCase()}`}>
								Edit
							</button>
						) : null}
					</div>
					{open && lede ? <p className="italic-soft mt-1 text-[1.05rem]">{lede}</p> : null}
					{status === 'done' && summary ? <div className="mt-2 text-[0.95rem] text-ink-muted">{summary}</div> : null}
				</div>
			</header>
			<AnimatePresence initial={false}>
				{open ? (
					<motion.div
						key="body"
						initial={reduce ? false : BODY_INITIAL}
						animate={BODY_ANIMATE}
						exit={reduce ? undefined : BODY_EXIT}
						transition={reduce ? NO_TRANSITION : BODY_TRANSITION}
						className="overflow-hidden"
					>
						<div className="pt-7 sm:pl-14">{children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</section>
	);
}

/** Inline, kind error under a step (API messages, conflicts). */
export function SectionError({ children }: { children: ReactNode }) {
	return (
		<div role="alert" className="mt-5 flex gap-3 rounded-[20px] border border-danger/25 bg-danger/[0.06] px-5 py-4 text-[0.92rem] text-ink">
			<span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
			<div>{children}</div>
		</div>
	);
}
