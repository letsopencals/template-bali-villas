import Link from 'next/link';
import { clsx } from 'clsx';
import { templateImage } from '@/lib/villa-images';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal } from '@/components/motion/reveal';
import { buttonClasses } from '@/components/ui/button';
import { SectionHeading } from '@/components/home/section-heading';
import { money } from '@/components/home/home-format';

/** The add-on fields the mosaic shows. */
export interface HomeAddOn {
	slug: string;
	title: string;
	description: string;
	price: number;
	/** Charged per night rather than once per stay. */
	perNight: boolean;
}

interface Tile {
	image: string;
	alt: string;
	title: string;
	copy: string;
	/** Add-on slug(s) to price the tile from; none for things in the valley we don't sell. */
	addOn?: string;
	/** Keyword to match an add-on title when the slug differs in another store. */
	match?: RegExp;
	span: string;
}

const TILES: Tile[] = [
	{
		image: 'experiences/sunrise-trek',
		alt: 'Walkers on the slopes of Mount Agung at sunrise',
		title: 'Mount Agung sunrise trek',
		copy: 'A guided night climb to see the sun come up from the slopes of Agung.',
		addOn: 'mount-agung-sunrise-trek',
		match: /sunrise|trek/i,
		span: 'md:col-span-2 md:row-span-2',
	},
	{
		image: 'experiences/cooking-class',
		alt: 'Hands grinding spices for base genep in a stone mortar',
		title: 'Cooking class',
		copy: 'The morning market, then the family kitchen.',
		addOn: 'cooking-class',
		match: /cook/i,
		span: '',
	},
	{
		image: 'experiences/spa',
		alt: 'Frangipani and oil prepared for a Balinese massage',
		title: 'Balinese massage for two',
		copy: 'In your villa, with therapists from the village.',
		addOn: 'balinese-massage-for-two',
		match: /massage|spa/i,
		span: '',
	},
	{
		image: 'experiences/weaving',
		alt: 'A weaver at a wooden loom with ikat thread',
		title: 'Weaving in the village',
		copy: 'Sidemen is known for its songket and ikat. Ask us the way to the looms.',
		span: '',
	},
	{
		image: 'experiences/temple',
		alt: 'Offerings on the steps of a village temple',
		title: 'Temples and ceremonies',
		copy: 'Cover shoulders and knees, and we will tell you what is happening this week.',
		span: '',
	},
	{
		image: 'experiences/warung',
		alt: 'A simple warung lunch of rice, vegetables and sambal',
		title: 'Lunch at the warung',
		copy: 'Nasi campur down the road, where the farmers eat.',
		span: 'md:col-span-2',
	},
];

function findAddOn(addOns: readonly HomeAddOn[], tile: Tile): HomeAddOn | undefined {
	if (!tile.addOn) return undefined;
	return addOns.find((a) => a.slug === tile.addOn) ?? (tile.match ? addOns.find((a) => tile.match!.test(a.title)) : undefined);
}

/**
 * Experiences: a photo mosaic. Tiles that are add-ons show the store's price
 * ("$55 per stay"); the rest are things in the valley we point you to. The
 * remaining add-ons (transfer, breakfast…) are listed below with prices.
 * Without add-ons from the store, the tiles say "Add at checkout" instead.
 */
export function ExperiencesMosaic({ addOns, currency }: { addOns: HomeAddOn[]; currency: string }) {
	const used = new Set<string>();
	const tiles = TILES.map((t) => {
		const a = findAddOn(addOns, t);
		if (a) used.add(a.slug);
		return { tile: t, addOn: a };
	});
	const others = addOns.filter((a) => !used.has(a.slug));

	return (
		<section aria-labelledby="experiences-title" className="bg-paper">
			<div className="container-x section-y">
				<SectionHeading
					id="experiences-title"
					eyebrow="Experiences"
					title={
						<>
							Add a morning, <em className="italic-soft">or a whole day</em>
						</>
					}
					intro="Book the ones we run as add-ons when you reserve, at the prices below. The rest are simply the valley, and we are glad to point the way."
					aside={
						<Link href="/experiences" className={buttonClasses('outline', 'md')}>
							All experiences
						</Link>
					}
				/>

				<ul className="mt-14 grid auto-rows-[260px] grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[280px] md:grid-cols-4">
					{tiles.map(({ tile, addOn }, i) => (
						<Reveal as="li" key={tile.image} delay={0.05 * i} className={clsx('group relative overflow-hidden rounded-[24px]', tile.span)}>
							<div className="image-placeholder absolute inset-0">
								<SafeImage
									src={templateImage(tile.image)}
									alt={tile.alt}
									fill
									sizes={tile.span.includes('col-span-2') ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, (min-width: 640px) 50vw, 100vw'}
									className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
								/>
							</div>
							<div aria-hidden className="absolute inset-0 bg-gradient-to-t from-jungle-deep/80 via-jungle-deep/20 to-transparent" />
							<div className="on-dark absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 text-cream">
								<span className="label">{addOn ? 'Add-on' : tile.addOn ? 'Add at checkout' : 'In the valley'}</span>
								<h3 className={clsx('font-display font-light leading-tight', tile.span.includes('row-span-2') ? 'text-[2rem]' : 'text-[1.4rem]')}>{addOn?.title ?? tile.title}</h3>
								<p className="max-w-md text-[0.92rem] leading-snug text-cream/80">{tile.copy}</p>
								{addOn ? (
									<p className="mt-1 flex items-baseline gap-1.5">
										<span className="tabular font-display text-[1.3rem] text-cream">{money(addOn.price, currency)}</span>
										<span className="label">{addOn.perNight ? '/ night' : 'per stay'}</span>
									</p>
								) : null}
							</div>
						</Reveal>
					))}
				</ul>

				{others.length > 0 ? (
					<div className="mt-10 rounded-[24px] bg-sand p-6 md:p-8">
						<p className="label">Also when you reserve</p>
						<ul className="mt-5 grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
							{others.map((a) => (
								<li key={a.slug} className="flex items-baseline text-[0.95rem]">
									<span className="text-ink">{a.title}</span>
									<span aria-hidden className="leader-line" />
									<span className="tabular font-display text-[1.1rem] text-terracotta">{money(a.price, currency)}</span>
									<span className="label ml-1.5">{a.perNight ? '/ night' : ''}</span>
								</li>
							))}
						</ul>
					</div>
				) : null}
			</div>
		</section>
	);
}
