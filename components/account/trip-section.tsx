import type { ReactNode } from 'react';

/** A titled group on the overview ("Upcoming", "Past stays", "Cancelled"). */
export function TripSection({ title, local, count, children }: { title: string; local: string; count: number; children: ReactNode }) {
	return (
		<section className="mt-16 lg:mt-20" aria-label={title}>
			<header className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
				<h2 className="display-sm">
					{title} <span className="italic-soft text-ink-dim">· {local}</span>
				</h2>
				<span className="tabular text-sm text-ink-muted">{count}</span>
			</header>
			<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
		</section>
	);
}
