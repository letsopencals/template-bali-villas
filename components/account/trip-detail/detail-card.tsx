import type { ReactNode } from 'react';
import { clsx } from 'clsx';

/** A rounded paper card with a small label + title, used for every block on the trip page. */
export function DetailCard({ id, label, title, children, className }: { id?: string; label: string; title: string; children: ReactNode; className?: string }) {
	return (
		<section id={id} aria-label={title} className={clsx('scroll-mt-32 rounded-[24px] bg-cream p-6 shadow-[0_1px_0_var(--color-line)] md:p-8', className)}>
			<p className="label">{label}</p>
			<h2 className="display-sm mt-2">{title}</h2>
			<div className="mt-6">{children}</div>
		</section>
	);
}

/** One label/value row with a dotted leader. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="flex items-baseline gap-3 py-2.5 text-[0.95rem]">
			<dt className="shrink-0 text-ink-muted">{label}</dt>
			<span aria-hidden className="leader-line flex-1" />
			<dd className="tabular text-right text-ink">{children}</dd>
		</div>
	);
}
