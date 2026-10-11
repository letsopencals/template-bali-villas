'use client';

import { memo, useRef, type RefObject } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { ROOM_TOUR_ID, roomAnchorId, useRoomHighlight } from '@/components/villa/room-highlight-context';
import type { TourRoom } from '@/components/villa/villa-page-data';

export interface RoomTourProps {
	title: string;
	rooms: TourRoom[];
}

/**
 * "Room by room": a horizontal snap scroller of arch-framed rooms. Each photo
 * drifts inside its arch as the row scrolls (reduced motion: still). The floor
 * plan highlights and scrolls to cards via the room-highlight context.
 */
export function RoomTour({ title, rooms }: RoomTourProps) {
	const scroller = useRef<HTMLDivElement>(null);
	const { active, setActive } = useRoomHighlight();
	if (rooms.length === 0) return null;

	const nudge = (dir: 1 | -1) => {
		const el = scroller.current;
		if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 420), behavior: 'smooth' });
	};

	return (
		<section id={ROOM_TOUR_ID} aria-labelledby="room-tour-title" className="scroll-mt-28">
			<div className="flex items-end justify-between gap-6">
				<div>
					<p className="label">Inside {title}</p>
					<h2 id="room-tour-title" className="display-md mt-3">
						Room <em className="italic-soft">by</em> room
					</h2>
				</div>
				<div className="flex gap-2 max-md:hidden">
					<ArrowButton dir={-1} onClick={() => nudge(-1)} />
					<ArrowButton dir={1} onClick={() => nudge(1)} />
				</div>
			</div>
			<div
				ref={scroller}
				data-lenis-prevent-wheel
				className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 md:gap-7"
			>
				{rooms.map((r, i) => (
					<RoomCard key={r.key} room={r} index={i} total={rooms.length} villaTitle={title} container={scroller} highlighted={active === r.key} onHover={setActive} />
				))}
			</div>
		</section>
	);
}

interface RoomCardProps {
	room: TourRoom;
	index: number;
	total: number;
	villaTitle: string;
	container: RefObject<HTMLDivElement | null>;
	highlighted: boolean;
	onHover(key: string | null): void;
}

const RoomCard = memo(function RoomCard({ room, index, total, villaTitle, container, highlighted, onHover }: RoomCardProps) {
	const ref = useRef<HTMLElement>(null);
	const reduce = useReducedMotion();
	const { scrollXProgress } = useScroll({ container, target: ref, axis: 'x', offset: ['start end', 'end start'] });
	const x = useTransform(scrollXProgress, [0, 1], reduce ? ['0%', '0%'] : ['-9%', '9%']);

	return (
		<article
			ref={ref}
			id={roomAnchorId(room.key)}
			onPointerEnter={() => onHover(room.key)}
			onPointerLeave={() => onHover(null)}
			className="w-[78vw] max-w-[360px] shrink-0 snap-start sm:w-[46vw]"
		>
			<div className={clsx('arch image-placeholder relative aspect-[3/4] w-full transition-[box-shadow] duration-500', highlighted && 'ring-2 ring-terracotta ring-offset-4 ring-offset-paper')}>
				<motion.div className="absolute inset-y-0 -left-[10%] w-[120%]" style={{ x }}>
					<SafeImage src={room.image} alt={`${villaTitle}: ${room.name}`} fill sizes="(min-width: 640px) 40vw, 85vw" className="object-cover" />
				</motion.div>
				{room.fallback ? (
					<span className="glass absolute bottom-4 left-4 rounded-full px-3 py-1 text-[0.75rem] text-ink">Room photo coming soon</span>
				) : null}
			</div>
			<p className="label tabular mt-5">
				{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
			</p>
			<h3 className={clsx('mt-2 font-display text-[1.45rem] leading-tight transition-colors', highlighted && 'text-terracotta-deep')}>{room.name}</h3>
			{room.bedSetup ? <p className="mt-1 text-[0.92rem] text-terracotta">{room.bedSetup}</p> : null}
			<ul className="mt-3 flex flex-col gap-1.5 text-[0.95rem] text-ink-muted">
				{room.features.map((f) => (
					<li key={f} className="flex gap-2.5">
						<span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-ochre" />
						{f}
					</li>
				))}
			</ul>
		</article>
	);
});

function ArrowButton({ dir, onClick }: { dir: 1 | -1; onClick(): void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={dir === 1 ? 'Next room' : 'Previous room'}
			className="grid h-11 w-11 place-items-center rounded-full border border-line-strong transition-colors hover:border-ink hover:bg-sand"
		>
			<svg aria-hidden viewBox="0 0 16 16" className={clsx('h-4 w-4', dir === -1 && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
				<path d="M6 3l5 5-5 5" />
			</svg>
		</button>
	);
}
