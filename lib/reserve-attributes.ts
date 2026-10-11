import { siteConfig } from '@/lib/site-config';

const ALLOWED_ATTRIBUTE_KEYS: ReadonlySet<string> = new Set(Object.values(siteConfig.customAttributeKeys));

/**
 * Appointment custom attributes for a stay: keeps exactly the
 * `siteConfig.customAttributeKeys` values (adults, children, infants,
 * arrival_time, flight_number, occasion). Finite numbers (guest counts) become
 * strings, strings are trimmed and capped at 255 chars, everything else and
 * empty values are dropped.
 */
export function sanitizeStayAttributes(input: unknown): Record<string, string> {
	const out: Record<string, string> = {};
	if (!input || typeof input !== 'object' || Array.isArray(input)) return out;
	for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
		if (!ALLOWED_ATTRIBUTE_KEYS.has(k)) continue;
		const str = typeof v === 'number' && Number.isFinite(v) ? String(v) : typeof v === 'string' ? v.trim() : '';
		if (str) out[k] = str.slice(0, 255);
	}
	return out;
}
