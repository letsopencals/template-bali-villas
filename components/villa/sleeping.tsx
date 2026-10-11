import type { TourRoom } from '@/components/villa/villa-page-data';

/** One card per room with a bed, from the room tour data. */
export function Sleeping({ rooms, beds }: { rooms: TourRoom[]; beds: string }) {
	const sleeping = rooms.filter((r) => r.bedSetup);
	if (sleeping.length === 0) return null;
	return (
		<section aria-labelledby="sleeping-title">
			<p className="label">Where you sleep</p>
			<h2 id="sleeping-title" className="display-sm mt-3">
				Beds
			</h2>
			{beds ? <p className="mt-2 text-ink-muted">{beds}</p> : null}
			<ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{sleeping.map((r) => (
					<li key={r.key} className="rounded-[24px] border border-line bg-paper-deep/50 p-5">
						<BedGlyph twin={/twin|bunk|single/i.test(r.bedSetup ?? '')} />
						<p className="mt-4 font-display text-[1.15rem] leading-tight">{r.name}</p>
						<p className="mt-1 text-[0.92rem] text-ink-muted">{r.bedSetup}</p>
					</li>
				))}
			</ul>
		</section>
	);
}

function BedGlyph({ twin }: { twin: boolean }) {
	return (
		<svg aria-hidden viewBox="0 0 40 24" className="h-6 w-10 text-terracotta" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
			{twin ? (
				<>
					<path d="M2 20V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11M2 15h16M5 11h6" />
					<path d="M22 20V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11M22 15h16M25 11h6" />
				</>
			) : (
				<path d="M3 21V8a2 2 0 0 1 2-2h30a2 2 0 0 1 2 2v13M3 15h34M7 11h10M23 11h10" />
			)}
		</svg>
	);
}
