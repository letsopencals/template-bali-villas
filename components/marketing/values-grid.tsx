import { TerraceLines } from '@/components/motifs/terrace-lines';
import { CanangSari } from '@/components/motifs/canang-sari';
import { Reveal } from '@/components/motion/reveal';
import type { Value } from '@/components/marketing/about-content';

/** "What we hold to": three values on sand cards over terrace lines. */
export function ValuesGrid({ values }: { values: readonly Value[] }) {
	return (
		<section className="grain relative overflow-hidden bg-paper">
			<TerraceLines />
			<div className="container-x relative z-[2] section-y">
				<div className="flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="label">What we hold to</p>
						<h2 className="display-md mt-4 max-w-2xl">
							Three things <em className="italic-soft">we don’t bend on</em>
						</h2>
					</div>
					<CanangSari size={56} />
				</div>
				<ul className="mt-14 grid gap-5 md:grid-cols-3">
					{values.map((v, i) => (
						<Reveal as="li" key={v.title} delay={i * 0.08} className="flex flex-col rounded-[24px] bg-sand p-8">
							<span className="tabular label text-terracotta">{String(i + 1).padStart(2, '0')}</span>
							<h3 className="display-sm mt-6">{v.title}</h3>
							<p className="mt-1 font-display italic text-terracotta-deep">{v.local}</p>
							<p className="mt-5 text-ink-muted">{v.text}</p>
						</Reveal>
					))}
				</ul>
			</div>
		</section>
	);
}
