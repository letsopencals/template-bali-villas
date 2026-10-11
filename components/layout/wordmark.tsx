import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';
import { LumbungMark } from '@/components/motifs/lumbung-mark';

export interface WordmarkProps {
	className?: string;
	/**
	 * `inline`: the logo (arch mark + "Lumbung" + descriptor), header-sized.
	 * `stacked`: a big Fraunces "Lumbung" with the descriptor below, sized by the
	 * parent's font-size (set text-* on `className`), for auth screens and closings.
	 */
	layout?: 'inline' | 'stacked';
	onDark?: boolean;
}

export function Wordmark({ className, layout = 'inline', onDark }: WordmarkProps) {
	if (layout === 'inline') return <LumbungMark onDark={onDark} className={className} />;
	return (
		<span
			aria-label={`${siteConfig.shortName}, ${siteConfig.descriptor}`}
			className={clsx('inline-flex select-none flex-col items-start leading-none', onDark ? 'text-cream' : 'text-ink', className)}
		>
			<span aria-hidden className="font-display font-light tracking-[-0.03em]" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}>
				{siteConfig.shortName}
			</span>
			<span aria-hidden className={clsx('mt-[0.35em] text-[0.18em] font-semibold uppercase tracking-[0.3em]', onDark ? 'text-cream/70' : 'text-terracotta')}>
				{siteConfig.descriptor}
			</span>
		</span>
	);
}
