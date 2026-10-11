import { getVillaAddOns, getVillas, type Villa } from '@/lib/server-data';
import { VILLA_ORDER } from '@/lib/villa-content';
import { siteConfig } from '@/lib/site-config';
import { CandiDivider } from '@/components/motifs/candi-bentar';
import { HeroFlyover, type HeroPinVilla } from '@/components/home/hero-flyover';
import { ValleySection } from '@/components/home/valley-section';
import { VillaCarousel, type CarouselVilla } from '@/components/home/villa-carousel';
import { SiteMap, type MapVilla } from '@/components/home/site-map';
import { SectionHeading } from '@/components/home/section-heading';
import { DayTimeline } from '@/components/home/day-timeline';
import { ExperiencesMosaic, type HomeAddOn } from '@/components/home/experiences-mosaic';
import { PricePromise, type PromiseExample } from '@/components/home/price-promise';
import { Testimonials } from '@/components/home/testimonials';
import { JournalTeaser } from '@/components/home/journal-teaser';
import { HomeFaq, type FaqPrices } from '@/components/home/home-faq';
import { ClosingBand } from '@/components/home/closing-band';
import { money } from '@/components/home/home-format';

const DEFAULT_CURRENCY = 'USD';

function cardContent(v: Villa) {
	return v.content ? { type: v.content.type, maxGuests: v.content.maxGuests, bedrooms: v.content.bedrooms } : null;
}

function cheapest(villas: Villa[]): Villa | null {
	return villas.reduce<Villa | null>((best, v) => (best == null || v.price < best.price ? v : best), null);
}

export default async function HomePage() {
	const villas = await getVillas();
	// Add-ons are attached per product; the first villa carries the store-wide set.
	const addOnSource = villas[0]?.slug ?? VILLA_ORDER[0];
	const rawAddOns = addOnSource ? await getVillaAddOns(addOnSource) : [];

	const currency = villas[0]?.currency ?? DEFAULT_CURRENCY;
	const addOns: HomeAddOn[] = rawAddOns
		.filter((a) => a.status !== 'inactive')
		.map((a) => ({ slug: a.slug, title: a.title, description: a.description, price: a.price, perNight: a.durationMultiplied }));

	const heroVillas: HeroPinVilla[] = villas.map((v) => ({ slug: v.slug, title: v.title, price: v.price, currency: v.currency }));
	const carouselVillas: CarouselVilla[] = villas.map((v) => ({ slug: v.slug, title: v.title, price: v.price, currency: v.currency, image: v.image, content: cardContent(v), collections: v.collections }));
	const mapVillas: MapVilla[] = villas.map((v) => ({
		slug: v.slug,
		title: v.title,
		price: v.price,
		currency: v.currency,
		image: v.image,
		type: v.content?.type ?? null,
		maxGuests: v.content?.maxGuests ?? null,
		bedrooms: v.content?.bedrooms ?? null,
	}));
	const villaTitles = Object.fromEntries(villas.map((v) => [v.slug, v.title]));

	const low = cheapest(villas);
	const example: PromiseExample | null = low ? { slug: low.slug, title: low.title, price: low.price, currency: low.currency, nights: Math.max(low.minNights, 1) } : null;
	const mins = villas.map((v) => v.minNights);
	const faqPrices: FaqPrices = {
		currency,
		transfer: addOns.find((a) => a.slug === 'airport-transfer')?.price ?? null,
		breakfast: addOns.find((a) => a.slug === 'floating-breakfast')?.price ?? null,
		minNights: mins.length ? { min: Math.min(...mins), max: Math.max(...mins) } : null,
	};

	return (
		<>
			<HeroFlyover villas={heroVillas} />
			<ValleySection />

			<section aria-labelledby="villas-title" className="bg-paper pb-24 md:pb-32">
				<SectionHeading
					id="villas-title"
					eyebrow="The villas"
					title={
						<>
							Ten houses, <em className="italic-soft">each its own</em>
						</>
					}
					intro={low ? `From ${money(low.price, low.currency)} a night for the whole house. ${siteConfig.stay.taxNote}` : siteConfig.stay.taxNote}
					className="container-x mb-10"
				/>
				<VillaCarousel villas={carouselVillas} />
			</section>

			<CandiDivider className="bg-paper" />

			<section aria-labelledby="map-title" className="bg-paper">
				<div className="container-x section-y">
					<SectionHeading
						id="map-title"
						eyebrow="The site"
						title={
							<>
								Find your house <em className="italic-soft">on the terraces</em>
							</>
						}
						intro="Ten houses on one hillside of terraces, joined by footpaths. Pick a number to meet each one."
						className="mb-12"
					/>
					<SiteMap villas={mapVillas} />
				</div>
			</section>

			<DayTimeline />
			<ExperiencesMosaic addOns={addOns} currency={currency} />
			<PricePromise example={example} />
			<Testimonials villaTitles={villaTitles} />
			<JournalTeaser />
			<HomeFaq prices={faqPrices} />
			<ClosingBand fromPrice={low ? money(low.price, low.currency) : null} />
		</>
	);
}
