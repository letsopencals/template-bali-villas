import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { buttonClasses } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { IkatRule } from '@/components/motifs/ikat-rule';
import { SectionHeading } from '@/components/home/section-heading';
import { money } from '@/components/home/home-format';

export interface PromiseExample {
	slug: string;
	title: string;
	price: number;
	currency: string;
	nights: number;
}

function Tick() {
	return (
		<svg aria-hidden viewBox="0 0 16 16" className="mt-1 h-4 w-4 shrink-0 text-moss" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<path d="m3 8.5 3 3 7-7" />
		</svg>
	);
}

function Dash() {
	return (
		<svg aria-hidden viewBox="0 0 16 16" className="mt-1 h-4 w-4 shrink-0 text-ink-dim" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
			<path d="M4 8h8" />
		</svg>
	);
}

/**
 * The price promise: what the nightly rate covers, what it doesn't, the tax
 * note, and a worked example on the cheapest villa (its minimum stay × rate).
 */
export function PricePromise({ example }: { example: PromiseExample | null }) {
	const { stay, priceIncludes, priceExcludes } = siteConfig;
	return (
		<section aria-labelledby="promise-title" className="bg-paper">
			<div className="container-x section-y grid gap-14 lg:grid-cols-12 lg:gap-10">
				<div className="lg:col-span-7">
					<SectionHeading
						id="promise-title"
						eyebrow="The price promise"
						title={
							<>
								The price you see <em className="italic-soft">is the price per night</em>
							</>
						}
						intro={stay.taxNote}
					/>
					<div className="mt-12 grid gap-10 sm:grid-cols-2">
						<div>
							<h3 className="label">Always included</h3>
							<ul className="mt-5 space-y-3">
								{priceIncludes.map((item) => (
									<li key={item} className="flex gap-3 text-ink">
										<Tick />
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
						<div>
							<h3 className="label">Not included</h3>
							<ul className="mt-5 space-y-3">
								{priceExcludes.map((item) => (
									<li key={item} className="flex gap-3 text-ink-muted">
										<Dash />
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
					<p className="mt-10 max-w-xl text-[0.95rem] leading-relaxed text-ink-muted">
						Free cancellation up to {stay.cancellationDays} days before check-in. Check-in from <span className="tabular">{stay.checkIn}</span>, check-out by{' '}
						<span className="tabular">{stay.checkOut}</span>, stays of up to {stay.maxNights} nights.
					</p>
				</div>

				{example ? (
					<Reveal className="lg:col-span-5 lg:self-center">
						<div className="on-dark grain relative overflow-hidden rounded-[24px] bg-jungle p-8 text-cream md:p-10">
							<p className="label">A worked example</p>
							<h3 className="display-sm mt-3">
								{example.title}, <em className="italic-soft">{example.nights} {example.nights === 1 ? 'night' : 'nights'}</em>
							</h3>
							<dl className="mt-8 space-y-3 text-[0.95rem]">
								<div className="flex items-baseline">
									<dt className="text-cream/80">
										<span className="tabular">{money(example.price, example.currency)}</span> × {example.nights} {example.nights === 1 ? 'night' : 'nights'}
									</dt>
									<span aria-hidden className="leader-line" />
									<dd className="tabular">{money(example.price * example.nights, example.currency)}</dd>
								</div>
								<div className="flex items-baseline">
									<dt className="text-cream/80">Housekeeping, wifi, welcome drink</dt>
									<span aria-hidden className="leader-line" />
									<dd>Included</dd>
								</div>
								<div className="flex items-baseline">
									<dt className="text-cream/80">Add-ons</dt>
									<span aria-hidden className="leader-line" />
									<dd>If you want them</dd>
								</div>
							</dl>
							<IkatRule tone="cream" className="my-8" />
							<div className="flex items-baseline justify-between gap-4">
								<span className="label">Before taxes</span>
								<span className="tabular font-display text-[2.25rem] font-light leading-none">{money(example.price * example.nights, example.currency)}</span>
							</div>
							<p className="mt-4 text-[0.85rem] text-cream/70">Taxes are shown, as charged, before you pay.</p>
							<Link href={`/villas/${example.slug}`} className={buttonClasses('primary', 'md', { className: 'mt-8' })}>
								See {example.title}
							</Link>
						</div>
					</Reveal>
				) : null}
			</div>
		</section>
	);
}
