'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { VillaCard, type VillaCardData } from '@/components/villas/villa-card';
import { Chip } from '@/components/ui/chip';
import { buttonClasses } from '@/components/ui/button';
import { CanangSari } from '@/components/motifs/canang-sari';
import { siteConfig } from '@/lib/site-config';
import type { VillaCollection } from '@/lib/villa-content';

export type CarouselVilla = VillaCardData & { collections: VillaCollection[] };

const COLLECTION_KEYS = Object.keys(siteConfig.collections) as VillaCollection[];

/**
 * Horizontal arch-card carousel of every villa (already in VILLA_ORDER), with
 * collection chips to filter. Native scroll-snap; arrows scroll one card.
 */
export function VillaCarousel({ villas }: { villas: CarouselVilla[] }) {
	const [filter, setFilter] = useState<VillaCollection | 'all'>('all');
	const trackRef = useRef<HTMLUListElement>(null);
	const [edges, setEdges] = useState({ start: true, end: false });

	const counts = useMemo(() => {
		const out = new Map<VillaCollection, number>();
		for (const key of COLLECTION_KEYS) out.set(key, villas.filter((v) => v.collections.includes(key)).length);
		return out;
	}, [villas]);
	const shown = useMemo(() => (filter === 'all' ? villas : villas.filter((v) => v.collections.includes(filter))), [villas, filter]);

	const measure = useCallback(() => {
		const el = trackRef.current;
		if (!el) return;
		const start = el.scrollLeft < 8;
		const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
		setEdges((p) => (p.start === start && p.end === end ? p : { start, end }));
	}, []);

	useEffect(() => {
		const el = trackRef.current;
		if (!el) return;
		el.scrollTo({ left: 0 });
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, [filter, measure]);

	const step = useCallback((dir: 1 | -1) => {
		const el = trackRef.current;
		if (!el) return;
		const card = el.querySelector('li');
		const width = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
		el.scrollBy({ left: dir * width, behavior: 'smooth' });
	}, []);

	const blurb = filter === 'all' ? null : siteConfig.collections[filter].blurb;

	return (
		<div>
			<div className="container-x flex flex-wrap items-center justify-between gap-4">
				<div role="group" aria-label="Filter villas by collection" className="flex flex-wrap gap-2">
					<Chip size="sm" selected={filter === 'all'} onClick={() => setFilter('all')}>
						All <span className="tabular opacity-70">{villas.length}</span>
					</Chip>
					{COLLECTION_KEYS.map((key) =>
						(counts.get(key) ?? 0) > 0 ? (
							<Chip key={key} size="sm" selected={filter === key} onClick={() => setFilter(key)}>
								{siteConfig.collections[key].label} <span className="tabular opacity-70">{counts.get(key)}</span>
							</Chip>
						) : null,
					)}
				</div>
				<div className="flex items-center gap-2">
					<ArrowButton dir={-1} disabled={edges.start} onClick={step} />
					<ArrowButton dir={1} disabled={edges.end} onClick={step} />
				</div>
			</div>
			<p className="container-x mt-4 min-h-[1.6rem] text-[0.95rem] italic text-ink-muted" aria-live="polite">
				{blurb ?? `All ${villas.length} houses, cheapest first.`}
			</p>

			{shown.length === 0 ? (
				<div className="container-x mt-10 flex flex-col items-center gap-4 py-16 text-center text-ink-muted">
					<CanangSari size={56} />
					<p>The villas are resting. Please try again in a moment.</p>
				</div>
			) : (
				<ul
					ref={trackRef}
					onScroll={measure}
					aria-label="Villas"
					className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain px-5 pb-4 scroll-pl-5 md:px-10 md:scroll-pl-10 2xl:px-[calc((100vw-1440px)/2+2.5rem)] 2xl:scroll-pl-[calc((100vw-1440px)/2+2.5rem)]"
				>
					{shown.map((v, i) => (
						<li key={v.slug} className="w-[78vw] shrink-0 snap-start sm:w-[44vw] lg:w-[29vw] xl:w-[22rem]">
							<VillaCard villa={v} priority={i < 2} sizes="(min-width: 1280px) 22rem, (min-width: 1024px) 29vw, (min-width: 640px) 44vw, 78vw" />
						</li>
					))}
					<li className="flex w-[60vw] shrink-0 snap-start items-center sm:w-[30vw] lg:w-[16rem]">
						<Link href={filter === 'all' ? '/villas' : `/villas?collection=${filter}`} className="arch group flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 bg-jungle p-8 text-center text-cream">
							<span className="font-display text-[1.5rem] font-light leading-tight">
								Compare <em className="italic-soft on-dark">every house</em>
							</span>
							<span className={buttonClasses('outline', 'sm', { onDark: true })}>See all villas</span>
						</Link>
					</li>
				</ul>
			)}
		</div>
	);
}

function ArrowButton({ dir, disabled, onClick }: { dir: 1 | -1; disabled: boolean; onClick(dir: 1 | -1): void }) {
	return (
		<button
			type="button"
			aria-label={dir === 1 ? 'Next villas' : 'Previous villas'}
			disabled={disabled}
			onClick={() => onClick(dir)}
			className={clsx(
				'inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink hover:bg-ink/[0.03] disabled:cursor-not-allowed disabled:opacity-35',
				'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta',
			)}
		>
			<svg aria-hidden viewBox="0 0 16 16" className={clsx('h-4 w-4', dir === -1 && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
				<path d="M3 8h10M9 4l4 4-4 4" />
			</svg>
		</button>
	);
}
