import { siteConfig } from '@/lib/site-config';
import { ParallaxImage } from '@/components/motion/parallax-image';
import { Reveal } from '@/components/motion/reveal';

const MASTERPLAN = '/images/masterplan/masterplan-16x9.jpg';

/** The valley: wide aerial band, a short paragraph and the siteConfig facts. */
export function ValleyBand() {
	return (
		<section className="on-dark relative bg-jungle text-cream">
			<ParallaxImage
				src={MASTERPLAN}
				alt="The ten villas stepped down the terraces of the Sidemen valley, the river below and Mount Agung across"
				className="aspect-[16/10] w-full md:aspect-[21/9]"
				strength={8}
			>
				<div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,58,46,0)_40%,rgba(31,58,46,1)_100%)]" />
			</ParallaxImage>
			<div className="container-x relative -mt-20 pb-24 md:-mt-32 md:pb-32">
				<div className="grid gap-12 md:grid-cols-12">
					<Reveal className="md:col-span-6">
						<p className="label on-dark">The valley</p>
						<h2 className="display-md mt-4 text-cream">
							Sidemen, <em className="italic-soft on-dark">east of everything</em>
						</h2>
						<p className="mt-6 max-w-xl text-cream/80">
							Sidemen sits in the hills of Karangasem, the quiet eastern end of Bali, where the Unda river cuts a green valley below Mount Agung. Terraces run down both sides, fed by water from the mountain. Mornings start in mist. Evenings are cool enough for a long sleeve. The beach is about an hour away, and most people forget about it.
						</p>
					</Reveal>
					<dl className="grid grid-cols-2 gap-x-8 gap-y-10 md:col-span-5 md:col-start-8 md:pt-16">
						{siteConfig.facts.map((f) => (
							<div key={f.label} className="border-t border-line-on-dark pt-5">
								<dt className="sr-only">{f.label}</dt>
								<dd>
									<span className="tabular block font-display text-[2.6rem] font-light leading-none text-cream">{f.value}</span>
									<span className="label on-dark mt-3 block">{f.label}</span>
								</dd>
							</div>
						))}
					</dl>
				</div>
			</div>
		</section>
	);
}
