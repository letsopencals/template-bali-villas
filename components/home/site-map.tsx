'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_EXPO } from '@/components/motion/easing';
import { SafeImage } from '@/components/ui/safe-image';
import { PriceTag } from '@/components/ui/price-tag';
import { buttonClasses } from '@/components/ui/button';
import { STILL_PINS_16X9 } from '@/components/home/hero-still-pins';

export interface MapVilla {
	slug: string;
	title: string;
	price: number;
	currency: string;
	image: string | null;
	type: string | null;
	maxGuests: number | null;
	bedrooms: number | null;
}

const MAP_IMAGE = '/images/masterplan/masterplan-16x9.jpg';
const CARD_FROM = { opacity: 0, y: 10, scale: 0.97 } as const;
const CARD_TO = { opacity: 1, y: 0, scale: 1 } as const;
const CARD_TRANSITION: Transition = { duration: 0.45, ease: EASE_EXPO };

function facts(v: MapVilla): string | null {
	if (v.maxGuests == null || v.bedrooms == null) return null;
	return `${v.maxGuests} guests · ${v.bedrooms} ${v.bedrooms === 1 ? 'bedroom' : 'bedrooms'}`;
}

/**
 * "Find your house": the illustrated masterplan with a numbered hotspot per
 * villa (at the positions measured in the 16:9 still). Hover or focus shows a
 * preview card next to the hotspot; on small screens the card sits below the
 * map and the numbered list doubles as the picker.
 */
export function SiteMap({ villas }: { villas: MapVilla[] }) {
	const reduce = useReducedMotion();
	const placed = villas.filter((v) => STILL_PINS_16X9[v.slug]);
	const [active, setActive] = useState<string | null>(null);
	const current = placed.find((v) => v.slug === active) ?? null;
	const mobile = current ?? placed[0] ?? null;

	const clearOnMouseLeave = useCallback((e: React.PointerEvent) => {
		if (e.pointerType === 'mouse') setActive(null);
	}, []);

	if (placed.length === 0) return null;

	return (
		<div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-10">
			<div onPointerLeave={clearOnMouseLeave}>
				<div className="relative aspect-[16/9] w-full">
					<div className="image-placeholder absolute inset-0 overflow-hidden rounded-[24px] ring-1 ring-line">
						<SafeImage
							src={MAP_IMAGE}
							alt="Illustrated site plan of Lumbung Sidemen: ten houses on the terraces, the river on the left, the coffee garden on the right and Mount Agung at the top"
							fill
							sizes="(min-width: 1024px) 70vw, 100vw"
							className="object-cover"
						/>
						<div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-jungle-deep/25 via-transparent to-transparent" />
					</div>

					{/* Hotspots */}
					{placed.map((v, i) => {
						const pos = STILL_PINS_16X9[v.slug]!;
						const on = active === v.slug;
						const mobileDefault = !on && mobile?.slug === v.slug;
						return (
							<button
								key={v.slug}
								type="button"
								aria-label={`${v.title}, show details`}
								aria-pressed={on}
								onPointerEnter={(e) => (e.pointerType === 'mouse' ? setActive(v.slug) : undefined)}
								onFocus={() => setActive(v.slug)}
								onClick={() => setActive(v.slug)}
								className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5 outline-none md:p-2"
								style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
							>
								{on && !reduce ? <span aria-hidden className="absolute inset-1.5 animate-pulse-ring rounded-full bg-terracotta md:inset-2" /> : null}
								<span
									className={clsx(
										'tabular relative flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] font-semibold ring-2 transition-[background-color,color,transform] duration-300 group-focus-visible:ring-terracotta md:h-8 md:w-8 md:text-[0.75rem]',
										on
											? 'scale-110 bg-terracotta text-cream ring-cream'
											: mobileDefault
												? 'bg-cream text-ink ring-cream/70 max-md:bg-terracotta max-md:text-cream group-hover:bg-terracotta group-hover:text-cream'
												: 'bg-cream text-ink ring-cream/70 group-hover:bg-terracotta group-hover:text-cream',
									)}
								>
									{i + 1}
								</span>
							</button>
						);
					})}

					{/* Desktop preview card */}
					<AnimatePresence>
						{current ? <DesktopCard key={current.slug} villa={current} reduce={reduce} /> : null}
					</AnimatePresence>
				</div>
				<p className="label mt-4 max-md:hidden">Hover a number to meet the house · not to scale</p>
				<p className="label mt-3 md:hidden">Tap a number to meet the house</p>
			</div>

			{/* Mobile card */}
			{mobile ? (
				<div className="md:hidden">
					<PreviewCard villa={mobile} />
				</div>
			) : null}

			{/* Legend / picker */}
			<ol className="grid grid-cols-1 gap-1 self-start sm:grid-cols-2 lg:grid-cols-1" aria-label="The ten houses">
				{placed.map((v, i) => {
					const on = (current ?? null)?.slug === v.slug;
					return (
						<li key={v.slug}>
							<button
								type="button"
								onPointerEnter={(e) => (e.pointerType === 'mouse' ? setActive(v.slug) : undefined)}
								onFocus={() => setActive(v.slug)}
								onClick={() => setActive(v.slug)}
								aria-pressed={on}
								className={clsx(
									'flex w-full items-center gap-3 rounded-full px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-terracotta',
									on ? 'bg-sand' : 'hover:bg-sand/70',
								)}
							>
								<span className={clsx('tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-semibold', on ? 'bg-terracotta text-cream' : 'bg-sand-strong text-ink')}>{i + 1}</span>
								<span className="min-w-0 flex-1 truncate text-[0.95rem] font-medium text-ink">{v.title}</span>
								<PriceTag amount={v.price} currency={v.currency} size="sm" unit={null} className="shrink-0" />
							</button>
						</li>
					);
				})}
			</ol>
		</div>
	);
}

function DesktopCard({ villa, reduce }: { villa: MapVilla; reduce: boolean }) {
	const pos = STILL_PINS_16X9[villa.slug]!;
	const right = pos.x < 58;
	const below = pos.y < 45;
	return (
		<motion.div
			className="pointer-events-none absolute z-10 w-[280px] max-md:hidden"
			style={{
				left: right ? `calc(${pos.x}% + 26px)` : undefined,
				right: right ? undefined : `calc(${100 - pos.x}% + 26px)`,
				top: below ? `calc(${pos.y}% - 28px)` : undefined,
				bottom: below ? undefined : `calc(${100 - pos.y}% - 28px)`,
			}}
			initial={reduce ? false : CARD_FROM}
			animate={CARD_TO}
			exit={reduce ? undefined : CARD_FROM}
			transition={CARD_TRANSITION}
		>
			<div className="pointer-events-auto">
				<PreviewCard villa={villa} compact />
			</div>
		</motion.div>
	);
}

function PreviewCard({ villa, compact }: { villa: MapVilla; compact?: boolean }) {
	const f = facts(villa);
	return (
		<article className={clsx('float-surface overflow-hidden rounded-[24px] p-3', compact ? '' : 'sm:flex sm:gap-4')}>
			<div className={clsx('image-placeholder relative overflow-hidden rounded-[20px]', compact ? 'aspect-[16/10]' : 'aspect-[16/10] sm:aspect-square sm:w-40 sm:shrink-0')}>
				<SafeImage src={villa.image} alt={villa.type ? `${villa.title}, ${villa.type.toLowerCase()}` : villa.title} fill sizes="280px" className="object-cover" />
			</div>
			<div className="px-2 pb-2 pt-4 sm:flex-1">
				<h3 className="display-sm text-ink">{villa.title}</h3>
				{villa.type ? <p className="mt-1 text-[0.9rem] text-ink-muted">{villa.type}</p> : null}
				{f ? <p className="label mt-2">{f}</p> : null}
				<div className="mt-4 flex items-center justify-between gap-3">
					<PriceTag amount={villa.price} currency={villa.currency} size="sm" />
					<Link href={`/villas/${villa.slug}`} className={buttonClasses('secondary', 'sm')}>
						See the house
					</Link>
				</div>
			</div>
		</article>
	);
}
