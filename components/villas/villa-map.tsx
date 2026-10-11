'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import { PriceTag } from '@/components/ui/price-tag';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_SOFT } from '@/components/motion/easing';
import { MASTERPLAN_IMAGE, MASTERPLAN_POSITIONS, type VillaSummary } from '@/components/villas/villa-summary';

export interface VillaMapProps {
	villas: readonly VillaSummary[];
	/** Slugs that pass the current filters; the rest are dimmed. Default: all. */
	activeSlugs?: ReadonlySet<string>;
	/** `full`: the /villas map view with preview cards. `mini`: the villa-page locator. */
	variant?: 'full' | 'mini';
	/** Villa to highlight (mini) or preselect (full). */
	highlight?: string;
	/** Query string carried into villa links (dates and guests). */
	query?: string;
	className?: string;
}

const CARD_TRANSITION: Transition = { duration: 0.35, ease: EASE_SOFT };
const CARD_OFF = { opacity: 0, y: 8, scale: 0.97 } as const;
const CARD_ON = { opacity: 1, y: 0, scale: 1 } as const;

/**
 * The painted masterplan with one hotspot per villa. On narrow screens the
 * plan keeps its size and scrolls sideways inside its own container.
 */
export function VillaMap({ villas, activeSlugs, variant = 'full', highlight, query, className }: VillaMapProps) {
	const reduce = useReducedMotion();
	const [hover, setHover] = useState<string | null>(null);
	const [pinned, setPinned] = useState<string | null>(variant === 'full' ? (highlight ?? null) : null);
	const open = hover ?? pinned;
	const mini = variant === 'mini';
	const clear = useCallback(() => setHover(null), []);
	const placed = villas.filter((v) => MASTERPLAN_POSITIONS[v.slug]);

	return (
		<div
			data-lenis-prevent-wheel={mini ? undefined : true}
			className={clsx('no-scrollbar relative overflow-x-auto overscroll-x-contain rounded-[24px]', className)}
		>
			<div className={clsx('image-placeholder relative aspect-[16/9] overflow-hidden rounded-[24px]', mini ? 'w-full' : 'min-w-[860px]')}>
				<SafeImage src={MASTERPLAN_IMAGE} alt="Painted site plan of Lumbung Sidemen on the terraces of the Sidemen valley" fill sizes={mini ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 860px) 90vw, 860px'} className="object-cover" />
				<div aria-hidden className="absolute inset-0 bg-jungle-deep/10" />
				<ul className="absolute inset-0" onMouseLeave={clear}>
					{placed.map((v) => {
						const pos = MASTERPLAN_POSITIONS[v.slug]!;
						const dim = activeSlugs ? !activeSlugs.has(v.slug) : false;
						const isHighlight = highlight === v.slug;
						const isOpen = !mini && open === v.slug;
						const href = `/villas/${v.slug}${query ? `?${query}` : ''}`;
						return (
							<li key={v.slug} className="absolute" style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: isOpen || isHighlight ? 3 : 2 }}>
								{mini ? (
									<MiniPin villa={v} highlight={isHighlight} reduce={reduce} href={href} />
								) : (
									<>
										<Link
											href={href}
											onMouseEnter={() => setHover(v.slug)}
											onFocus={() => setPinned(v.slug)}
											aria-label={`${v.title}, $${v.price} a night${dim ? ', doesn’t match your filters' : ''}`}
											className={clsx(
												'tabular -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-3.5 text-[0.8rem] font-semibold shadow-[0_10px_30px_-12px_rgba(21,41,32,0.6)] outline-none transition-[background-color,color,opacity,transform] duration-300 focus-visible:ring-2 focus-visible:ring-terracotta',
												isOpen ? 'bg-terracotta text-cream' : 'glass text-ink hover:bg-cream',
												dim && !isOpen && 'opacity-45',
											)}
										>
											<span className={clsx('relative flex h-5 w-5 items-center justify-center rounded-full', isOpen ? 'bg-cream/25' : 'bg-terracotta/15')}>
												<span className={clsx('h-2 w-2 rounded-full', isOpen ? 'bg-cream' : 'bg-terracotta')} />
												{!reduce && !dim ? <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full bg-terracotta/30" /> : null}
											</span>
											{v.title}
											<span className={clsx('font-display font-normal', isOpen ? 'text-cream' : 'text-terracotta')}>${v.price}</span>
										</Link>
										<AnimatePresence>
											{isOpen ? (
												<motion.div
													key="card"
													initial={reduce ? false : CARD_OFF}
													animate={CARD_ON}
													exit={reduce ? undefined : CARD_OFF}
													transition={CARD_TRANSITION}
													className={clsx('pointer-events-none absolute w-64', pos.y > 50 ? 'bottom-6' : 'top-6', pos.x > 70 ? 'right-[-1rem]' : pos.x < 25 ? 'left-[-1rem]' : '-left-32')}
												>
													<PreviewCard villa={v} dim={dim} />
												</motion.div>
											) : null}
										</AnimatePresence>
									</>
								)}
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}

function MiniPin({ villa, highlight, reduce, href }: { villa: VillaSummary; highlight: boolean; reduce: boolean; href: string }) {
	if (!highlight) {
		return (
			<Link href={href} aria-label={villa.title} title={villa.title} className="group block -translate-x-1/2 -translate-y-1/2 p-1.5 outline-none">
				<span className="block h-2.5 w-2.5 rounded-full bg-cream/90 ring-2 ring-jungle/40 transition-transform group-hover:scale-125 group-focus-visible:ring-terracotta" />
			</Link>
		);
	}
	return (
		<div className="-translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
			<span className="relative flex h-6 w-6 items-center justify-center">
				{!reduce ? <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full bg-terracotta/40" /> : null}
				<span className="h-3.5 w-3.5 rounded-full bg-terracotta ring-4 ring-cream" />
			</span>
			<span className="glass mt-2 whitespace-nowrap rounded-full px-3 py-1 text-[0.78rem] font-semibold text-ink">You’re here · {villa.title}</span>
		</div>
	);
}

function PreviewCard({ villa, dim }: { villa: VillaSummary; dim: boolean }) {
	const c = villa.content;
	return (
		<div className="float-surface overflow-hidden rounded-[20px] ring-1 ring-line">
			<div className="image-placeholder relative aspect-[16/10]">
				<SafeImage src={villa.image} alt="" fill sizes="256px" className="object-cover" />
			</div>
			<div className="p-4">
				<p className="display-sm text-[1.2rem]">{villa.title}</p>
				{c ? <p className="mt-0.5 text-[0.85rem] text-ink-muted">{c.type}</p> : null}
				<div className="mt-3 flex items-end justify-between gap-3">
					{c ? (
						<span className="label">
							{c.maxGuests} guests · {c.bedrooms} {c.bedrooms === 1 ? 'bed' : 'beds'}
						</span>
					) : (
						<span />
					)}
					<PriceTag amount={villa.price} currency={villa.currency} size="sm" />
				</div>
				{dim ? <p className="mt-2 text-[0.78rem] text-ink-dim">Doesn’t match your filters</p> : null}
			</div>
		</div>
	);
}
