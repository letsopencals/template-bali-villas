/**
 * Small formatting helpers for the home sections. Plain functions (no
 * 'use client'), so Server Components can call them.
 */

/** "$240" (narrow symbol, whole units). Falls back to "USD 240". */
export function money(amount: number, currency: string): string {
	try {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
			currencyDisplay: 'narrowSymbol',
			maximumFractionDigits: 0,
		}).format(amount);
	} catch {
		return `${currency} ${Math.round(amount).toLocaleString('en-US')}`;
	}
}

/** "400 m" → { value: 400, suffix: ' m' }; non-numeric values come back as text. */
export function parseFact(value: string): { value: number; suffix: string; prefix: string } | { text: string } {
	const m = /^(\D*?)(\d+(?:\.\d+)?)(.*)$/.exec(value.trim());
	if (!m) return { text: value };
	return { prefix: m[1] ?? '', value: Number(m[2]), suffix: m[3] ?? '' };
}

/** "joglo-agung" → "Joglo Agung" (only used when the store has no title). */
export function titleFromSlug(slug: string): string {
	return slug
		.split('-')
		.map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w))
		.join(' ');
}
