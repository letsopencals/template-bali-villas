import type { Metadata } from 'next';
import { templateImage } from '@/lib/villa-images';
import { siteConfig } from '@/lib/site-config';
import { breadcrumbJsonLd } from '@/lib/seo';
import { PageHero } from '@/components/marketing/page-hero';
import { EditorialImage } from '@/components/marketing/editorial-image';
import { Timeline } from '@/components/marketing/timeline';
import { ValleyBand } from '@/components/marketing/valley-band';
import { ValuesGrid } from '@/components/marketing/values-grid';
import { CtaBand } from '@/components/marketing/cta-band';
import { JsonLd } from '@/components/marketing/json-ld';
import { carpenter, familyTimeline, values } from '@/components/marketing/about-content';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = {
	title: 'Our story',
	description:
		'Lumbung Sidemen is run by one family, three generations, on the rice terraces they have always farmed. The barns, the joglos, the carpenter who builds them and the valley they stand in.',
	alternates: { canonical: '/about' },
	openGraph: { images: [templateImage('about/family')] },
};

const guestQuote = siteConfig.testimonials[0];

export default function AboutPage() {
	return (
		<>
			<JsonLd data={breadcrumbJsonLd([['Our story', '/about']])} />
			<PageHero
				image={templateImage('about/valley')}
				imageAlt="The Sidemen valley in the morning, rice terraces stepping down to the river with Mount Agung behind"
				eyebrow="Our story"
				local="Selamat datang"
				title={
					<>
						One family, <em className="italic-soft on-dark">one valley</em>
					</>
				}
				lede="We are not a hotel group. We are the family that has farmed these terraces for three generations, and the ten houses stand in our rice fields."
			/>

			{/* The family */}
			<section className="grain bg-paper">
				<div className="container-x relative z-[2] section-y grid items-start gap-14 md:grid-cols-12">
					<div className="md:col-span-5">
						<Reveal>
							<p className="label">The family</p>
							<h2 className="display-md mt-4">
								Three generations <em className="italic-soft">on the same slope</em>
							</h2>
						</Reveal>
						<Reveal delay={0.08}>
							<div className="mt-7 space-y-5 text-[1.05rem] leading-relaxed text-ink-muted">
								<p>
									Lumbung started with a barn. Our grandfather kept the harvest in a thatched lumbung at the top of the terraces, and when walkers on their way to Agung asked for a place to sleep, our parents gave them the floor of the bale and a plate of rice.
								</p>
								<p>
									That was the beginning. The houses came one at a time, built by the same carpenter, each where it fitted between the paddies and the river. The family still lives here, still farms, and still answers the phone.
								</p>
							</div>
						</Reveal>
						<Reveal delay={0.14}>
							<blockquote className="mt-10 border-l-2 border-terracotta pl-6">
								<p className="font-display text-[1.35rem] font-light leading-snug">“{guestQuote.quote}”</p>
								<footer className="label mt-4">
									{guestQuote.name} · {guestQuote.from}
								</footer>
							</blockquote>
						</Reveal>
					</div>
					<EditorialImage
						src={templateImage('about/family')}
						alt="Three generations of the family on the steps of the family bale"
						aspect="aspect-[4/5]"
						arch
						caption="On the steps of the family bale. Kakek, our parents, and the grandchildren who run reception."
						className="md:col-span-6 md:col-start-7"
						from="right"
					/>
				</div>
			</section>

			{/* Timeline */}
			<section className="bg-paper-deep">
				<div className="container-x section-y grid gap-14 md:grid-cols-12">
					<div className="md:col-span-4">
						<p className="label">How it grew</p>
						<h2 className="display-md mt-4">
							From one barn <em className="italic-soft">to ten houses</em>
						</h2>
						<p className="mt-5 max-w-sm text-ink-muted">Slowly, and in the order the money and the carpenter allowed.</p>
					</div>
					<div className="md:col-span-7 md:col-start-6">
						<Timeline entries={familyTimeline} />
					</div>
				</div>
			</section>

			{/* The carpenter */}
			<section className="grain bg-paper">
				<div className="container-x relative z-[2] section-y grid items-center gap-14 md:grid-cols-12">
					<EditorialImage
						src={templateImage('about/carpenter')}
						alt="The carpenter fitting a teak beam with a wooden peg in his workshop"
						aspect="aspect-[5/6]"
						caption={`${carpenter.name} in the workshop behind the coffee garden`}
						className="md:col-span-6"
						from="left"
					/>
					<div className="md:col-span-5 md:col-start-8">
						<Reveal>
							<p className="label">The builder</p>
							<h2 className="display-md mt-4">
								{carpenter.name}, <em className="italic-soft">and no nails</em>
							</h2>
							<p className="mt-2 font-display italic text-terracotta-deep">{carpenter.local}</p>
						</Reveal>
						<Reveal delay={0.08}>
							<div className="mt-7 space-y-5 text-[1.05rem] leading-relaxed text-ink-muted">
								{carpenter.paragraphs.map((p) => (
									<p key={p.slice(0, 24)}>{p}</p>
								))}
							</div>
							<p className="mt-9 font-display text-[1.6rem] font-light leading-snug">
								<em className="italic-soft">“{carpenter.pullQuote}”</em>
							</p>
						</Reveal>
					</div>
				</div>
			</section>

			<ValleyBand />

			<ValuesGrid values={values} />

			<CtaBand
				local="Sampai jumpa"
				title={
					<>
						Come and stay <em className="italic-soft on-dark">with the family</em>
					</>
				}
				text="Ten houses, from a rice-barn studio for two to an estate for eight. The price of every night is on the page."
				primary={{ href: '/villas', label: 'See the villas' }}
				secondary={{ href: '/contact', label: 'Write to us' }}
			/>
		</>
	);
}
