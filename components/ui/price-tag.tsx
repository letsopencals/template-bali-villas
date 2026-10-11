'use client';

import { clsx } from 'clsx';
import { useSettings } from '@/contexts/settings-context';
import { formatStayPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';

export interface PriceTagProps {
	/** Amount in major units. */
	amount: number;
	/** ISO currency. Defaults to the store currency (settings), then siteConfig.currency. */
	currency?: string;
	/** Unit label after the price. Default "/ night"; pass null to hide. */
	unit?: string | null;
	size?: 'sm' | 'md' | 'lg';
	onDark?: boolean;
	/** Keep cents (checkout lines). Default false: "$240". */
	cents?: boolean;
	className?: string;
}

const SIZES = { sm: 'text-[1.2rem]', md: 'text-[1.6rem]', lg: 'text-[2.2rem]' } as const;

export { formatStayPrice } from '@/lib/format';

/** `$240 / night`: Fraunces terracotta number, Figtree label unit (DESIGN.md §3). */
export function PriceTag({ amount, currency, unit = '/ night', size = 'md', onDark, cents, className }: PriceTagProps) {
	const { settings } = useSettings();
	const code = currency ?? settings?.currency ?? siteConfig.currency;
	return (
		<span className={clsx('inline-flex items-baseline gap-1.5', className)}>
			<span className={clsx('tabular font-display font-normal leading-none', SIZES[size], onDark ? 'text-cream' : 'text-terracotta')}>
				{formatStayPrice(amount, code, cents)}
			</span>
			{unit ? <span className={clsx('label', onDark && 'on-dark')}>{unit}</span> : null}
		</span>
	);
}
