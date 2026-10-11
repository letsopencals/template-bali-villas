import Link from 'next/link';
import type { VillaContent } from '@/lib/villa-content';
import { siteConfig } from '@/lib/site-config';
import { Reveal } from '@/components/motion/reveal';
import { IkatRule } from '@/components/motifs/ikat-rule';

const POOL_LABEL: Record<VillaContent['pool'], string | null> = {
	private: 'Private pool',
	plunge: 'Plunge pool',
	shared: 'Shared pool',
	none: null,
};

/** Facts strip in the order guests scan it. Empty values drop out (fallback content). */
export function villaFacts(c: VillaContent): Array<{ label: string; value: string }> {
	const facts: Array<{ label: string; value: string } | null> = [
		c.sizeM2 > 0 ? { label: 'Size', value: `${c.sizeM2} m²` } : null,
		{ label: 'Sleeps', value: `${c.maxGuests} ${c.maxGuests === 1 ? 'guest' : 'guests'}` },
		{ label: 'Bedrooms', value: String(c.bedrooms) },
		c.beds ? { label: 'Beds', value: c.beds } : null,
		{ label: 'Bathrooms', value: String(c.bathrooms) },
		POOL_LABEL[c.pool] ? { label: 'Pool', value: POOL_LABEL[c.pool]! } : null,
		c.view ? { label: 'View', value: c.view } : null,
	];
	return facts.filter((f): f is { label: string; value: string } => !!f);
}

/** Breadcrumb, name, type and tagline (sits above the gallery). */
export function VillaTitle({ title, content }: { title: string; content: VillaContent }) {
	const collection = content.collections[0] ? siteConfig.collections[content.collections[0]] : null;
	return (
		<div>
			<nav aria-label="Breadcrumb" className="label flex flex-wrap items-center gap-2">
				<Link href="/villas" className="link-underline">
					The villas
				</Link>
				{collection ? (
					<>
						<span aria-hidden>·</span>
						<Link href={`/villas?collection=${content.collections[0]}`} className="link-underline">
							{collection.label}
						</Link>
					</>
				) : null}
			</nav>
			<h1 className="display-lg mt-5">{title}</h1>
			<p className="mt-4 max-w-2xl text-[1.1rem] text-ink-muted">
				<span className="text-ink">{content.type}.</span> {content.tagline}
			</p>
		</div>
	);
}

/** Facts strip, the two-paragraph story and the pull quote. */
export function VillaStory({ content }: { content: VillaContent }) {
	const facts = villaFacts(content);
	const story = content.story.filter(Boolean);
	return (
		<section aria-label="About the house">
			<dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6 sm:grid-cols-4">
				{facts.map((f) => (
					<div key={f.label}>
						<dt className="label">{f.label}</dt>
						<dd className="tabular mt-1.5 text-[1.02rem]">{f.value}</dd>
					</div>
				))}
			</dl>
			{story.length > 0 ? (
				<div className="mt-12 grid gap-6 text-[1.08rem] leading-relaxed md:mt-16">
					{story.map((p, i) => (
						<Reveal as="p" key={i} delay={i * 0.08} className={i === 0 ? 'first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[3.6rem] first-letter:leading-[0.9] first-letter:text-terracotta' : 'text-ink-muted'}>
							{p}
						</Reveal>
					))}
				</div>
			) : null}
			{content.pullQuote ? (
				<Reveal className="mt-14 md:mt-20">
					<IkatRule className="max-w-[120px]" />
					<blockquote className="display-md italic-soft mt-6 max-w-xl text-terracotta-deep">“{content.pullQuote}”</blockquote>
				</Reveal>
			) : null}
		</section>
	);
}
