import type { Metadata, Viewport } from 'next';
import { Fraunces, Figtree } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Providers } from '@/components/providers';
import { SmoothScroll } from '@/components/motion/smooth-scroll';
import { ScrollProgress } from '@/components/motion/scroll-progress';
import { GateScript } from '@/components/motifs/candi-bentar';
import { siteConfig } from '@/lib/site-config';
import { getStoreSettings } from '@/lib/server-data';
import { lodgingBusinessJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/marketing/json-ld';
import './globals.css';

// Fraunces is variable on weight plus opsz/SOFT/WONK; the axes ship so
// `.display-*` and `.italic-soft` can set font-variation-settings.
const fraunces = Fraunces({
	subsets: ['latin'],
	axes: ['opsz', 'SOFT', 'WONK'],
	style: ['normal', 'italic'],
	variable: '--font-fraunces',
	display: 'swap',
});
const figtree = Figtree({
	subsets: ['latin'],
	variable: '--font-figtree',
	display: 'swap',
});

const title = `${siteConfig.name} | ${siteConfig.tagline}`;
const OG_IMAGE = '/images/og.jpg';

export const metadata: Metadata = {
	title: { default: title, template: `%s | ${siteConfig.name}` },
	description: siteConfig.description,
	metadataBase: new URL(siteConfig.url),
	applicationName: siteConfig.name,
	keywords: ['Sidemen villa', 'Bali villa rental', 'private villa Bali', 'Sidemen rice fields', 'joglo villa Bali', 'East Bali accommodation'],
	openGraph: {
		title,
		description: siteConfig.description,
		siteName: siteConfig.name,
		locale: siteConfig.locale,
		type: 'website',
		images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${siteConfig.name}, ${siteConfig.descriptor}` }],
	},
	twitter: { card: 'summary_large_image', title, description: siteConfig.description, images: [OG_IMAGE] },
	robots: { index: true, follow: true },
};

export const viewport: Viewport = {
	themeColor: '#F4EEE4',
	colorScheme: 'light',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const initialSettings = await getStoreSettings();

	return (
		<html lang="en" className={`${fraunces.variable} ${figtree.variable}`} suppressHydrationWarning>
			<head>
				<GateScript />
			</head>
			<body>
				{/* Allow parent frames to control scrolling via postMessage */}
				<script
					dangerouslySetInnerHTML={{
						__html: `window.addEventListener("message",function(e){if(e.data&&e.data.type==="scrollTo"&&e.data.id){var el=document.getElementById(e.data.id);if(el){var top=el.getBoundingClientRect().top+window.scrollY;window.scrollTo({top:top,behavior:"smooth"})}}if(e.data&&e.data.type==="scrollTop"){window.scrollTo({top:0,behavior:"smooth"})}});`,
					}}
				/>
				<Providers initialSettings={initialSettings}>
					<SmoothScroll>
						<ScrollProgress />
						<Header />
						<main>{children}</main>
						<Footer />
					</SmoothScroll>
				</Providers>
				<JsonLd data={lodgingBusinessJsonLd(initialSettings)} />
			</body>
		</html>
	);
}
