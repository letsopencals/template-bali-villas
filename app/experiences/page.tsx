import type { Metadata } from 'next';
import Link from 'next/link';
import { templateImage } from '@/lib/villa-images';
import { siteConfig } from '@/lib/site-config';
import { breadcrumbJsonLd } from '@/lib/seo';
import { PageHero } from '@/components/marketing/page-hero';
import { ExperienceRow } from '@/components/marketing/experience-row';
import { CtaBand } from '@/components/marketing/cta-band';
import { JsonLd } from '@/components/marketing/json-ld';
import { addOnSteps, experiences } from '@/components/marketing/experiences-content';
import { getResortAddOns, matchAddOn } from '@/components/marketing/add-ons';
import { buttonClasses } from '@/components/ui/button';
import { IkatRule } from '@/components/motifs/ikat-rule';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = {
	title: 'Experiences in Sidemen',
	description:
		'Sunrise on Mount Agung from Pura Pasar Agung, songket weaving, a Balinese cooking class, massage, the family warung and the village temples. Add them to your stay when you book.',
	alternates: { canonical: '/experiences' },
	openGraph: { images: [templateImage('experiences/sunrise-trek')] },
};

export default async function ExperiencesPage() {
	const addOns = await getResortAddOns();
	const rows = experiences.map((e) => ({ experience: e, addOn: e.addOnKeywords.length ? matchAddOn(addOns, e.addOnKeywords) : null }));

	return (
		<>
			<JsonLd data={breadcrumbJsonLd([['Experiences', '/experiences']])} />
			<PageHero
				image={templateImage('experiences/sunrise-trek')}
				imageAlt="First light over Mount Agung from the trail above Pura Pasar Agung"
				eyebrow="Experiences"
				local="Ada apa di lembah"
				title={
					<>
						Things to do <em className="italic-soft on-dark">in the valley</em>
					</>
				}
				lede="Sidemen is a working valley, not a resort town. The best things here are the ones the village already does: weaving, cooking, praying, farming, and climbing the mountain before dawn."
			>
				<Link href="#sunrise-trek" className={buttonClasses('glass', 'md')}>
					Start with the sunrise
				</Link>
			</PageHero>

			<section className="grain bg-paper">
				<div className="container-x relative z-[2] pb-10 pt-20 md:pt-28">
					<div className="grid gap-10 md:grid-cols-12">
						<Reveal className="md:col-span-6">
							<p className="label">How it works</p>
							<p className="display-sm mt-4 max-w-xl">
								Some of these are add-ons with a fixed price you can see now. The rest we arrange <em className="italic-soft">at reception</em>, and you pay the person who guides you.
							</p>
						</Reveal>
						<nav aria-label="Experiences on this page" className="md:col-span-5 md:col-start-8">
							<ul className="grid gap-x-6 sm:grid-cols-2">
								{rows.map(({ experience: e }, i) => (
									<li key={e.key} className="border-b border-line">
										<Link href={`#${e.key}`} className="group flex items-baseline gap-3 py-3.5">
											<span className="tabular label text-terracotta">{String(i + 1).padStart(2, '0')}</span>
											<span className="transition-colors group-hover:text-terracotta-deep">{e.name}</span>
										</Link>
									</li>
								))}
							</ul>
						</nav>
					</div>
					<IkatRule className="mt-16 opacity-50" />
				</div>

				<div className="container-x relative z-[2] space-y-28 pb-28 pt-16 md:space-y-40 md:pb-36">
					{rows.map(({ experience, addOn }, i) => (
						<ExperienceRow key={experience.key} experience={experience} addOn={addOn} index={i} />
					))}
				</div>
			</section>

			<section className="bg-paper-deep">
				<div className="container-x section-y">
					<div className="grid gap-12 md:grid-cols-12">
						<div className="md:col-span-4">
							<p className="label">Adding them to your stay</p>
							<h2 className="display-md mt-4">
								Booked with the villa, <em className="italic-soft">planned with us</em>
							</h2>
							<p className="mt-5 text-ink-muted">{siteConfig.stay.taxNote}</p>
						</div>
						<ol className="grid gap-5 md:col-span-7 md:col-start-6 md:grid-cols-3">
							{addOnSteps.map((s, i) => (
								<li key={s.title} className="rounded-[24px] bg-sand p-6">
									<span className="tabular font-display text-[2rem] font-light text-terracotta">{i + 1}</span>
									<h3 className="mt-3 font-display text-[1.2rem]">{s.title}</h3>
									<p className="mt-2 text-[0.95rem] text-ink-muted">{s.text}</p>
								</li>
							))}
						</ol>
					</div>
				</div>
			</section>

			<CtaBand
				local="Sampai jumpa di Sidemen"
				title={
					<>
						First, a house <em className="italic-soft on-dark">to come back to</em>
					</>
				}
				text="Ten villas from rice-barn studios to a four-bedroom estate. Every nightly price is on the card."
				primary={{ href: '/villas', label: 'See the villas' }}
				secondary={{ href: '/getting-there', label: 'Getting here' }}
			/>
		</>
	);
}
