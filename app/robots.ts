import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

/** Guest-only and API routes stay out of the index. */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: '*', allow: '/', disallow: ['/account', '/reserve', '/api', '/auth', '/link'] },
		sitemap: `${siteConfig.url}/sitemap.xml`,
		host: siteConfig.url,
	};
}
