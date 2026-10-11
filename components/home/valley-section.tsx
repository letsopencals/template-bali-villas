import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { templateImage } from '@/lib/villa-images';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal, RevealImage } from '@/components/motion/reveal';
import { CountUp } from '@/components/motion/count-up';
import { ParallaxImage } from '@/components/motion/parallax-image';
import { TerraceLines } from '@/components/motifs/terrace-lines';
import { parseFact } from '@/components/home/home-format';

/**
 * "The valley": a big mixed-italic statement beside an overlapping photo pair,
 * then the facts from siteConfig.facts in a full-width row (numbers count up on first view).
 */
export function ValleySection() {
	return (
		<section id="valley" aria-labelledby="valley-title" className="grain relative scroll-mt-20 overflow-hidden bg-paper">
			<TerraceLines className="opacity-70" />
			<div className="container-x section-y relative">
				<div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-24">
					<div>
						<Reveal>
							<p className="label">The valley · Selamat datang</p>
						</Reveal>
						<Reveal delay={0.05}>
							<h2 id="valley-title" className="display-lg mt-6 max-w-[14ch] text-ink">
								Rice on every side, <em className="italic-soft">Agung across the valley</em>.
							</h2>
						</Reveal>
						<Reveal delay={0.1} className="mt-10 max-w-xl space-y-5 text-[1.05rem] leading-relaxed text-ink-muted">
							<p>
								Sidemen is a farming valley in Karangasem, East Bali, a long way from the beach clubs. The terraces step down to the river, the mornings
								start in mist, and on clear days Mount Agung fills the view.
							</p>
							<p>
								We are one family running ten houses here: rice barns, teak joglos and family homes, built from thatch, timber and volcanic
								stone. You book with us directly, at the price you see.
							</p>
						</Reveal>
						<Reveal delay={0.15} className="mt-8">
							<Link href="/about" className="link-underline font-medium text-terracotta-deep">
								Our story
							</Link>
						</Reveal>
					</div>

					{/* Two photos overlapping on one corner; the box keeps its proportions at every width. */}
					<div className="relative mx-auto aspect-[1/1.12] w-full max-w-[36rem]">
						{/* Positioned wrappers: ParallaxImage and RevealImage add `relative`, which would beat `absolute` (no tailwind-merge). */}
						<div className="absolute left-0 top-0 w-[72%]">
							<ParallaxImage
								src={templateImage('about/valley')}
								alt="The Sidemen valley in the morning, terraces stepping down to the river"
								sizes="(min-width: 1024px) 30vw, 70vw"
								strength={8}
								className="aspect-[4/5] rounded-[20px]"
							/>
						</div>
						<div className="absolute bottom-0 right-0 w-[44%] rounded-[20px] ring-8 ring-paper">
							<RevealImage from="up" delay={0.2} className="image-placeholder aspect-[3/4] rounded-[20px]">
								<SafeImage src={templateImage('day/pagi')} alt="Morning coffee on a bale above the paddy" fill sizes="(min-width: 1024px) 18vw, 42vw" className="object-cover" />
							</RevealImage>
						</div>
						<p className="label absolute bottom-0 left-0 max-w-[48%] max-md:hidden">
							Pagi <span className="normal-case tracking-normal">(morning)</span>, from the breakfast bale
						</p>
					</div>
				</div>

				<dl className="mt-20 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:mt-24">
					{siteConfig.facts.map((f, i) => {
						const parsed = parseFact(f.value);
						return (
							<Reveal key={f.label} delay={0.05 * i} className="border-t border-line-strong pt-5">
								<dt className="sr-only">{f.label}</dt>
								<dd>
									<span className="block font-display text-[2.6rem] font-light leading-none text-terracotta">
										{'text' in parsed ? parsed.text : <CountUp value={parsed.value} prefix={parsed.prefix} suffix={parsed.suffix} />}
									</span>
									<span aria-hidden className="mt-3 block text-[0.92rem] leading-snug text-ink-muted">
										{f.label}
									</span>
								</dd>
							</Reveal>
						);
					})}
				</dl>
			</div>
		</section>
	);
}
