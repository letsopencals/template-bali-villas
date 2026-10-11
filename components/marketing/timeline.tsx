import { Reveal } from '@/components/motion/reveal';
import type { TimelineEntry } from '@/components/marketing/about-content';

/** Vertical timeline on a terracotta spine. Markers are labels, not invented years. */
export function Timeline({ entries }: { entries: readonly TimelineEntry[] }) {
	return (
		<ol className="relative border-l border-terracotta/40 pl-8 md:pl-12">
			{entries.map((e, i) => (
				<Reveal as="li" key={e.title} delay={i * 0.06} className="relative pb-14 last:pb-0">
					<span aria-hidden className="absolute -left-8 top-1.5 flex h-3 w-3 -translate-x-1/2 items-center justify-center md:-left-12">
						<span className="h-3 w-3 rounded-full border border-terracotta bg-paper" />
					</span>
					<p className="label">{e.marker}</p>
					<p className="mt-1 font-display text-[1rem] italic text-terracotta-deep">{e.local}</p>
					<h3 className="display-sm mt-3">{e.title}</h3>
					<p className="mt-3 max-w-xl text-ink-muted">{e.text}</p>
				</Reveal>
			))}
		</ol>
	);
}
