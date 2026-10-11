import { siteConfig } from '@/lib/site-config';
import { Marquee } from '@/components/motion/marquee';
import { CanangSari } from '@/components/motifs/canang-sari';
import { titleFromSlug } from '@/components/home/home-format';

/**
 * "Guests say": a slow marquee of quote cards. No links inside (a moving
 * target is hard to click); the villa is named under each quote. Reduced
 * motion: the marquee sits still and scrolls by hand on small screens.
 */
export function Testimonials({ villaTitles }: { villaTitles: Record<string, string> }) {
	const items: readonly (typeof siteConfig.testimonials)[number][] = siteConfig.testimonials;
	if (items.length === 0) return null;
	return (
		<section aria-labelledby="guests-title" className="overflow-hidden bg-sand py-24 md:py-32">
			<div className="container-x flex items-end justify-between gap-6">
				<div>
					<p className="label">Guests say</p>
					<h2 id="guests-title" className="display-md mt-4 text-ink">
						In their <em className="italic-soft">own words</em>
					</h2>
				</div>
				<CanangSari size={48} className="max-sm:hidden" />
			</div>
			<Marquee duration={70} gapClassName="gap-6" className="mt-14">
				{items.map((t) => (
					<figure key={t.name} className="float-surface flex w-[19rem] shrink-0 flex-col justify-between gap-8 rounded-[24px] p-7 md:w-[24rem]">
						<blockquote className="font-display text-[1.2rem] font-light leading-snug text-ink md:text-[1.35rem]">
							<span aria-hidden className="text-terracotta">“</span>
							{t.quote}
							<span aria-hidden className="text-terracotta">”</span>
						</blockquote>
						<figcaption className="flex items-baseline justify-between gap-3 border-t border-line pt-4">
							<span className="text-[0.95rem] font-medium text-ink">
								{t.name} <span className="font-normal text-ink-muted">· {t.from}</span>
							</span>
							<span className="label truncate">{villaTitles[t.villa] ?? titleFromSlug(t.villa)}</span>
						</figcaption>
					</figure>
				))}
			</Marquee>
		</section>
	);
}
