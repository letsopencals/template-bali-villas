import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { addressLines, emailHref, phoneHref, whatsappHref } from '@/lib/contact';
import { getVillas } from '@/lib/server-data';
import { breadcrumbJsonLd } from '@/lib/seo';
import { PaperIntro } from '@/components/marketing/paper-intro';
import { ContactForm } from '@/components/marketing/contact-form';
import { ContactChannels } from '@/components/marketing/contact-channels';
import { MapCard } from '@/components/marketing/map-card';
import { JsonLd } from '@/components/marketing/json-ld';

export const metadata: Metadata = {
	title: 'Contact',
	description: `WhatsApp, phone or email the family at ${siteConfig.name}. ${siteConfig.contact.hours}.`,
	alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
	const villas = await getVillas();
	const channels = [
		{ label: 'WhatsApp', local: 'Paling cepat', value: siteConfig.contact.whatsapp, href: whatsappHref, external: true, note: 'The quickest way to reach us' },
		{ label: 'Phone', local: 'Telepon', value: siteConfig.contact.phone, href: phoneHref, external: false, note: siteConfig.contact.hours },
		{ label: 'Email', local: 'Surel', value: siteConfig.contact.email, href: emailHref, external: false, note: 'For longer questions, groups and retreats' },
	];

	return (
		<>
			<JsonLd data={breadcrumbJsonLd([['Contact', '/contact']])} />
			<PaperIntro
				eyebrow="Contact"
				local="Hubungi kami"
				title={
					<>
						Write to the family, <em className="italic-soft">not a call centre</em>
					</>
				}
				lede="Wayan or Kadek will answer, usually within the day. We are happy to help with which house suits you, the journey, or planning a celebration."
			/>

			<section className="bg-paper">
				<div className="container-x pb-20">
					<ContactChannels channels={channels} />
				</div>
			</section>

			<section className="bg-paper">
				<div className="container-x grid gap-14 pb-24 md:grid-cols-12 md:pb-36">
					<div className="md:col-span-7">
						<p className="label">Send a message</p>
						<h2 className="display-sm mt-3">Tell us a little about your trip</h2>
						<div className="mt-8">
							<ContactForm email={siteConfig.contact.email} whatsappHref={whatsappHref} villas={villas.map((v) => v.title)} />
						</div>
					</div>
					<aside className="space-y-8 md:col-span-5">
						<MapCard />
						<div className="rounded-[24px] bg-sand p-7">
							<p className="label">Address</p>
							<address className="mt-3 not-italic leading-relaxed">
								{siteConfig.name}
								{addressLines().map((l) => (
									<span key={l} className="block text-ink-muted">
										{l}
									</span>
								))}
							</address>
							<p className="label mt-6">Hours</p>
							<p className="mt-2 text-ink-muted">{siteConfig.contact.hours}</p>
							<p className="label mt-6">Find us elsewhere</p>
							<a href={siteConfig.contact.instagram} target="_blank" rel="noopener noreferrer" className="link-underline mt-2 text-terracotta-deep">
								Instagram
							</a>
							<p className="mt-6 text-[0.9rem] text-ink-muted">
								Coming from the airport? Read{' '}
								<Link href="/getting-there" className="text-terracotta-deep underline underline-offset-4">
									getting there
								</Link>{' '}
								first, or the{' '}
								<Link href="/faq" className="text-terracotta-deep underline underline-offset-4">
									questions
								</Link>{' '}
								people ask most.
							</p>
						</div>
					</aside>
				</div>
			</section>
		</>
	);
}
