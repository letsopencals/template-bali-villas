import { clsx } from 'clsx';
import { templateImage } from '@/lib/villa-images';
import { PriceTag } from '@/components/ui/price-tag';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/motion/reveal';
import { EditorialImage } from '@/components/marketing/editorial-image';
import type { Experience } from '@/components/marketing/experiences-content';
import type { StoreAddOn } from '@/components/marketing/add-ons';

export interface ExperienceRowProps {
	experience: Experience;
	addOn: StoreAddOn | null;
	index: number;
}

/** One experience: photo on one side, story, practical notes and its price (or "ask at reception"). */
export function ExperienceRow({ experience: e, addOn, index }: ExperienceRowProps) {
	const flip = index % 2 === 1;
	return (
		<article id={e.key} className="scroll-mt-28 grid items-center gap-10 md:grid-cols-12 md:gap-14">
			<EditorialImage
				src={templateImage(e.image)}
				alt={e.imageAlt}
				aspect="aspect-[4/5] md:aspect-[5/6]"
				arch={index % 3 === 0}
				from={flip ? 'right' : 'left'}
				className={clsx('md:col-span-6', flip && 'md:order-2 md:col-start-7')}
			/>
			<div className={clsx('md:col-span-5', flip ? 'md:order-1 md:col-start-1 md:row-start-1' : 'md:col-start-8')}>
				<Reveal>
					<p className="label flex items-center gap-3">
						<span className="tabular text-terracotta">{String(index + 1).padStart(2, '0')}</span>
						<span aria-hidden className="h-px w-6 bg-line-strong" />
						<span>{e.when}</span>
					</p>
					<h2 className="display-md mt-4">{e.name}</h2>
					<p className="mt-2 font-display text-[1.05rem] italic text-terracotta-deep">{e.local}</p>
					<p className="mt-6 text-[1.08rem] leading-relaxed text-ink">{e.summary}</p>
				</Reveal>
				<Reveal delay={0.08}>
					<div className="mt-5 space-y-4 text-ink-muted">
						{e.body.map((p) => (
							<p key={p.slice(0, 24)}>{p}</p>
						))}
					</div>
					<ul className="mt-7 space-y-2.5 text-[0.95rem]">
						{e.notes.map((n) => (
							<li key={n} className="flex gap-3">
								<span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
								<span>{n}</span>
							</li>
						))}
					</ul>
				</Reveal>
				<Reveal delay={0.14}>
					<dl className="mt-8 grid gap-4 rounded-[24px] bg-sand p-6 sm:grid-cols-2">
						<div>
							<dt className="label">How long</dt>
							<dd className="mt-1.5 text-[0.95rem]">{e.duration}</dd>
						</div>
						<div>
							<dt className="label">Price</dt>
							<dd className="mt-1.5">
								{addOn ? (
									<span className="flex flex-col gap-1">
										<PriceTag amount={addOn.price} currency={addOn.currency} unit="per booking" size="sm" />
										<span className="text-[0.82rem] text-ink-muted">“{addOn.title}”, add it when you book</span>
									</span>
								) : (
									<span className="flex flex-col items-start gap-1.5">
										<Badge tone="moss">Ask at reception</Badge>
										<span className="text-[0.82rem] text-ink-muted">Priced on the day, paid locally</span>
									</span>
								)}
							</dd>
						</div>
					</dl>
				</Reveal>
			</div>
		</article>
	);
}
