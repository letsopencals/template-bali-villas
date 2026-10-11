import type { AddOnListItemResponse } from '@opencals/storefront-sdk';
import { getCurrency, getVillaAddOns, getVillas } from '@/lib/server-data';

/**
 * Server-only helpers that read the store's add-ons for the story pages
 * (experiences, getting there). Add-ons are attached per villa in the store,
 * so we take the union across villas, deduped by id.
 */

export interface StoreAddOn {
	id: string;
	title: string;
	description: string;
	price: number;
	currency: string;
}

export async function getResortAddOns(): Promise<StoreAddOn[]> {
	const [villas, currency] = await Promise.all([getVillas(), getCurrency()]);
	if (!villas.length) return [];
	const lists = await Promise.all(villas.map((v) => getVillaAddOns(v.slug, v.locationId ?? undefined)));
	const byId = new Map<string, AddOnListItemResponse>();
	for (const list of lists) for (const a of list) if (!byId.has(a.id)) byId.set(a.id, a);
	return [...byId.values()].map((a) => ({ id: a.id, title: a.title, description: plainText(a.description), price: a.price, currency }));
}

/**
 * The first add-on whose title contains every word of one of the keyword
 * groups (case-insensitive). `[['sunrise'], ['trek']]` matches "Mount Agung
 * sunrise trek". Returns null when the store doesn't sell it.
 */
export function matchAddOn(addOns: readonly StoreAddOn[], keywordGroups: ReadonlyArray<readonly string[]>): StoreAddOn | null {
	for (const group of keywordGroups) {
		const hit = addOns.find((a) => {
			const t = a.title.toLowerCase();
			return group.every((k) => t.includes(k.toLowerCase()));
		});
		if (hit) return hit;
	}
	return null;
}

/** Store descriptions may contain HTML; the story pages show plain text. */
function plainText(html: string | null | undefined): string {
	return (html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}
