import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface SectionHeadingProps {
	eyebrow: string;
	/** Use <em className="italic-soft"> for the mixed-italic signature. */
	title: ReactNode;
	intro?: ReactNode;
	/** Trailing slot on the right from `md` (e.g. a link or carousel arrows). */
	aside?: ReactNode;
	onDark?: boolean;
	align?: 'left' | 'center';
	className?: string;
	/** Id for aria-labelledby on the section. */
	id?: string;
}

/** Eyebrow + display-md title (+ intro) used by every home section. */
export function SectionHeading({ eyebrow, title, intro, aside, onDark, align = 'left', className, id }: SectionHeadingProps) {
	return (
		<div className={clsx('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', align === 'center' && 'md:flex-col md:items-center md:text-center', onDark && 'on-dark', className)}>
			<div className={clsx('max-w-2xl', align === 'center' && 'mx-auto')}>
				<p className="label">{eyebrow}</p>
				<h2 id={id} className={clsx('display-md mt-4', onDark ? 'text-cream' : 'text-ink')}>
					{title}
				</h2>
				{intro ? <p className={clsx('mt-5 max-w-xl text-[1.05rem] leading-relaxed', onDark ? 'text-cream/75' : 'text-ink-muted', align === 'center' && 'mx-auto')}>{intro}</p> : null}
			</div>
			{aside ? <div className="shrink-0">{aside}</div> : null}
		</div>
	);
}
