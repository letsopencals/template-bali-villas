import { siteConfig } from '@/lib/site-config';
import { Reveal } from '@/components/motion/reveal';

export interface VillaReviewsProps {
	slug: string;
	title: string;
	/** slug → title, to attribute reviews of other houses. */
	titles: Record<string, string>;
}

/** Guest words about this house first; if there are none yet, about the others. */
export function VillaReviews({ slug, title, titles }: VillaReviewsProps) {
	const own = siteConfig.testimonials.filter((t) => t.villa === slug);
	const reviews = own.length > 0 ? own : siteConfig.testimonials.filter((t) => t.villa !== slug).slice(0, 2);
	if (reviews.length === 0) return null;

	return (
		<section aria-labelledby="reviews-title">
			<p className="label">From the guest book</p>
			<h2 id="reviews-title" className="display-sm mt-3">
				{own.length > 0 ? `Guests on ${title}` : 'Guests on staying with us'}
			</h2>
			<div className="mt-8 grid gap-5 md:grid-cols-2">
				{reviews.map((r, i) => (
					<Reveal key={r.name} delay={i * 0.08}>
						<figure className="h-full rounded-[24px] bg-sand/60 p-6 md:p-7">
							<blockquote className="italic-soft font-display text-[1.25rem] leading-snug">“{r.quote}”</blockquote>
							<figcaption className="mt-5 text-[0.9rem] text-ink-muted">
								<span className="font-medium text-ink">{r.name}</span> · {r.from}
								{r.villa !== slug && titles[r.villa] ? <span> · Stayed in {titles[r.villa]}</span> : null}
							</figcaption>
						</figure>
					</Reveal>
				))}
			</div>
		</section>
	);
}
