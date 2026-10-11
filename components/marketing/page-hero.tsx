import type { ReactNode } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal } from '@/components/motion/reveal';
import { IkatRule } from '@/components/motifs/ikat-rule';

export interface PageHeroProps {
	image: string;
	imageAlt: string;
	eyebrow: string;
	/** Indonesian line shown next to the eyebrow, e.g. "Selamat datang". */
	local?: string;
	title: ReactNode;
	lede?: ReactNode;
	children?: ReactNode;
	/** object-position for the photo. */
	imagePosition?: string;
}

/**
 * Full-bleed dark photo hero for the transparent-header routes (/experiences,
 * /about, /getting-there). The jungle-deep base shows if the image is missing,
 * so cream text always has contrast. The scrim is darker at the top (header) and
 * the bottom (the title).
 */
export function PageHero({ image, imageAlt, eyebrow, local, title, lede, children, imagePosition = 'center' }: PageHeroProps) {
	return (
		<section className="on-dark relative isolate flex min-h-[88svh] items-end overflow-hidden bg-jungle-deep text-cream">
			<SafeImage src={image} alt={imageAlt} fill priority sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: imagePosition }} />
			<div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(21,41,32,0.55)_0%,rgba(21,41,32,0.12)_32%,rgba(21,41,32,0.25)_58%,rgba(21,41,32,0.86)_100%)]" />
			<div className="container-x w-full pb-16 pt-40 md:pb-24">
				<Reveal>
					<p className="label on-dark flex flex-wrap items-center gap-x-3 gap-y-1">
						<span>{eyebrow}</span>
						{local ? (
							<>
								<span aria-hidden className="h-px w-8 bg-terracotta-bright" />
								<span className="font-display text-[0.95rem] normal-case tracking-normal text-cream/85 italic">{local}</span>
							</>
						) : null}
					</p>
				</Reveal>
				<Reveal delay={0.08}>
					<h1 className="display-lg mt-5 max-w-4xl text-cream">{title}</h1>
				</Reveal>
				{lede ? (
					<Reveal delay={0.16}>
						<div className="mt-6 max-w-2xl text-[1.08rem] leading-relaxed text-cream/85 md:text-[1.15rem]">{lede}</div>
					</Reveal>
				) : null}
				{children ? (
					<Reveal delay={0.24}>
						<div className="mt-9">{children}</div>
					</Reveal>
				) : null}
				<IkatRule tone="cream" className="mt-14 max-w-[220px] opacity-70" />
			</div>
		</section>
	);
}
