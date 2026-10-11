import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { addressLines, emailHref, mapsHref, phoneHref, secondaryNav, whatsappHref } from '@/lib/contact';
import { LumbungMark } from '@/components/motifs/lumbung-mark';
import { IkatRule } from '@/components/motifs/ikat-rule';
import { SidemenNow } from '@/components/layout/sidemen-now';

/** Jungle footer: logo + tagline, site links, contact, address, small print. */
export function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className="on-dark relative overflow-hidden bg-jungle text-cream">
			<IkatRule tone="cream" />
			<div className="container-x grid gap-14 py-20 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:py-24">
				<div className="space-y-5">
					<LumbungMark onDark size={40} />
					<p className="max-w-xs font-display text-[1.4rem] font-light leading-snug">
						Ten houses <em className="italic-soft on-dark">in the rice fields</em>.
					</p>
					<SidemenNow onDark />
				</div>

				<nav aria-label="Footer" className="space-y-4">
					<p className="label">Stay</p>
					<ul className="space-y-2.5">
						{siteConfig.nav.map((l) => (
							<li key={l.href}>
								<Link href={l.href} className="link-underline text-cream/80 hover:text-cream">
									{l.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>

				<div className="space-y-4">
					<p className="label">Help</p>
					<ul className="space-y-2.5">
						{secondaryNav.map((l) => (
							<li key={l.href}>
								<Link href={l.href} className="link-underline text-cream/80 hover:text-cream">
									{l.label}
								</Link>
							</li>
						))}
						<li>
							<a href={siteConfig.contact.instagram} target="_blank" rel="noopener noreferrer" className="link-underline text-cream/80 hover:text-cream">
								Instagram
							</a>
						</li>
					</ul>
				</div>

				<address className="space-y-4 not-italic">
					<p className="label">Find us</p>
					<a href={mapsHref} target="_blank" rel="noopener noreferrer" className="block space-y-0.5 text-cream/80 hover:text-cream">
						{addressLines().map((l) => (
							<span key={l} className="block">
								{l}
							</span>
						))}
					</a>
					<div className="space-y-1 pt-1">
						<a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="block text-cream hover:text-terracotta-bright">
							WhatsApp {siteConfig.contact.whatsapp}
						</a>
						<a href={phoneHref} className="block text-cream/80 hover:text-cream">
							{siteConfig.contact.phone}
						</a>
						<a href={emailHref} className="block text-cream/80 hover:text-cream">
							{siteConfig.contact.email}
						</a>
					</div>
					<p className="text-[0.85rem] text-cream/55">{siteConfig.contact.hours}</p>
				</address>
			</div>

			<div className="container-x flex flex-col gap-3 border-t border-line-on-dark py-6 text-[0.82rem] text-cream/55 md:flex-row md:items-center md:justify-between">
				<p>
					© {year} {siteConfig.name}. {siteConfig.stay.taxNote}
				</p>
				<p>
					<span className="italic">Sampai jumpa</span>, see you soon.
				</p>
			</div>
		</footer>
	);
}
