import { siteConfig } from '@/lib/site-config';

/**
 * Derived contact links (siteConfig keeps the raw values only).
 */
const digits = (s: string) => s.replace(/[^\d]/g, '');

export const whatsappHref = `https://wa.me/${digits(siteConfig.contact.whatsapp)}`;
export const phoneHref = `tel:+${digits(siteConfig.contact.phone)}`;
export const emailHref = `mailto:${siteConfig.contact.email}`;

/** One-line postal address. */
export function addressLine(): string {
	const a = siteConfig.contact.address;
	return [a.line1, a.city, a.region, a.postalCode, a.country].filter(Boolean).join(', ');
}

/** Address as lines for a footer/contact block. */
export function addressLines(): string[] {
	const a = siteConfig.contact.address;
	return [a.line1, `${a.city} ${a.postalCode}`, `${a.region}, ${a.country}`];
}

export const mapsHref = `https://www.google.com/maps/search/?api=1&query=${siteConfig.contact.geo.lat},${siteConfig.contact.geo.lng}`;

/** Secondary links (menu overlay, footer). Not in siteConfig.nav on purpose. */
export const secondaryNav = [
	{ href: '/faq', label: 'FAQ' },
	{ href: '/contact', label: 'Contact' },
	{ href: '/account', label: 'My trips' },
] as const;

/** The header/menu primary CTA. */
export const bookCta = { href: '/villas', label: 'Book a stay' } as const;
