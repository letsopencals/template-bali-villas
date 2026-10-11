import { VillaCard } from '@/components/villas/villa-card';
import { Reveal } from '@/components/motion/reveal';
import type { VillaSummary } from '@/components/villas/villa-summary';

/** Three nearby-in-spirit houses (shared collection, then closest price). */
export function SimilarVillas({ villas }: { villas: VillaSummary[] }) {
	if (villas.length === 0) return null;
	return (
		<section aria-labelledby="similar-title" className="container-x section-y">
			<p className="label">Also on the terraces</p>
			<h2 id="similar-title" className="display-md mt-3">
				You might <em className="italic-soft">also</em> like
			</h2>
			<ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
				{villas.map((v, i) => (
					<Reveal as="li" key={v.slug} delay={i * 0.08}>
						<VillaCard villa={v} />
					</Reveal>
				))}
			</ul>
		</section>
	);
}
