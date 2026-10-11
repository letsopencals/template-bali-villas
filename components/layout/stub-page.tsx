import type { ReactNode } from 'react';
import { CanangSari } from '@/components/motifs/canang-sari';
import { IkatRule } from '@/components/motifs/ikat-rule';

/**
 * Placeholder body for routes whose page agent hasn't landed yet. Delete the
 * usage when the real page is built (the component can go once nothing imports it).
 */
export function StubPage({ eyebrow, title, owner, children }: { eyebrow: string; title: ReactNode; owner: string; children?: ReactNode }) {
	return (
		<section className="grain container-narrow flex min-h-[70svh] flex-col items-start justify-center gap-6 pb-24 pt-40">
			<CanangSari size={56} />
			<p className="label">{eyebrow}</p>
			<h1 className="display-lg">{title}</h1>
			<IkatRule className="max-w-xs" />
			{children ? <div className="max-w-xl text-ink-muted">{children}</div> : null}
			<p className="text-[0.8rem] text-ink-dim">Placeholder. Built by {owner}.</p>
		</section>
	);
}
