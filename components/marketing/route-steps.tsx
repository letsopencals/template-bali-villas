import { Reveal } from '@/components/motion/reveal';
import type { RouteLeg } from '@/components/marketing/getting-there-content';

/** Numbered route legs on a dotted road line. */
export function RouteSteps({ legs }: { legs: readonly RouteLeg[] }) {
	return (
		<ol className="relative">
			<span aria-hidden className="absolute bottom-6 left-[1.2rem] top-6 border-l-2 border-dotted border-terracotta/50" />
			{legs.map((leg, i) => (
				<Reveal as="li" key={leg.place} delay={i * 0.05} className="relative flex gap-6 pb-12 last:pb-0">
					<span className="tabular relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-terracotta bg-paper font-display text-[1rem] text-terracotta">
						{i + 1}
					</span>
					<div className="pt-1.5">
						<h3 className="font-display text-[1.35rem] leading-snug">{leg.place}</h3>
						{leg.local ? <p className="label mt-1">{leg.local}</p> : null}
						<p className="mt-3 max-w-lg text-ink-muted">{leg.text}</p>
					</div>
				</Reveal>
			))}
		</ol>
	);
}
