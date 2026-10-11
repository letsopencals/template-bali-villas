import type { Metadata } from 'next';
import Link from 'next/link';
import { templateImage } from '@/lib/villa-images';
import { siteConfig } from '@/lib/site-config';
import { mapsHref, whatsappHref } from '@/lib/contact';
import { breadcrumbJsonLd } from '@/lib/seo';
import { PageHero } from '@/components/marketing/page-hero';
import { EditorialImage } from '@/components/marketing/editorial-image';
import { MapCard } from '@/components/marketing/map-card';
import { RouteSteps } from '@/components/marketing/route-steps';
import { TransferCard } from '@/components/marketing/transfer-card';
import { CtaBand } from '@/components/marketing/cta-band';
import { JsonLd } from '@/components/marketing/json-ld';
import { darkArrival, packingList, routeLegs } from '@/components/marketing/getting-there-content';
import { getResortAddOns, matchAddOn } from '@/components/marketing/add-ons';
import { buttonClasses } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = {
	title: 'Getting to Sidemen',
	description:
		'From Denpasar airport (DPS) to Sidemen is about two hours by road, east along the coast and north from Klungkung into the hills. Airport transfers, arriving after dark, and what to pack for cool evenings at 400 m.',
	alternates: { canonical: '/getting-there' },
	openGraph: { images: [templateImage('getting-there/road')] },
};

export default async function GettingTherePage() {
	const addOns = await getResortAddOns();
	const transfer = matchAddOn(addOns, [['airport', 'transfer'], ['transfer'], ['airport']]);
	const [, altitude, distance] = siteConfig.facts;

	return (
		<>
			<JsonLd data={breadcrumbJsonLd([['Getting there', '/getting-there']])} />
			<PageHero
				image={templateImage('getting-there/road')}
				imageAlt="The narrow road into the Sidemen valley between rice terraces, Mount Agung in the distance"
				eyebrow="Getting there"
				local="Jalan ke Sidemen"
				title={
					<>
						Two hours from the airport, <em className="italic-soft on-dark">a long way from it</em>
					</>
				}
				lede="Sidemen is in the hills of East Bali, away from the south coast traffic. The drive is part of the arrival: the coast road, the old town of Klungkung, then terraces all the way up."
			>
				<div className="flex flex-wrap gap-3">
					<a href={mapsHref} target="_blank" rel="noopener noreferrer" className={buttonClasses('glass', 'md')}>
						Open the map
					</a>
					<Link href="#transfer" className={buttonClasses('outline', 'md', { onDark: true })}>
						Airport transfer
					</Link>
				</div>
			</PageHero>

			{/* At a glance */}
			<section className="grain bg-paper">
				<div className="container-x relative z-[2] pt-20 md:pt-28">
					<dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						<div className="rounded-[24px] bg-sand p-6">
							<dt className="label">From DPS airport</dt>
							<dd className="tabular mt-3 font-display text-[2.2rem] font-light leading-none">About {distance?.value ?? '2 h'}</dd>
							<dd className="mt-2 text-[0.9rem] text-ink-muted">By road, depending on traffic</dd>
						</div>
						<div className="rounded-[24px] bg-sand p-6">
							<dt className="label">Altitude</dt>
							<dd className="tabular mt-3 font-display text-[2.2rem] font-light leading-none">{altitude?.value ?? '400 m'}</dd>
							<dd className="mt-2 text-[0.9rem] text-ink-muted">Cool evenings, misty mornings</dd>
						</div>
						<div className="rounded-[24px] bg-sand p-6">
							<dt className="label">Check-in · check-out</dt>
							<dd className="tabular mt-3 font-display text-[2.2rem] font-light leading-none">
								{siteConfig.stay.checkIn} · {siteConfig.stay.checkOut}
							</dd>
							<dd className="mt-2 text-[0.9rem] text-ink-muted">Local time, WITA (UTC+8)</dd>
						</div>
						<div className="rounded-[24px] bg-sand p-6">
							<dt className="label">Reception</dt>
							<dd className="mt-3 font-display text-[1.35rem] leading-snug">{siteConfig.contact.hours}</dd>
						</div>
					</dl>
				</div>

				{/* Route */}
				<div className="container-x relative z-[2] section-y grid gap-14 md:grid-cols-12">
					<div className="md:col-span-5">
						<div className="md:sticky md:top-28">
							<Reveal>
								<p className="label">The route</p>
								<h2 className="display-md mt-4">
									Airport to the gate, <em className="italic-soft">via Klungkung</em>
								</h2>
								<p className="mt-5 max-w-md text-ink-muted">
									Most drivers know the way. If yours doesn’t, send them our pin. The last stretch is on a village road, so phone signal comes and goes.
								</p>
							</Reveal>
							<MapCard className="mt-10" />
						</div>
					</div>
					<div className="md:col-span-6 md:col-start-7">
						<RouteSteps legs={routeLegs} />
					</div>
				</div>
			</section>

			{/* Transfer */}
			<section id="transfer" className="scroll-mt-24 bg-paper-deep">
				<div className="container-x section-y grid items-center gap-14 md:grid-cols-12">
					<div className="md:col-span-6">
						<p className="label">Airport transfer</p>
						<h2 className="display-md mt-4">
							Let someone else <em className="italic-soft">do the driving</em>
						</h2>
						<p className="mt-5 max-w-lg text-ink-muted">
							Our drivers are from the valley. They meet you in arrivals, help with the bags, stop for cash or water if you need it, and know the last few turns in the dark.
						</p>
					</div>
					<TransferCard addOn={transfer} whatsappHref={whatsappHref} className="md:col-span-5 md:col-start-8" />
				</div>
			</section>

			{/* Arriving in the dark */}
			<section className="on-dark bg-jungle text-cream">
				<div className="container-x section-y grid items-center gap-14 md:grid-cols-12">
					<EditorialImage
						src={templateImage('getting-there/arrival')}
						alt="Oil lamps lighting the stone path to a villa gate after dark"
						aspect="aspect-[4/5]"
						arch
						className="md:col-span-5"
						from="left"
					/>
					<div className="md:col-span-6 md:col-start-7">
						<p className="label on-dark">Arriving after dark</p>
						<p className="mt-1 font-display italic text-cream/80">Selamat malam</p>
						<h2 className="display-md mt-4 text-cream">
							Landing late? <em className="italic-soft on-dark">That’s fine.</em>
						</h2>
						<div className="mt-7 space-y-5 text-cream/80">
							{darkArrival.map((p) => (
								<p key={p.slice(0, 24)}>{p}</p>
							))}
						</div>
						<a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClasses('outline', 'md', { onDark: true, className: 'mt-9' })}>
							WhatsApp {siteConfig.contact.whatsapp}
						</a>
					</div>
				</div>
			</section>

			{/* What to pack */}
			<section className="grain bg-paper">
				<div className="container-x relative z-[2] section-y">
					<p className="label">What to pack</p>
					<h2 className="display-md mt-4 max-w-2xl">
						For the hills, <em className="italic-soft">not the beach</em>
					</h2>
					<ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
						{packingList.map((p, i) => (
							<Reveal as="li" key={p.title} delay={(i % 3) * 0.06} className="border-t border-line pt-6">
								<h3 className="font-display text-[1.3rem]">{p.title}</h3>
								<p className="mt-2 text-ink-muted">{p.text}</p>
							</Reveal>
						))}
					</ul>
				</div>
			</section>

			<CtaBand
				local="Sampai jumpa di Sidemen"
				title={
					<>
						See you <em className="italic-soft on-dark">at the gate</em>
					</>
				}
				text="Pick a house, then add the transfer at checkout. Questions about the journey are welcome on WhatsApp."
				primary={{ href: '/villas', label: 'See the villas' }}
				secondary={{ href: '/faq', label: 'Read the FAQ' }}
			/>
		</>
	);
}
