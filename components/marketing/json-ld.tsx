import { jsonLdString } from '@/lib/seo';

/**
 * Renders schema.org JSON-LD. The payload goes through `jsonLdString`, which
 * escapes `<` so a value can never close the script tag. Server Component.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
