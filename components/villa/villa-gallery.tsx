'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DayDuskToggle, type Light } from '@/components/villa/day-dusk-toggle';
import type { LightboxGroup, LightboxItem, MosaicTile } from '@/components/villa/villa-page-data';

const VillaLightbox = dynamic(() => import('@/components/villa/villa-lightbox').then((m) => m.VillaLightbox), { ssr: false });

export interface VillaGalleryProps {
	title: string;
	tiles: MosaicTile[];
	items: LightboxItem[];
	groups: LightboxGroup[];
	/** The store has dusk photos for this villa. */
	hasDusk: boolean;
}

/**
 * Mosaic: one tall arch-topped exterior and four room tiles. The Day/Dusk
 * toggle cross-fades every tile to its dusk twin (or a warm dim when it has
 * none) over 900 ms. Any tile opens the room-grouped lightbox.
 */
export function VillaGallery({ title, tiles, items, groups, hasDusk }: VillaGalleryProps) {
	const [light, setLight] = useState<Light>('day');
	// Dusk photos only load once someone shows interest in the toggle.
	const [wantDusk, setWantDusk] = useState(false);
	const [openAt, setOpenAt] = useState<number | null>(null);
	const reduce = useReducedMotion();
	const [big, ...small] = tiles;
	const dusk = light === 'dusk';

	const onLight = useCallback((v: Light) => {
		setWantDusk(true);
		setLight(v);
	}, []);
	const onIntent = useCallback(() => setWantDusk(true), []);
	const close = useCallback(() => setOpenAt(null), []);

	return (
		<section aria-label={`Photos of ${title}`} className="relative">
			<div className="grid gap-3 md:grid-cols-[1.35fr_1fr] md:gap-4">
				{big ? <Tile tile={big} dusk={dusk} loadDusk={wantDusk} reduce={reduce} onOpen={setOpenAt} big priority sizes="(min-width: 768px) 55vw, 100vw" /> : null}
				{small.length > 0 ? (
					<div className="grid grid-cols-2 gap-3 md:gap-4">
						{small.map((t, i) => (
							<Tile key={`${t.day}-${i}`} tile={t} dusk={dusk} loadDusk={wantDusk} reduce={reduce} onOpen={setOpenAt} sizes="(min-width: 768px) 22vw, 50vw" />
						))}
					</div>
				) : null}
			</div>

			<div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-end justify-between gap-3 px-4 md:bottom-6 md:px-6">
				{hasDusk ? <DayDuskToggle value={light} onChange={onLight} onIntent={onIntent} className="pointer-events-auto" /> : <span />}
				{items.length > 0 ? (
					<button
						type="button"
						onClick={() => setOpenAt(0)}
						className="glass pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.88rem] font-medium text-ink transition-colors hover:bg-cream"
					>
						<GridGlyph />
						View all <span className="tabular">{items.length}</span> photos
					</button>
				) : null}
			</div>

			{openAt !== null ? <VillaLightbox title={title} items={items} groups={groups} index={openAt} onIndex={setOpenAt} onClose={close} /> : null}
		</section>
	);
}

interface TileProps {
	tile: MosaicTile;
	dusk: boolean;
	loadDusk: boolean;
	reduce: boolean;
	onOpen(i: number): void;
	big?: boolean;
	priority?: boolean;
	sizes: string;
}

function Tile({ tile, dusk, loadDusk, reduce, onOpen, big, priority, sizes }: TileProps) {
	const fade = { transitionDuration: reduce ? '0ms' : '900ms' };
	return (
		<button
			type="button"
			onClick={() => onOpen(tile.index)}
			aria-label={`Open photo: ${tile.alt}`}
			className={clsx(
				'image-placeholder group relative block w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-4',
				big ? 'arch aspect-[4/5] md:aspect-auto md:h-full md:min-h-[560px]' : 'aspect-square rounded-[20px]',
			)}
		>
			<SafeImage src={tile.day} alt={tile.alt} fill sizes={sizes} priority={priority} className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" />
			{tile.dusk ? (
				loadDusk ? (
					<SafeImage
						src={tile.dusk}
						alt=""
						aria-hidden
						fill
						sizes={sizes}
						className={clsx('object-cover transition-[opacity,transform] ease-in-out group-hover:scale-[1.04]', dusk ? 'opacity-100' : 'opacity-0')}
						style={fade}
					/>
				) : null
			) : (
				// No dusk twin: warm the tile down instead.
				<span aria-hidden className={clsx('absolute inset-0 bg-gradient-to-b from-terracotta-deep/35 via-jungle-deep/35 to-jungle-deep/60 mix-blend-multiply transition-opacity ease-in-out', dusk ? 'opacity-100' : 'opacity-0')} style={fade} />
			)}
			{big ? <span aria-hidden className="scrim-bottom absolute inset-x-0 bottom-0 h-1/3" /> : null}
		</button>
	);
}

function GridGlyph() {
	return (
		<svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
			<rect x="1" y="1" width="6" height="6" rx="1.5" />
			<rect x="9" y="1" width="6" height="6" rx="1.5" />
			<rect x="1" y="9" width="6" height="6" rx="1.5" />
			<rect x="9" y="9" width="6" height="6" rx="1.5" />
		</svg>
	);
}
