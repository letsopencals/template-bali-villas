'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type PanInfo, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import { Chip } from '@/components/ui/chip';
import { useModalOverlay, useMounted } from '@/components/ui/use-overlay';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_SOFT } from '@/components/motion/easing';
import type { LightboxGroup, LightboxItem } from '@/components/villa/villa-page-data';

export interface VillaLightboxProps {
	title: string;
	items: LightboxItem[];
	groups: LightboxGroup[];
	index: number;
	onIndex(i: number): void;
	onClose(): void;
}

const FADE = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as const;
const FADE_T: Transition = { duration: 0.3 };
const SLIDE_T: Transition = { duration: 0.45, ease: EASE_SOFT };
const SWIPE_PX = 60;

/**
 * Full-screen photo viewer (z-80, above the header and sheets). Photos are
 * grouped by room: chips jump to a group, arrows and swipes step through
 * everything. Escape closes; focus is trapped; Lenis is paused.
 */
export function VillaLightbox({ title, items, groups, index, onIndex, onClose }: VillaLightboxProps) {
	const mounted = useMounted();
	const reduce = useReducedMotion();
	const panelRef = useRef<HTMLDivElement>(null);
	const stripRef = useRef<HTMLDivElement>(null);
	useModalOverlay(true, onClose, panelRef, '[data-lightbox-close]');

	const count = items.length;
	const step = useCallback((d: number) => onIndex((index + d + count) % count), [index, count, onIndex]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'ArrowRight') step(1);
			else if (e.key === 'ArrowLeft') step(-1);
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [step]);

	// Keep the current thumbnail in view.
	useEffect(() => {
		stripRef.current?.querySelector<HTMLElement>(`[data-thumb="${index}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
	}, [index, reduce]);

	const onDragEnd = (_: unknown, info: PanInfo) => {
		if (info.offset.x < -SWIPE_PX) step(1);
		else if (info.offset.x > SWIPE_PX) step(-1);
	};

	if (!mounted || count === 0) return null;
	const item = items[Math.min(index, count - 1)]!;
	const group = groups.find((g) => g.id === item.group);

	return createPortal(
		<motion.div
			ref={panelRef}
			role="dialog"
			aria-modal="true"
			aria-label={`${title} photos`}
			tabIndex={-1}
			data-lenis-prevent
			className="fixed inset-0 z-[80] flex flex-col bg-jungle-deep/97 text-cream outline-none"
			{...FADE}
			transition={FADE_T}
		>
			<header className="flex items-center justify-between gap-4 px-4 pb-2 pt-4 md:px-8 md:pt-6">
				<p className="min-w-0 truncate">
					<span className="font-display text-[1.15rem]">{title}</span>
					<span className="tabular ml-3 text-[0.85rem] text-cream/60">
						{index + 1} / {count}
					</span>
				</p>
				<button
					type="button"
					data-lightbox-close
					onClick={onClose}
					aria-label="Close photos"
					className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line-on-dark transition-colors hover:bg-cream/10"
				>
					<svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
						<path d="M3 3l10 10M13 3 3 13" />
					</svg>
				</button>
			</header>

			{groups.length > 1 ? (
				<nav aria-label="Rooms" className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2 md:justify-center md:px-8">
					{groups.map((g) => (
						<Chip key={g.id} size="sm" onDark selected={g.id === item.group} onClick={() => onIndex(g.start)} className="shrink-0">
							{g.label}
							<span className="tabular opacity-60">{g.count}</span>
						</Chip>
					))}
				</nav>
			) : null}

			<div className="relative min-h-0 flex-1">
				<AnimatePresence initial={false} mode="popLayout">
					<motion.figure
						key={item.url}
						className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-24"
						initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0 }}
						transition={SLIDE_T}
						drag={count > 1 ? 'x' : false}
						dragConstraints={{ left: 0, right: 0 }}
						dragElastic={0.18}
						onDragEnd={onDragEnd}
					>
						<div className="relative h-full w-full">
							<SafeImage src={item.url} alt={item.caption} fill sizes="100vw" className="select-none object-contain" draggable={false} />
						</div>
						<figcaption className="pt-3 text-center text-[0.9rem] text-cream/75">
							{item.caption}
							{group && group.count > 1 ? (
								<span className="tabular ml-2 text-cream/45">
									{index - group.start + 1} of {group.count}
								</span>
							) : null}
						</figcaption>
					</motion.figure>
				</AnimatePresence>
				{count > 1 ? (
					<>
						<NavButton dir={-1} onClick={() => step(-1)} />
						<NavButton dir={1} onClick={() => step(1)} />
					</>
				) : null}
			</div>

			<div ref={stripRef} data-lenis-prevent className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-5 pt-3 md:px-8">
				{items.map((it, i) => (
					<button
						key={it.url}
						type="button"
						data-thumb={i}
						onClick={() => onIndex(i)}
						aria-label={`Photo ${i + 1}: ${it.caption}`}
						aria-current={i === index ? 'true' : undefined}
						className={clsx(
							'image-placeholder relative h-14 w-20 shrink-0 overflow-hidden rounded-[10px] transition-opacity md:h-16 md:w-24',
							i === index ? 'opacity-100 ring-2 ring-terracotta-bright' : 'opacity-50 hover:opacity-80',
						)}
					>
						<SafeImage src={it.url} alt="" fill sizes="96px" className="object-cover" />
					</button>
				))}
			</div>
		</motion.div>,
		document.body,
	);
}

function NavButton({ dir, onClick }: { dir: 1 | -1; onClick(): void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={dir === 1 ? 'Next photo' : 'Previous photo'}
			className={clsx(
				'absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line-on-dark bg-jungle-deep/40 backdrop-blur-sm transition-colors hover:bg-cream/10 max-md:hidden',
				dir === 1 ? 'right-6' : 'left-6',
			)}
		>
			<svg aria-hidden viewBox="0 0 16 16" className={clsx('h-4 w-4', dir === -1 && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
				<path d="M6 3l5 5-5 5" />
			</svg>
		</button>
	);
}
