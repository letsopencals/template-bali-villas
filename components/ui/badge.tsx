import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export type BadgeTone = 'neutral' | 'moss' | 'terracotta' | 'jungle' | 'danger' | 'glass';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	tone?: BadgeTone;
	/** Small leading status dot. */
	dot?: boolean;
	leading?: ReactNode;
}

const TONES: Record<BadgeTone, string> = {
	neutral: 'bg-sand text-ink-muted',
	moss: 'bg-moss-soft text-[#4a5734]',
	terracotta: 'bg-terracotta/12 text-terracotta-deep',
	jungle: 'bg-jungle text-cream',
	danger: 'bg-danger/10 text-danger',
	glass: 'bg-cream/75 text-ink backdrop-blur-xl',
};

const DOTS: Record<BadgeTone, string> = {
	neutral: 'bg-ink-dim',
	moss: 'bg-moss',
	terracotta: 'bg-terracotta',
	jungle: 'bg-cream',
	danger: 'bg-danger',
	glass: 'bg-terracotta',
};

/** Small pill label: availability ("Free 14–17 Nov" in moss), trip status, collection tags. */
export function Badge({ tone = 'neutral', dot, leading, className, children, ...props }: BadgeProps) {
	return (
		<span
			className={clsx(
				'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em]',
				TONES[tone],
				className,
			)}
			{...props}
		>
			{dot ? <span aria-hidden className={clsx('h-1.5 w-1.5 rounded-full', DOTS[tone])} /> : null}
			{leading}
			{children}
		</span>
	);
}
