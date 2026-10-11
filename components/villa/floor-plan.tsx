'use client';

import { clsx } from 'clsx';
import type { VillaContent } from '@/lib/villa-content';
import { useRoomHighlight } from '@/components/villa/room-highlight-context';

export interface FloorPlanProps {
	title: string;
	plan: VillaContent['floorPlan'];
	/** Room keys that have a card in the tour (only those are links). */
	tourKeys: string[];
	sizeM2?: number;
}

/**
 * Hand-drawn style plan in a 100×60 box. Hovering a room highlights it here
 * and in the room tour; clicking scrolls the tour to it.
 */
export function FloorPlan({ title, plan, tourKeys, sizeM2 }: FloorPlanProps) {
	const { active, setActive, goTo } = useRoomHighlight();
	if (plan.length === 0) return null;
	const linked = new Set(tourKeys);

	return (
		<section aria-labelledby="floor-plan-title" className="grid gap-8 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
			<div className="rounded-[24px] bg-sand/60 p-4 md:p-6">
				<svg viewBox="-2 -2 104 64" role="img" aria-labelledby="floor-plan-title" className="h-auto w-full">
					<defs>
						<pattern id="fp-hatch" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
							<path d="M0 0v2" stroke="var(--color-terracotta)" strokeWidth="0.35" opacity="0.5" />
						</pattern>
					</defs>
					<rect x="-1" y="-1" width="102" height="62" rx="2" fill="none" stroke="var(--color-line-strong)" strokeWidth="0.3" strokeDasharray="1 1" />
					{plan.map((r) => {
						const on = active === r.room;
						const isLink = linked.has(r.room);
						return (
							<g
								key={`${r.room}-${r.label}`}
								role={isLink ? 'link' : undefined}
								tabIndex={isLink ? 0 : undefined}
								aria-label={isLink ? `${r.label}: see it in the room tour` : r.label}
								onPointerEnter={() => setActive(r.room)}
								onPointerLeave={() => setActive(null)}
								onFocus={() => setActive(r.room)}
								onBlur={() => setActive(null)}
								onClick={isLink ? () => goTo(r.room) : undefined}
								onKeyDown={
									isLink
										? (e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													goTo(r.room);
												}
											}
										: undefined
								}
								className={clsx('outline-none', isLink && 'cursor-pointer')}
							>
								<rect
									x={r.x}
									y={r.y}
									width={r.w}
									height={r.h}
									rx="1"
									fill={on ? 'url(#fp-hatch)' : 'var(--color-paper)'}
									stroke={on ? 'var(--color-terracotta)' : 'var(--color-ink)'}
									strokeWidth={on ? 0.7 : 0.45}
									className="transition-[stroke,stroke-width] duration-300"
								/>
								<text
									x={r.x + r.w / 2}
									y={r.y + r.h / 2}
									textAnchor="middle"
									dominantBaseline="middle"
									fontSize={Math.min(3.2, r.h / 3.2, r.w / 5)}
									fill={on ? 'var(--color-terracotta-deep)' : 'var(--color-ink-muted)'}
									className="pointer-events-none select-none font-display"
								>
									{r.label}
								</text>
							</g>
						);
					})}
				</svg>
			</div>
			<div>
				<p className="label">Floor plan</p>
				<h2 id="floor-plan-title" className="display-sm mt-3">
					How {title} fits together
				</h2>
				<p className="mt-3 text-[0.95rem] text-ink-muted">
					{sizeM2 ? <span className="tabular">{sizeM2} m² inside and out. </span> : null}
					Hover a room to find it in the tour, or tap to jump there. Not to scale.
				</p>
			</div>
		</section>
	);
}
