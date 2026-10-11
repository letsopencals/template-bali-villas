import type { ReactNode } from 'react';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { TerraceLines } from '@/components/motifs/terrace-lines';
import { CandiDivider } from '@/components/motifs/candi-bentar';

export interface CtaBandProps {
	local: string;
	title: ReactNode;
	text: ReactNode;
	primary: { href: string; label: string };
	secondary?: { href: string; label: string };
}

/** Jungle closing band with one terracotta action. */
export function CtaBand({ local, title, text, primary, secondary }: CtaBandProps) {
	return (
		<section className="on-dark relative overflow-hidden bg-jungle text-cream">
			<TerraceLines onDark />
			<div className="container-narrow relative section-y text-center">
				<CandiDivider onDark className="mb-10" />
				<p className="font-display text-[1.1rem] italic text-cream/80">{local}</p>
				<h2 className="display-md mt-3 text-cream">{title}</h2>
				<div className="mx-auto mt-5 max-w-xl text-cream/80">{text}</div>
				<div className="mt-10 flex flex-wrap items-center justify-center gap-3">
					<Link href={primary.href} className={buttonClasses('primary', 'lg')}>
						{primary.label}
					</Link>
					{secondary ? (
						<Link href={secondary.href} className={buttonClasses('outline', 'lg', { onDark: true })}>
							{secondary.label}
						</Link>
					) : null}
				</div>
			</div>
		</section>
	);
}
