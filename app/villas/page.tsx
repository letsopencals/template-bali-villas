import type { Metadata } from 'next';
import { getVillas } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';
import { TerraceLines } from '@/components/motifs/terrace-lines';
import { IkatRule } from '@/components/motifs/ikat-rule';
import { VillasExplorer } from '@/components/villas/villas-explorer';
import { parseExplorerQuery, toVillaSummary } from '@/components/villas/villa-summary';

export const metadata: Metadata = {
	title: 'Villas',
	description: 'Ten private villas in the Sidemen valley, from rice-barn studios to a four-bedroom estate, with nightly prices and live availability.',
	alternates: { canonical: '/villas' },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toParams(sp: Record<string, string | string[] | undefined>): URLSearchParams {
	const p = new URLSearchParams();
	for (const [k, v] of Object.entries(sp)) {
		const first = Array.isArray(v) ? v[0] : v;
		if (first !== undefined) p.set(k, first);
	}
	return p;
}

export default async function VillasPage({ searchParams }: { searchParams: SearchParams }) {
	const [villas, sp] = await Promise.all([getVillas(), searchParams]);
	const summaries = villas.map(toVillaSummary);
	const from = summaries.length ? Math.min(...summaries.map((v) => v.price)) : null;

	return (
		<>
			<header className="grain relative overflow-hidden pb-14 pt-36 md:pb-20 md:pt-44">
				<TerraceLines className="opacity-80" />
				<div className="container-x relative z-[2]">
					<p className="label">The villas · {siteConfig.descriptor}</p>
					<h1 className="display-lg mt-5 max-w-4xl">
						Find <em className="italic-soft">your house</em> in the rice fields
					</h1>
					<p className="mt-6 max-w-2xl text-[1.05rem] text-ink-muted">
						Ten houses stepped down the terraces, from a rice barn for two to a four-bedroom estate.
						{from !== null ? ` Every price is per villa per night, from $${from}.` : ''} Add your dates to see what’s free.
					</p>
					<IkatRule className="mt-10 max-w-xs" />
				</div>
			</header>
			<VillasExplorer villas={summaries} initialState={parseExplorerQuery(toParams(sp))} />
		</>
	);
}
