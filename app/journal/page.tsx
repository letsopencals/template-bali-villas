import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { breadcrumbJsonLd } from '@/lib/seo';
import { journalPosts } from '@/content/journal';
import { PaperIntro } from '@/components/marketing/paper-intro';
import { JournalCard } from '@/components/marketing/journal-card';
import { CtaBand } from '@/components/marketing/cta-band';
import { JsonLd } from '@/components/marketing/json-ld';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = {
	title: 'Journal',
	description: `Notes from ${siteConfig.name}: the rice year in the Sidemen valley, how a teak joglo travels from Java, and the canang sari offerings made every morning.`,
	alternates: { canonical: '/journal' },
};

export default function JournalPage() {
	const [lead, ...rest] = journalPosts;
	return (
		<>
			<JsonLd data={breadcrumbJsonLd([['Journal', '/journal']])} />
			<PaperIntro
				eyebrow="Journal"
				local="Catatan dari lembah"
				title={
					<>
						Notes <em className="italic-soft">from the valley</em>
					</>
				}
				lede="Slow pieces by the family about the things around the villas: the fields, the houses, the mornings. Read them before you come, or on the terrace when you are here."
			/>
			<section className="bg-paper">
				<div className="container-x pb-24 md:pb-36">
					{lead ? (
						<Reveal>
							<JournalCard post={lead} lead />
						</Reveal>
					) : null}
					{rest.length ? (
						<ul className="mt-20 grid gap-14 border-t border-line pt-16 md:mt-28 md:grid-cols-2 md:gap-10">
							{rest.map((p, i) => (
								<Reveal as="li" key={p.slug} delay={i * 0.08}>
									<JournalCard post={p} />
								</Reveal>
							))}
						</ul>
					) : null}
				</div>
			</section>
			<CtaBand
				local="Terima kasih sudah membaca"
				title={
					<>
						Come and see it <em className="italic-soft on-dark">for yourself</em>
					</>
				}
				text="Ten houses in the rice fields of Sidemen, each with its price on the page."
				primary={{ href: '/villas', label: 'See the villas' }}
				secondary={{ href: '/about', label: 'Our story' }}
			/>
		</>
	);
}
