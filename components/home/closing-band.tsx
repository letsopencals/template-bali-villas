import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { bookCta, whatsappHref } from '@/lib/contact';
import { buttonClasses } from '@/components/ui/button';
import { TerraceLines } from '@/components/motifs/terrace-lines';
import { RevealText } from '@/components/motion/reveal';

/**
 * Closing band: jungle green, "Sampai jumpa", two ways to book, and a giant
 * terracotta wordmark bleeding off the bottom edge into the footer.
 */
export function ClosingBand({ fromPrice }: { fromPrice: string | null }) {
	return (
		<section aria-label={`Book a stay at ${siteConfig.name}`} className="on-dark grain relative overflow-hidden bg-jungle text-cream">
			<TerraceLines onDark className="opacity-[0.12]" />
			<div className="container-x relative pb-[clamp(5rem,16vw,15rem)] pt-28 text-center md:pt-36">
				<p className="label">Until next time</p>
				<RevealText as="h2" text="Sampai jumpa" className="display-lg mt-6 text-cream" lineClassName="pb-2" />
				<p className="mt-2 font-display text-[1.4rem] font-light italic text-cream/80">see you soon, in the rice fields</p>
				<p className="mx-auto mt-6 max-w-xl text-[1.05rem] leading-relaxed text-cream/75">
					{fromPrice ? `Ten houses from ${fromPrice} a night. ` : 'Ten houses in the Sidemen valley. '}
					Free cancellation up to {siteConfig.stay.cancellationDays} days before you arrive.
				</p>
				<div className="mt-10 flex flex-wrap items-center justify-center gap-3">
					<Link href={bookCta.href} className={buttonClasses('primary', 'lg')}>
						{bookCta.label}
					</Link>
					<a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClasses('outline', 'lg', { onDark: true })}>
						Ask us on WhatsApp
					</a>
				</div>
			</div>
			<p
				aria-hidden
				className="pointer-events-none relative -mb-[0.24em] select-none text-center font-display font-light leading-[0.8] tracking-[-0.04em] text-terracotta"
				style={{ fontSize: 'clamp(6rem, 27vw, 30rem)', fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'WONK' 1" }}
			>
				{siteConfig.shortName}
			</p>
		</section>
	);
}
