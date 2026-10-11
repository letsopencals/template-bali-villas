import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { emailHref, whatsappHref } from '@/lib/contact';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';
import { PaperIntro } from '@/components/marketing/paper-intro';
import { Accordion, AccordionItem } from '@/components/marketing/accordion';
import { JsonLd } from '@/components/marketing/json-ld';
import { allFaqEntries, faqGroups } from '@/components/marketing/faq-content';
import { buttonClasses } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = {
	title: 'Questions',
	description: `Prices, check-in at ${siteConfig.stay.checkIn} and check-out by ${siteConfig.stay.checkOut}, free cancellation up to ${siteConfig.stay.cancellationDays} days before, children, getting to Sidemen and life in the villas.`,
	alternates: { canonical: '/faq' },
};

export default function FaqPage() {
	return (
		<>
			<JsonLd data={faqJsonLd(allFaqEntries)} />
			<JsonLd data={breadcrumbJsonLd([['Questions', '/faq']])} />
			<PaperIntro
				eyebrow="Questions"
				local="Tanya jawab"
				title={
					<>
						Before you come, <em className="italic-soft">the honest answers</em>
					</>
				}
				lede="The things people ask us most, from prices and check-in times to children, the road and the insects. If yours isn’t here, write to us."
			>
				<nav aria-label="Question groups">
					<ul className="flex flex-wrap gap-2">
						{faqGroups.map((g) => (
							<li key={g.key}>
								<Link href={`#${g.key}`} className="inline-flex h-10 items-center rounded-full bg-sand px-5 text-[0.88rem] font-medium transition-colors hover:bg-sand-strong">
									{g.title}
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</PaperIntro>

			<section className="bg-paper">
				<div className="container-x space-y-20 pb-24 md:space-y-28 md:pb-36">
					{faqGroups.map((g) => (
						<div key={g.key} id={g.key} className="grid scroll-mt-28 gap-8 md:grid-cols-12">
							<Reveal className="md:col-span-4">
								<h2 className="display-sm">{g.title}</h2>
								<p className="mt-1 font-display italic text-terracotta-deep">{g.local}</p>
							</Reveal>
							<Accordion className="md:col-span-8">
								{g.items.map((item) => (
									<AccordionItem key={item.question} question={item.question}>
										<p>{item.answer}</p>
									</AccordionItem>
								))}
							</Accordion>
						</div>
					))}
				</div>
			</section>

			<section className="bg-paper-deep">
				<div className="container-x flex flex-col items-start gap-8 py-20 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="label">Still wondering</p>
						<h2 className="display-sm mt-3 max-w-xl">Ask the family. We usually answer within the day, in English or Bahasa.</h2>
					</div>
					<div className="flex flex-wrap gap-3">
						<a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClasses('primary', 'md')}>
							WhatsApp us
						</a>
						<a href={emailHref} className={buttonClasses('outline', 'md')}>
							{siteConfig.contact.email}
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
