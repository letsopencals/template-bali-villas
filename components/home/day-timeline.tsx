import { templateImage } from '@/lib/villa-images';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal, RevealImage } from '@/components/motion/reveal';
import { SectionHeading } from '@/components/home/section-heading';
import { AmbientVideoBand } from '@/components/home/ambient-video-band';

const MOMENTS = [
	{
		id: 'pagi',
		label: 'Pagi',
		english: 'Morning',
		hours: '06:00–11:00',
		image: 'day/pagi',
		alt: 'Mist over the rice terraces at first light',
		copy: 'Mist sits in the valley until the sun clears the ridge. Coffee on the bale, a fresh offering at your door, Agung if the sky is kind.',
	},
	{
		id: 'siang',
		label: 'Siang',
		english: 'Midday',
		hours: '11:00–15:00',
		image: 'day/siang',
		alt: 'A path through green paddy fields in bright midday light',
		copy: 'Walk the terrace paths with a map from reception, swim, then a long lunch at the warung down the road. Check-in for new guests from 15:00.',
	},
	{
		id: 'sore',
		label: 'Sore',
		english: 'Late afternoon',
		hours: '15:00–19:00',
		image: 'day/sore',
		alt: 'Golden light over the paddy and a farmer walking home',
		copy: 'The light turns gold across the paddy. Farmers walk home along the dykes and the herons come in to roost.',
	},
	{
		id: 'malam',
		label: 'Malam',
		english: 'Night',
		hours: '19:00–06:00',
		image: 'day/malam',
		alt: 'An oil lamp on a teak terrace at night',
		copy: 'Oil lamps on the paths, frogs in the fields, a sky with very little light in it. Quiet hours start at 22:00, and someone is on call all night.',
	},
] as const;

/** "A day at Lumbung": Pagi / Siang / Sore / Malam, a timeline with photos. */
export function DayTimeline() {
	return (
		<section aria-labelledby="day-title" className="grain relative overflow-hidden bg-paper-deep">
			<div className="container-x section-y">
				<SectionHeading
					id="day-title"
					eyebrow="A day at Lumbung"
					title={
						<>
							Four times of day, <em className="italic-soft">four kinds of light</em>
						</>
					}
					intro="The Balinese day has names for its parts. Ours goes roughly like this."
				/>

				<ol className="relative mt-16 grid gap-12 md:grid-cols-2 md:gap-x-8 lg:grid-cols-4 lg:gap-6">
					{/* The thread that ties the four moments together (desktop). */}
					<li aria-hidden className="pointer-events-none absolute inset-x-0 top-[7px] hidden h-px bg-line-strong lg:block" />
					{MOMENTS.map((m, i) => (
						<Reveal as="li" key={m.id} delay={0.08 * i} className="relative">
							<span aria-hidden className="relative z-[1] mb-6 hidden h-[15px] w-[15px] rounded-full border-2 border-terracotta bg-paper-deep lg:block" />
							<RevealImage from="up" delay={0.08 * i} className="image-placeholder aspect-[4/5] w-full rounded-[20px]">
								<SafeImage src={templateImage(m.image)} alt={m.alt} fill sizes="(min-width: 1024px) 23vw, (min-width: 768px) 45vw, 90vw" className="object-cover" />
							</RevealImage>
							<div className="mt-6 flex items-baseline justify-between gap-3">
								<h3 className="font-display text-[2rem] font-light italic leading-none text-terracotta-deep" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
									{m.label}
								</h3>
								<span className="label tabular">{m.hours}</span>
							</div>
							<p className="label mt-2">{m.english}</p>
							<p className="mt-4 leading-relaxed text-ink-muted">{m.copy}</p>
						</Reveal>
					))}
				</ol>
			</div>
			{/* Malam, in motion: rain on the thatch, a lamp-lit bale. */}
			<AmbientVideoBand src="/videos/evening-rain" alt="Rain falling from a thatched roof beside a lamp-lit bale at night">
				<div className="container-x flex flex-wrap items-end justify-between gap-4 pb-10 md:pb-14">
					<p className="font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-light leading-tight">
						Malam, <em className="italic-soft">when the rain comes</em>
					</p>
					<p className="label">Quiet hours after 22:00</p>
				</div>
			</AmbientVideoBand>
		</section>
	);
}
