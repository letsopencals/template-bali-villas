import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVilla, getVillas } from '@/lib/server-data';
import { VILLA_ORDER } from '@/lib/villa-content';
import { accommodationJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/marketing/json-ld';
import { TerraceLines } from '@/components/motifs/terrace-lines';
import { CandiDivider } from '@/components/motifs/candi-bentar';
import { VillaBookingBoundary } from '@/components/villa/booking/villa-booking-boundary';
import { ReservationCard } from '@/components/villa/booking/reservation-card';
import { MobileBookingBar } from '@/components/villa/booking/mobile-booking-bar';
import { RoomHighlightProvider } from '@/components/villa/room-highlight-context';
import { VillaGallery } from '@/components/villa/villa-gallery';
import { VillaStory, VillaTitle } from '@/components/villa/villa-header';
import { RoomTour } from '@/components/villa/room-tour';
import { VillaFilm } from '@/components/villa/villa-film';
import { FloorPlan } from '@/components/villa/floor-plan';
import { Amenities } from '@/components/villa/amenities';
import { Sleeping } from '@/components/villa/sleeping';
import { VillaLocator } from '@/components/villa/villa-locator';
import { HouseRules } from '@/components/villa/house-rules';
import { CancellationTimeline } from '@/components/villa/cancellation-timeline';
import { VillaReviews } from '@/components/villa/villa-reviews';
import { SimilarVillas } from '@/components/villa/similar-villas';
import { buildLightbox, buildMosaic, buildTourRooms, contentFor, toBookingVilla } from '@/components/villa/villa-page-data';
import { pickSimilar, toVillaSummary } from '@/components/villas/villa-summary';

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
	return VILLA_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const villa = await getVilla(slug);
	if (!villa) return {};
	const content = contentFor(villa);
	const description = `${content.type}. ${content.tagline}`.slice(0, 160);
	const images = villa.image ? [{ url: villa.image, alt: villa.title }] : undefined;
	return {
		title: villa.title,
		description,
		alternates: { canonical: `/villas/${villa.slug}` },
		openGraph: { title: villa.title, description, images },
		twitter: { card: 'summary_large_image', title: villa.title, description, images: villa.image ? [villa.image] : undefined },
	};
}

export default async function VillaPage({ params }: { params: Params }) {
	const { slug } = await params;
	const [villa, all] = await Promise.all([getVilla(slug), getVillas()]);
	if (!villa) notFound();

	const content = contentFor(villa);
	const booking = toBookingVilla(villa, content);
	const rooms = buildTourRooms(villa, content);
	const { items, groups } = buildLightbox(villa, content);
	const { tiles, hasDusk } = buildMosaic(villa, content, items);
	const summaries = all.map(toVillaSummary);
	const self = summaries.find((v) => v.slug === villa.slug) ?? toVillaSummary(villa);
	const similar = pickSimilar(self, summaries, 3);
	const titles = Object.fromEntries(all.map((v) => [v.slug, v.title]));

	return (
		<>
			<JsonLd data={accommodationJsonLd(villa)} />
			<JsonLd data={breadcrumbJsonLd([['Villas', '/villas'], [villa.title, `/villas/${villa.slug}`]])} />

			<VillaBookingBoundary villa={booking}>
				<header className="grain relative overflow-hidden pb-10 pt-32 md:pt-40">
					<TerraceLines className="opacity-60" />
					<div className="container-x relative z-[2]">
						<VillaTitle title={villa.title} content={content} />
					</div>
				</header>

				<div className="container-x">
					<VillaGallery title={villa.title} tiles={tiles} items={items} groups={groups} hasDusk={hasDusk} />
				</div>

				<RoomHighlightProvider>
					<div className="container-x grid gap-16 pb-20 pt-14 md:pt-20 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-24">
						<div className="flex min-w-0 flex-col gap-20 md:gap-28">
							<VillaStory content={content} />
							<RoomTour title={villa.title} rooms={rooms} />
							<VillaFilm title={villa.title} video={content.video} still={villa.image} />
							<FloorPlan title={villa.title} plan={content.floorPlan} tourKeys={rooms.map((r) => r.key)} sizeM2={content.sizeM2 || undefined} />
							<Amenities amenities={content.amenities} />
							<Sleeping rooms={rooms} beds={content.beds} />
							<VillaLocator villas={summaries} slug={villa.slug} title={villa.title} />
							<HouseRules rules={content.houseRules} stayTimes={villa.stayTimes} />
							<CancellationTimeline />
							<VillaReviews slug={villa.slug} title={villa.title} titles={titles} />
						</div>
						<aside aria-label={`Book ${villa.title}`} className="max-lg:hidden">
							<div className="sticky top-28">
								<ReservationCard />
							</div>
						</aside>
					</div>
				</RoomHighlightProvider>

				<MobileBookingBar />
			</VillaBookingBoundary>

			<CandiDivider className="container-x" />
			<SimilarVillas villas={similar} />
		</>
	);
}
