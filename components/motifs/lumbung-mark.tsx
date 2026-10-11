import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';

export interface LumbungMarkProps {
	/** `full`: mark + wordmark + descriptor. `mark`: the icon only. `wordmark`: text only. */
	variant?: 'full' | 'mark' | 'wordmark';
	/** Cream on dark/video, ink on paper. */
	onDark?: boolean;
	className?: string;
	/** Icon height in px. Default 36. */
	size?: number;
}

/** The arch with the lumbung A-frame roof inside, outlined. */
export function LumbungGlyph({ size = 36, className }: { size?: number; className?: string }) {
	return (
		<svg aria-hidden viewBox="0 0 40 48" width={(size * 40) / 48} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
			{/* arch */}
			<path d="M3 46V20C3 10.6 10.6 3 20 3s17 7.6 17 17v26Z" />
			{/* thatched A-frame roof, curved like a lumbung */}
			<path d="M9 33c3-4 6.5-12 11-20 4.5 8 8 16 11 20" />
			<path d="M11.5 29.5h17" />
			<path d="M14 25.5c2-1 4-1.5 6-1.5s4 .5 6 1.5" opacity="0.7" />
			{/* granary body + stilts */}
			<path d="M14 33v6M26 33v6M20 33v6" />
			<path d="M9 39h22" />
		</svg>
	);
}

/** Lumbung Sidemen logo (DESIGN.md §5.6), inline SVG + Fraunces wordmark. */
export function LumbungMark({ variant = 'full', onDark, className, size = 36 }: LumbungMarkProps) {
	const tone = onDark ? 'text-cream' : 'text-ink';
	if (variant === 'mark') return <LumbungGlyph size={size} className={clsx(onDark ? 'text-cream' : 'text-terracotta', className)} />;
	return (
		<span className={clsx('inline-flex items-center gap-3', tone, className)}>
			{variant === 'full' ? <LumbungGlyph size={size} className={onDark ? 'text-cream' : 'text-terracotta'} /> : null}
			<span className="flex flex-col leading-none">
				<span className="font-display text-[1.45rem] font-normal tracking-[-0.01em]" style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 100" }}>
					{siteConfig.shortName}
				</span>
				<span className={clsx('mt-1 text-[0.56rem] font-semibold uppercase tracking-[0.28em]', onDark ? 'text-cream/70' : 'text-ink-muted')}>
					{siteConfig.descriptor.toUpperCase()}
				</span>
			</span>
		</span>
	);
}
