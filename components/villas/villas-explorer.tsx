'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { DateGuestField } from '@/components/stay/date-guest-field';
import type { StayValue } from '@/components/stay/stay-calendar';
import { formatGuests, type GuestCounts } from '@/components/stay/guest-picker';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CanangSari } from '@/components/motifs/canang-sari';
import { Reveal } from '@/components/motion/reveal';
import { VillaFilters } from '@/components/villas/villa-filters';
import { VillaResultCard } from '@/components/villas/villa-result-card';
import { VillaMap } from '@/components/villas/villa-map';
import {
	EMPTY_FILTERS,
	activeFilterCount,
	explorerQuery,
	formatStayRange,
	matchesFilters,
	stayQuery,
	type ExplorerFilters,
	type ExplorerState,
	type ExplorerView,
	type VillaSummary,
} from '@/components/villas/villa-summary';
import { nightsBetween } from '@/lib/stay';

export interface VillasExplorerProps {
	villas: VillaSummary[];
	/** Parsed from the request's search params on the server. */
	initialState: ExplorerState;
}

const VIEW_TABS = [
	{ value: 'grid', label: 'Houses' },
	{ value: 'map', label: 'On the map' },
] as const;

/**
 * /villas body: date + guest strip, filters, and the grid or the masterplan
 * map. State is local and mirrored to the URL with `history.replaceState`
 * (no server round trip), so a filtered search can be shared or reloaded.
 */
export function VillasExplorer({ villas, initialState }: VillasExplorerProps) {
	const [state, setState] = useState<ExplorerState>(initialState);
	const [filtersOpen, setFiltersOpen] = useState(() => activeFilterCount(initialState) > 0);

	const update = useCallback(
		(patch: Partial<ExplorerState>) => {
			const next = { ...state, ...patch };
			setState(next);
			// Mirror to the URL. Next keeps useSearchParams in sync with replaceState.
			const qs = explorerQuery(next);
			window.history.replaceState(window.history.state, '', qs ? `?${qs}` : window.location.pathname);
		},
		[state],
	);

	const onStayChange = useCallback((v: StayValue) => update({ checkin: v.checkin, checkout: v.checkout }), [update]);
	const onGuestsChange = useCallback((g: GuestCounts) => update({ guests: g }), [update]);
	const onFilters = useCallback((patch: Partial<ExplorerFilters>) => update(patch), [update]);

	const searching = !!state.checkin && !!state.checkout;
	// Only a complete range searches; a lone check-in waits for its check-out.
	const searchCheckin = searching ? state.checkin : null;
	const searchCheckout = searching ? state.checkout : null;

	const matching = useMemo(() => villas.filter((v) => matchesFilters(v, state)), [villas, state]);
	const activeSlugs = useMemo(() => new Set(matching.map((v) => v.slug)), [matching]);
	const minNights = useMemo(() => Math.min(...villas.map((v) => v.minNights), 1), [villas]);
	const filterCount = activeFilterCount(state);
	const nights = searching ? nightsBetween(state.checkin!, state.checkout!) : 0;
	const query = stayQuery({ checkin: searchCheckin, checkout: searchCheckout }, state.guests);

	return (
		<>
			{/* Header strip: dates and guests. */}
			<div className="sticky top-[72px] z-[40] border-y border-line bg-paper/90 backdrop-blur-md lg:top-20">
				<div className="container-x flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
					<DateGuestField
						stay={{ checkin: state.checkin, checkout: state.checkout }}
						onStayChange={onStayChange}
						guests={state.guests}
						onGuestsChange={onGuestsChange}
						minNights={minNights}
						maxGuests={Math.max(...villas.map((v) => v.content?.maxGuests ?? 2), 2)}
						className="w-full md:max-w-[640px]"
					/>
					<div className="flex items-center justify-between gap-3 md:justify-end">
						<Button variant={filterCount > 0 ? 'secondary' : 'outline'} size="sm" aria-expanded={filtersOpen} aria-controls="villa-filters" onClick={() => setFiltersOpen((o) => !o)}>
							<FilterGlyph />
							Filters{filterCount > 0 ? <span className="tabular">· {filterCount}</span> : null}
						</Button>
						<Tabs aria-label="View" items={VIEW_TABS} value={state.view} onChange={(view: ExplorerView) => update({ view })} />
					</div>
				</div>
				{filtersOpen ? (
					<div id="villa-filters" className="container-x border-t border-line py-5">
						<VillaFilters value={state} onChange={onFilters} />
					</div>
				) : null}
			</div>

			<section className="container-x pb-24 pt-10 md:pb-36 md:pt-14">
				<div className="mb-10 flex flex-wrap items-end justify-between gap-4" aria-live="polite">
					<p className="text-ink-muted">
						<span className="tabular font-medium text-ink">{matching.length}</span> of {villas.length} houses
						{searching ? (
							<>
								{' '}
								for <span className="tabular text-ink">{formatStayRange(state.checkin!, state.checkout!)}</span> · {nights} {nights === 1 ? 'night' : 'nights'}
							</>
						) : null}{' '}
						· {formatGuests(state.guests)}
					</p>
					{filterCount > 0 || searching ? (
						<button
							type="button"
							className="link-underline text-[0.9rem] text-terracotta-deep"
							onClick={() => update({ ...EMPTY_FILTERS, checkin: null, checkout: null })}
						>
							Clear dates and filters
						</button>
					) : null}
				</div>

				{matching.length === 0 ? (
					<EmptyState onClear={() => update({ ...EMPTY_FILTERS })} />
				) : state.view === 'map' ? (
					<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
						<VillaMap villas={villas} activeSlugs={activeSlugs} query={query} />
						<ol className="flex flex-col divide-y divide-line">
							{matching.map((v) => (
								<li key={v.slug}>
									<Link href={`/villas/${v.slug}?${query}`} className="group flex items-baseline justify-between gap-4 py-3">
										<span className="font-display text-[1.15rem] transition-colors group-hover:text-terracotta-deep">{v.title}</span>
										<span className="tabular text-[0.9rem] text-terracotta">${v.price}</span>
									</Link>
								</li>
							))}
						</ol>
					</div>
				) : (
					<ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
						{matching.map((v, i) => (
							<Reveal as="li" key={v.slug} delay={Math.min(i % 3, 2) * 0.08}>
								<VillaResultCard villa={v} checkin={searchCheckin} checkout={searchCheckout} guests={state.guests} priority={i < 3} />
							</Reveal>
						))}
					</ul>
				)}
			</section>
		</>
	);
}

function EmptyState({ onClear }: { onClear(): void }) {
	return (
		<div className="flex flex-col items-center gap-5 rounded-[24px] bg-sand px-6 py-20 text-center">
			<CanangSari size={56} />
			<p className="display-sm">No house fits all of that</p>
			<p className="max-w-md text-ink-muted">Try fewer filters, or a smaller party. Several of our houses sleep two, and the family houses sleep up to eight.</p>
			<Button variant="outline" onClick={onClear}>
				Clear filters
			</Button>
		</div>
	);
}

function FilterGlyph() {
	return (
		<svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
			<path d="M2 4h12M4.5 8h7M7 12h2" />
		</svg>
	);
}
