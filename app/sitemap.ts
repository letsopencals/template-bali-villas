import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import { getVillas } from '@/lib/server-data';
import { journalPosts } from '@/content/journal';

const STATIC_PATHS: Array<[string, number, MetadataRoute.Sitemap[number]['changeFrequency']]> = [
	['', 1, 'weekly'],
	['/villas', 0.9, 'daily'],
	['/experiences', 0.7, 'monthly'],
	['/getting-there', 0.7, 'monthly'],
	['/about', 0.6, 'monthly'],
	['/faq', 0.6, 'monthly'],
	['/journal', 0.5, 'weekly'],
	['/contact', 0.5, 'yearly'],
];

/** Every public route: static pages, one entry per villa (from the store) and each journal post. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = siteConfig.url;
	const now = new Date();
	const staticRoutes: MetadataRoute.Sitemap = STATIC_PATHS.map(([path, priority, changeFrequency]) => ({ url: `${base}${path}`, lastModified: now, changeFrequency, priority }));
	const villas = await getVillas().catch(() => []);
	const villaRoutes: MetadataRoute.Sitemap = villas.map((v) => ({
		url: `${base}/villas/${v.slug}`,
		lastModified: now,
		changeFrequency: 'weekly',
		priority: 0.8,
		...(v.image ? { images: [v.image] } : {}),
	}));
	const journalRoutes: MetadataRoute.Sitemap = journalPosts.map((p) => ({
		url: `${base}/journal/${p.slug}`,
		lastModified: new Date(`${p.date}T00:00:00Z`),
		changeFrequency: 'yearly',
		priority: 0.5,
		images: [`${base}/images/${p.image}.jpg`],
	}));
	return [...staticRoutes, ...villaRoutes, ...journalRoutes];
}
