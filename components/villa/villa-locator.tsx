import { VillaMap } from '@/components/villas/villa-map';
import type { VillaSummary } from '@/components/villas/villa-summary';

/** Where the house sits on the estate (mini masterplan with a pin). */
export function VillaLocator({ villas, slug, title }: { villas: VillaSummary[]; slug: string; title: string }) {
	return (
		<section aria-labelledby="locator-title">
			<p className="label">On the estate</p>
			<h2 id="locator-title" className="display-sm mt-3">
				Where {title} sits
			</h2>
			<p className="mt-2 max-w-xl text-ink-muted">Ten houses across the terraces. The other pins are your neighbours.</p>
			<VillaMap villas={villas} variant="mini" highlight={slug} className="mt-8" />
		</section>
	);
}
