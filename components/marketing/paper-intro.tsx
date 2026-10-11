import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { TerraceLines } from '@/components/motifs/terrace-lines';
import { IkatRule } from '@/components/motifs/ikat-rule';
import { Reveal } from '@/components/motion/reveal';

export interface PaperIntroProps {
	eyebrow: string;
	local?: string;
	title: ReactNode;
	lede?: ReactNode;
	children?: ReactNode;
	className?: string;
}

/** Paper page opener for /faq, /contact and /journal (the header is solid there). */
export function PaperIntro({ eyebrow, local, title, lede, children, className }: PaperIntroProps) {
	return (
		<section className={clsx('grain relative overflow-hidden bg-paper', className)}>
			<TerraceLines className="opacity-70" lines={12} />
			<div className="container-x relative z-[2] pb-16 pt-36 md:pb-20 md:pt-48">
				<Reveal>
					<p className="label flex flex-wrap items-center gap-x-3 gap-y-1">
						<span>{eyebrow}</span>
						{local ? (
							<>
								<span aria-hidden className="h-px w-8 bg-terracotta" />
								<span className="font-display text-[0.95rem] normal-case italic tracking-normal text-terracotta-deep">{local}</span>
							</>
						) : null}
					</p>
				</Reveal>
				<Reveal delay={0.08}>
					<h1 className="display-lg mt-5 max-w-4xl">{title}</h1>
				</Reveal>
				{lede ? (
					<Reveal delay={0.16}>
						<div className="mt-6 max-w-2xl text-[1.08rem] leading-relaxed text-ink-muted">{lede}</div>
					</Reveal>
				) : null}
				{children ? <div className="mt-9">{children}</div> : null}
				<IkatRule className="mt-12 max-w-[220px] opacity-60" />
			</div>
		</section>
	);
}
